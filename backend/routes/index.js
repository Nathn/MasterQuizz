const express = require("express");
const path = require("path");
const rateLimit = require('express-rate-limit');

const router = express.Router();

const matchRoutes = require("./matchRoutes");
const practiceRoutes = require("./practiceRoutes");
const questionRoutes = require("./questionRoutes");
const rankingRoutes = require("./rankingRoutes");
const themeRoutes = require("./themeRoutes");
const userRoutes = require("./userRoutes");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests, please try again later."
});

// console.log each request
router.use((req, res, next) => {
    console.log(
        `[SERVER] [${new Date().toLocaleString()}] Request received: ${
            req.method
        } ${req.url}`
    );
    next();
});

// Routes
router.use("/", limiter, matchRoutes);
router.use("/", limiter, practiceRoutes);
router.use("/", limiter, questionRoutes);
router.use("/", limiter, rankingRoutes);
router.use("/", limiter, themeRoutes);
router.use("/", limiter, userRoutes);

// Serve static files from the Angular app
router.get("/{*path}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../dist/master-quizz/index.html"));
});

// Exporting the module
module.exports = router;
