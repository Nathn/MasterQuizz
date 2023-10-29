const Match = require("../../models/Match");
const User = require("../../models/User");

const getNewRating = require("./utils/elo").getNewRating;

function forfeit(request, ws, userWebSockets) {
    Match.findOne({
        _id: request.match
    })
        .populate("users")
        .exec()
        .then((match) => {
            if (
                !match ||
                (match.users[0]._id != request.user &&
                    match.users[1]._id != request.user)
            ) {
                console.log(`[WS] Match not found`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found"
                    })
                );
            } else if (match.ended) {
                console.log(`[WS] Match already ended`);
                ws.send(
                    JSON.stringify({
                        message: "OK",
                        type: "duel",
                        status: "not found"
                    })
                );
            } else {
                console.log(`[WS] Match found: ${match._id}`);
                // Set the winner
                if (match.users[0]._id.toString() === request.user.toString()) {
                    match.winner = match.users[1];
                    match.scores.set(match.users[1]._id, 10);
                    match.scores.set(match.users[0]._id, 0);
                }
                if (match.users[1]._id.toString() === request.user.toString()) {
                    match.winner = match.users[0];
                    match.scores.set(match.users[0]._id, 10);
                    match.scores.set(match.users[1]._id, 0);
                }
                // Set the match as ended
                match.ended = true;
                match.save().then((match) => {
                    console.log(`[WS] Match updated`);
                    // Update the users' stats and elo
                    User.findById(match.users[0]._id).then((user1) => {
                        User.findById(match.users[1]._id).then((user2) => {
                            let user1EloChange = 0;
                            let user2EloChange = 0;
                            if (match.winner) {
                                if (
                                    match.winner._id.toString() ===
                                    user1._id.toString()
                                ) {
                                    user1.stats.duels.wins++;
                                    user2.stats.duels.losses++;
                                    user1EloChange = user1.elo;
                                    user2EloChange = user2.elo;
                                    user1.elo = getNewRating(
                                        user1.elo,
                                        user2.elo,
                                        1
                                    );
                                    user2.elo = getNewRating(
                                        user2.elo,
                                        user1.elo,
                                        0
                                    );
                                    user1EloChange = user1.elo - user1EloChange;
                                    user2EloChange = user2.elo - user2EloChange;
                                } else {
                                    user1.stats.duels.losses++;
                                    user2.stats.duels.wins++;
                                    user2EloChange = user2.elo;
                                    user1EloChange = user1.elo;
                                    user1.elo = getNewRating(
                                        user1.elo,
                                        user2.elo,
                                        0
                                    );
                                    user2.elo = getNewRating(
                                        user2.elo,
                                        user1.elo,
                                        1
                                    );
                                    user2EloChange = user2.elo - user2EloChange;
                                    user1EloChange = user1.elo - user1EloChange;
                                }
                            } else {
                                user1.stats.duels.draws++;
                                user2.stats.duels.draws++;
                                user1EloChange = user1.elo;
                                user2EloChange = user2.elo;
                                user1.elo = getNewRating(
                                    user1.elo,
                                    user2.elo,
                                    0.5
                                );
                                user2.elo = getNewRating(
                                    user2.elo,
                                    user1.elo,
                                    0.5
                                );
                                user1EloChange = user1.elo - user1EloChange;
                                user2ElorChange = user2.elo - user2EloChange;
                            }
                            match.eloChanges.set(user1._id, user1EloChange);
                            match.eloChanges.set(user2._id, user2EloChange);
                            // Updating questions stats for both users
                            user1.stats.questions.right += match.scores.get(
                                user1._id
                            );
                            user1.stats.questions.wrong +=
                                10 - match.scores.get(user1._id);
                            user2.stats.questions.right += match.scores.get(
                                user2._id
                            );
                            user2.stats.questions.wrong +=
                                10 - match.scores.get(user2._id);
                            user1.save().then(() => {
                                user2.save().then(() => {
                                    match.save().then(() => {
                                        console.log(
                                            `[WS] Match & users updated (match forfeited)`
                                        );
                                        match
                                            .populate(
                                                "users winner scores.user questions"
                                            )
                                            .then((match) => {
                                                // Send a message to both users
                                                const message = {
                                                    message: "OK",
                                                    type: "duel",
                                                    status: "ended",
                                                    match: match.toObject(), // Convert the Mongoose document to a plain JavaScript object
                                                    eloChanges:
                                                        match.eloChanges,
                                                    scores: match.scores,
                                                    answers: match.answers
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
                                            });
                                    });
                                });
                            });
                        });
                    });
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
    forfeit
};
