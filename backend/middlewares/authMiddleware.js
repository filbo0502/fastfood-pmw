import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(403).json({ message: 'Token is not valid' });
    };
};

export const authRestaurateurMiddleware = (req, res, next) => {
    if (req.user && req.user.userType === 'restaurateur') {
        next()
    } else {
        return res.status(403).json({ message: 'Access denied, Reserved only for restaurateurs.' });
    }
};