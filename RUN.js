/* Variable Declaration */

var express = require("express");
var socketIO = require("socket.io");

var http = require("http");
var path = require("path");

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var session = require("express-session")({
    secret: "ultimatehub",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

/* Express Routing */

app.set("port", 2000);
app.set("trust proxy", 1);

app.use(session);
io.use(
    sharedsession(session, {
        autoSave: true
    })
);

app.use(express.urlencoded());

app.use(express.static(__dirname + "/MAIN"));

app.get("/", function(request, response) {
    "use strict";

    if (request.session.is_logged_in === undefined) {
        response.sendFile(path.join(__dirname, "/MAIN/LOGIN.html"));
    } else {
        response.sendFile(path.join(__dirname, "/MAIN/MAIN.html"));
        request.body.responseTest = "Hello World";
    }
});

app.post("/HANDSHAKE", function(request, response) {
    "use strict";

    request.session.is_logged_in = true;
    request.session.username = request.body.username;
    request.session.save();

    response.redirect("/");
    response.end();
});

/* Game Itself */

const { GAME } = require("./MAIN/JS/GAME/GAME-ENGINE-FACTORY.js");

var game = new GAME();

/* Socket.io Routing */

global.SOCKET_LIST = {};
global.SOCKETS_ONLINE = 0;

io.sockets.on("connection", function(socket) {
    "use strict";
    var handshake = socket.handshake.session;

    socket.already_connected = false;

    if (handshake.is_logged_in) {
        if (handshake.tag == null) {
            handshake.tag = SOCKETS_ONLINE;
            SOCKETS_ONLINE++;

            handshake.save();
        }

        SOCKET_LIST[handshake.tag] = socket;
    }

    socket.on("debug-player", () => {
        game.createDebugPlayer();
        io.sockets.emit("update-start");
    });

    socket.on("seat-request", data => {
        game.seatRequest(handshake.username, handshake.tag, data.will_sit);
        io.sockets.emit("update-start");
    });

    socket.on("toggle-role-activity", data => {
        game.toggleRole(handshake.tag, data.value, data.which);
        io.sockets.emit("update-start");
    });

    socket.on("set_ready_to_play", data => {
        game.togglePlayerReady(handshake.tag);
        io.sockets.emit("update-start");
    });

    socket.on("confirm-settings", data => {
        game.preparationPhase(handshake.tag, () => {
            io.sockets.emit("update-start");
        });
    });

    socket.on("player-interaction", data => {
        game.playerInteraction(handshake.tag, data.type, data.whom, () => {
            socket.emit("update-start");
        });
    });

    socket.on("disconnect", () => {
        game.disconnectPlayer(handshake.tag);
        io.sockets.emit("update-start");
    });

    socket.on("update-process", () => {
        let output = game.parseForUpdate(handshake.tag);

        socket.emit("update-finish", {
            game: output,
            already_connected: socket.already_connected
        });
    });

    socket.on("validate-connection", function() {
        socket.already_connected = true;
    });
});

server.listen(2000);