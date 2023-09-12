const Question = require("../models/Question");
const Match = require("../models/Match");
const User = require("../models/User");

const duel = require("./duel");

function handleWebSocketDuelMessage(request, ws, userWebSockets) {
    if (request.action === "find") {
        duel.find(request, ws, userWebSockets);
    } else if (request.action === "cancel") {
        duel.cancel(request, ws, userWebSockets);
    } else if (request.action === "start") {
        duel.start(request, ws, userWebSockets);
    } else if (request.action === "answer") {
        duel.answer(request, ws, userWebSockets);
    } else if (request.action === "forfeit") {
        duel.forfeit(request, ws, userWebSockets);
    }
}

module.exports = {
    handleWebSocketDuelMessage
};
