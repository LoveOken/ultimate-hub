const {Express} = require('./express.js');
const {Table} = require('./table/constructors.js');

/**
 * Controls everything related to the Socket.io module.
 * @param {string} pDirname Location of the project's directory.
 * @return {void}
 */
function Socket(pDirname) {
    'use strict';
    const express = new Express(pDirname);

    const engine = require('socket.io');
    const session = require('express-socket.io-session');

    const io = engine(express.getServer);

    const socketList = [];
    let socketsOnline = 0;

    const tableList = [];

    const debug = false;

    /**
     * Request to create a Table object
     * @param {string} pName Name of the Table
     * @return {void}
     */
    function TableRequest(pName) {
        this.foundation =
            new Date()
                .toISOString()
                .replace(/\:/g, '')
                .replace(/\-/g, '')
                .replace(/\./, '_@')
                .replace('T', '_T');

        this.table =
            tableList.push(new Table(pName, '/main/' + this.foundation)) - 1;

        io.sockets
            .in('Lobby')
            .emit('update-start');
    };

    const socketStart = function() {
        express.routeStart();

        io.use(
            session(express.getSession, {
                autoSave: true,
            }),
        );

        express.initialRoutingSetup(TableRequest);
    };

    const socketInitialize = function(socket) {
        socket.loggedBefore = false;

        const handshake = socket.handshake.session;

        if (handshake.tag == null) {
            handshake.tag = socketsOnline;
            socketsOnline++;

            handshake.save();
        }

        socketList[handshake.tag] = socket;

        if (debug) {
            console.log('Socket Initialized with tag: ', handshake.tag);
        }
    };

    const socketsOnMain = function(socket) {
        const handshake = socket.handshake.session;

        const room = handshake.room + handshake.table;
        socket.join(room);

        const table = tableList[handshake.table];
        const game = table.getGame();
        const chat = table.getChat();

        const updatePlayerChatStatus = function() {
            if (game.getIfPlayerExists(handshake.tag)) {
                chat.addBadgeToAuthor('Player', handshake.tag);
            } else {
                chat.addBadgeToAuthor('Spectator', handshake.tag);
            }
        };

        socket
            .on('update-process', () => {
                const gameClient = game.getClientExport(handshake.tag);

                socket
                    .emit('update-end', {
                        game: gameClient,
                        loggedBefore: socket.loggedBefore,
                        logged: handshake.logged,
                    })
                    .emit('chat-get-messages', chat.getMessages());
            })
            .on('set-logged-true', () => {
                socket.loggedBefore = true;
            });

        if (handshake.logged) {
            chat.newAuthor(handshake.username, handshake.tag);

            updatePlayerChatStatus();

            socket
                .on('game-create-debug-player', () => {
                    game.createDebugPlayer();

                    io.sockets
                        .in(room)
                        .emit('update-start');
                })
                .on('game-create-real-player', () => {
                    game.createRealPlayer(handshake.username, handshake.tag);

                    updatePlayerChatStatus();

                    io.sockets
                        .in(room)
                        .emit('update-start');
                })
                .on('game-toggle-role', (data) => {
                    game.toggleRoles(handshake.tag, data.value, data.which);

                    io.sockets
                        .in(room)
                        .emit('update-start');
                })
                .on('game-toggle-player', () => {
                    game.togglePlayers(handshake.tag);

                    io.sockets
                        .in(room)
                        .emit('update-start');
                })
                .on('start-game', () => {
                    game.startGame(handshake.tag,
                        () => {
                            io.sockets
                                .in(room)
                                .emit('update-start');
                        },
                    );
                })
                .on('game-get-interaction', (data) => {
                    game.getPlayerInteraction(
                        handshake.tag,
                        data.type,
                        data.whom,
                        () => {
                            socket.emit('update-start');
                        },
                    );
                })
                .on('disconnect', () => {
                    game.deleteRealPlayer(handshake.tag);
                    updatePlayerChatStatus();

                    socket.leave(room);

                    io.sockets
                        .in(room)
                        .emit('update-start');
                })
                .on('chat-send-message', (content) => {
                    chat.newMessage(handshake.tag, content);

                    io.sockets
                        .in(room)
                        .emit('receive-messages', chat.getMessages());
                });
        }

        socket
            .emit('update-start');
    };

    const socketsOnLobby = function(socket) {
        const handshake = socket.handshake.session;

        const room = handshake.room;
        socket.join(room);

        socket
            .on('update-process', () => {
                const tableList = [];

                tableList.forEach(
                    function(t) {
                        tableList.push(
                            t
                                .getGame()
                                .getClientExport(handshake.tag),
                        );
                    },
                );

                socket
                    .emit('update-tables', tables);
            })
            .on('disconnect', () => {
                socket.leave(room);
            })
            .emit('update-start');
    };

    const socketConnect = function() {
        if (debug) {
            console.log('Socket Connection Set Up');
        }

        io.sockets.on('connection', (socket) => {
            'use strict';
            if (debug) {
                console.log('Socket Connected');
            }

            socket.on('ready', () => {
                socketInitialize(socket);

                if (debug) {
                    console.log('Ready Set');
                }

                switch (socket.handshake.session.room) {
                case 'Main':
                    socketsOnMain(socket);
                    break;
                case 'Lobby':
                    socketsOnLobby(socket);
                    break;
                }
            });
        });
    };

    this.run = function(pPort) {
        socketStart();
        socketConnect();
        express.serverListen(pPort);
    };

    Object.freeze(this);
}

module.exports.Socket = Socket;
