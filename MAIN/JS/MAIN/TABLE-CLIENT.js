let socket = io();

const GAME_SEAT_REQUEST = function() {
    "use strict";
    socket.emit("seat-request");
};

const GAME_SET_READY_TO_PLAY = function() {
    "use strict";
    socket.emit("set_ready_to_play");
};

const GAME_CONFIRM_SETTINGS = function() {
    "use strict";
    socket.emit("confirm-settings");
};

const GAME_PLAYER_INTERACTION = function(type_of_interaction, interacted_with) {
    "use strict";
    socket.emit("player-interaction", {
        type: type_of_interaction,
        whom: interacted_with
    });
};

const GAME_TOGGLE_ROLE = function(value, which) {
    "use strict";
    socket.emit("toggle-role-activity", {
        value: value,
        which: which
    });

    return false;
}

const CHAT_SEND_MESSAGE = function(message) {
    "use strict";
    socket.emit("send-message", message);
}

const CLIENT_INIT = function(GENERAL, ROLES, PLAYERS, CENTER) {
    "use strict";
    socket.on("update-start", function() {
        socket.emit("update-process");
    });

    socket.on("update-finish", function(data) {
        let game, already_connected, logged, my_player_index, my_player;

        let FOR_EVERY_ROLE = function(todo) {
            let ROLE_ACT = function(role, index) {
                let ACTIVE_ACT = function(active, subindex) {
                    todo(role, index, active, subindex, () => GAME_TOGGLE_ROLE(index, subindex));
                };

                role.active.forEach(ACTIVE_ACT);
            };

            game.roles.forEach(ROLE_ACT);
        };

        game = data.game;
        already_connected = data.already_connected;
        logged = data.logged;


        my_player_index = game.player_list.findIndex(
            player => player.visible === true
        );

        my_player = game.player_list[my_player_index];

        (my_player_index !== -1) ? GENERAL.sitting(my_player): GENERAL.standing();

        GENERAL.default();

        if (!already_connected) {
            GENERAL.start();
            socket.emit("validate-connection");
        }

        if (ROLES.undisplayed()) {
            FOR_EVERY_ROLE(ROLES.display);
            ROLES.after_display();
        } else {
            FOR_EVERY_ROLE(ROLES.update);
        }

        game.player_list.forEach(function(player, index) {
            PLAYERS.initialize(player, index);

            if (index + 1 == game.player_max) {
                GENERAL.full();
            }
        });

        game.player_list.forEach(function(player, index) {
            PLAYERS.position(player, index);

            if (game.stage > 0) {
                PLAYERS.display(
                    my_player.player_knowledge,
                    index,
                    game.public_player_knowledge,
                    game.stage
                );
            }
        });

        game.center_cards.forEach(function(center, index) {
            CENTER.initialize(center, index);
        });

        game.center_cards.forEach(function(center, index) {
            CENTER.position(center, index);

            if (game.stage > 0) {
                CENTER.display(
                    my_player.center_knowledge,
                    index,
                    game.public_center_knowledge,
                    game.stage
                );
            }
        });

        (my_player_index === 0) ? GENERAL.leading(): GENERAL.following();

        GENERAL.stage(
            game.stage,
            game.roles[game.role_on_play],
            game.winners
        );
        GENERAL.ready(game.ready);
        GENERAL.clock(game.stage_clock);

        if (!logged) {
            GENERAL.unlogged();
        }
    });

    socket.on("receive-messages", (messages) => {
        console.log(messages);
    });

    socket.emit("ready");
};