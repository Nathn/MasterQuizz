const express = require('express');
const path = require('path');

const router = express.Router();

const userRoutes = require('./userRoutes');
const questionRoutes = require('./questionRoutes');
const themeRoutes = require('./themeRoutes');

// console.log each request
router.use((req, res, next) => {
    console.log('[SERVER] Request received: ' + req.method + ' ' + req.url);
    next();
});

// Routes
router.use('/', userRoutes);
router.use('/', questionRoutes);
router.use('/', themeRoutes);

// Serve static files from the Angular app
router.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/master-quizz/index.html'));
});

// Exporting the module
module.exports = router;
