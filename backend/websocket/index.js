const Question = require('../models/Question');
const Match = require('../models/Match');
const User = require('../models/User');

function handleWebSocketDuelMessage(request, ws, userWebSockets) {
    if (request.action === 'find') {
        Match.findOne({
            users: {
                $size: 1
            },
            started: false
        }).populate('users').exec()
            .then(match => {
                if (!match) {
                    console.log(`[WS] No match found`);
                    const newMatch = new Match({
                        users: [request.user]
                    });
                    newMatch.save()
                        .then(match => {
                            console.log(`[WS] Match created`);
                            ws.send(JSON.stringify({
                                message: 'OK',
                                type: 'duel',
                                status: 'waiting',
                                match
                            }));
                        })
                        .catch(err => {
                            console.log(`[WS] An error occurred while creating match: ${err}`);
                            ws.send(JSON.stringify({
                                message: 'Internal server error'
                            }));
                        });
                } else {
                    console.log(`[WS] Match found: ${match._id}`);
                    match.users.push(request.user);
                    match.save()
                    .then(match => {
                        console.log(`[WS] Match updated`);
                        const userWs1 = userWebSockets[match.users[0]._id]; // WebSocket of the first user
                        const userWs2 = userWebSockets[match.users[1]._id]; // WebSocket of the second user (newly joined)
                        // Check if both users' WebSocket connections exist
                        if (userWs1 && userWs2) {
                            // Send a message to both users
                            userWs1.send(JSON.stringify({
                                message: 'OK',
                                type: 'duel',
                                status: 'ready',
                                match
                            }));
                            userWs2.send(JSON.stringify({
                                message: 'OK',
                                type: 'duel',
                                status: 'ready',
                                match
                            }));
                        } else {
                            console.log(`[WS] One of the users is not connected`);
                            ws.send(JSON.stringify({
                                message: 'OK',
                                type: 'duel',
                                status: 'waiting',
                                match
                            }));
                        }
                    })
                    .catch(err => {
                        console.log(`[WS] An error occurred while updating match: ${err}`);
                        ws.send(JSON.stringify({
                        message: 'Internal server error'
                        }));
                    });
                }
            })
            .catch(err => {
                console.log(`[WS] An error occurred while finding match: ${err}`);
                ws.send(JSON.stringify({
                    message: 'Internal server error'
                }));
            });
    } else if (request.action === 'cancel') {
        Match.findOne({
            users: request.user
        }).exec()
            .then(match => {
                Match.deleteOne({ _id: match._id })
                    .then(() => {
                        console.log(`[WS] Match deleted`);
                        ws.send(JSON.stringify({
                            message: 'OK',
                            type: 'duel',
                            status: 'cancelled'
                        }));
                    })
                    .catch(err => {
                        console.log(`[WS] An error occurred while deleting match: ${err}`);
                        ws.send(JSON.stringify({
                            message: 'Internal server error'
                        }));
                    });
            })
            .catch(err => {
                console.log(`[WS] An error occurred while finding match: ${err}`);
                ws.send(JSON.stringify({
                    message: 'Internal server error'
                }));
            });
    }
}

module.exports = {
    handleWebSocketDuelMessage
};
