const mongoose = require("mongoose");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

const matchSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
    },
    questions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Question",
        },
    ],
    currentQuestion: {
        type: Number,
        default: 0,
    },
    answers: [
        [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                answerIndex: Number,
            },
        ],
    ],
    started: {
        type: Number,
        default: 0,
    },
    ended: {
        type: Boolean,
        default: false,
    },
    scores: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
            score: {
                type: Number,
            },
        },
    ],
    eloChanges: {
        type: Map,
        of: Number,
        default: {},
    },
    users: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    ],
    winner: {
        type: mongoose.Schema.ObjectId || null,
        ref: "User",
    },
});

matchSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Match", matchSchema);
