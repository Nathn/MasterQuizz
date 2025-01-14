const express = require("express");

const router = express.Router();

const Match = require("../models/Match");

router.post("/getCurrentDuelFromUser", async (req, res) => {
    /*
     *   Get the current duel of a user
     *   @param {string} use
     *   @return {object} duel
     * */
    const userId = req.body.user;
    try {
        const match = await Match.findOne({
            users: { $size: 2, $in: [userId] },
            ended: false
        });
        if (!match) {
            const searchMatch = await Match.findOne({
                users: { $size: 1, $in: [userId] },
                started: false
            });
            if (!searchMatch) {
                res.status(200).json({
                    message: "OK"
                });
            } else {
                console.log(
                    `[SERVER] Found match ${searchMatch._id} for user ${userId} (in queue)`
                );
                res.status(200).json({
                    message: "OK",
                    status: "searching"
                });
            }
        } else {
            console.log(`[SERVER] Found match ${match._id} for user ${userId}`);
            res.status(200).json({
                message: "OK",
                status: "found",
                match: match
            });
        }
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while finding match: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
