const express = require("express");
const path = require("path");

const router = express.Router();

const matchRoutes = require("./matchRoutes");
const practiceRoutes = require("./practiceRoutes");
const questionRoutes = require("./questionRoutes");
const rankingRoutes = require("./rankingRoutes");
const themeRoutes = require("./themeRoutes");
const userRoutes = require("./userRoutes");

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
router.use("/", matchRoutes);
router.use("/", practiceRoutes);
router.use("/", questionRoutes);
router.use("/", rankingRoutes);
router.use("/", themeRoutes);
router.use("/", userRoutes);

// Serve static files from the Angular app
router.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../dist/master-quizz/index.html"));
});

// Exporting the module
module.exports = router;
