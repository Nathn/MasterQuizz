const Match = require("../../models/Match");

function find(request, ws, userWebSockets) {
    Match.findOne({
        users: {
            $size: 1,
            $ne: request.user // Exclude the request.user from the query
        },
        started: 0
    })
        .populate("users")
        .exec()
        .then((match) => {
            if (!match) {
                console.log(`[WS] No match found`);
                const newMatch = new Match({
                    users: [request.user]
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
                                match
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
                                message: "Internal server error"
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
                        // Send a message to all users in the match
                        for (const user in userWebSockets) {
                            if (userWebSockets.hasOwnProperty(user)) {
                                userWebSockets[user].send(
                                    JSON.stringify({
                                        message: "OK",
                                        type: "duel",
                                        status: "ready",
                                        match
                                    })
                                );
                            }
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
            console.log(`[WS] An error occurred while finding match: ${err}`);
            console.log(err.stack);
            ws.send(
                JSON.stringify({
                    message: "Internal server error"
                })
            );
        });
}

module.exports = {
    find
};
