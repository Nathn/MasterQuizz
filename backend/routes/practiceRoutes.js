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

router.post("/getPracticeQuizzByTheme", async (req, res) => {
    /*
    This route is used to get a list of 10 questions that correspond
    to the theme.
    The difficulty of each question should be 1 for the first 2 questions,
    2 for the next 2 questions, 3 for the next 2 questions, 4 for the next
    2 questions and 5 for the last 2 questions.
    */
    try {
        console.log(`[SERVER] Getting practice quizz by theme`);
        await Question.find({
            theme: { $eq: req.body.theme },
            online: true
        })
            .sort({ difficulty: "asc" })
            .populate("theme")
            .exec()
            .then((questions) => {
                if (!questions) {
                    console.log(
                        `[SERVER] Questions not found while getting practice quizz by theme`
                    );
                    res.status(200).json({
                        message: "Questions introuvables."
                    });
                } else {
                    console.log(
                        `[SERVER] Questions found while getting practice quizz by theme`
                    );
                    let practiceQuizz = [];
                    // Iterate through difficulty levels 1 to 5
                    for (let difficulty = 1; difficulty <= 5; difficulty++) {
                        // Filter questions based on the current difficulty level
                        const filteredQuestions = questions.filter(
                            (question) => question.difficulty === difficulty
                        );
                        // Randomize the order of the filtered questions
                        filteredQuestions.sort(() => Math.random() - 0.5);
                        // Select 2 questions from the filtered list and add them to the practiceQuizz array
                        practiceQuizz.push(...filteredQuestions.slice(0, 2));
                    }
                    res.status(200).json({
                        message: "OK",
                        questions: practiceQuizz
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting practice quizz by theme: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting practice quizz by theme: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getPracticeQuizzByDifficulty", async (req, res) => {
    /*
    This route is used to get a list of 10 questions that correspond
    to the difficulty.
    The theme of each question should be different from the theme of the
    previous question.
    */
    try {
        console.log(`[SERVER] Getting practice quizz by difficulty`);
        await Question.find({
            difficulty: { $eq: req.body.difficulty },
            online: true
        })
            .sort({ theme: "asc" })
            .populate("theme")
            .exec()
            .then((questions) => {
                if (!questions) {
                    console.log(
                        `[SERVER] Questions not found while getting practice quizz by difficulty`
                    );
                    res.status(200).json({
                        message: "Questions introuvables."
                    });
                } else {
                    console.log(
                        `[SERVER] Questions found while getting practice quizz by difficulty`
                    );
                    let practiceQuizz = [];
                    let themes = [];
                    // Randomize the order of the questions
                    questions.sort(() => Math.random() - 0.5);
                    for (
                        let i = 0;
                        i < questions.length && practiceQuizz.length < 10;
                        i++
                    ) {
                        let question = questions[i];
                        if (!themes.includes(question.theme._id)) {
                            themes.push(question.theme._id);
                            practiceQuizz.push(question);
                        }
                    }
                    res.status(200).json({
                        message: "OK",
                        questions: practiceQuizz
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting practice quizz by difficulty: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting practice quizz by difficulty: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/updatePlayedPracticeQuizzes", async (req, res) => {
    /*
    This route is used to update the playedPracticeQuizzes field of the user.
    It adds the theme or the difficulty of the practice quizz to the
    corresponding arrays, if they are not already in the arrays.
    */
    try {
        console.log(`[SERVER] Updating played practice quizzes`);
        const userId = req.body.user_id;
        if (typeof userId !== "string") {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        await User.findOne({ _id: { $eq: userId } })
            .exec()
            .then(async (user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while updating played practice quizzes`
                    );
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    console.log(
                        `[SERVER] User found while updating played practice quizzes`
                    );
                    if (req.body.mode === "theme") {
                        if (
                            !user.playedPracticeQuizzes.themes.includes(
                                req.body.quiz_id
                            )
                        ) {
                            user.playedPracticeQuizzes.themes.push(
                                req.body.quiz_id
                            );
                        }
                    } else if (req.body.mode === "difficulty") {
                        if (
                            !user.playedPracticeQuizzes.difficulties.includes(
                                req.body.quiz_id
                            )
                        ) {
                            user.playedPracticeQuizzes.difficulties.push(
                                req.body.quiz_id
                            );
                        }
                    }
                    await user
                        .save()
                        .then((user) => {
                            console.log(
                                `[SERVER] User updated while updating played practice quizzes`
                            );
                            res.status(200).json({
                                message: "OK",
                                user
                            });
                        })
                        .catch((err) => {
                            console.log(
                                `[SERVER] An error occured while updating played practice quizzes: ${err}`
                            );
                            res.status(500).json({
                                message: "Internal server error"
                            });
                        });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while updating played practice quizzes: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while updating played practice quizzes: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
