import swaggerAutogen from 'swagger-autogen';

const document = {
    info: {
        title: 'FastFood PMW API',
        description: 'Documentazione API REST per il progetto FastFood PMW 2025/2026 (CodeBite)',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'Authentication',
            description: 'Endpoints per autenticazione e registrazione utenti'
        },
        {
            name: 'Users',
            description: 'Gestione profili utente'
        },
        {
            name: 'Restaurants',
            description: 'Gestione ristoranti e menu'
        },
        {
            name: 'Meals',
            description: 'Gestione piatti e ricette'
        },
        {
            name: 'Orders',
            description: 'Gestione ordini'
        },
        {
            name: 'Statistics',
            description: 'Statistiche ristoranti'
        }
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Inserire il token JWT nel formato: Bearer {token}'
        }
    },
    definitions: {
        User: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                },
                name: {
                    type: 'string',
                    example: 'Mario'
                },
                surname: {
                    type: 'string',
                    example: 'Rossi'
                },
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'mario.rossi@example.com'
                },
                userType: {
                    type: 'string',
                    enum: ['customer', 'restaurateur'],
                    example: 'customer'
                },
                restaurant: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439012'
                },
                paymentInfo: {
                    type: 'object',
                    properties: {
                        cardType: { type: 'string', example: 'Visa' },
                        cardNumb: { type: 'string', example: '4111111111111111' },
                        CVC: { type: 'number', example: 123 },
                        expiryDate: { type: 'string', format: 'date', example: '2025-12-31' }
                    }
                },
                address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Via Roma 123' },
                        city: { type: 'string', example: 'Milano' },
                        zipCode: { type: 'string', example: '20100' }
                    }
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        },
        Restaurant: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439012'
                },
                name: {
                    type: 'string',
                    example: 'Burger King Milano Centro'
                },
                owner: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                },
                description: {
                    type: 'string',
                    example: 'Il miglior fast food di Milano con hamburger gourmet'
                },
                phone: {
                    type: 'string',
                    example: '+39 02 1234567'
                },
                vatNumber: {
                    type: 'string',
                    example: 'IT12345678901'
                },
                image: {
                    type: 'string',
                    example: '/uploads/restaurant_123.jpg'
                },
                address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Corso Buenos Aires 10' },
                        city: { type: 'string', example: 'Milano' },
                        zipCode: { type: 'string', example: '20124' },
                        coordinates: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number', example: 45.4773 },
                                longitude: { type: 'number', example: 9.2058 }
                            }
                        }
                    }
                },
                menu: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            meal: { type: 'string', example: '507f1f77bcf86cd799439013' },
                            price: { type: 'number', example: 8.50 },
                            preparationTime: { type: 'number', example: 15 },
                            isAvailable: { type: 'boolean', example: true }
                        }
                    }
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        },
        Meal: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439013'
                },
                idMeal: {
                    type: 'string',
                    example: 'MEAL_001'
                },
                strMeal: {
                    type: 'string',
                    example: 'Cheeseburger Deluxe'
                },
                strCategory: {
                    type: 'string',
                    example: 'Burger'
                },
                strArea: {
                    type: 'string',
                    example: 'American'
                },
                strMealThumb: {
                    type: 'string',
                    example: 'https://example.com/images/cheeseburger.jpg'
                },
                ingredients: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Pane', 'Carne di manzo', 'Formaggio cheddar', 'Lattuga', 'Pomodoro']
                },

                isCustom: {
                    type: 'boolean',
                    example: false
                },
                createdBy: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439012'
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        },
        Order: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439014'
                },
                customer: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                },
                restaurant: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439012'
                },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            meal: { type: 'string', example: '507f1f77bcf86cd799439013' },
                            quantity: { type: 'number', example: 2 },
                            price: { type: 'number', example: 8.50 },
                            preparationTime: { type: 'number', example: 15 }
                        }
                    }
                },
                totalAmount: {
                    type: 'number',
                    example: 17.00
                },
                status: {
                    type: 'string',
                    enum: ['ordered', 'preparing', 'delivering', 'delivered'],
                    example: 'ordered'
                },

                estimatedPreparationTime: {
                    type: 'number',
                    example: 30
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        },
        LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'mario.rossi@example.com'
                },
                password: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!'
                }
            }
        },
        LoginResponse: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'il_tuo_token_jwt_qui'
                },
                user: {
                    $ref: '#/definitions/User'
                }
            }
        },
        RegisterRequest: {
            type: 'object',
            required: ['name', 'surname', 'email', 'password', 'confirmPassword', 'userType'],
            properties: {
                name: { type: 'string', example: 'Mario' },
                surname: { type: 'string', example: 'Rossi' },
                email: { type: 'string', format: 'email', example: 'mario.rossi@example.com' },
                password: { type: 'string', format: 'password', example: 'Password123!' },
                confirmPassword: { type: 'string', format: 'password', example: 'Password123!' },
                userType: { type: 'string', enum: ['customer', 'restaurateur'], example: 'customer' },
                restaurantName: { type: 'string', example: 'Burger King Milano' },
                vatNumber: { type: 'string', example: 'IT12345678901' },
                phone: { type: 'string', example: '+39 02 1234567' },
                addressStreet: { type: 'string', example: 'Corso Buenos Aires 10' },
                addressCity: { type: 'string', example: 'Milano' },
                addressZip: { type: 'string', example: '20124' },
                description: { type: 'string', example: 'Il miglior fast food di Milano' }
            }
        },
        Error: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Errore durante l\'elaborazione della richiesta'
                },
                error: {
                    type: 'string',
                    example: 'Dettagli tecnici dell\'errore'
                }
            }
        }
    }
};

const endpointFile = ['./server.js'];
const outputFile = './swagger.json';

swaggerAutogen(outputFile, endpointFile, document).then(async () => {
    await import('./server.js');
});