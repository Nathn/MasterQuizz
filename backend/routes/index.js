const express = require('express');

const router = express.Router();

// console.log each request
router.use((req, res, next) => {
    console.log('[SERVER] Request received: ' + req.method + ' ' + req.url);
    next();
});

router.get('/ping', async (req, res) => {
    res.status(200).json({
        message: 'pong'
    });
});

// Exporting the module
module.exports = router;
