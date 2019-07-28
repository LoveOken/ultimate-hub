var { Table } = require("./MAIN/JS/TABLE/TABLE-ENGINE-FACTORY.js");

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

    if (request.session.logged) {
        response.redirect("/lobby");
    } else {
        response.redirect("/login");
    }

    response.end();
});

app.get("/login", function(request, response) {
    "use strict";
    response.sendFile(path.join(__dirname, "/MAIN/LOGIN.html"));

    request.session.room = "Login";
    request.session.save();
});

app.post("/login/handshake", function(request, response) {
    "use strict";

    request.session.logged = true;

    request.session.username = request.body.username;
    request.session.password = request.body.password;

    request.session.save();

    response.redirect("/lobby");
    response.end();
});

app.get("/lobby", function(request, response) {
    "use strict";
    response.sendFile(path.join(__dirname, "/MAIN/LOBBY.html"));

    request.session.room = "Lobby";
    request.session.save();

});


global.SOCKET_LIST = [];
global.SOCKETS_ONLINE = 0;

global.TABLE_LIST = [];

io.sockets.on("connection", socket => {
    "use strict";

    socket.on("ready", () => {
        socket.already_connected = false;

        let handshake = socket.handshake.session;

        if (handshake.tag == null) {
            handshake.tag = SOCKETS_ONLINE;
            SOCKETS_ONLINE++;

            handshake.save();
        }

        SOCKET_LIST[handshake.tag] = socket;

        switch (handshake.room) {
            case "Main":
                {
                    let room = handshake.room + handshake.table;
                    socket.join(room);

                    let table = TABLE_LIST[handshake.table];
                    let game = table.game;
                    let chat = table.chat;

                    socket
                    .on("update-process", () => {
                        let output = game.parseForUpdate(handshake.tag);

                        socket
                            .emit("update-finish", {
                                game: output,
                                already_connected: socket.already_connected,
                                logged: handshake.logged
                            })
                            .emit("receive-messages", chat.messages);
                    })
                    .on("validate-connection", () => {
                        socket.already_connected = true;
                    });

                    if (handshake.logged) {
                        chat.newAuthor(handshake.username, handshake.tag);

                        game.doesPlayerExist(handshake.tag) ?
                            chat.addFilterToAuthor("Player", handshake.tag) :
                            chat.addFilterToAuthor("Spectator", handshake.tag);

                        socket
                            .on("debug-player", () => {
                                game.createDebugPlayer();

                                io.sockets
                                    .in(room)
                                    .emit("update-start");
                            })
                            .on("seat-request", () => {
                                game.seatRequest(handshake.username, handshake.tag);

                                game.doesPlayerExist(handshake.tag) ?
                                    chat.addFilterToAuthor("Player", handshake.tag) :
                                    chat.addFilterToAuthor("Spectator", handshake.tag);

                                io.sockets
                                    .in(room)
                                    .emit("update-start");
                            })
                            .on("toggle-role-activity", data => {
                                game.toggleRole(
                                    handshake.tag,
                                    data.value,
                                    data.which
                                );

                                io.sockets
                                    .in(room)
                                    .emit("update-start");
                            })
                            .on("set_ready_to_play", () => {
                                game.togglePlayerReady(handshake.tag);

                                io.sockets
                                    .in(room)
                                    .emit("update-start");
                            })
                            .on("confirm-settings", () => {
                                game.preparationPhase(handshake.tag, () => {
                                    io.sockets
                                        .in(room)
                                        .emit("update-start");
                                });
                            })
                            .on("player-interaction", data => {
                                game.playerInteraction(handshake.tag, data.type, data.whom,
                                    () => {
                                        socket.emit("update-start");
                                    }
                                );
                            })
                            .on("disconnect", () => {
                                game.disconnectPlayer(handshake.tag);
                                chat.addFilterToAuthor("Spectator", handshake.tag);

                                socket.leave(handshake.room);
                                socket.join(handshake.table);

                                io.sockets
                                    .in(room)
                                    .emit("update-start");
                            })
                            .on("send-message", content => {
                                chat.newMessage(handshake.tag, content);

                                io.sockets
                                    .in(room)
                                    .emit("receive-messages", chat.messages);
                            });
                    }

                    socket
                    .emit("update-start");

                    break;
                }
            case "Lobby":
                {
                    let room = handshake.room;
                    socket.join(room);

                    socket
                    .on("creation-request", () => {
                        let foundation = (new Date()).getTime().toString();
                        let table = TABLE_LIST.push(new Table(foundation)) - 1;

                        app.get("/main/" + foundation, function(request, response) {
                            "use strict";
                            response.sendFile(path.join(__dirname, "/MAIN/MAIN.html"));

                            request.session.room = "Main";
                            request.session.table = table;

                            request.session.save();
                        });

                        socket.emit("redirect-to-table", "/main/" + foundation);
                    })
                    .on("disconnect", () => {
                        socket.leave(room);
                    })

                    break;
                }
        }
    });
});

server.listen(2000);