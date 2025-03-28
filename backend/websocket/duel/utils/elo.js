// Elo calculations // Source : https://github.com/moroshko/elo.js/blob/master/elo.js
function getRatingDelta(myRating, opponentRating, myGameResult) {
    if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
        return null;
    }
    var myChanceToWin =
        1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
    return Math.round(32 * (myGameResult - myChanceToWin));
}

function getNewRating(myRating, opponentRating, myGameResult) {
    return (
        myRating + getRatingDelta(myRating, opponentRating, myGameResult) + 1
    );
}

module.exports = {
    getNewRating
};
