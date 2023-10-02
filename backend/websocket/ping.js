function handleWebSocketPing(ws) {
    ws.send(
        JSON.stringify({
            message: "pong"
        })
    );
}

module.exports = {
    handleWebSocketPing
};
