const Question = require('../models/Question');
const Match = require('../models/Match');
const User = require('../models/User');

function handleWebSocketDuelMessage(request, ws, userWebSockets) {
    if (request.action === 'find') {
        Match.findOne({
            users: {
                $size: 1
            },
            started: 0
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
                            console.log(err.stack);
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
                        console.log(err.stack);
                        ws.send(JSON.stringify({
                            message: 'Internal server error'
                        }));
                    });
                }
            })
            .catch(err => {
                console.log(`[WS] An error occurred while finding match: ${err}`);
                console.log(err.stack);
                ws.send(JSON.stringify({
                    message: 'Internal server error'
                }));
            });
    } else if (request.action === 'cancel') {
        Match.findOne({
            users: request.user
        }).exec().then(match => {
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
                    console.log(err.stack);
                    ws.send(JSON.stringify({
                        message: 'Internal server error'
                    }));
                });
        }).catch(err => {
            console.log(`[WS] An error occurred while finding match: ${err}`);
            console.log(err.stack);
            ws.send(JSON.stringify({
                message: 'Internal server error'
            }));
        });
    } else if (request.action === 'start') {
        // Find the match corresponding to the match parameter
        // Add 1 to the started field
        // If both users started the match, then send a message to both users containing the info & first question
        Match.findOne({
            _id: request.match
        }).populate('users').exec()
            .then(match => {
                if (!match) {
                    console.log(`[WS] Match not found`);
                    ws.send(JSON.stringify({
                        message: 'OK',
                        type: 'duel',
                        status: 'not found'
                    }));
                } else {
                    console.log(`[WS] Match found: ${match._id}`);
                    match.started += 1;
                    match.save().then(match => {
                        console.log(`[WS] Match updated`);
                        if (match.started === 2) {
                            console.log(`[WS] Both users started the match`);
                            const userWs1 = userWebSockets[match.users[0]._id]; // WebSocket of the first user
                            const userWs2 = userWebSockets[match.users[1]._id]; // WebSocket of the second user
                            // Check if both users' WebSocket connections exist
                            if (userWs1 && userWs2) {
                                Question.aggregate([
                                    { $sample: { size: 1 } }
                                ]).exec()
                                .then(questions => {
                                    console.log(`[WS] Question found: ${questions[0]._id}`);
                                        // Send a message to both users
                                        userWs1.send(JSON.stringify({
                                            message: 'OK',
                                            type: 'duel',
                                            status: 'started',
                                            match,
                                            question: questions[0]
                                        }));
                                        userWs2.send(JSON.stringify({
                                            message: 'OK',
                                            type: 'duel',
                                            status: 'started',
                                            match,
                                            question: questions[0]
                                        }));
                                    })
                                    .catch(err => {
                                        console.log(`[WS] An error occurred while finding question: ${err}`);
                                        console.log(err.stack);
                                        ws.send(JSON.stringify({
                                            message: 'Internal server error'
                                        }));
                                    });
                            } else {
                                console.log(`[WS] One of the users is not connected`);
                                ws.send(JSON.stringify({
                                    message: 'OK',
                                    type: 'duel',
                                    status: 'waiting',
                                    match
                                }));
                            }
                        } else if (match.started > 2) {
                            console.log(`[WS] Both users already started the match`);
                            match.started = 2;
                            match.save().then(match => {
                                ws.send(JSON.stringify({
                                    message: 'OK',
                                    type: 'duel',
                                    status: 'started',
                                    match
                                }));
                            });
                        }
                    }).catch(err => {
                        console.log(`[WS] An error occurred while updating match: ${err}`);
                        console.log(err.stack);
                        ws.send(JSON.stringify({
                            message: 'Internal server error'
                        }));
                    });
                }
            });
    }
}

module.exports = {
    handleWebSocketDuelMessage
};
