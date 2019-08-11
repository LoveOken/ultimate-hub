const { Router } = require("./EXPRESS-ROUTING.js");
const { Table } = require("../MAIN/JS/TABLE/TABLE-ENGINE-FACTORY.js");

function SOCKET(dirname) {
    "use strict";
    let express = new Router(dirname);

    let engine = require("socket.io");
    let session = require("express-socket.io-session");

    let io = engine(express.getServer);

    let socketList = [];
    let socketsOnline = 0;

    let tableList = [];

    let debug = false;

    function tableRequest(title) {
        this.foundation =
            new Date()
            .toISOString()
            .replace(/\:/g, "")
            .replace(/\-/g, "")
            .replace(/\./, "_@")
            .replace("T", "_T");

        this.table = tableList.push(new Table(title)) - 1;   

        io.sockets
            .in("Lobby")
            .emit("update-start");
    };

    const socketStart = function() {
        express.routeStart();

        io.use(
            session(express.getSession, {
                autoSave: true
            })
        );

        express.initialRoutingSetup(tableRequest);
    };

    const socketInitialize = function(socket) {
        socket.already_connected = false;

        let handshake = socket.handshake.session;

        if (handshake.tag == null) {
            handshake.tag = socketsOnline;
            socketsOnline++;

            handshake.save();
        }

        socketList[handshake.tag] = socket;

        if (debug) {
            console.log("Socket Initialized with tag: ", handshake.tag);
        }
    };

    const socketsOnMain = function(socket) {
        let handshake = socket.handshake.session;

        let room = handshake.room + handshake.table;
        socket.join(room);

        let table = tableList[handshake.table];
        let game = table.getGame();
        let chat = table.getChat();

        socket
            .on("update-process", () => {
                let output = game.parseForUpdate(handshake.tag);

                if (debug) {
                    console.log("Update processed");
                }

                socket
                    .emit("update-finish", {
                        game: output,
                        already_connected: socket.already_connected,
                        logged: handshake.logged
                    })
                    .emit("receive-messages", chat.getMessages());
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
                    game.toggleRole(handshake.tag, data.value, data.which);

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
                    game.preparationPhase(handshake.tag,
                        () => {
                            io.sockets
                                .in(room)
                                .emit("update-start");
                        }
                    );
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

                    socket.leave(room);

                    io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("send-message", content => {
                    chat.newMessage(handshake.tag, content);

                    io.sockets
                        .in(room)
                        .emit("receive-messages", chat.getMessages());
                });
        }

        socket
            .emit("update-start");
    };

    const socketsOnLobby = function(socket) {
        let handshake = socket.handshake.session;

        let room = handshake.room;
        socket.join(room);

        socket
            .on("update-process", () => {
                let tables = [];

                if (debug) {
                    console.log("Update processed");
                }

                tableList.forEach(
                    function(table) {
                        tables.push(table.game.parseForUpdate(handshake.tag));
                    }
                );

                socket
                    .emit("update-tables", tables);
            })
            .on("disconnect", () => {
                socket.leave(room);
            })
            .emit("update-start");
    };

    const socketConnect = function() {
        if (debug) {
            console.log("Socket Connection Set Up");
        }

        io.sockets.on("connection", socket => {
            "use strict";
            if (debug) {
                console.log("Socket Connected");
            }

            socket.on("ready", () => {
                socketInitialize(socket);

                console.log("Ready is set");

                switch (socket.handshake.session.room) {
                    case "Main":
                        socketsOnMain(socket);
                        break;
                    case "Lobby":
                        socketsOnLobby(socket);
                        break;
                }
            });
        });
    };

    this.run = function(port) {
        socketStart();
        socketConnect();
        express.serverListen(port);
    };

    Object.freeze(this);
}

module.exports.Socket = SOCKET;