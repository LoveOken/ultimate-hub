function GAME(name) {
    "use strict";
    this.id = name;

    this.options = {
        action_time_multiplier: 1,
        discussion_time: 0.1,
        voting_time: 5
    };

    this.role_on_play = 0;
    this.roleTrack();
    this.roleStage();

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

function ROLE(name, quantity, team, description, action, necessary, time) {
    "use strict";
    this.name = name;
    this.team = team;
    this.description = description;

    this.action = action;

    this.active = [];

    this.active.length = quantity;
    this.active.fill(false);

    this.necessary = necessary;

    this.time = time;
}

module.exports.GAME = GAME;
module.exports.PLAYER = PLAYER;
module.exports.CENTER = CENTER;
module.exports.ROLE = ROLE;

require("./GAME-STAGING-ROLE.js");

require("./GAME-ENGINE-CONFIGURATION.js");
require("./GAME-ENGINE-INPUT.js");
require("./GAME-ENGINE-STAGING.js");

require("./GAME-ENGINE-PUBLIC.js");
