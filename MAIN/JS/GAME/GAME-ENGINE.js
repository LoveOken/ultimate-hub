const {
    CREATE_ROLE_CARDS,
    CREATE_WIN_CONDITIONS
} = require("./GAME-STAGING.js");



/* Object Definitions */

function GAME() {
    "use strict";
    this.id = "Game Test";

    this.options = {
        action_time_multiplier: 1,
        discussion_time: 0.1,
        voting_time: 5
    };

    this.roles = CREATE_ROLE_CARDS(this);
    this.role_on_play = 0;

    this.player_list = [];
    this.player_max = 10;

    this.center_cards = [];

    this.stage = 0;
    this.stage_clock = 0;

    this.ready = false;

    this.public_player_knowledge = [];
    this.public_center_knowledge = [];

    this.winners = [];
}

function PLAYER(name, tag) {
    "use strict";
    this.name = name;
    this.tag = tag;

    this.ready = false;

    this.visible = true;

    this.player_knowledge = [];
    this.center_knowledge = [];

    this.actual_role = "UNDEFINED";
    this.original_role = "UNDEFINED";

    this.actual_team = "Undefined";
    this.original_team = "Undefined";

    this.action_state = 0;
    this.evaluate = new Function();
    this.end = new Function();
    this.vote = new Function();
    this.action = new Function();

    this.vote_count = 0;
    this.alive = true;

    this.won = false;
}

function CENTER(name, role) {
    "use strict";
    this.name = name;

    this.actual_role = role.name;

    this.actual_team = role.team;
}



/* Debugging */

GAME.prototype.createDebugPlayer = function() {
    "use strict";
    let dummy;
    dummy = new PLAYER("Dummy", -1);
    dummy.ready = true;
    this.player_list.push(dummy);

    this.setReady();
};

GAME.prototype.debugPlayerList = function() {
    "use strict";
    this.player_list.forEach(function(player) {
        console.log(player);
    });

    this.center_cards.forEach(function(center) {
        console.log(center);
    });
};



/* Game Preparations */

GAME.prototype.disconnectPlayer = function(tag) {
    "use strict";
    let me;
    me = this.player_list.findIndex(player => player.tag === tag);

    if (me !== -1 && this.stage === 0) {
        this.player_list.splice(me, 1);
    }

    this.setReady();
};

GAME.prototype.seatRequest = function(name, tag, seating) {
    "use strict";
    try {
        if (this.player_list.length === this.player_max && seating) {
            throw new Error("The player list is full. (Modified Client)");
        }
        if (
            this.player_list.findIndex(player => player.tag === tag) !== -1 &&
            seating
        ) {
            throw new Error(
                "The client is already seated on the game. (Modified Client)"
            );
        }
        if (
            this.player_list.findIndex(player => player.tag === tag) === -1 &&
            !seating
        ) {
            throw new Error(
                "The client has not seated yet wants to stand. (Modified Client)"
            );
        }
        if (seating !== true && seating !== false) {
            throw new Error("Seating is not defined. (Modified Client)");
        }
    } catch (e) {
        console.log(e);
        return;
    }

    seating
        ?
        this.player_list.push(new PLAYER(name, tag)) :
        this.player_list.splice(
            this.player_list.findIndex(player => player.tag === tag),
            1
        );

    this.setReady();
};

GAME.prototype.toggleRole = function(tag, value, which) {
    "use strict";
    let from;
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from !== 0) {
            throw new Error(
                "The player selecting roles is not table leader. (Modified Client)"
            );
        }
        if (this.roles[value] === null) {
            throw new Error("Invalid index. (Modified Client)");
        }
        if (this.roles[value].active[which] === null) {
            throw new Error("Invalid subindex. (Modified Client)");
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.roles[value].active[which] = !this.roles[value].active[which];

    this.setReady();
};

GAME.prototype.togglePlayerReady = function(tag) {
    "use strict";
    let from;
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from === -1) {
            throw new Error("The player is not seated. (Modified Client)");
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.player_list[from].ready = !this.player_list[from].ready;

    this.setReady();
};

GAME.prototype.setReady = function() {
    "use strict";
    let amount_of_cards_picked;
    let not_everyone_is_ready,
        not_enough_players,
        no_necessary_roles_active,
        cards_dont_align;

    amount_of_cards_picked = 0;

    this.roles
        .filter(role => role.active.includes(true))
        .forEach(function(role) {
            role.active.forEach(function(active) {
                if (active === true) {
                    amount_of_cards_picked += 1;
                }
            });
        });

    not_everyone_is_ready =
        this.player_list.filter(player => player.ready === false).length > 0;
    not_enough_players = this.player_list.length < 3;
    no_necessary_roles_active =
        this.roles.filter(
            role => role.necessary === true && role.active.includes(true)
        ).length === 0;
    cards_dont_align = amount_of_cards_picked !== this.player_list.length + 3;

    this.ready = !(
        not_everyone_is_ready ||
        not_enough_players ||
        no_necessary_roles_active ||
        cards_dont_align
    );
};

GAME.prototype.shuffleRoles = function() {
    "use strict";
    let roles_to_pick_from, roles;

    roles = this.roles;
    roles_to_pick_from = "";

    roles.forEach(function(role, index) {
        let string_index;
        string_index = Math.floor(index / 10).toString() + (index % 10);

        role.active.forEach(function(active) {
            if (active === true) {
                roles_to_pick_from += string_index;
            }
        });
    });

    this.player_list.forEach(function(player) {
        let random_factor, random_role, role_index;
        random_factor = Math.floor(
            (Math.random() * roles_to_pick_from.length) / 2
        );
        random_role = roles_to_pick_from.slice(
            2 * random_factor,
            2 * random_factor + 2
        );

        roles_to_pick_from = roles_to_pick_from.replace(random_role, "");

        role_index = parseInt(random_role, 10);

        player.actual_role = roles[role_index].name;
        player.original_role = roles[role_index].name;

        player.actual_team = roles[role_index].team;
        player.original_team = roles[role_index].team;

        roles[role_index].action(player);
    });

    let i;
    for (i = 0; 3 > i; i += 1) {
        let random_factor, random_role, role_index, name;
        random_factor = Math.floor(
            (Math.random() * roles_to_pick_from.length) / 2
        );
        random_role = roles_to_pick_from.slice(
            2 * random_factor,
            2 * random_factor + 2
        );

        roles_to_pick_from = roles_to_pick_from.replace(random_role, "");
        role_index = parseInt(random_role, 10);

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



/* Game Stages */

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

        let most_voted_player;

        let make_vote = function(player) {
            player.vote();
        };

        let find_most_voted_player = function(player) {
            if (
                most_voted_player === undefined ||
                player.vote_count > most_voted_player.vote_count
            ) {
                most_voted_player = player;
            }
        };

        let kill_most_voted_player = function() {
            if (most_voted_player.vote_count !== 1) {
                game.killPlayer(most_voted_player);
            }
        };

        game.player_list.forEach(make_vote);
        game.player_list.forEach(find_most_voted_player);
        kill_most_voted_player();

        let dead_players = game.player_list.filter(
            player => player.alive === false
        );

        let evaluate_win_condition = function(player) {
            if (
                player.evaluate(dead_players) &&
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

    this.player_list.forEach(CREATE_WIN_CONDITIONS);

    this.clockStart(update_function, voting_phase);
};



/* Player Interactions
 * All interactions occur here
 * These are interactions with the client */

GAME.prototype.playerInteraction = function(tag, type, whom, update_function) {
    "use strict";
    let from, to;

    from = this.player_list.find(player => player.tag === tag);
    to = type ? this.center_cards[whom] : this.player_list[whom];

    try {
        if (from === undefined || to === undefined) {
            throw new Error("Both target and sender must be defined.");
        }
    } catch (err) {
        console.log(err);
        return;
    }

    switch (this.stage) {
        case 2:
            if (from.original_role !== this.roles[this.role_on_play].name) {
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

GAME.prototype.copyPlayer = function(player_copying, target_player) {
    "use strict";
    let own_index, target_index;

    own_index = this.player_list.findIndex(player => player === player_copying);
    target_index = this.player_list.findIndex(
        player => player === target_player
    );

    if (own_index === -1 || target_index === -1) {
        return false;
    }

    player_copying.player_knowledge[own_index] = target_player.actual_role;
    player_copying.player_knowledge[target_index] = target_player.actual_role;

    player_copying.actual_team = target_player.actual_team;

    let new_role;

    new_role = this.roles.find(role => role.name === target_player.actual_role);

    new_role.action(player_copying);
    player_copying.action();

    return true;
};

GAME.prototype.recognizePlayers = function(
    player_recognizing,
    role_to_recognize_as,
    condition_of_recognition
) {
    "use strict";
    let output = false;
    let own_index = this.player_list.findIndex(
        player => player === player_recognizing
    );

    if (own_index === -1) {
        return output;
    }

    this.player_list.forEach(function(p, i) {
        if (condition_of_recognition(p)) {
            player_recognizing.player_knowledge[i] = role_to_recognize_as;

            output = true;
        }
    });

    return output;
};

GAME.prototype.peekOnPlayer = function(player_peeking, target_player) {
    "use strict";
    let own_index = this.player_list.findIndex(
        player => player === player_peeking
    );
    let target_index = this.player_list.findIndex(
        player => player === target_player
    );

    if (own_index === -1 || target_index === -1) {
        return false;
    }

    player_peeking.player_knowledge[target_index] = target_player.actual_role;

    return true;
};

GAME.prototype.peekCenter = function(player_peeking, target_center) {
    "use strict";
    let own_index = this.player_list.findIndex(
        player => player === player_peeking
    );
    let target_index = this.center_cards.findIndex(
        center => center === target_center
    );

    if (own_index === -1 || target_index === -1) {
        return false;
    }

    player_peeking.center_knowledge[target_index] = target_center.actual_role;

    return true;
};

GAME.prototype.swapTwoPlayers = function(
    player_watching,
    player_swapping,
    target_player
) {
    "use strict";
    let own_index = this.player_list.findIndex(
        player => player === player_watching
    );
    let swapping_index = this.player_list.findIndex(
        player => player === player_swapping
    );
    let target_index = this.player_list.findIndex(
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

GAME.prototype.swapPlayerCenter = function(
    player_watching,
    player_swapping,
    target_center
) {
    "use strict";
    let own_index = this.player_list.findIndex(
        player => player === player_watching
    );
    let swapping_index = this.player_list.findIndex(
        player => player === player_swapping
    );
    let target_index = this.center_cards.findIndex(
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

GAME.prototype.voteFor = function(target) {
    "use strict";
    let target_index = this.player_list.findIndex(player => player === target);

    if (target_index === -1) {
        return false;
    }

    target.vote_count += 1;

    return true;
};

GAME.prototype.killPlayer = function(target) {
    "use strict";
    let target_index = this.player_list.findIndex(player => player === target);

    if (target_index === -1) {
        return false;
    }

    target.alive = false;
    target.end();

    return true;
};

GAME.prototype.rolePlayingIs = function(role_name) {
    "use strict";
    return this.roles[this.role_on_play].name === role_name;
};

GAME.prototype.revealAll = function() {
    "use strict";
    let game;
    game = this;

    this.player_list.forEach(function(target) {
        game.public_player_knowledge.push(target.actual_role);
    });

    this.center_cards.forEach(function(target) {
        game.public_center_knowledge.push(target.actual_role);
    });
};

GAME.prototype.randomPlayer = function() {
    "use strict";
    let random_index;
    random_index = Math.floor(Math.random() * this.player_list.length);

    return this.player_list[random_index];
};



/* Exporting */

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

module.exports.GAME = GAME;