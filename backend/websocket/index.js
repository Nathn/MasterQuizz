const { handleWebSocketPing } = require("./ping");
const { handleWebSocketDisconnect } = require("./disconnect");
const duel = require("./duel/duel");

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
    handleWebSocketPing,
    handleWebSocketDisconnect,
    handleWebSocketDuelMessage,
};
