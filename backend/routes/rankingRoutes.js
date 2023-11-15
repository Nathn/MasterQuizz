const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Match = require("../models/Match");

router.post("/getTopUsersByElo", async (req, res) => {
    /*
     *   Get the top users by elo
     *   @param {string} user_id
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top ten users by elo`);
        await User.find({})
            .sort({ elo: -1 })
            .limit(50)
            .select("displayName username avatarUrl elo") // Only return the displayName, username, and elo
            .exec()
            .then(async (users) => {
                const updatedUsers = [];
                // for each user, find if they are in a match
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const match = await Match.findOne({
                        users: { $size: 2, $in: [user._id] },
                        ended: false
                    });
                    if (match) {
                        // Create a new object with the additional property
                        const updatedUser = {
                            ...user.toObject(),
                            currentDuelId: match._id
                        };
                        updatedUsers.push(updatedUser);
                        updatedUser.isCurrentDuelUser =
                            req.body.user_id &&
                            match.users.includes(req.body.user_id);
                    } else {
                        updatedUsers.push(user);
                    }
                }
                res.status(200).json({
                    message: "OK",
                    users: updatedUsers
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top users by elo: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getTopUsersByNbGames", async (req, res) => {
    /*
     *   Get the top users by nbGames
     *   @param {string} user_id
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top users by nbGames`);
        await User.aggregate([
            {
                $addFields: {
                    totalDuels: {
                        $sum: [
                            "$stats.duels.wins",
                            "$stats.duels.losses",
                            "$stats.duels.draws"
                        ]
                    }
                }
            },
            {
                $sort: { totalDuels: -1 }
            },
            {
                $limit: 50
            },
            {
                $project: {
                    displayName: 1,
                    username: 1,
                    avatarUrl: 1,
                    stats: 1
                }
            }
        ])
            .exec()
            .then(async (users) => {
                const updatedUsers = [];
                // for each user, find if they are in a match
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const match = await Match.findOne({
                        users: { $size: 2, $in: [user._id] },
                        ended: false
                    });
                    if (match) {
                        // Create a new object with the additional property
                        const updatedUser = {
                            ...user,
                            currentDuelId: match._id
                        };
                        updatedUsers.push(updatedUser);
                        updatedUser.isCurrentDuelUser =
                            req.body.user_id &&
                            match.users.includes(req.body.user_id);
                    } else {
                        updatedUsers.push(user);
                    }
                }
                res.status(200).json({
                    message: "OK",
                    users: updatedUsers
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top users by nbGames: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getTopUsersByNbWins", async (req, res) => {
    /*
     *   Get the top users by nbWins
     *   @param {string} user_id
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top users by nbWins`);
        await User.find({})
            .sort({ "stats.duels.wins": -1 })
            .limit(50)
            .select("displayName username avatarUrl stats")
            .exec()
            .then(async (users) => {
                const updatedUsers = [];
                // for each user, find if they are in a match
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const match = await Match.findOne({
                        users: { $size: 2, $in: [user._id] },
                        ended: false
                    });
                    if (match) {
                        // Create a new object with the additional property
                        const updatedUser = {
                            ...user.toObject(),
                            currentDuelId: match._id
                        };
                        updatedUsers.push(updatedUser);
                        updatedUser.isCurrentDuelUser =
                            req.body.user_id &&
                            match.users.includes(req.body.user_id);
                    } else {
                        updatedUsers.push(user);
                    }
                }
                res.status(200).json({
                    message: "OK",
                    users: updatedUsers
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top users by nbWins: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/getTopUsersByNbGoodAnswers", async (req, res) => {
    /*
     *   Get the top users by nbGoodAnswers
     *   @param {string} user_id
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top users by nbGoodAnswers`);
        await User.find({})
            .sort({ "stats.questions.right": -1 })
            .limit(50)
            .select("displayName username avatarUrl stats")
            .exec()
            .then(async (users) => {
                const updatedUsers = [];
                // for each user, find if they are in a match
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const match = await Match.findOne({
                        users: { $size: 2, $in: [user._id] },
                        ended: false
                    });
                    if (match) {
                        // Create a new object with the additional property
                        const updatedUser = {
                            ...user.toObject(),
                            currentDuelId: match._id
                        };
                        updatedUsers.push(updatedUser);
                        updatedUser.isCurrentDuelUser =
                            req.body.user_id &&
                            match.users.includes(req.body.user_id);
                    } else {
                        updatedUsers.push(user);
                    }
                }
                res.status(200).json({
                    message: "OK",
                    users: updatedUsers
                });
            });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top users by nbGoodAnswers: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
