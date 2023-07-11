const express = require('express');

const router = express.Router();

const Question = require('../models/Question');
const Theme = require('../models/Theme');
const User = require('../models/User');

router.post('/getAllThemes', async (req, res) => {
    /*
    This route is used to get a list of all themes.
    */
    try {
        console.log(`[SERVER] Getting all themes`);
        await Theme.find().sort({ code: 'asc' }).exec()
            .then(themes => {
                if (!themes) {
                    console.log(`[SERVER] Themes not found while getting all themes`);
                    res.status(200).json({
                        message: 'Thèmes introuvables.'
                    });
                } else {
                    console.log(`[SERVER] Themes found`);
                    res.status(200).json({
                        message: 'OK',
                        themes
                    });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while getting all themes: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while getting all themes: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;
