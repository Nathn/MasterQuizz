const Question = require("../../models/Question");
const Match = require("../../models/Match");

function start(request, ws, userWebSockets) {
    // Find the match corresponding to the match parameter
    // Add 1 to the started field
    // If both users started the match, then send a message to both users containing the info & first question
    Match.findOne({
        _id: request.match
    })
        .populate("users winner scores.user questions")
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
                if (match.ended) {
                    console.log(`[WS] Match already ended`);
                    for (const user in userWebSockets) {
                        // Send a message to all users (to support spectator mode)
                        if (userWebSockets.hasOwnProperty(user)) {
                            userWebSockets[user].send(
                                JSON.stringify({
                                    message: "OK",
                                    type: "duel",
                                    status: "ended",
                                    match: match.toObject(),
                                    eloChanges: match.eloChanges,
                                    scores: match.scores,
                                    answers: match.answers
                                })
                            );
                        }
                    }
                    return;
                }
                console.log(`[WS] Match found: ${match._id}`);
                // if the user is not in the match ans match is not started yet, then return
                if (
                    !(
                        match.users[0]._id == request.user ||
                        (match.users[1] && match.users[1]._id == request.user)
                    ) &&
                    match.started < 2
                ) {
                    console.log(`[WS] User not in the match`);
                    ws.send(
                        JSON.stringify({
                            message: "OK",
                            type: "duel",
                            status: "not found"
                        })
                    );
                    return;
                }
                match.started += 1;
                match
                    .save()
                    .then((match) => {
                        console.log(`[WS] Match updated`);
                        if (match.started === 2) {
                            console.log(`[WS] Both users started the match`);
                            Question.aggregate([
                                {
                                    $match: {
                                        difficulty: { $in: [1, 2] },
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
                                    match.questions.push(questions[0]._id);
                                    // Add the time limit to the match (Date.now() + 30 seconds)
                                    match.timeLimits.push(Date.now() + 90000);
                                    match.save().then((match) => {
                                        console.log(
                                            `[WS] Match updated with question`
                                        );
                                        for (const user in userWebSockets) {
                                            if (
                                                userWebSockets.hasOwnProperty(
                                                    user
                                                )
                                            ) {
                                                JSON.stringify({
                                                    message: "OK",
                                                    type: "duel",
                                                    status: "started",
                                                    match,
                                                    question: questions[0]
                                                });
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
                                            message: "Internal server error"
                                        })
                                    );
                                });
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
                                                question
                                            })
                                        );
                                        if (
                                            match.answers.length >
                                                match.currentQuestion &&
                                            match.answers[match.currentQuestion]
                                                .size > 0 &&
                                            ((request.user &&
                                                match.answers[
                                                    match.currentQuestion
                                                ].has(
                                                    request.user.toString()
                                                )) ||
                                                !request.user)
                                        ) {
                                            console.log(
                                                `[WS] User already answered the question`
                                            );
                                            ws.send(
                                                JSON.stringify({
                                                    message: "OK",
                                                    type: "duel",
                                                    status: "waitingforanswer",
                                                    match,
                                                    user: request.user
                                                })
                                            );
                                        }
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
                                message: "Internal server error"
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
                        status: "not found"
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
    start
};
