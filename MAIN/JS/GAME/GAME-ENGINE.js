const { CREATE_ROLE_CARDS, CREATE_WIN_CONDITIONS } = require("./GAME-STAGING.js");

/* Object Definitions */

function GAME() {
    this.id = "Game Test";

    this.options = {
        action_time_multiplier: 0.25,
        discussion_time: 0.5,
        voting_time: 20
    }

    this.roles = CREATE_ROLE_CARDS(this);
    this.role_on_play = 0;

    this.player_list = new Array;
    this.player_max = 10;

    this.center_cards = new Array;

    this.stage = 0;
    this.stage_clock = 0;

    this.ready = false;

    this.public_player_knowledge = new Array;
    this.public_center_knowledge = new Array;
}

function PLAYER(name, tag) {
    this.name = name;
    this.tag = tag;

    this.ready = false;

    this.visible = true;

    this.player_knowledge = new Array;
    this.center_knowledge = new Array;

    this.actual_role = "UNDEFINED";
    this.original_role = "UNDEFINED";

    this.actual_team = "Undefined";
    this.original_team = "Undefined";

    this.action_state = 0;
    this.evaluate = new Function;
    this.end = new Function;
    this.vote = new Function;
    this.action = new Function;

    this.vote_count = 0;
    this.alive = true;

    this.won = false;
}

function CENTER(name, role) {
    this.name = name;

    this.actual_role = role.name;

    this.actual_team = role.team;
}

/* Debugging */

GAME.prototype.createDebugPlayer = function() {
    dummy = new PLAYER("Dummy", -1);
    dummy.ready = true;
    this.player_list.push(dummy);

    this.setReady();
}

GAME.prototype.debugPlayerList = function() {
    this.player_list.forEach((player) => {
        console.log(player);
    });

    this.center_cards.forEach((center) => {
        console.log(center);
    })
}

/* Game Preparations */

GAME.prototype.disconnectPlayer = function(tag) {
    let me = this.player_list.findIndex(player => player.tag === tag);

    if (me != -1 && this.stage == 0) {
        this.player_list.splice(me, 1);
    }

    this.setReady();
}

GAME.prototype.seatRequest = function(name, tag, seating) {
    try {
        if (this.player_list.length == this.player_max && seating) {
            throw (Error("The player list is full. (Modified Client)"));
        };
        if (this.player_list.findIndex(player => player.tag === tag) != -1 && seating) {
            throw (Error("The client is already seated on the game. (Modified Client)"));
        }
        if (this.player_list.findIndex(player => player.tag === tag) == -1 && !seating) {
            throw (Error("The client has not seated yet wants to stand. (Modified Client)"));
        }
        if (seating != true && seating != false) {
            throw (Error("Seating is not defined."))
        }
    } catch (e) {
        console.log(e);
        return;
    }

    if (seating) {
        this.player_list.push(new PLAYER(name, tag));
    } else {
        this.player_list.splice(this.player_list.findIndex(player => player.tag === tag), 1);
    }

    this.setReady();
}

GAME.prototype.toggleRole = function(tag, value, which) {
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from != 0) {
            throw (Error("The player selecting roles is not table leader. (Modified Client)"));
        }
        if (this.roles[value] == null) {
            throw (Error("Invalid index. (Modified Client)"));
        }
        if (this.roles[value].active[which] == null) {
            throw (Error("Invalid subindex. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.roles[value].active[which] = !this.roles[value].active[which];

    this.setReady();
}

GAME.prototype.togglePlayerReady = function(tag) {
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from == -1) {
            throw (Error("The player is not seated. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.player_list[from].ready = !this.player_list[from].ready;

    this.setReady();
}

GAME.prototype.setReady = function() {
    let amount_of_cards_picked;
    let not_everyone_is_ready, not_enough_players, no_necessary_roles_active, cards_dont_align;

    amount_of_cards_picked = 0;

    this.roles.filter(role => role.active.includes(true)).forEach(
        function(role) {
            role.active.forEach(function(active) {
                if (active == true) amount_of_cards_picked += 1;
            })
        }
    );

    not_everyone_is_ready = (this.player_list.filter(player => player.ready === false).length > 0);
    not_enough_players = (this.player_list.length < 3);
    no_necessary_roles_active = (this.roles.filter(role => role.necessary === true && role.active.includes(true)).length == 0);
    cards_dont_align = (amount_of_cards_picked != this.player_list.length + 3);

    this.ready = !(
        not_everyone_is_ready ||
        not_enough_players ||
        no_necessary_roles_active ||
        cards_dont_align
    );
}

GAME.prototype.shuffleRoles = function() {
    let roles_to_pick_from, roles;

    roles = this.roles;
    roles_to_pick_from = "";

    roles.forEach(
        function(role, index) {
            let string_index;
            string_index = Math.floor(index / 10).toString() + (index % 10).toString();

            role.active.forEach(function(active) {
                if (active == true) roles_to_pick_from += string_index;
            })
        }
    );

    this.player_list.forEach(
        function(player) {
            let random_factor, random_role, role_index;
            random_factor = Math.floor(Math.random() * roles_to_pick_from.length / 2);
            random_role = roles_to_pick_from.slice(2 * random_factor, 2 * random_factor + 2);

            roles_to_pick_from = roles_to_pick_from.replace(random_role, '');

            role_index = eval(random_role);

            player.actual_role = roles[role_index].name;
            player.original_role = roles[role_index].name;

            player.actual_team = roles[role_index].team;
            player.original_team = roles[role_index].team;

            roles[role_index].action(player);
        }
    )

    for (let i = 0; 3 > i; i++) {
        let random_factor, random_role, role_index;
        random_factor = Math.floor(Math.random() * roles_to_pick_from.length / 2);
        random_role = roles_to_pick_from.slice(2 * random_factor, 2 * random_factor + 2);

        roles_to_pick_from = roles_to_pick_from.replace(random_role, '');
        role_index = eval(random_role);

        name = "Center " + (i + 1);

        this.center_cards.push(
            new CENTER(
                name,
                roles[role_index]
            )
        );
    }

    this.debugPlayerList();
}

GAME.prototype.initializeKnowledge = function() {
    let initial_player_knowledge, initial_center_knowledge;
    initial_player_knowledge = new Array;
    initial_center_knowledge = new Array;

    this.player_list.forEach(
        function() {
            initial_player_knowledge.push("UNKNOWN");
        }
    )

    this.center_cards.forEach(
        function() {
            initial_center_knowledge.push("UNKNOWN");
        }
    )

    this.player_list.forEach(
        function(player, index) {
            player.player_knowledge = initial_player_knowledge.slice();
            player.center_knowledge = initial_center_knowledge.slice();

            player.player_knowledge[index] = player.original_role;
        }
    )
}

GAME.prototype.clockStart = function(update_function, end_function) {
    update_function();

    if (this.stage_clock > 0) {
        setTimeout(
            () => {
                this.stage_clock--;
                this.clockStart(update_function, end_function);
            }, 1000);
    } else {
        end_function();
    }
}

/* Game Stages */

GAME.prototype.preparationPhase = function(tag, update_function) {
    let from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from != 0) {
            throw (Error("The player who confirmed the game settings is not table leader. (Modified Client)"));
        }
        if (!this.ready) {
            throw (Error("The game is not ready to start yet the button to start is unlocked. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.stage = 1;
    this.stage_clock = 5;

    let end_function = () => {
        this.stage = 2;
        this.nightPhase(update_function, 0);
    }

    this.shuffleRoles();
    this.initializeKnowledge();
    this.clockStart(
        update_function,
        end_function
    )
}

GAME.prototype.nightPhase = function(update_function, i) {
    let roles = this.roles.filter(role => role.active.includes(true));
    let players;

    if (roles[i] != undefined) {
        players = this.player_list.filter(player => player.original_role === roles[i].name);
    } else {
        this.discussionPhase(update_function);
        return;
    }

    this.role_on_play = this.roles.findIndex(role => role.name === roles[i].name);

    let currentAction = () => {
        players.forEach(
            function(player) {
                player.action();
            }
        );
    }

    let end_function = () => {
        currentAction();
        this.nightPhase(update_function, i + 1);
    }

    currentAction();

    let time = roles[i].time;

    if (time == 0) {
        this.discussionPhase(update_function);
        return;
    } else {
        this.stage_clock = time * this.options.action_time_multiplier;
    }

    this.clockStart(
        update_function,
        end_function
    )
}

GAME.prototype.discussionPhase = function(update_function) {
    let determine_result = () => {
        this.stage = 5;

        let most_voted_player = null;

        let make_vote = (player) => {
            player.vote();
        }

        let find_most_voted_player = (player) => {
            if (most_voted_player == null || player.vote_count > most_voted_player.vote_count) most_voted_player = player;
        }

        let kill_most_voted_player = () => {
            if (most_voted_player.vote_count != 1) {
                this.killPlayer(most_voted_player);
            }
        }

        this.player_list.forEach(make_vote);
        this.player_list.forEach(find_most_voted_player);
        kill_most_voted_player();

        let dead_players = this.player_list.filter(player => player.alive == false);

        let evaluate_win_condition = (player) => {
            player.evaluate(dead_players);
        }

        this.player_list.forEach(evaluate_win_condition);
        this.debugPlayerList();
        this.revealAll();

        update_function();
    }

    let voting_phase = () => {
        this.stage = 4;
        this.stage_clock = this.options.voting_time;

        this.clockStart(
            update_function,
            determine_result
        );
    }

    this.stage = 3;
    this.stage_clock = this.options.discussion_time * 60;

    this.player_list.forEach(CREATE_WIN_CONDITIONS);
    this.debugPlayerList();

    this.clockStart(
        update_function,
        voting_phase
    );
}

/* Player Interactions */

GAME.prototype.playerInteraction = function(tag, type, whom, update_function) {
    let from = this.player_list.find(player => player.tag === tag);
    let to = (type) ? this.center_cards[whom] : this.player_list[whom];

    try {
        if (from === undefined || to === undefined) {
            throw (Error("Both target and sender must be defined."));
        }
    } catch (err) {
        console.log(err);
        return;
    }

    switch (this.stage) {
        case 2:
            if (from.original_role != this.roles[this.role_on_play].name) return;
            from.action(to);
            break;
        case 4:
            from.vote(to);
            break;
        default:
            return;
    }

    this.debugPlayerList();
    update_function();
}

GAME.prototype.copyPlayer = function(player_copying, target_player) {
    let own_index = this.player_list.findIndex(player => player === player_copying);
    let target_index = this.player_list.findIndex(player => player === target_player);

    if (own_index == -1 || target_index == -1) return false;

    player_copying.player_knowledge[own_index] = target_player.actual_role;
    player_copying.player_knowledge[target_index] = target_player.actual_role;

    player_copying.actual_team = target_player.actual_team;

    let new_role = this.roles.find(role => role.name === target_player.actual_role);

    new_role.action(player_copying);
    player_copying.action();

    return true;
}

GAME.prototype.recognizePlayers = function(player_recognizing, role_to_recognize_as, condition_of_recognition) {
    let output = false;
    let own_index = this.player_list.findIndex(player => player === player_recognizing);

    if (own_index == -1) return output;

    this.player_list.forEach(
        (p, i) => {
            if (condition_of_recognition(p)) {
                player_recognizing.player_knowledge[i] = role_to_recognize_as;

                output = true;
            }
        }
    );

    return output;
}

GAME.prototype.peekOnPlayer = function(player_peeking, target_player) {
    let own_index = this.player_list.findIndex(player => player === player_peeking);
    let target_index = this.player_list.findIndex(player => player === target_player);

    if (own_index == -1 || target_index == -1) return false;

    player_peeking.player_knowledge[target_index] = target_player.actual_role;

    return true;
}

GAME.prototype.peekCenter = function(player_peeking, target_center) {
    let own_index = this.player_list.findIndex(player => player === player_peeking);
    let target_index = this.center_cards.findIndex(center => center === target_center);

    if (own_index == -1 || target_index == -1) return false;

    player_peeking.center_knowledge[target_index] = target_center.actual_role;

    return true;
}

GAME.prototype.swapTwoPlayers = function(player_watching, player_swapping, target_player) {
    let own_index = this.player_list.findIndex(player => player === player_watching);
    let swapping_index = this.player_list.findIndex(player => player === player_swapping);
    let target_index = this.player_list.findIndex(player => player === target_player);

    if (own_index == -1 || swapping_index == -1 || target_index == -1) return false;

    let holder = undefined;

    holder = player_watching.player_knowledge[target_index];
    player_watching.player_knowledge[target_index] = player_watching.player_knowledge[swapping_index];
    player_watching.player_knowledge[swapping_index] = holder;

    holder = target_player.actual_role;
    target_player.actual_role = player_swapping.actual_role;
    player_swapping.actual_role = holder;

    holder = target_player.actual_team;
    target_player.actual_team = player_swapping.actual_team;
    player_swapping.actual_team = holder;

    delete holder;

    return true;
}

GAME.prototype.swapPlayerCenter = function(player_watching, player_swapping, target_center) {
    let own_index = this.player_list.findIndex(player => player === player_watching);
    let swapping_index = this.player_list.findIndex(player => player === player_swapping);
    let target_index = this.center_cards.findIndex(center => center === target_center);

    if (own_index == -1 || swapping_index == -1 || target_index == -1) return false;

    let holder = undefined;

    holder = player_watching.center_knowledge[target_index];
    player_watching.center_knowledge[target_index] = player_watching.player_knowledge[swapping_index];
    player_watching.player_knowledge[swapping_index] = holder;

    holder = target_center.actual_role;
    target_center.actual_role = player_swapping.actual_role;
    player_swapping.actual_role = holder;

    holder = target_center.actual_team;
    target_center.actual_team = player_swapping.actual_team;
    player_swapping.actual_team = holder;

    delete holder;

    return true;
}

GAME.prototype.rolePlayingIs = function(role_name) {
    return (this.roles[this.role_on_play].name == role_name);
}

GAME.prototype.voteFor = function(target) {
    let target_index = this.player_list.findIndex(player => player === target);

    if (target_index == -1) return false;

    target.vote_count += 1;

    return true;
}

GAME.prototype.randomPlayer = function() {
    random_index = Math.floor(Math.random() * this.player_list.length);

    return (this.player_list[random_index]);
}

GAME.prototype.killPlayer = function(target) {
    let target_index = this.player_list.findIndex(player => player === target);

    if (target_index == -1) return false;

    target.alive = false;
    target.end();

    return true;
}

GAME.prototype.revealAll = function() {
    this.player_list.forEach(
        (target) => {
            this.public_player_knowledge.push(target.actual_role);
        }
    )

    this.center_cards.forEach(
        (target) => {
            this.public_center_knowledge.push(target.actual_role);
        }
    )
}

/* Exporting */

GAME.prototype.parseForUpdate = function(tag) {
    let game = JSON.parse(JSON.stringify(this));

    let me = game.player_list.findIndex(player => player.tag === tag);

    if (me != -1) {
        delete game.player_list[me].actual_role;
    }

    let other_players = game.player_list.filter(player => player.tag != tag);
    other_players.forEach(
        function(player) {
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
        }
    );

    game.center_cards.forEach(
        function(center) {
            delete center.actual_role;

            delete center.actual_team;
        }
    );

    game.roles.forEach(
        function(role) {
            delete role.team;
            delete role.action;
        }
    )

    return game;
}

module.exports.GAME = GAME;