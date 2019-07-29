const { GAME } = require("./GAME-ENGINE-FACTORY.js");



GAME.prototype.parseForUpdate = function(tag) {
    "use strict";
    let game, me;

    game = JSON.parse(JSON.stringify(this));
    me = game.player_list.findIndex(player => player.tag === tag);

    if (me !== -1) {
        delete game.player_list[me].actual_role;
        delete game.player_list[me].actual_team;
    }

    let other_players = game.player_list.filter(player => player.tag !== tag);
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

    game.center_cards.forEach(function(center) {
        delete center.actual_role;

        delete center.actual_team;
    });

    game.roles.forEach(function(role) {
        delete role.team;
        delete role.action;
    });

    return game;
};



GAME.prototype.doesPlayerExist = function(tag) {
    return (this.player_list.findIndex(player => player.tag === tag) >= 0);
};