import CONFIG from "../config.js";

const API_BASE_URL = CONFIG.API_BASE_URL;

let restaurantData = null;
let dailyChart = null;
let statusChart = null;

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    loadRestaurantData();
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'restaurateur') {
        window.location.href = '../pages/login.html';
        return;
    }
};

const logout = () => {
    localStorage.clear();
    window.location.href = '../pages/login.html';
};

async function loadRestaurantData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/restaurants/my-restaurant`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            restaurantData = await response.json();
            document.getElementById('restaurantName').innerHTML =
                `<i class="fas fa-store"></i> Statistics - ${restaurantData.name}`;
            loadStatistics();
        } else {
            throw new Error('Error loading restaurant data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading restaurant data');
    }
}

async function loadStatistics() {
    if (!restaurantData) return;

    try {
        document.getElementById('loading').style.display = 'block';

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/statistics/restaurant/${restaurantData._id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const stats = await response.json();
            updateStats(stats);
            createCharts(stats);
            updateTopMeals(stats.topMeals);
        } else {
            throw new Error('Error loading statistics');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading statistics');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function updateStats(stats) {
    document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('completedOrders').textContent = stats.completedOrders || 0;
    document.getElementById('totalRevenue').textContent = `€${(stats.totalRevenue || 0).toFixed(2)}`;

    const successRate = stats.totalOrders > 0 ?
        ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

function createCharts(stats) {
    createDailyOrdersChart(stats.dailyOrders);
    createStatusChart(stats.statusDistribution);
}

//Chart.js
function createDailyOrdersChart(dailyData) {
    const ctx = document.getElementById('dailyOrdersChart').getContext('2d');

    if (dailyChart) {
        dailyChart.destroy();
    }

    const { labels, data } = prepareChartData(dailyData);

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function createStatusChart(statusData) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    if (statusChart) {
        statusChart.destroy();
    }

    if (!statusData || statusData.length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }


    const statusColors = {
        'ordered': '#ffc107',
        'preparing': '#20c997',
        'delivering': '#17a2b8',
        'delivered': '#28a745',
    };

    const statusNames = {
        'ordered': 'Ordered',
        'preparing': 'Preparing',
        'delivering': 'Delivering',
        'delivered': 'Delivered',
    };

    const labels = statusData.map(item => statusNames[item._id] || item._id);
    const data = statusData.map(item => item.count);
    const colors = statusData.map(item => statusColors[item._id] || '#6c757d');

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTopMeals(topMeals) {
    const container = document.getElementById('topMealsList');

    if (!topMeals || topMeals.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No meals sold yet</p>';
        return;
    }

    container.innerHTML = topMeals.map((meal, index) => `
        <div class="top-meals-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-primary me-2">${index + 1}</span>
                    <strong>${meal.mealName}</strong>
                </div>
                <div>
                    <span class="badge bg-success">${meal.quantitySold} sold</span>
                </div>
            </div>
        </div>
    `).join('');
}

function prepareChartData(dailyData) {
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const dateKey = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

        const dayData = dailyData.find(d => d._id === dateKey);
        data.push(dayData ? dayData.count : 0);
    }
    return { labels, data };
}
