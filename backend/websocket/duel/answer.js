const Question = require("../../models/Question");
const Match = require("../../models/Match");
const User = require("../../models/User");

const getNewRating = require("./utils/elo").getNewRating;

function answer(request, ws, userWebSockets) {
    // Find the match corresponding to the match parameter
    // Check if the other user already answered
    // If yes, then send a message to both users containing the info & next question
    // If no, then save the answer
    Match.findOne({
        _id: request.match
    })
        .populate("users questions")
        .exec()
        .then((match) => {
            if (!match) {
                console.log(`[WS] Match not found`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found"
                    })
                );
            } else {
                console.log(`[WS] Match found: ${match._id}`);
                // Check if the other user already answered
                if (
                    match.answers.length > match.currentQuestion &&
                    match.answers[match.currentQuestion] &&
                    match.answers[match.currentQuestion].size > 0 &&
                    !match.answers[match.currentQuestion].has(
                        request.user.toString()
                    )
                ) {
                    console.log(`[WS] Second user answered the question`);
                    match.answers[match.currentQuestion].set(
                        request.user.toString(),
                        request.answer
                    );
                    Match.updateOne(
                        { _id: request.match },
                        { $set: { answers: match.answers } }
                    ).then(() => {
                        Match.findById(request.match)
                            .populate("users questions")
                            .then((match) => {
                                console.log("[WS] Match updated with answer");
                                // Check if the question was the last one
                                if (match.currentQuestion === 9) {
                                    console.log(`[WS] Match ended`);
                                    // Calculate the score of both users
                                    match.scores.set(match.users[0]._id, 0);
                                    match.scores.set(match.users[1]._id, 0);
                                    for (let i = 0; i < 10; i++) {
                                        for (let j = 0; j < 2; j++) {
                                            if (
                                                match.questions[i].answers[
                                                    match.answers[i].get(
                                                        match.users[j]._id
                                                    )
                                                ] &&
                                                match.questions[i].answers[
                                                    match.answers[i].get(
                                                        match.users[j]._id
                                                    )
                                                ].correct
                                            ) {
                                                match.scores.set(
                                                    match.users[j]._id,
                                                    match.scores.get(
                                                        match.users[j]._id
                                                    ) + 1
                                                );
                                            }
                                        }
                                    }
                                    // Set the winner
                                    if (
                                        match.scores.get(match.users[0]._id) >
                                        match.scores.get(match.users[1]._id)
                                    ) {
                                        match.winner = match.users[0];
                                    } else if (
                                        match.scores.get(match.users[0]._id) <
                                        match.scores.get(match.users[1]._id)
                                    ) {
                                        match.winner = match.users[1];
                                    } else {
                                        match.winner = null;
                                    }
                                    // Set the match as ended
                                    match.ended = true;
                                    match.save().then((match) => {
                                        // Update the users' stats and elo
                                        User.findById(match.users[0]._id).then(
                                            (user1) => {
                                                User.findById(
                                                    match.users[1]._id
                                                ).then((user2) => {
                                                    let user1EloChange = 0;
                                                    let user2EloChange = 0;
                                                    if (match.winner) {
                                                        if (
                                                            match.winner._id.toString() ===
                                                            user1._id.toString()
                                                        ) {
                                                            user1.stats.duels
                                                                .wins++;
                                                            user2.stats.duels
                                                                .losses++;
                                                            user1EloChange =
                                                                user1.elo;
                                                            user2EloChange =
                                                                user2.elo;
                                                            user1.elo =
                                                                getNewRating(
                                                                    user1.elo,
                                                                    user2.elo,
                                                                    1
                                                                );
                                                            user2.elo =
                                                                getNewRating(
                                                                    user2.elo,
                                                                    user1.elo,
                                                                    0
                                                                );
                                                            user1EloChange =
                                                                user1.elo -
                                                                user1EloChange;
                                                            user2EloChange =
                                                                user2.elo -
                                                                user2EloChange;
                                                        } else {
                                                            user1.stats.duels
                                                                .losses++;
                                                            user2.stats.duels
                                                                .wins++;
                                                            user2EloChange =
                                                                user2.elo;
                                                            user1EloChange =
                                                                user1.elo;
                                                            user1.elo =
                                                                getNewRating(
                                                                    user1.elo,
                                                                    user2.elo,
                                                                    0
                                                                );
                                                            user2.elo =
                                                                getNewRating(
                                                                    user2.elo,
                                                                    user1.elo,
                                                                    1
                                                                );
                                                            user2EloChange =
                                                                user2.elo -
                                                                user2EloChange;
                                                            user1EloChange =
                                                                user1.elo -
                                                                user1EloChange;
                                                        }
                                                    } else {
                                                        user1.stats.duels
                                                            .draws++;
                                                        user2.stats.duels
                                                            .draws++;
                                                        user1EloChange =
                                                            user1.elo;
                                                        user2EloChange =
                                                            user2.elo;
                                                        user1.elo =
                                                            getNewRating(
                                                                user1.elo,
                                                                user2.elo,
                                                                0.5
                                                            );
                                                        user2.elo =
                                                            getNewRating(
                                                                user2.elo,
                                                                user1.elo,
                                                                0.5
                                                            );
                                                        user1EloChange =
                                                            user1.elo -
                                                            user1EloChange;
                                                        user2EloChange =
                                                            user2.elo -
                                                            user2EloChange;
                                                    }
                                                    match.eloChanges.set(
                                                        user1._id,
                                                        user1EloChange
                                                    );
                                                    match.eloChanges.set(
                                                        user2._id,
                                                        user2EloChange
                                                    );
                                                    // Updating questions stats for both users
                                                    user1.stats.questions.right +=
                                                        match.scores.get(
                                                            user1._id
                                                        );
                                                    user1.stats.questions.wrong +=
                                                        10 -
                                                        match.scores.get(
                                                            user1._id
                                                        );
                                                    user2.stats.questions.right +=
                                                        match.scores.get(
                                                            user2._id
                                                        );
                                                    user2.stats.questions.wrong +=
                                                        10 -
                                                        match.scores.get(
                                                            user2._id
                                                        );
                                                    user1.save().then(() => {
                                                        user2
                                                            .save()
                                                            .then(() => {
                                                                match
                                                                    .save()
                                                                    .then(
                                                                        () => {
                                                                            match
                                                                                .populate(
                                                                                    "users winner scores.user questions"
                                                                                )
                                                                                .then(
                                                                                    (
                                                                                        match
                                                                                    ) => {
                                                                                        // Send a message to both users
                                                                                        const message =
                                                                                            {
                                                                                                message:
                                                                                                    "OK",
                                                                                                type: "duel",
                                                                                                status: "ended",
                                                                                                match: match.toObject(), // Convert the Mongoose document to a plain JavaScript object
                                                                                                eloChanges:
                                                                                                    match.eloChanges,
                                                                                                scores: match.scores,
                                                                                                answers:
                                                                                                    match.answers
                                                                                            };
                                                                                        for (const user in userWebSockets) {
                                                                                            // Send a message to all users (to support spectator mode)
                                                                                            if (
                                                                                                userWebSockets.hasOwnProperty(
                                                                                                    user
                                                                                                )
                                                                                            ) {
                                                                                                userWebSockets[
                                                                                                    user
                                                                                                ].send(
                                                                                                    JSON.stringify(
                                                                                                        message
                                                                                                    )
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                        // }
                                                                                    }
                                                                                );
                                                                        }
                                                                    );
                                                            });
                                                    });
                                                });
                                            }
                                        );
                                    });
                                } else {
                                    // Pick a random question and add it to the match
                                    match.currentQuestion++;
                                    Question.aggregate([
                                        {
                                            $lookup: {
                                                from: "matches",
                                                let: { questionId: "$_id" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    {
                                                                        $in: [
                                                                            "$$questionId",
                                                                            "$questions"
                                                                        ]
                                                                    },
                                                                    {
                                                                        $eq: [
                                                                            "$ended",
                                                                            false
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ],
                                                as: "matches"
                                            }
                                        },
                                        {
                                            $match: {
                                                matches: { $size: 0 },
                                                difficulty: {
                                                    $in: [
                                                        Math.min(
                                                            Math.floor(
                                                                (match.currentQuestion +
                                                                    1) /
                                                                    2
                                                            ),
                                                            4
                                                        ),
                                                        Math.min(
                                                            Math.floor(
                                                                (match.currentQuestion +
                                                                    1) /
                                                                    2
                                                            ),
                                                            4
                                                        ) + 1
                                                    ]
                                                },
                                                online: true
                                            }
                                        },
                                        { $sample: { size: 1 } },
                                        {
                                            $lookup: {
                                                from: "themes",
                                                localField: "theme",
                                                foreignField: "_id",
                                                as: "theme"
                                            }
                                        },
                                        { $unwind: "$theme" }
                                    ])
                                        .exec()
                                        .then((questions) => {
                                            console.log(
                                                `[WS] Question found: ${questions[0]._id}`
                                            );
                                            // Add the question to the match
                                            match.questions.push(
                                                questions[0]._id
                                            );
                                            // Add the time limit to the match (Date.now() + 30 seconds)
                                            match.timeLimits.push(
                                                Date.now() + 90000
                                            );
                                            match.save().then((match) => {
                                                console.log(
                                                    `[WS] Match updated with question`
                                                );
                                                for (const user in userWebSockets) {
                                                    // Send a message to all users (to support spectator mode)
                                                    if (
                                                        userWebSockets.hasOwnProperty(
                                                            user
                                                        )
                                                    ) {
                                                        userWebSockets[
                                                            user
                                                        ].send(
                                                            JSON.stringify({
                                                                message: "OK",
                                                                type: "duel",
                                                                status: "answered",
                                                                match,
                                                                question:
                                                                    questions[0]
                                                            })
                                                        );
                                                    }
                                                }
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
                                                        "Internal server error"
                                                })
                                            );
                                        });
                                }
                            });
                    });
                } else if (
                    match.answers.length > match.currentQuestion &&
                    match.answers[match.currentQuestion].size > 0 &&
                    match.answers[match.currentQuestion].has(
                        request.user.toString()
                    )
                ) {
                    console.log(`[WS] User already answered the question`);
                    ws.send(
                        JSON.stringify({
                            message: "OK",
                            type: "duel",
                            status: "waitingforanswer",
                            match
                        })
                    );
                } else {
                    console.log(`[WS] First user answered the question`);
                    // Save the answer
                    let newAnswerMap = new Map();
                    newAnswerMap.set(request.user, request.answer); // /!\ request.user is the user id !
                    match.answers.push(newAnswerMap);
                    match
                        .save()
                        .then((match) => {
                            console.log(`[WS] Match updated with answer`);
                            ws.send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "waitingforanswer",
                                    match
                                })
                            );
                        })
                        .catch((err) => {
                            console.log(
                                `[WS] An error occurred while updating match: ${err}`
                            );
                            console.log(err.stack);
                            ws.send(
                                JSON.stringify({
                                    message: "Internal server error"
                                })
                            );
                        });
                }
            }
        })
        .catch((err) => {
            if (err.name === "CastError") {
                console.log(`[WS] Match not found (invalid id)`);
                console.log(err.stack);
                ws.send(
                    JSON.stringify({
                        message: "Internal server error"
                    })
                );
            } else {
                console.log(
                    `[WS] An error occurred while finding match: ${err}`
                );
                console.log(err.stack);
                ws.send(
                    JSON.stringify({
                        message: "Internal server error"
                    })
                );
            }
        });
}

module.exports = {
    answer
};
