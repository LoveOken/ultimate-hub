const { GAME, PLAYER } = require("./GAME-ENGINE-FACTORY.js");



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



GAME.prototype.disconnectPlayer = function(tag) {
    "use strict";
    let me;
    me = this.player_list.findIndex(player => player.tag === tag);

    if (me !== -1 && this.stage === 0) {
        this.player_list.splice(me, 1);
    }

    this.setReady();
};



GAME.prototype.seatRequest = function(name, tag) {
    "use strict";
    let me;
    me = this.player_list.findIndex(player => player.tag === tag)

    if (me === -1) {
        if (this.player_list.length !== this.player_max) { this.player_list.push(new PLAYER(name, tag)) };
    } else {
        this.player_list.splice(me, 1);
    }

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

    let count_active_cards = function(role) {

        role.active.forEach(function(active) {
            if (active === true) {
                amount_of_cards_picked += 1;
            }
        });

    }

    this.roles
        .filter(role => role.active.includes(true))
        .forEach(count_active_cards);

    not_everyone_is_ready =
        this.player_list.filter(player => player.ready === false).length > 0;

    not_enough_players =
        this.player_list.length < 3;

    no_necessary_roles_active =
        this.roles.filter(
            role => role.necessary === true && role.active.includes(true)
        ).length === 0;

    cards_dont_align =
        amount_of_cards_picked !== this.player_list.length + 3;

    this.ready = !(
        not_everyone_is_ready ||
        not_enough_players ||
        no_necessary_roles_active ||
        cards_dont_align
    );
};