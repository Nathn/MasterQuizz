const express = require('express');
const ws = require('ws');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const shrinkRay = require('shrink-ray-current');

require('dotenv').config({
    path: 'backend/.env'
});

const routes = require('./routes');

// Express server
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(shrinkRay());

app.use((req, res, next) => {
    if (req.method === 'GET') { // GET requests don't need CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    } else { // POST, PUT, DELETE, etc. requests need CORS verification
        const origin = req.headers.origin;
        if (!origin) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            if (process.env.CORS_WHITELIST.split(',').includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                next();
            } else {
                res.status(403).json({
                    message: 'Forbidden'
                });
            }
        }
    }
});

app.use(express.static(path.join(__dirname, '../dist/master-quizz'), {
    setHeaders: (res, path, stat) => {
        const mimeType = {
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        const ext = path.slice(path.lastIndexOf('.'));
        res.setHeader('Content-Type', mimeType[ext] || 'text/plain');
    }
}));

// Websocket server
const server = http.createServer(app);
const wss = new ws.Server({
    server
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`[WS] received: ${message}`);
        ws.send(`[WS] received: ${message}`);
    });
    ws.send('[WS] connected');
});

// MongoDB connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log(`An error occured while connecting to the database: ${err}`);
});

app.use('/', routes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`[SERVER] is running on port ${process.env.PORT || 3000} !`);
});
server.listen(process.env.WS_PORT || 3001, () => {
    console.log(`[WS] is running on port ${process.env.WS_PORT || 3001} !`);
});
