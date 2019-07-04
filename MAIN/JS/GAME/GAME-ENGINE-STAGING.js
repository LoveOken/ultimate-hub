const { GAME, CENTER } = require("./GAME-ENGINE-FACTORY.js");



GAME.prototype.shuffleRoles = function() {
    "use strict";
    let roles_to_pick_from, roles;

    roles = this.roles;
    roles_to_pick_from = "";

    let role_random = function() {
        let random_factor = Math.floor(
            (Math.random() * roles_to_pick_from.length) / 2
        );

        return (roles_to_pick_from.slice(
            2 * random_factor,
            2 * random_factor + 2
        ));
    };

    let check_if_active = function(active) {
        if (active === true) {
            roles_to_pick_from += string_index;
        }
    };

    roles.forEach(function(role, index) {
        let string_index;
        string_index = Math.floor(index / 10).toString() + (index % 10);

        role.active.forEach(check_if_active);
    });

    this.player_list.forEach(function(player) {
        let role = role_random();

        roles_to_pick_from = roles_to_pick_from.replace(role, "");

        role_index = parseInt(role, 10);

        player.actual_role = roles[role_index].name;
        player.original_role = roles[role_index].name;

        player.actual_team = roles[role_index].team;
        player.original_team = roles[role_index].team;

        roles[role_index].action(player);
    });

    for (i = 0; 3 > i; i += 1) {
        let role = role_random();

        roles_to_pick_from = roles_to_pick_from.replace(role, "");
        role_index = parseInt(role, 10);

        name = "Center " + (i + 1);

        this.center_cards.push(new CENTER(name, roles[role_index]));
    }

    this.debugPlayerList();
};



GAME.prototype.initializeKnowledge = function() {
    "use strict";
    let initial_player_knowledge, initial_center_knowledge;
    initial_player_knowledge = [];
    initial_center_knowledge = [];

    this.player_list.forEach(function() {
        initial_player_knowledge.push("UNKNOWN");
    });

    this.center_cards.forEach(function() {
        initial_center_knowledge.push("UNKNOWN");
    });

    this.player_list.forEach(function(player, index) {
        player.player_knowledge = initial_player_knowledge.slice();
        player.center_knowledge = initial_center_knowledge.slice();

        player.player_knowledge[index] = player.original_role;
    });
};



GAME.prototype.clockStart = function(update_function, end_function) {
    "use strict";
    let game;
    game = this;

    update_function();

    if (this.stage_clock > 0) {
        setTimeout(function() {
            game.stage_clock -= 1;
            game.clockStart(update_function, end_function);
        }, 1000);
    } else {
        end_function();
    }
};



GAME.prototype.preparationPhase = function(tag, update_function) {
    "use strict";
    let from, game;
    from = this.player_list.findIndex(player => player.tag === tag);
    game = this;

    try {
        if (from !== 0) {
            throw new Error(
                "The player who confirmed the game settings is not table leader. (Modified Client)"
            );
        }
        if (!this.ready) {
            throw new Error(
                "The game is not ready to start yet the button to start is unlocked. (Modified Client)"
            );
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.stage = 1;
    this.stage_clock = 5;

    let end_function = function() {
        game.stage = 2;
        game.nightPhase(update_function, 0);
    };

    this.shuffleRoles();
    this.initializeKnowledge();

    this.clockStart(update_function, end_function);
};



GAME.prototype.nightPhase = function(update_function, i) {
    "use strict";
    let roles, players, game;
    roles = this.roles.filter(role => role.active.includes(true));
    game = this;

    if (roles[i] !== undefined) {
        players = this.player_list.filter(
            player => player.original_role === roles[i].name
        );
    } else {
        this.discussionPhase(update_function);
        return;
    }

    this.role_on_play = this.roles.findIndex(
        role => role.name === roles[i].name
    );

    let currentAction = function() {
        players.forEach(function(player) {
            player.action();
        });
    };

    let end_function = function() {
        currentAction();
        game.nightPhase(update_function, i + 1);
    };

    currentAction();

    let time = roles[i].time * this.options.action_time_multiplier;

    if (time === 0) {
        this.discussionPhase(update_function);
        return;
    }

    this.stage_clock = time;

    this.clockStart(update_function, end_function);
};



GAME.prototype.discussionPhase = function(update_function) {
    "use strict";
    let game;
    game = this;

    let determine_result = function() {
        game.stage = 5;

        let most_votes;

        let make_vote = function(player) {
            player.vote();
        };

        let find_most_voted = function(player) {
            if (player.vote_count > most_votes) {
                most_votes = player.vote_count;
            }
        };

        game.player_list.forEach(make_vote);
        game.player_list.forEach(find_most_voted);

        if (most_votes !== 1) {
            game.player_list.filter(player => player.vote_count === most_votes).forEach(game.killPlayer);
        }

        let dead = game.player_list.filter(
            player => player.alive === false
        );

        let evaluate_win_condition = function(player) {
            if (
                player.evaluate(dead) &&
                !game.winners.includes(player.actual_team)
            ) {
                game.winners.push(player.actual_team);
            }
        };

        game.player_list.forEach(evaluate_win_condition);
        game.revealAll();

        game.debugPlayerList();

        update_function();
    };

    let voting_phase = function() {
        game.stage = 4;
        game.stage_clock = game.options.voting_time;

        game.clockStart(update_function, determine_result);
    };

    this.stage = 3;
    this.stage_clock = this.options.discussion_time * 60;

    this.player_list.forEach(this.roleWin);

    this.clockStart(update_function, voting_phase);
};