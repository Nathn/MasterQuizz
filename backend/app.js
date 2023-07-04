const express = require('express');
const cors = require('cors');

require('dotenv').config({
    path: 'backend/.env'
});

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(new Error('The CORS policy for this site does not allow access from the specified origin.'), false);
        if (process.env.CORS_WHITELIST.split(',').indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified origin.'), false);
        }
        return callback(null, origin);
    }
}));

app.use('/', routes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`[SERVER] is running on port ${process.env.PORT || 3000} !`);
});
