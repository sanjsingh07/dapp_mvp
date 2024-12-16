const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// signup validation middleware
const signupValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Email address is not valid please provide a valid email address.')
        .normalizeEmail()
        .custom(async (value) => {
            // if email already exists in the database, throw err
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Error('Email already in use');
            }
            return true;
        }),

    body('password')
        .trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'),

    // Validation error handling
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg
                }))
            });
        }
        next();
    }
];

module.exports = signupValidation;