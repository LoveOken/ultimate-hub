const { PLAYER } = require("./GAME-ENGINE-FACTORY.js");

const moduleConfiguration = function(game, accessor) {
    "use strict";

    game.createDebugPlayer = function() {
        "use strict";
        let dummy;
        dummy = new PLAYER("Dummy", -1);
        dummy.ready = true;
        game.player_list.push(dummy);

        game.setReady();
    };



    game.debugPlayerList = function() {
        "use strict";
        return false;
        console.log(game.player_list);
        console.log(game.center_cards);
    };



    game.disconnectPlayer = function(tag) {
        "use strict";
        let me;
        me = game.player_list.findIndex(player => player.tag === tag);

        if (me !== -1 && game.stage === 0) {
            game.player_list.splice(me, 1);
        }

        game.setReady();
    };



    game.seatRequest = function(name, tag) {
        "use strict";
        let me;
        me = game.player_list.findIndex(player => player.tag === tag)

        if (me === -1) {
            if (game.player_list.length !== game.player_max) { game.player_list.push(new PLAYER(name, tag)) };
        } else {
            game.player_list.splice(me, 1);
        }

        game.setReady();
    };



    game.toggleRole = function(tag, value, which) {
        "use strict";
        let from;
        from = game.player_list.findIndex(player => player.tag === tag);

        try {
            if (from !== 0) {
                throw new Error(
                    "The player selecting roles is not table leader. (Modified Client)"
                );
            }
            if (game.roles[value] === null) {
                throw new Error("Invalid index. (Modified Client)");
            }
            if (game.roles[value].active[which] === null) {
                throw new Error("Invalid subindex. (Modified Client)");
            }
        } catch (e) {
            console.log(e);
            return;
        }

        game.roles[value].active[which] = !game.roles[value].active[which];

        game.setReady();
    };



    game.togglePlayerReady = function(tag) {
        "use strict";
        let from;
        from = game.player_list.findIndex(player => player.tag === tag);

        try {
            if (from === -1) {
                throw new Error("The player is not seated. (Modified Client)");
            }
        } catch (e) {
            console.log(e);
            return;
        }

        game.player_list[from].ready = !game.player_list[from].ready;

        game.setReady();
    };



    game.setReady = function() {
        "use strict";
        let amount_of_cards_picked;

        let not_everyone_is_ready,
            not_enough_players,
            no_necessary_roles_active,
            cards_dont_align;

        amount_of_cards_picked = 0;

        let count_active_cards = function(role) {

            role.active.forEach(function(active) {
                if (active === true) {
                    amount_of_cards_picked += 1;
                }
            });

        }

        game.roles
            .filter(role => role.active.includes(true))
            .forEach(count_active_cards);

        not_everyone_is_ready =
            game.player_list.filter(player => player.ready === false).length > 0;

        not_enough_players =
            game.player_list.length < 3;

        no_necessary_roles_active =
            game.roles.filter(
                role => role.necessary === true && role.active.includes(true)
            ).length === 0;

        cards_dont_align =
            amount_of_cards_picked !== game.player_list.length + 3;

        game.ready = !(
            not_everyone_is_ready ||
            not_enough_players ||
            no_necessary_roles_active ||
            cards_dont_align
        );
    };

    accessor.createDebugPlayer = game.createDebugPlayer;
    accessor.seatRequest = game.seatRequest;
    accessor.toggleRole = game.toggleRole;
    accessor.togglePlayerReady = game.togglePlayerReady;
    accessor.disconnectPlayer = game.disconnectPlayer;
};

module.exports.moduleConfiguration = moduleConfiguration;