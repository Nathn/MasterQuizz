const express = require('express');
const path = require('path');

const router = express.Router();

const userRoutes = require('./userRoutes');

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

router.use('/', userRoutes);

// Serve static files from the Angular app
router.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/master-quizz/index.html'));
});

// Exporting the module
module.exports = router;
