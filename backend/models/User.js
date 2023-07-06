const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const userSchema = new mongoose.Schema({
    admin: {
        type: Boolean,
        default: false
    },
    avatarUrl: {
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/masterquizz06.appspot.com/o/javoue_tout.jpg?alt=media&token=52cc269f-730b-468e-ae4c-1e0a5e384329'
    },
    created: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    }
});

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);