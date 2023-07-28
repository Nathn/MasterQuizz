const Question = require("../models/Question");
const Match = require("../models/Match");
const User = require("../models/User");

function find(request, ws, userWebSockets) {
    Match.findOne({
        users: {
            $size: 1,
        },
        started: 0,
    })
        .populate("users")
        .exec()
        .then((match) => {
            if (!match) {
                console.log(`[WS] No match found`);
                const newMatch = new Match({
                    users: [request.user],
                });
                newMatch
                    .save()
                    .then((match) => {
                        console.log(`[WS] Match created`);
                        ws.send(
                            JSON.stringify({
                                message: "OK",
                                type: "duel",
                                status: "waiting",
                                match,
                            })
                        );
                    })
                    .catch((err) => {
                        console.log(
                            `[WS] An error occurred while creating match: ${err}`
                        );
                        console.log(err.stack);
                        ws.send(
                            JSON.stringify({
                                message: "Internal server error",
                            })
                        );
                    });
            } else {
                console.log(`[WS] Match found: ${match._id}`);
                match.users.push(request.user);
                match
                    .save()
                    .then((match) => {
                        console.log(`[WS] Match updated`);
                        const userWs1 = userWebSockets[match.users[0]._id]; // WebSocket of the first user
                        const userWs2 = userWebSockets[match.users[1]._id]; // WebSocket of the second user (newly joined)
                        // Check if both users' WebSocket connections exist
                        if (userWs1 && userWs2) {
                            // Send a message to both users
                            userWs1.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "ready",
                                    match,
                                })
                            );
                            userWs2.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "ready",
                                    match,
                                })
                            );
                        } else {
                            console.log(
                                `[WS] One of the users is not connected`
                            );
                            ws.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "waiting",
                                    match,
                                })
                            );
                        }
                    })
                    .catch((err) => {
                        console.log(
                            `[WS] An error occurred while updating match: ${err}`
                        );
                        console.log(err.stack);
                        ws.send(
                            JSON.stringify({
                                message: "Internal server error",
                            })
                        );
                    });
            }
        })
        .catch((err) => {
            console.log(`[WS] An error occurred while finding match: ${err}`);
            console.log(err.stack);
            ws.send(
                JSON.stringify({
                    message: "Internal server error",
                })
            );
        });
}

function cancel(request, ws, userWebSockets) {
    Match.findOne({
        users: request.user,
        started: 0,
    })
        .exec()
        .then((match) => {
            Match.deleteOne({ _id: match._id })
                .then(() => {
                    console.log(`[WS] Match deleted`);
                    ws.send(
                        JSON.stringify({
                            message: "OK",
                            type: "duel",
                            status: "cancelled",
                        })
                    );
                })
                .catch((err) => {
                    console.log(
                        `[WS] An error occurred while deleting match: ${err}`
                    );
                    console.log(err.stack);
                    ws.send(
                        JSON.stringify({
                            message: "Internal server error",
                        })
                    );
                });
        })
        .catch((err) => {
            console.log(`[WS] An error occurred while finding match: ${err}`);
            console.log(err.stack);
            ws.send(
                JSON.stringify({
                    message: "Internal server error",
                })
            );
        });
}

function start(request, ws, userWebSockets) {
    // Find the match corresponding to the match parameter
    // Add 1 to the started field
    // If both users started the match, then send a message to both users containing the info & first question
    Match.findOne({
        _id: request.match,
    })
        .populate("users")
        .exec()
        .then((match) => {
            if (!match) {
                console.log(`[WS] Match not found`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found",
                    })
                );
            } else {
                console.log(`[WS] Match found: ${match._id}`);
                match.started += 1;
                match
                    .save()
                    .then((match) => {
                        console.log(`[WS] Match updated`);
                        if (match.started === 2) {
                            console.log(`[WS] Both users started the match`);
                            const userWs1 = userWebSockets[match.users[0]._id]; // WebSocket of the first user
                            const userWs2 = userWebSockets[match.users[1]._id]; // WebSocket of the second user
                            // Check if both users' WebSocket connections exist
                            if (userWs1 && userWs2) {
                                Question.aggregate([
                                    {
                                        $match: {
                                            difficulty: { $in: [1, 2] },
                                        },
                                    },
                                    { $sample: { size: 1 } },
                                    {
                                        $lookup: {
                                            from: "themes",
                                            localField: "theme",
                                            foreignField: "_id",
                                            as: "theme",
                                        },
                                    },
                                    { $unwind: "$theme" },
                                ])
                                    .exec()
                                    .then((questions) => {
                                        console.log(
                                            `[WS] Question found: ${questions[0]._id}`
                                        );
                                        // Add the question to the match
                                        match.questions.push(questions[0]._id);
                                        match.save().then((match) => {
                                            console.log(
                                                `[WS] Match updated with question`
                                            );
                                            // Send a message to both users
                                            userWs1.send(
                                                JSON.stringify({
                                                    message: "OK",
                                                    type: "duel",
                                                    status: "started",
                                                    match,
                                                    question: questions[0],
                                                })
                                            );
                                            userWs2.send(
                                                JSON.stringify({
                                                    message: "OK",
                                                    type: "duel",
                                                    status: "started",
                                                    match,
                                                    question: questions[0],
                                                })
                                            );
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(
                                            `[WS] An error occurred while finding question: ${err}`
                                        );
                                        console.log(err.stack);
                                        ws.send(
                                            JSON.stringify({
                                                message:
                                                    "Internal server error",
                                            })
                                        );
                                    });
                            } else {
                                console.log(
                                    `[WS] One of the users is not connected`
                                );
                                ws.send(
                                    JSON.stringify({
                                        message: "OK",
                                        type: "duel",
                                        status: "waiting",
                                        match,
                                    })
                                );
                            }
                        } else if (match.started > 2) {
                            console.log(
                                `[WS] Both users already started the match`
                            );
                            match.started = 2;
                            match.save().then((match) => {
                                Question.findById(
                                    match.questions[match.currentQuestion]
                                )
                                    .populate("theme")
                                    .exec()
                                    .then((question) => {
                                        ws.send(
                                            JSON.stringify({
                                                message: "OK",
                                                type: "duel",
                                                status: "started",
                                                match,
                                                question,
                                            })
                                        );
                                    });
                            });
                        }
                    })
                    .catch((err) => {
                        console.log(
                            `[WS] An error occurred while updating match: ${err}`
                        );
                        console.log(err.stack);
                        ws.send(
                            JSON.stringify({
                                message: "Internal server error",
                            })
                        );
                    });
            }
        })
        .catch((err) => {
            if (err.name === "CastError") {
                console.log(`[WS] Match not found (invalid id)`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found",
                    })
                );
            } else {
                console.log(
                    `[WS] An error occurred while finding match: ${err}`
                );
                console.log(err.stack);
                ws.send(
                    JSON.stringify({
                        message: "Internal server error",
                    })
                );
            }
        });
}

function answer(request, ws, userWebSockets) {
    // Find the match corresponding to the match parameter
    // Check if the other user already answered
    // If yes, then send a message to both users containing the info & next question
    // If no, then save the answer
    Match.findOne({
        _id: request.match,
    })
        .populate("users")
        .exec()
        .then((match) => {
            if (!match) {
                console.log(`[WS] Match not found`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found",
                    })
                );
            } else {
                console.log(`[WS] Match found: ${match._id}`);
                const userWs1 = userWebSockets[match.users[0]._id]; // WebSocket of the first user
                const userWs2 = userWebSockets[match.users[1]._id]; // WebSocket of the second user
                // Check if both users' WebSocket connections exist
                if (userWs1 && userWs2) {
                    // Check if the other user already answered
                    if (match.answers[match.currentQuestion].length > 0) {
                        console.log(`[WS] Second user answered the question`);
                        // Pick a random question and add it to the match
                        Question.aggregate([
                            {
                                $match: {
                                    // difficulty based on the current question
                                    difficulty: {
                                        $in: [
                                            Math.floor(
                                                (match.currentQuestion + 1) / 2
                                            ),
                                            Math.floor(
                                                (match.currentQuestion + 1) / 2
                                            ) + 1,
                                        ],
                                    },
                                },
                            },
                            { $sample: { size: 1 } },
                            {
                                $lookup: {
                                    from: "themes",
                                    localField: "theme",
                                    foreignField: "_id",
                                    as: "theme",
                                },
                            },
                            { $unwind: "$theme" },
                        ])
                            .exec()
                            .then((questions) => {
                                console.log(
                                    `[WS] Question found: ${questions[0]._id}`
                                );
                                // Add the question to the match
                                match.questions.push(questions[0]._id);
                                match.save().then((match) => {
                                    console.log(
                                        `[WS] Match updated with question`
                                    );
                                    // Send a message to both users
                                    userWs1.send(
                                        JSON.stringify({
                                            message: "OK",
                                            type: "duel",
                                            status: "answered",
                                            match,
                                            question: questions[0],
                                        })
                                    );
                                    userWs2.send(
                                        JSON.stringify({
                                            message: "OK",
                                            type: "duel",
                                            status: "answered",
                                            match,
                                            question: questions[0],
                                        })
                                    );
                                });
                            })
                            .catch((err) => {
                                console.log(
                                    `[WS] An error occurred while finding question: ${err}`
                                );
                                console.log(err.stack);
                                ws.send(
                                    JSON.stringify({
                                        message: "Internal server error",
                                    })
                                );
                            });
                    } else {
                        console.log(`[WS] First user answered the question`);
                        // Save the answer
                        match.answers[match.currentQuestion].push({
                            user: request.user,
                            answerIndex: request.answer,
                        });
                        match.save().then((match) => {
                            console.log(`[WS] Match updated with answer`);
                            // Send a message to both users
                            userWs1.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "waiting",
                                    match,
                                })
                            );
                            userWs2.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "waiting",
                                    match,
                                })
                            );
                        });
                    }
                } else {
                    console.log(`[WS] One of the users is not connected`);
                    if (userWs1) {
                        userWs1.send(
                            JSON.stringify({
                                message: "OK",
                                type: "duel",
                                status: "waiting",
                                match,
                            })
                        );
                    }
                    if (userWs2) {
                        userWs2.send(
                            JSON.stringify({
                                message: "OK",
                                type: "duel",
                                status: "waiting",
                                match,
                            })
                        );
                    }
                }
            }
        })
        .catch((err) => {
            if (err.name === "CastError") {
                console.log(`[WS] Match not found (invalid id)`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found",
                    })
                );
            } else {
                console.log(
                    `[WS] An error occurred while finding match: ${err}`
                );
                console.log(err.stack);
                ws.send(
                    JSON.stringify({
                        message: "Internal server error",
                    })
                );
            }
        });
}

module.exports = {
    find,
    cancel,
    start,
    answer,
};
