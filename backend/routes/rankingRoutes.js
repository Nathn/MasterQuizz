const express = require("express");

const router = express.Router();

const User = require("../models/User");

router.post("/getTopUsersByElo", async (req, res) => {
    /*
     *   Get the top ten users by elo
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top ten users by elo`);
        const users = await User.find({})
            .sort({ elo: -1 })
            .limit(50)
            .select("displayName username elo") // Only return the displayName, username and elo
            .exec();
        res.status(200).json({
            message: "OK",
            users: users,
        });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top ten users by elo: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/getTopUsersByNbGames", async (req, res) => {
    /*
     *   Get the top ten users by nbGames
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top ten users by nbGames`);
        const users = await User.aggregate([
            {
                $addFields: {
                    totalDuels: {
                        $sum: [
                            "$stats.duels.wins",
                            "$stats.duels.losses",
                            "$stats.duels.draws",
                        ],
                    },
                },
            },
            {
                $sort: { totalDuels: -1 },
            },
            {
                $limit: 50,
            },
            {
                $project: {
                    displayName: 1,
                    username: 1,
                    stats: 1,
                },
            },
        ]);
        res.status(200).json({
            message: "OK",
            users: users,
        });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top ten users by nbGames: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/getTopUsersByNbWins", async (req, res) => {
    /*
     *   Get the top ten users by nbWins
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top ten users by nbWins`);
        const users = await User.find({})
            .sort({ "stats.duels.wins": -1 })
            .limit(50)
            .select("displayName username stats")
            .exec();
        res.status(200).json({
            message: "OK",
            users: users,
        });
    } catch (err) {
        console.log(
            `[SERVER] An error occurred while getting top ten users by nbWins: ${err.stack}`
        );
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = router;
