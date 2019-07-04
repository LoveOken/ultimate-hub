const { GAME } = require("./GAME-ENGINE-FACTORY.js");



GAME.prototype.randomPlayer = function() {
    "use strict";
    let random_index;
    random_index = Math.floor(Math.random() * this.player_list.length);

    return this.player_list[random_index];
};



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



GAME.prototype.rolePlayingIs = function(role_name) {
    "use strict";
    return this.roles[this.role_on_play].name === role_name;
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