const express = require("express");

const router = express.Router();

const Question = require("../models/Question");
const Theme = require("../models/Theme");
const User = require("../models/User");

router.post("/getAvailableThemes", async (req, res) => {
    /*
    This route is used to get a list of the themes that
    correspond to at least 3 questions by level of difficulty.
    */
    try {
        console.log(`[SERVER] Getting available themes`);
        await Theme.find()
            .sort({ code: "asc" })
            .exec()
            .then(async (themes) => {
                if (!themes) {
                    console.log(
                        `[SERVER] Themes not found while getting available themes`
                    );
                    res.status(200).json({
                        message: "Thèmes introuvables."
                    });
                } else {
                    console.log(
                        `[SERVER] Themes found while getting available themes`
                    );
                    let availableThemes = [];
                    for (let i = 0; i < themes.length; i++) {
                        let theme = themes[i];
                        let questions = await Question.find({
                            theme: theme._id,
                            online: true
                        }).exec();
                        let questionsByDifficulty = {
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0
                        };
                        for (let j = 0; j < questions.length; j++) {
                            let question = questions[j];
                            questionsByDifficulty[question.difficulty]++;
                        }
                        for (let difficulty in questionsByDifficulty) {
                            if (questionsByDifficulty[difficulty] < 3) {
                                delete questionsByDifficulty[difficulty];
                            }
                        }
                        if (Object.keys(questionsByDifficulty).length == 5) {
                            availableThemes.push(theme);
                        }
                    }
                    res.status(200).json({
                        message: "OK",
                        themes: availableThemes
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting available themes: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting available themes: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getAvailableDifficulties", async (req, res) => {
    /*
    This route is used to get a list of the difficulties that
    correspond to at least 15 questions (all themes combined).
    */
    try {
        console.log(`[SERVER] Getting available difficulties`);
        await Question.find({ online: true })
            .exec()
            .then(async (questions) => {
                if (!questions) {
                    console.log(
                        `[SERVER] Questions not found while getting available difficulties`
                    );
                    res.status(200).json({
                        message: "Questions introuvables."
                    });
                } else {
                    console.log(
                        `[SERVER] Questions found while getting available difficulties`
                    );
                    let availableDifficulties = [];
                    let questionsByDifficulty = {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0
                    };
                    for (let i = 0; i < questions.length; i++) {
                        let question = questions[i];
                        questionsByDifficulty[question.difficulty]++;
                    }
                    for (let difficulty in questionsByDifficulty) {
                        if (questionsByDifficulty[difficulty] < 15) {
                            delete questionsByDifficulty[difficulty];
                        }
                    }
                    if (Object.keys(questionsByDifficulty).length == 5) {
                        availableDifficulties = [1, 2, 3, 4, 5];
                    } else {
                        for (let difficulty in questionsByDifficulty) {
                            availableDifficulties.push(difficulty);
                        }
                    }
                    res.status(200).json({
                        message: "OK",
                        difficulties: availableDifficulties
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting available difficulties: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting available difficulties: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

//router.post("/getPracticeQuizzByTheme", async (req, res) => {

module.exports = router;
