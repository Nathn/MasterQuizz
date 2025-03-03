const express = require("express");

const router = express.Router();

const Question = require("../models/Question");
const Theme = require("../models/Theme");
const User = require("../models/User");

router.post("/createQuestion", async (req, res) => {
    try {
        console.log(`[SERVER] Creating a new question: ${req.body.question}`);
        // Get corresponding theme
        const theme = await Theme.findOne({
            code: { $eq: req.body.theme },
        }).exec();
        if (!theme) {
            console.log(
                `[SERVER] Theme not found while creating a new question`
            );
            res.status(200).json({
                message: "Thème introuvable.",
            });
            return;
        }
        // Get the user executing the request
        const user = await User.findOne({
            _id: req.body.user_id,
        }).exec();
        if (!user) {
            console.log(
                `[SERVER] User not found while creating a new question`
            );
            res.status(200).json({
                message: "Utilisateur introuvable.",
            });
            return;
        }
        // Create a new question
        question = new Question({
            answers: req.body.answers,
            difficulty: req.body.difficulty,
            question: req.body.question,
            theme: theme,
            user: req.body.user_id,
            online: user.admin,
        });
        await question.save();
        // And return a success message
        res.status(200).json({
            message: "OK",
        });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while creating a new question: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/updateQuestion", async (req, res) => {
    try {
        console.log(`[SERVER] Updating a question: ${req.body.questionId}`);
        // Get corresponding theme
        const theme = await Theme.findOne({
            code: req.body.theme,
        }).exec();
        // Update the question
        await Question.updateOne(
            {
                _id: req.body.questionId,
            },
            {
                answers: req.body.answers,
                difficulty: req.body.difficulty,
                question: req.body.question,
                theme: theme,
                updated: Date.now(),
                userUpdated: req.body.user_id,
            }
        )
            .exec()
            .then((question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while updating a question`
                    );
                    res.status(200).json({
                        message: "Question introuvable.",
                    });
                } else {
                    console.log(`[SERVER] Question updated: ${question._id}`);
                    res.status(200).json({
                        message: "OK",
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while updating a question: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while updating a question: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/deleteQuestion", async (req, res) => {
    try {
        console.log(`[SERVER] Deleting a question: ${req.body.questionId}`);
        await Question.deleteOne({
            _id: req.body.questionId,
        })
            .exec()
            .then((question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while deleting a question`
                    );
                    res.status(200).json({
                        message: "Question introuvable.",
                    });
                } else {
                    console.log(`[SERVER] Question deleted: ${question._id}`);
                    res.status(200).json({
                        message: "OK",
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while deleting a question: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while deleting a question: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/getRandomQuestion", async (req, res) => {
    try {
        console.log(`[SERVER] Getting a random question`);
        if (req.body.user_id) {
            // Get the user
            await User.findOne({
                _id: req.body.user_id,
            })
                .exec()
                .then((user) => {
                    if (user && user.remainingQuestions <= 0) {
                        console.log(`[SERVER] User has no remaining questions`);
                        res.status(200).json({
                            message: "OK",
                            question: null,
                        });
                    }
                })
                .catch((err) => {
                    console.log(
                        `[SERVER] An error occured while getting a random question: ${err}`
                    );
                    res.status(500).json({
                        message: "Internal server error",
                    });
                });
        }
        await Question.aggregate([
            {
                $sample: {
                    size: 1,
                },
            },
            {
                $match: {
                    online: true,
                },
            },
        ])
            .exec()
            .then((question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while getting a random question`
                    );
                    res.status(200).json({
                        message: "Question introuvable.",
                    });
                } else {
                    Question.populate(question, {
                        path: "theme",
                    })
                        .then((populatedQuestion) => {
                            console.log(
                                `[SERVER] Question found: ${populatedQuestion[0]._id}`
                            );
                            res.status(200).json({
                                message: "OK",
                                question: populatedQuestion[0],
                            });
                        })
                        .catch((err) => {
                            console.log(
                                `[SERVER] An error occured while populating a random question: ${err}`
                            );
                            res.status(500).json({
                                message: "Internal server error",
                            });
                        });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting a random question: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting a random question: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/getQuestionFromId", async (req, res) => {
    try {
        console.log(
            `[SERVER] Getting a question from id: ${req.body.questionId}`
        );
        await Question.findOne({
            _id: req.body.questionId,
        })
            .exec()
            .then((question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while getting a question from id`
                    );
                    res.status(200).json({
                        message: "Question introuvable.",
                    });
                } else {
                    Question.populate(question, { path: "theme" }).then(
                        (populatedQuestion) => {
                            console.log(
                                `[SERVER] Question found: ${populatedQuestion._id}`
                            );
                            res.status(200).json({
                                message: "OK",
                                question: populatedQuestion,
                            });
                        }
                    );
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting a question from id: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting a question from id: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/getAllQuestions", async (req, res) => {
    try {
        console.log(`[SERVER] Getting all questions`);
        await Question.find()
            .sort({ updated: -1, created: -1 })
            .exec()
            .then((questions) => {
                console.log(`[SERVER] Questions found: ${questions.length}`);
                // For each question, get the corresponding theme and user
                Question.populate(questions, { path: "theme user userUpdated" })
                    .then((populatedQuestions) => {
                        res.status(200).json({
                            message: "OK",
                            questions: populatedQuestions,
                        });
                    })
                    .catch((err) => {
                        console.log(
                            `[SERVER] An error occured while populating questions: ${err}`
                        );
                        res.status(500).json({
                            message: "Internal server error",
                        });
                    });
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting all questions: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting all questions: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/updateQuestionStats", async (req, res) => {
    /*
     *   Update both the question object and the user object
     *   @Input req.body.user_id
     *   @Input req.body.question_id
     *   @Input req.body.answer_status (true or false)
     * */
    try {
        console.log(
            `[SERVER] Updating question stats: ${req.body.question_id}`
        );
        await Question.updateOne(
            {
                _id: req.body.question_id,
            },
            {
                $inc: {
                    "stats.right": req.body.answer_status ? 1 : 0,
                    "stats.wrong": req.body.answer_status ? 0 : 1,
                },
            }
        )
            .exec()
            .then(async (question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while updating question stats`
                    );
                } else {
                    console.log(
                        `[SERVER] Question updated: ${req.body.question_id}`
                    );
                    await User.updateOne(
                        {
                            _id: req.body.user_id,
                        },
                        {
                            $inc: {
                                "stats.questions.right": req.body.answer_status
                                    ? 1
                                    : 0,
                                "stats.questions.wrong": req.body.answer_status
                                    ? 0
                                    : 1,
                            },
                        }
                    )
                        .exec()
                        .then((user) => {
                            if (!user) {
                                console.log(
                                    `[SERVER] User not found while updating question stats`
                                );
                                res.status(200).json({
                                    message: "User introuvable.",
                                });
                            } else {
                                console.log(
                                    `[SERVER] User updated: ${req.body.user_id}`
                                );
                                res.status(200).json({
                                    message: "OK",
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(
                                `[SERVER] An error occured while updating question stats: ${err}`
                            );
                            res.status(500).json({
                                message: "Internal server error",
                            });
                        });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while updating question stats: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while updating question stats: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/switchQuestionOnlineStatus", async (req, res) => {
    try {
        console.log(
            `[SERVER] Switching question online status: ${req.body.questionId}`
        );
        await Question.findOne({
            _id: req.body.question_id,
        })
            .exec()
            .then(async (question) => {
                if (!question) {
                    console.log(
                        `[SERVER] Question not found while switching question online status`
                    );
                    res.status(200).json({
                        message: "Question introuvable.",
                    });
                } else {
                    await Question.updateOne(
                        {
                            _id: req.body.question_id,
                        },
                        {
                            online: !question.online,
                            updated: Date.now(),
                            userUpdated: req.body.user_id,
                        }
                    )
                        .exec()
                        .then((question) => {
                            if (!question) {
                                console.log(
                                    `[SERVER] Question not found while switching question online status`
                                );
                                res.status(200).json({
                                    message: "Question introuvable.",
                                });
                            } else {
                                console.log(
                                    `[SERVER] Question updated: ${req.body.question_id}`
                                );
                                res.status(200).json({
                                    message: "OK",
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(
                                `[SERVER] An error occured while switching question online status: ${err}`
                            );
                            res.status(500).json({
                                message: "Internal server error",
                            });
                        });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while switching question online status: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while switching question online status: ${err}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = router;
