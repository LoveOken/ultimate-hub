const modulePublic = function(game, accessor) {
    "use strict";

    game.parseForUpdate = function(tag) {
        "use strict";
        let clone, me;

        clone = JSON.parse(JSON.stringify(game));
        me = clone.player_list.findIndex(player => player.tag === tag);

        if (me !== -1) {
            delete clone.player_list[me].actual_role;
            delete clone.player_list[me].actual_team;
        }

        let other_players = clone.player_list.filter(player => player.tag !== tag);
        other_players.forEach(function(player) {
            player.visible = false;

            delete player.player_knowledge;
            delete player.center_knowledge;

            delete player.actual_role;
            delete player.original_role;

            delete player.actual_team;
            delete player.original_team;

            delete player.action;
            delete player.vote;
            delete player.end;
            delete player.evaluate;
            delete player.action_state;
        });

        clone.center_cards.forEach(function(center) {
            delete center.actual_role;

            delete center.actual_team;
        });

        clone.roles.forEach(function(role) {
            delete role.team;
            delete role.action;
        });

        return clone;
    };



    game.doesPlayerExist = function(tag) {
        return (game.player_list.findIndex(player => player.tag === tag) >= 0);
    };

    accessor.parseForUpdate = game.parseForUpdate;
    accessor.doesPlayerExist = game.doesPlayerExist;
}

module.exports.modulePublic = modulePublic;