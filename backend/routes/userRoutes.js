const express = require('express');

const router = express.Router();

const User = require('../models/User');

router.post('/validateRegister', async (req, res) => {
    /*
    This route is used to validate the registration form.
    It checks if the username and email are already taken.
    */
    const {
        username,
        email
    } = req.body;
    // Check if the email is valid
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(200).json({
            message: 'Invalid email'
        });
    }
    // Check if the username is valid
    if (!username || !username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
        return res.status(200).json({
            message: 'Invalid username'
        });
    }
    // Check if the username is already taken
    let user = await User.findOne({
        username
    });
    if (user) {
        return res.status(200).json({
            message: 'Username already taken'
        });
    }
    // Check if the email is already taken
    user = await User.findOne({
        email
    });
    if (user) {
        return res.status(200).json({
            message: 'Email already taken'
        });
    }
    // If everything is OK, return a success message
    res.status(200).json({
        message: 'OK'
    });
});

router.post('/register', async (req, res) => {
    /*
    This route is used to register a new user.
    To be used only after Firebase Auth has validated the user.
    */
    try {
        console.log(`[SERVER] Registering a new user: ${req.body.username} - ${req.body.email}`);
        user = new User({
            email: req.body.email,
            username: req.body.username
        });
        await user.save();
        // And return a success message
        res.status(200).json({
            message: 'OK'
        });
    } catch (err) {
        console.log(`[SERVER] An error occured while registering a new user: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/getEmailFromUsername', async (req, res) => {
    /*
    This route is used to get the email of a user from his username.
    */
    try {
        console.log(`[SERVER] Getting email from username: ${req.body.username}`);
        await User.findOne({
            username: req.body.username
        }).exec()
            .then(user => {
                if (!user) {
                    console.log(`[SERVER] User not found while getting email from username`);
                    res.status(200).json({
                        message: 'Nom d\'utilisateur introuvable'
                    });
                } else {
                    console.log(`[SERVER] Email found: ${user.email}`);
                    res.status(200).json({
                        message: 'OK',
                        email: user.email
                    });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while getting email from username: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while getting email from username: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


module.exports = router;
