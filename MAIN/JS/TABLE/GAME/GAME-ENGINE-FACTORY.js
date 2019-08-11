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
};

function CENTER(name, role) {
    "use strict";
    this.name = name;

    this.actual_role = role.name;

    this.actual_team = role.team;
};

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
};

module.exports.PLAYER = PLAYER;
module.exports.CENTER = CENTER;
module.exports.ROLE = ROLE;

const { moduleRoles } = require("./GAME-STAGING-ROLE.js");

const { moduleConfiguration } = require("./GAME-ENGINE-CONFIGURATION.js");
const { moduleInput } = require("./GAME-ENGINE-INPUT.js");
const { moduleStaging } = require("./GAME-ENGINE-STAGING.js");

const { modulePublic } = require("./GAME-ENGINE-PUBLIC.js");

function GAME(name) {
    "use strict";
    this.id = name;

    let game = {
        id: name,

        options: {
            action_time_multiplier: 1,
            discussion_time: 30,
            voting_time: 5
        },

        role_on_play: 0,

        player_list: [],
        player_max: 10,

        center_cards: [],

        stage: 0,
        stage_clock: 0,
        ready: false,

        public_player_knowledge: [],
        public_center_knowledge: [],

        winners: []
    };

    moduleRoles(game, this);

    moduleConfiguration(game, this);
    moduleInput(game, this);
    moduleStaging(game, this);

    modulePublic(game, this);

    Object.freeze(this);
};

module.exports.GAME = GAME;

