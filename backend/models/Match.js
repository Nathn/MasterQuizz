const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const matchSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    started: {
        type: Boolean,
        default: false
    },
    ended: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
});

matchSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Match', matchSchema);
