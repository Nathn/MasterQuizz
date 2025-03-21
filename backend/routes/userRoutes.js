const express = require("express");
const nodemailer = require("nodemailer");
const { AES } = require("crypto-js");

const router = express.Router();

const User = require("../models/User");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRANSPORTER_HOST,
    port: process.env.MAIL_TRANSPORTER_PORT,
    secure: process.env.MAIL_TRANSPORTER_PORT == 465 ? true : false,
    auth: {
        user: process.env.MAIL_TRANSPORTER_AUTH_USER,
        pass: process.env.MAIL_TRANSPORTER_AUTH_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

router.post("/validateRegister", async (req, res) => {
    /*
    This route is used to validate the registration form.
    It checks if the username and email are already taken.
    */
    const { username, email } = req.body;
    // Check if the email is valid
    if (!email || email.length > 254 || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(200).json({
            message: "L'adresse email n'est pas valide."
        });
    }
    // Check if the username is valid
    if (!username || !username.match(/^[a-zA-Z0-9_]{1,14}$/)) {
        return res.status(200).json({
            message:
                "Le pseudo n'est pas valide.\nIl ne doit contenir que des caractères alphanumériques et underscores, et doit faire moins de 15 caractères."
        });
    }
    // Check if the username is already taken
    let user = await User.findOne({
        username: { $eq: username }
    });
    if (user) {
        return res.status(200).json({
            message: "Le pseudo n'est pas disponible."
        });
    }
    // Check if the email is already taken
    user = await User.findOne({
        email: { $eq: email }
    });
    if (user) {
        return res.status(200).json({
            message: "L'adresse email est déjà utilisée par un autre compte."
        });
    }
    // If everything is OK, return a success message
    res.status(200).json({
        message: "OK"
    });
});

router.post("/register", async (req, res) => {
    /*
    This route is used to register a new user.
    To be used only after Firebase Auth has validated the user.
    */
    try {
        console.log(
            `[SERVER] Registering a new user: ${req.body.username} - ${req.body.email}`
        );
        user = new User({
            email: req.body.email,
            username: req.body.username,
            displayName: req.body.username,
            avatarUrl:
                req.body.avatar ||
                `https://ui-avatars.com/api/?background=random&name=${req.body.username.replace(
                    " ",
                    "+"
                )}`
        });
        await user.save();
        if (process.env.MAIL_TRANSPORTER_HOST && process.env.MAIL_RECEIVER) {
            const message = {
                from: process.env.MAIL_TRANSPORTER_AUTH_USER, // sender's email address
                to: process.env.MAIL_RECEIVER,
                subject: "Nouvel utilisateur MasterQuizz", // Subject line
                text: `Un nouvel utilisateur s'est inscrit sur MasterQuizz.\n\nPseudo: ${req.body.username}\nEmail: ${req.body.email}\n\nCordialement,\nL'équipe MasterQuizz` // plain text body
            };
            transporter.sendMail(message, (err, info) => {
                if (err) {
                    console.log(
                        `[SERVER] An error occured while sending email: ${err}`
                    );
                } else {
                    console.log(
                        `[SERVER] Email sent: ${info.response} - ${info.messageId}`
                    );
                }
            });
        }
        // And return a success message
        res.status(200).json({
            message: "OK"
        });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while registering a new user: ${err}`
        );
        // if the error is duplicate email
        if (err.code === 11000 && err.keyPattern.email) {
            res.status(200).json({
                message: "Utilisateur déjà enregistré."
            });
        } else if (err.code === 11000 && err.keyPattern.username) {
            user = new User({
                email: req.body.email,
                username: req.body.username + Math.floor(Math.random() * 1000),
                displayName: req.body.username,
                avatarUrl: req.body.avatar
            });
            await user.save();
            if (
                process.env.MAIL_TRANSPORTER_HOST &&
                process.env.MAIL_RECEIVER
            ) {
                const message = {
                    from: process.env.MAIL_TRANSPORTER_AUTH_USER, // sender's email address
                    to: process.env.MAIL_RECEIVER,
                    subject: "Nouvel utilisateur MasterQuizz", // Subject line
                    text: `Un nouvel utilisateur s'est inscrit sur MasterQuizz.\n\nPseudo: ${req.body.username}\nEmail: ${req.body.email}\n\nCordialement,\nL'équipe MasterQuizz` // plain text body
                };
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log(
                            `[SERVER] An error occured while sending email: ${err}`
                        );
                    } else {
                        console.log(
                            `[SERVER] Email sent: ${info.response} - ${info.messageId}`
                        );
                    }
                });
            }
            res.status(200).json({
                message: "OK"
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

router.post("/getEmailFromUsername", async (req, res) => {
    /*
    This route is used to get the email of a user from his username.
    */
    try {
        console.log(
            `[SERVER] Getting email from username: ${req.body.username}`
        );
        await User.findOne({
            username: { $eq: req.body.username }
        })
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while getting email from username`
                    );
                    res.status(200).json({
                        message: "Nom d'utilisateur introuvable."
                    });
                } else {
                    console.log(`[SERVER] Email found: ${user.email}`);
                    res.status(200).json({
                        message: "OK",
                        email: AES.encrypt(
                            user.email,
                            process.env.ENCRYPTION_KEY || "secret key"
                        ).toString()
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting email from username: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting email from username: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getUserFromEmail", async (req, res) => {
    /*
    This route is used to get the user from his email.
    */
    try {
        console.log(`[SERVER] Getting user from email: ${req.body.email}`);
        await User.findOne({
            email: { $eq: req.body.email }
        })
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while getting user from email`
                    );
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    console.log(`[SERVER] User found: ${user.username}`);
                    res.status(200).json({
                        message: "OK",
                        user
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting user from email: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting user from email: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getUserFromUsername", async (req, res) => {
    /*
    This route is used to get the user from his username.
    */
    try {
        console.log(
            `[SERVER] Getting user from username: ${req.body.username}`
        );
        await User.findOne({
            username: { $eq: req.body.username }
        })
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while getting user from username`
                    );
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    delete user.email;
                    console.log(`[SERVER] User found: ${user.username}`);
                    res.status(200).json({
                        message: "OK",
                        user
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while getting user from username: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while getting user from username: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/editUsername", async (req, res) => {
    /*
    This route is used to edit the username of a user.
    */
    try {
        console.log("[SERVER] Editing username");
        // Check if the username is valid
        if (
            !req.body.username ||
            !req.body.username.match(/^[a-zA-Z0-9_]{1,14}$/)
        ) {
            return res.status(200).json({
                message:
                    "Le pseudo n'est pas valide.\nIl ne doit contenir que des caractères alphanumériques et underscores, et doit faire moins de 15 caractères."
            });
        }
        // Check if the username is already taken
        let userTest = await User.findOne({
            username: { $eq: req.body.username }
        });
        if (userTest && userTest._id.toString() !== req.body.userId) {
            return res.status(200).json({
                message: "Le pseudo n'est pas disponible."
            });
        }
        console.log(
            `[SERVER] Editing username of user ${req.body.userId} to ${req.body.username}`
        );
        await User.findOneAndUpdate(
            {
                _id: { $eq: req.body.userId }
            },
            {
                username: encodeURIComponent(req.body.username.toLowerCase()),
                displayName: encodeURIComponent(req.body.username)
            }
        )
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while editing username`
                    );
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    console.log(`[SERVER] Username edited: ${user.username}`);
                    res.status(200).json({
                        message: "OK",
                        user
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while editing username: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while editing username: ${err}`);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/editAvatar", async (req, res) => {
    /*
    This route is used to edit the avatar of a user.
    */
    try {
        console.log("[SERVER] Editing avatar");
        console.log(
            `[SERVER] Editing avatar of user ${req.body.userId} to ${req.body.avatar}`
        );
        await User.findOneAndUpdate(
            {
                _id: { $eq: req.body.userId }
            },
            {
                avatarUrl: encodeURIComponent(req.body.avatar)
            }
        )
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(`[SERVER] User not found while editing avatar`);
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    console.log(`[SERVER] Avatar edited: ${user.avatarUrl}`);
                    res.status(200).json({
                        message: "OK",
                        user
                    });
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while editing avatar: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(`[SERVER] An error occured while editing avatar: ${err}`);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/updateRemainingQuestions", async (req, res) => {
    /*
    This route is used to update the remaining questions of a user.
    If the user has no remaining questions, set the value of timeBeforeQuestionRefill to Date.now + 24h.
    */
    try {
        console.log("[SERVER] Updating remaining questions");
        console.log(
            `[SERVER] Updating remaining questions of user ${req.body.userId} to ${req.body.remainingQuestions}`
        );
        if (typeof req.body.userId !== "string") {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        if (typeof req.body.remainingQuestions !== "number") {
            res.status(400).json({ message: "Invalid remaining questions" });
            return;
        }
        await User.findOneAndUpdate(
            {
                _id: { $eq: req.body.userId }
            },
            {
                remainingQuestions: req.body.remainingQuestions
            }
        )
            .exec()
            .then((user) => {
                if (!user) {
                    console.log(
                        `[SERVER] User not found while updating remaining questions`
                    );
                    res.status(200).json({
                        message: "Utilisateur introuvable."
                    });
                } else {
                    console.log(
                        `[SERVER] Remaining questions updated: ${req.body.remainingQuestions}`
                    );
                    if (user.remainingQuestions <= 1) {
                        console.log(
                            `[SERVER] Setting refillQuestionsTime to ${
                                Date.now() + 86400000
                            }`
                        );
                        if (typeof req.body.userId !== "string") {
                            res.status(400).json({ message: "Invalid user ID" });
                            return;
                        }
                        User.findOneAndUpdate(
                            {
                                _id: { $eq: req.body.userId }
                            },
                            {
                                timeBeforeQuestionRefill: Date.now() + 86400000
                            }
                        )
                            .exec()
                            .then((user) => {
                                if (!user) {
                                    console.log(
                                        `[SERVER] User not found while setting refillQuetimeBeforeQuestionRefillstionsTime`
                                    );
                                    res.status(200).json({
                                        message: "Utilisateur introuvable."
                                    });
                                } else {
                                    console.log(
                                        `[SERVER] refillQuestionsTime set: ${
                                            Date.now() + 86400000
                                        }`
                                    );
                                    res.status(200).json({
                                        message: "OK",
                                        userObj: user
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    `[SERVER] An error occured while setting refillQuestionsTime: ${err}`
                                );
                                res.status(500).json({
                                    message: "Internal server error"
                                });
                            });
                    } else if (user.timeBeforeQuestionRefill) {
                        console.log(`[SERVER] Removing refillQuestionsTime`);
                        if (typeof req.body.userId !== "string") {
                            res.status(400).json({ message: "Invalid user ID" });
                            return;
                        }
                        User.findOneAndUpdate(
                            {
                                _id: { $eq: req.body.userId }
                            },
                            {
                                timeBeforeQuestionRefill: null
                            }
                        )
                            .exec()
                            .then((user) => {
                                if (!user) {
                                    console.log(
                                        `[SERVER] User not found while removing refillQuestionsTime`
                                    );
                                    res.status(200).json({
                                        message: "Utilisateur introuvable."
                                    });
                                } else {
                                    console.log(
                                        `[SERVER] refillQuestionsTime removed`
                                    );
                                    res.status(200).json({
                                        message: "OK",
                                        userObj: user
                                    });
                                }
                            });
                    }
                }
            })
            .catch((err) => {
                console.log(
                    `[SERVER] An error occured while updating remaining questions: ${err}`
                );
                res.status(500).json({
                    message: "Internal server error"
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occured while updating remaining questions: ${err}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
