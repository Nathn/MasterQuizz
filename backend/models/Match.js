const mongoose = require("mongoose");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

const matchSchema = new mongoose.Schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    startedOn: {
        type: Date
    },
    endedOn: {
        type: Date
    },
    currentQuestion: {
        type: Number,
        default: 0
    },
    questions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Question"
        }
    ],
    timeLimits: [
        {
            type: Number,
            default: 0
        }
    ],
    answers: [
        {
            type: Map,
            of: Number,
            default: {}
        }
    ],
    started: {
        type: Number,
        default: 0
    },
    ended: {
        type: Boolean,
        default: false
    },
    scores: {
        type: Map,
        of: Number,
        default: {}
    },
    eloChanges: {
        type: Map,
        of: Number,
        default: {}
    },
    users: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
    winner: {
        type: mongoose.Schema.ObjectId || null,
        ref: "User"
    }
});

matchSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Match", matchSchema);
