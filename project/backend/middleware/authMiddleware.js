const jwt = require('jsonwebtoken');
const User = require('../models/person'); // Adjust path as needed

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is correct

            req.user = await User.findById(decoded.id).select('-password');
            console.log("User authenticated:", req.user ? req.user.id : 'No user found'); // Backend log
            next();
        } catch (error) {
            console.error('Backend - Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('Backend - No token provided'); // Backend log
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = protect;