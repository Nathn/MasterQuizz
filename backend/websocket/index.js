const duel = require("./duel/duel");
const { handleWebSocketDisconnect } = require("./disconnect");

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
    handleWebSocketDuelMessage,
    handleWebSocketDisconnect,
};
