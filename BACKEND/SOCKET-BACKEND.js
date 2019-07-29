const { Table } = require("../MAIN/JS/TABLE/TABLE-ENGINE-FACTORY.js");
const { Router } = require("./EXPRESS-ROUTING.js");

function SOCKET(dirname) {
    "use strict";
    let router = this;

    this.express = new Router(dirname);

    this.engine = require("socket.io");
    this.session = require("express-socket.io-session");

    this.io = this.engine(this.express.server);

    this.socketStart = function() {
        router.io.use(
            router.session(router.express.session, {
                autoSave: true
            })
        );
    };

    this.socketList = [];
    this.socketsOnline = 0;

    this.tableList = [];

    this.socketInitialize = function(socket) {
        socket.already_connected = false;

        let handshake = socket.handshake.session;

        if (handshake.tag == null) {
            handshake.tag = router.socketsOnline;
            router.socketsOnline++;

            handshake.save();
        }

        router.socketList[handshake.tag] = socket;
    };

    this.socketsOnMain = function(socket) {
        let handshake = socket.handshake.session;

        let room = handshake.room + handshake.table;
        socket.join(room);

        let table = router.tableList[handshake.table];
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

                    router.io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("seat-request", () => {
                    game.seatRequest(handshake.username, handshake.tag);

                    game.doesPlayerExist(handshake.tag) ?
                        chat.addFilterToAuthor("Player", handshake.tag) :
                        chat.addFilterToAuthor("Spectator", handshake.tag);

                    router.io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("toggle-role-activity", data => {
                    game.toggleRole(
                        handshake.tag,
                        data.value,
                        data.which
                    );

                    router.io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("set_ready_to_play", () => {
                    game.togglePlayerReady(handshake.tag);

                    router.io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("confirm-settings", () => {
                    game.preparationPhase(handshake.tag, () => {
                        router.io.sockets
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

                    socket.leave(room);

                    router.io.sockets
                        .in(room)
                        .emit("update-start");
                })
                .on("send-message", content => {
                    chat.newMessage(handshake.tag, content);

                    router.io.sockets
                        .in(room)
                        .emit("receive-messages", chat.messages);
                });
        }

        socket
            .emit("update-start");
    };

    this.socketsOnLobby = function(socket) {
    	let handshake = socket.handshake.session;

        let room = handshake.room;
        socket.join(room);

        socket
            .on("creation-request", () => {
                let foundation = (new Date()).getTime().toString();
                let table = router.tableList.push(new Table(foundation)) - 1;

                router.express.routeMain(foundation, table);

                socket.emit("redirect-to-table", "/main/" + foundation);
            })
            .on("disconnect", () => {
                socket.leave(room);
            });
    };

    this.socketConnect = function() {
        router.io.sockets.on("connection", socket => {
            "use strict";
            socket.on("ready", () => {
                router.socketInitialize(socket);

                switch (socket.handshake.session.room) {
                    case "Main":
                        router.socketsOnMain(socket);
                        break;
                    case "Lobby":
                        router.socketsOnLobby(socket);
                        break;
                }
            });
        });
    };
}

module.exports.Socket = SOCKET;