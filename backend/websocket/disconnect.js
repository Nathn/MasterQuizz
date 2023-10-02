const Match = require("../models/Match");

function handleWebSocketDisconnect(user) {
    Match.findOne({
        users: user,
        started: 0
    })
        .exec()
        .then((match) => {
            if (!match) {
                return;
            }
            Match.deleteOne({ _id: match._id })
                .then(() => {
                    console.log(`[WS] Match deleted`);
                })
                .catch((err) => {
                    console.log(
                        `[WS] An error occurred while deleting match: ${err}`
                    );
                    console.log(err.stack);
                });
        })
        .catch((err) => {
            console.log(`[WS] An error occurred while finding match: ${err}`);
            console.log(err.stack);
        });
}

module.exports = {
    handleWebSocketDisconnect
};
