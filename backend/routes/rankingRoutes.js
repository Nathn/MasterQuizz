const express = require("express");

const router = express.Router();

const User = require("../models/User");

router.post("/getTopTenUsersByElo", async (req, res) => {
    /*
     *   Get the top ten users by elo
     *   @return {object} users
     * */
    try {
        console.log(`[SERVER] Getting top ten users by elo`);
        const users = await User.find({})
            .sort({ elo: -1 })
            .limit(10)
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

module.exports = router;
