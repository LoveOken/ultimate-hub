const moduleInput = function(game, accessor) {
    "use strict";

    game.randomPlayer = function() {
        "use strict";
        let random_index;
        random_index = Math.floor(Math.random() * game.player_list.length);

        return game.player_list[random_index];
    };



    game.playerInteraction = function(tag, type, whom, update_function) {
        "use strict";
        let from, to;

        from = game.player_list.find(player => player.tag === tag);
        to = type ? game.center_cards[whom] : game.player_list[whom];

        try {
            if (from === undefined || to === undefined) {
                throw new Error("Both target and sender must be defined.");
            }
        } catch (err) {
            console.log(err);
            return;
        }

        switch (game.stage) {
            case 2:
                if (from.original_role !== game.roles[game.role_on_play].name) {
                    return;
                }
                from.action(to);
                break;
            case 4:
                from.vote(to);
                break;
            default:
                return;
        }

        update_function();
    };



    game.copyPlayer = function(player_copying, target_player) {
        "use strict";
        let own_index, target_index;

        own_index = game.player_list.findIndex(player => player === player_copying);
        target_index = game.player_list.findIndex(
            player => player === target_player
        );

        if (own_index === -1 || target_index === -1) {
            return false;
        }

        player_copying.player_knowledge[own_index] = target_player.actual_role;
        player_copying.player_knowledge[target_index] = target_player.actual_role;

        player_copying.actual_team = target_player.actual_team;

        let new_role;

        new_role = game.roles.find(role => role.name === target_player.actual_role);

        new_role.action(player_copying);
        player_copying.action();

        return true;
    };



    game.recognizePlayers = function(
        player_recognizing,
        role_to_recognize_as,
        condition_of_recognition
    ) {
        "use strict";
        let output = false;
        let own_index = game.player_list.findIndex(
            player => player === player_recognizing
        );

        if (own_index === -1) {
            return output;
        }

        game.player_list.forEach(function(p, i) {
            if (condition_of_recognition(p)) {
                player_recognizing.player_knowledge[i] = role_to_recognize_as;

                output = true;
            }
        });

        return output;
    };



    game.peekOnPlayer = function(player_peeking, target_player) {
        "use strict";
        let own_index = game.player_list.findIndex(
            player => player === player_peeking
        );
        let target_index = game.player_list.findIndex(
            player => player === target_player
        );

        if (own_index === -1 || target_index === -1) {
            return false;
        }

        player_peeking.player_knowledge[target_index] = target_player.actual_role;

        return true;
    };



    game.peekCenter = function(player_peeking, target_center) {
        "use strict";
        let own_index = game.player_list.findIndex(
            player => player === player_peeking
        );
        let target_index = game.center_cards.findIndex(
            center => center === target_center
        );

        if (own_index === -1 || target_index === -1) {
            return false;
        }

        player_peeking.center_knowledge[target_index] = target_center.actual_role;

        return true;
    };



    game.swapTwoPlayers = function(
        player_watching,
        player_swapping,
        target_player
    ) {
        "use strict";
        let own_index = game.player_list.findIndex(
            player => player === player_watching
        );
        let swapping_index = game.player_list.findIndex(
            player => player === player_swapping
        );
        let target_index = game.player_list.findIndex(
            player => player === target_player
        );

        if (own_index === -1 || swapping_index === -1 || target_index === -1) {
            return false;
        }

        let holder;

        holder = player_watching.player_knowledge[target_index];
        player_watching.player_knowledge[target_index] =
            player_watching.player_knowledge[swapping_index];
        player_watching.player_knowledge[swapping_index] = holder;

        holder = target_player.actual_role;
        target_player.actual_role = player_swapping.actual_role;
        player_swapping.actual_role = holder;

        holder = target_player.actual_team;
        target_player.actual_team = player_swapping.actual_team;
        player_swapping.actual_team = holder;

        return true;
    };



    game.swapPlayerCenter = function(
        player_watching,
        player_swapping,
        target_center
    ) {
        "use strict";
        let own_index = game.player_list.findIndex(
            player => player === player_watching
        );
        let swapping_index = game.player_list.findIndex(
            player => player === player_swapping
        );
        let target_index = game.center_cards.findIndex(
            center => center === target_center
        );

        if (own_index === -1 || swapping_index === -1 || target_index === -1) {
            return false;
        }

        let holder;

        holder = player_watching.center_knowledge[target_index];
        player_watching.center_knowledge[target_index] =
            player_watching.player_knowledge[swapping_index];
        player_watching.player_knowledge[swapping_index] = holder;

        holder = target_center.actual_role;
        target_center.actual_role = player_swapping.actual_role;
        player_swapping.actual_role = holder;

        holder = target_center.actual_team;
        target_center.actual_team = player_swapping.actual_team;
        player_swapping.actual_team = holder;

        return true;
    };



    game.rolePlayingIs = function(role_name) {
        "use strict";
        return game.roles[game.role_on_play].name === role_name;
    };



    game.voteFor = function(target) {
        "use strict";
        let target_index = game.player_list.findIndex(player => player === target);

        if (target_index === -1) {
            return false;
        }

        target.vote_count += 1;

        return true;
    };



    game.killPlayer = function(target) {
        "use strict";
        let target_index = game.player_list.findIndex(player => player === target);

        if (target_index === -1) {
            return false;
        }

        target.alive = false;
        target.end();

        return true;
    };

    accessor.playerInteraction = game.playerInteraction;
};

module.exports.moduleInput = moduleInput;