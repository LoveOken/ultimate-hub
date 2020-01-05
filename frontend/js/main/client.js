function Client() {
    'use strict';

    if (typeof client !== 'undefined') {
        return false;
    }

    let initialized;

    const itself = this;
    const socket = io();

    initialized = false;

    const createRealPlayer = function() {
        "use strict";
        socket.emit("game-create-real-player");
    };

    const toggleRole = function(pValue, pWhich) {
        "use strict";
        socket.emit("game-toggle-role", {
            value: pValue,
            which: pWhich
        });

        return false;
    };

    const togglePlayer = function() {
        "use strict";
        socket.emit("game-toggle-player");
    };

    const startGame = function() {
        "use strict";
        socket.emit("start-game");
    };

    const getInteraction = function(pType, pWhom) {
        "use strict";
        socket.emit("game-get-interaction", {
            type: pType,
            whom: pWhom
        });
    };

    const sendMessage = function(pMessage) {
        "use strict";
        socket.emit("chat-send-message", pMessage);
    };

    const startClient = function(g, r, p, c) {
        "use strict";

        if (initialized) {
            return;
        } else {
            initialized = true;
        }

        socket.on("update-start", function() {
            socket.emit("update-process");
        });

        socket.on("update-end", function(data) {
            let game, loggedBefore, logged, ID, ME;

            const forEveryRole = function(todo) {
                const checkRole = function(rr, ii) {
                    const checkActive = function(aa, si) {
                        const tt = () => toggleRole(ii, si);

                        todo(rr, ii, aa, ss, tt);
                    };

                    rr.gameActive.forEach(checkActive);
                };

                game.roleList.forEach(checkRole);
            };

            game = data.game;
            loggedBefore = data.loggedBefore;
            logged = data.logged;


            ID = game.playerList.findIndex(
                p => p.clientVisible === true
            );

            ME = game.playerList[ID];

            (ID !== -1) ? g.sitting(ME): g.standing();

            g.default();

            if (!loggedBefore) {
                g.start();
                socket.emit("set-logged-true");
            }

            if (r.undisplayed()) {
                forEveryRole(r.display);
                r.displayAfter();
            } else {
                forEveryRole(r.update);
            }

            game.playerList.forEach(function(pp, ii) {
                p.initialize(pp, ii);

                if (ii + 1 == game.playerMax) {
                    g.full();
                }
            });

            game.playerList.forEach(function(pp, ii) {
                p.position(pp, ii);

                if (game.stageId > 0) {
                    p.display(
                        ME.clientPlayerKnowledge,
                        ii,
                        game.publicPlayerKnowledge,
                        game.stageId
                    );
                }
            });

            game.centerList.forEach(function(cc, ii) {
                c.initialize(cc, ii);
            });

            game.centerList.forEach(function(cc, ii) {
                c.position(cc, ii);

                if (game.stageId > 0) {
                    c.display(
                        ME.clientCenterknowledge,
                        ii,
                        game.publicCenterKnowledge,
                        game.stageId
                    );
                }
            });

            (ID === 0) ? g.leading(): g.following();

            g.stage(
                game.stageId,
                game.roleList[game.gameRoleOnPlay],
                game.statusWinners
            );
            g.ready(game.setupReady);
            g.clock(game.stageClock);

            if (!logged) {
                g.unlogged();
            }
        });

        socket.on("chat-get-messages", (m) => {
            g.chat(m);
        });

        socket.emit("ready");
    };

    this.startClient = (g, r, p, c) => startClient(g, r, p, c);

    Object.freeze(this);
};

const client = new Client();