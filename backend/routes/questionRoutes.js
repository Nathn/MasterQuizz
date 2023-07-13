const express = require('express');

const router = express.Router();

const Question = require('../models/Question');
const Theme = require('../models/Theme');
const User = require('../models/User');

router.post('/createQuestion', async (req, res) => {
    try {
        console.log(`[SERVER] Creating a new question: ${req.body.question}`);
        // Get corresponding theme
        const theme = await Theme.findOne({
            code: req.body.theme
        }).exec();
        // Create a new question
        question = new Question({
            answers: req.body.answers,
            difficulty: req.body.difficulty,
            question: req.body.question,
            theme: theme,
            user: req.body.user
        });
        await question.save();
        // And return a success message
        res.status(200).json({
            message: 'OK'
        });
    } catch (err) {
        console.log(`[SERVER] An error occured while creating a new question: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/updateQuestion', async (req, res) => {
    try {
        console.log(`[SERVER] Updating a question: ${req.body.questionId}`);
        // Get corresponding theme
        const theme = await Theme.findOne({
            code: req.body.theme
        }).exec();
        // Update the question
        await Question.updateOne({
            _id: req.body.questionId
        }, {
            answers: req.body.answers,
            difficulty: req.body.difficulty,
            question: req.body.question,
            theme: theme,
            updated: Date.now(),
            userUpdated: req.body.user
        }).exec()
            .then(question => {
                if (!question) {
                    console.log(`[SERVER] Question not found while updating a question`);
                    res.status(200).json({
                        message: 'Question introuvable.'
                    });
                } else {
                    console.log(`[SERVER] Question updated: ${question._id}`);
                    res.status(200).json({
                        message: 'OK'
                    });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while updating a question: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while updating a question: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/deleteQuestion', async (req, res) => {
    try {
        console.log(`[SERVER] Deleting a question: ${req.body.questionId}`);
        await Question.deleteOne({
            _id: req.body.questionId
        }).exec()
            .then(question => {
                if (!question) {
                    console.log(`[SERVER] Question not found while deleting a question`);
                    res.status(200).json({
                        message: 'Question introuvable.'
                    });
                } else {
                    console.log(`[SERVER] Question deleted: ${question._id}`);
                    res.status(200).json({
                        message: 'OK'
                    });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while deleting a question: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while deleting a question: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/getRandomQuestion', async (req, res) => {
    try {
        console.log(`[SERVER] Getting a random question`);
        await Question.aggregate([{
            $sample: {
                size: 1
            }
        }]).exec()
            .then(question => {
                if (!question) {
                    console.log(`[SERVER] Question not found while getting a random question`);
                    res.status(200).json({
                        message: 'Question introuvable.'
                    });
                } else {
                    console.log(`[SERVER] Question found: ${question._id}`);
                    res.status(200).json({
                        message: 'OK',
                        question: question
                    });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while getting a random question: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while getting a random question: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/getQuestionFromId', async (req, res) => {
    try {
        console.log(`[SERVER] Getting a question from id: ${req.body.questionId}`);
        await Question.findOne({
            _id: req.body.questionId
        }).exec()
            .then(question => {
                if (!question) {
                    console.log(`[SERVER] Question not found while getting a question from id`);
                    res.status(200).json({
                        message: 'Question introuvable.'
                    });
                } else {
                    Question.populate(question, { path: 'theme user' })
                        .then(populatedQuestion => {
                            console.log(`[SERVER] Question found: ${populatedQuestion._id}`);
                            res.status(200).json({
                                message: 'OK',
                                question: populatedQuestion
                            });
                        });
                }
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while getting a question from id: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while getting a question from id: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/getAllQuestions', async (req, res) => {
    try {
        console.log(`[SERVER] Getting all questions`);
        await Question.find().exec()
            .then(questions => {
                console.log(`[SERVER] Questions found: ${questions.length}`);
                // For each question, get the corresponding theme and user
                Question.populate(questions, { path: 'theme user userUpdated' })
                    .then(populatedQuestions => {
                        res.status(200).json({
                            message: 'OK',
                            questions: populatedQuestions
                        });
                    })
                    .catch(err => {
                        console.log(`[SERVER] An error occured while populating questions: ${err}`);
                        res.status(500).json({
                            message: 'Internal server error'
                        });
                    });
            })
            .catch(err => {
                console.log(`[SERVER] An error occured while getting all questions: ${err}`);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while getting all questions: ${err}`);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


module.exports = router;
