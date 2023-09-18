const Match = require("../../models/Match");

function cancel(request, ws, userWebSockets) {
    Match.findOne({
        users: request.user,
        started: 0
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
                            status: "cancelled"
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
                            message: "Internal server error"
                        })
                    );
                });
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
    cancel
};
