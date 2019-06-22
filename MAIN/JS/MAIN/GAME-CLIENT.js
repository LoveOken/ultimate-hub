let socket = io();

const GAME_SEAT_REQUEST = (will_sit) => {
    socket.emit("seat-request", {
        will_sit: will_sit
    });
}

const GAME_SET_READY_TO_PLAY = () => {
    socket.emit("set_ready_to_play");
}

const GAME_CONFIRM_SETTINGS = () => {
    socket.emit("confirm-settings");
}

const GAME_PLAYER_INTERACTION = (type_of_interaction, interacted_with) => {
    socket.emit("player-interaction", {
        type: type_of_interaction,
        whom: interacted_with
    });
}

const GAME_TO_CLIENT_INIT =
    (
        do_once_connected,
        roles_arent_displayed,
        display_every_role,
        do_after_roles_are_displayed,
        update_active_roles,
        display_if_seated,
        display_if_stood_up,
        display_default,
        display_if_room_is_full,
        display_player_seats,
        initialize_player_cards,
        display_player_cards,
        display_center_seats,
        initialize_center_cards,
        display_center_cards,
        display_when_table_leader,
        display_when_not_table_leader,
        display_based_on_stage,
        display_based_on_ready_game,
        display_clock
    ) => {
        socket.on("update-start", () => {
            socket.emit("update-process");
        });

        socket.on("update-finish", (data) => {
            let game, already_connected, my_player_index, my_player, player_seats, title, subtitle, description, clock;

            let for_each_and_every_role = (todo) => {
                game.roles.forEach((role, index) => {
                    role.active.forEach((active, subindex) => {
                        todo(role, index, active, subindex, () => {
                            socket.emit("toggle-role-activity", {
                                value: index,
                                which: subindex
                            });

                            return false;
                        });
                    })
                });
            }

            game = data.game;
            already_connected = data.already_connected;

            my_player = null;
            my_player_index = game.player_list.findIndex(player => player.visible === true);

            display_default();

            if (my_player_index != -1) {
                my_player = game.player_list[my_player_index];
                display_if_seated(my_player);
            } else {
                display_if_stood_up();
            }

            if (!already_connected) {
                do_once_connected();
                socket.emit("validate-connection");
            }

            if (roles_arent_displayed()) {
                for_each_and_every_role(display_every_role);
                do_after_roles_are_displayed();
            } else {
                for_each_and_every_role(update_active_roles);
            }

            game.player_list.forEach((player, index) => {
                display_player_seats(player, index);

                if (index + 1 == game.player_max) {
                    display_if_room_is_full();
                }
            });

            game.player_list.forEach((player, index) => {
                initialize_player_cards(player, index);

                if (game.stage > 0) {
                    display_player_cards(my_player.player_knowledge, index, game.public_player_knowledge, game.stage);
                }
            });

            game.center_cards.forEach((center, index) => {
                display_center_seats(center, index);
            });

            game.center_cards.forEach((center, index) => {
                initialize_center_cards(center, index);

                if (game.stage > 0) {
                    display_center_cards(my_player.center_knowledge, index, game.public_center_knowledge, game.stage);
                }
            });

            if (my_player_index == 0) {
                display_when_table_leader();
            } else {
                display_when_not_table_leader();
            }

            display_based_on_stage(game.stage, game.roles[game.role_on_play]);
            display_based_on_ready_game(game.ready);
            display_clock(game.stage_clock);
        })

        socket.emit("update-process");
    }