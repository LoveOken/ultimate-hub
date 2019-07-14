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

const GAME_TO_CLIENT_INIT = function(general, roles, players, center) {
    "use strict";
    socket.on("update-start", function() {
        socket.emit("update-process");
    });

    socket.on("update-finish", function(data) {
        let game, already_connected, my_player_index, my_player;

        let roles_for_each = function(todo) {
            let active_for_each = function(role, index) {
                let perform = function(active, subindex) {
                    let toggle = function() {
                        socket.emit("toggle-role-activity", {
                            value: index,
                            which: subindex
                        });

                        return false;
                    };

                    todo(role, index, active, subindex, toggle);
                };

                role.active.forEach(perform);
            };

            game.roles.forEach(active_for_each);
        };

        game = data.game;
        already_connected = data.already_connected;

        my_player_index = game.player_list.findIndex(
            player => player.visible === true
        );

        (my_player_index !== -1) ? general.sitting(my_player): general.standing();

        my_player = game.player_list[my_player_index];

        general.default();

        if (!already_connected) {
            general.start();
            socket.emit("validate-connection");
        }

        if (roles.undisplayed()) {
            roles_for_each(roles.display);
            roles.after_display();
        } else {
            roles_for_each(roles.update);
        }

        game.player_list.forEach(function(player, index) {
            players.initialize(player, index);

            if (index + 1 == game.player_max) {
                general.full();
            }
        });

        game.player_list.forEach(function(player, index) {
            players.position(player, index);

            if (game.stage > 0) {
                players.display(
                    my_player.player_knowledge,
                    index,
                    game.public_player_knowledge,
                    game.stage
                );
            }
        });

        game.center_cards.forEach(function(center, index) {
            center.initialize(center, index);
        });

        game.center_cards.forEach(function(center, index) {
            center.position(center, index);

            if (game.stage > 0) {
                center.display(
                    my_player.center_knowledge,
                    index,
                    game.public_center_knowledge,
                    game.stage
                );
            }
        });

        (my_player_index === 0) ? general.leading(): general.following();

        general.stage(
            game.stage,
            game.roles[game.role_on_play],
            game.winners
        );
        general.ready(game.ready);
        general.clock(game.stage_clock);
    });

    socket.emit("update-process");
};