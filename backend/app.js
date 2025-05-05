const express = require("express");
const ws = require("ws");
const mongoose = require("mongoose");
const path = require("path");
const shrinkRay = require("shrink-ray-current");

require("dotenv").config({
    path: "backend/.env"
});

const routes = require("./routes");
const websocket = require("./websocket");

// Express server
const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(shrinkRay());

app.use((req, res, next) => {
    if (req.method === "GET") {
        // GET requests don't need CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    } else {
        // POST, PUT, DELETE, etc. requests need CORS verification
        const origin = req.headers.origin;
        if (!origin) {
            res.status(403).json({
                message: "Forbidden"
            });
        } else {
            if (process.env.CORS_WHITELIST.split(",").includes(origin)) {
                res.setHeader("Access-Control-Allow-Origin", origin);
                res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                res.setHeader(
                    "Access-Control-Allow-Methods",
                    "GET, POST, PUT, DELETE, OPTIONS"
                );
                next();
            } else {
                res.status(403).json({
                    message: "Forbidden"
                });
            }
        }
    }
});

app.use(
    express.static(path.join(__dirname, "../dist/master-quizz"), {
        setHeaders: (res, path, stat) => {
            const mimeType = {
                ".js": "text/javascript",
                ".css": "text/css",
                ".html": "text/html",
                ".png": "image/png",
                ".jpg": "image/jpg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".ico": "image/x-icon"
            };
            const ext = path.slice(path.lastIndexOf("."));
            res.setHeader("Content-Type", mimeType[ext] || "text/plain");
        }
    })
);

// MongoDB connection
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;
mongoose.connection.on("error", (err) => {
    console.log(`An error occured while connecting to the database: ${err}`);
});

app.use("/", routes);

// Server and WebSocket server initialization

const wss = new ws.Server({
    server: app.listen(process.env.PORT || 3000, () => {
        console.log(
            `[SERVER] is running on port ${process.env.PORT || 3000} !`
        );
    })
}).on("error", (err) => {
    console.log(
        `[WS] An error occurred while creating the WebSocket server: ${err}`
    );
});

console.log("[WS] WebSocket server is running");

// WebSocket server

var userWebSockets = {};

wss.on("connection", (ws) => {
    console.log("[WS] Connected to a client");
    ws.on("message", (message) => {
        console.log(
            `[WS] [${new Date().toLocaleString()}] Request received: ${message}`
        );
        // example message : {
        //   type: "duel",
        //   action: "find",
        //   user: "5e9f1b7b0f0b7b1b1c9b1b1b" // user id
        // }
        const request = JSON.parse(message);
        if (request.user) userWebSockets[request.user] = ws;
        if (request.type === "ping") {
            websocket.handleWebSocketPing(ws);
        } else if (request.type === "duel") {
            websocket.handleWebSocketDuelMessage(request, ws, userWebSockets);
        }
    });
    ws.on("close", () => {
        // Clean up the WebSocket connection when it's closed
        const user = Object.keys(userWebSockets).find(
            (key) => userWebSockets[key] === ws
        );
        if (user) {
            websocket.handleWebSocketDisconnect(user);
            delete userWebSockets[user];
            console.log(`[WS] User ${user} WebSocket disconnected`);
        }
    });
    ws.on("error", (err) => {
        console.log(`[WS] Error: ${err}`);
    });
});
