/**
 * Creates a Player object inside a Game object.
 * @param {string} pName The displayed player's name.
 * @param {number} pTag A unique tag used to locate the player.
 * @return {void}
 */
function Player(pName, pTag) {
    'use strict';
    this.idName = pName;
    this.idTag = pTag;

    this.setupReady = false;

    this.clientVisible = true;
    this.clientPlayerKnowledge = [];
    this.clientCenterKnowledge = [];

    this.gameActualRole = 'UNDEFINED';
    this.gameOriginalRole = 'UNDEFINED';

    this.gameActualTeam = 'Undefined';
    this.gameOriginalTeam = 'Undefined';

    this.eventActionState = 0;
    this.eventAction = new Function();
    this.eventVote = new Function();
    this.eventEvaluate = new Function();
    this.eventEnd = new Function();

    this.statusVoteCount = 0;
    this.statusAlive = true;

    this.statusWon = false;

    const p = this;

    this.setRoleAs = function(pRole, pInitial, pAction) {
        p.gameActualRole = pRole.idName;
        p.gameActualTeam = pRole.idTeam;

        if (pInitial) {
            p.gameOriginalRole = pRole.idName;
            p.gameOriginalTeam = pRole.idTeam;
        }

        if (pAction) {
            pRole.setEventAction(p);
        }
    };
}

/**
 * Creates a Center object inside a Game object.
 * @param {string} pName The displayed centers's name.
 * @param {object} pRole The role that belongs to this object.
 * @return {void}
 */
function Center(pName, pRole) {
    'use strict';
    this.idName = pName;

    this.gameActualRole = pRole.idName;
    this.gameActualTeam = pRole.idTeam;
}

/**
 * Creates a Role object inside a Game object.
 * @param {string} pName The displayed role's name.
 * @param {number} pQuantity The amount of role duplicates.
 * @param {string} pTeam The team in which the role belongs.
 * @param {string} pDescription A public description of the role.
 * @param {object} pAction Describes the actions performed by role.
 * @param {boolean} pNecessary Describes if you need the role to play the game.
 * @param {number} pTime Describes how long this role's turn is.
 * @return {void}
 */
function Role(
    pName,
    pQuantity,
    pTeam,
    pDescription,
    pAction,
    pNecessary,
    pTime,
) {
    'use strict';
    this.idName = pName;
    this.idTeam = pTeam;
    this.idDescription = pDescription;

    this.setEventAction = pAction;
    this.eventTime = pTime;

    this.gameActive = [];

    this.gameActive.length = pQuantity;
    this.gameActive.fill(false);

    this.gameNecessary = pNecessary;
}

module.exports.Player = Player;
module.exports.Center = Center;
module.exports.Role = Role;

/**
 * Creates a Game Object.
 * @param {string} pName The displayed player's name.
 * @param {string} pUrl A unique URL used to locate the game.
 * @return {undefined}
 */
function Game(pName, pUrl) {
    'use strict';

    const MODULES = {
        roles: require('./roles.js').roles,
        configuration: require('./configuration.js').configuration,
        interactions: require('./interactions.js').interactions,
        stages: require('./stages.js').stages,
        client: require('./client.js').client,
    };

    const PRIVATE = {
        idName: pName,
        idUrl: pUrl,

        setupReady: false,

        eventOptions: {
            eventNightTimeMultiplier: 1,
            eventDayTimeInMinutes: 1,
            eventVotingTimeInSeconds: 5,
        },

        playerList: [],
        playerMax: 10,

        centerList: [],

        stageId: 0,
        stageClock: 0,

        gameRoleOnPlay: 0,
        gamePublicPlayerknowledge: [],
        gamePublicCenterknowledge: [],

        statusWinners: [],
    };

    for (const moduleFunction in MODULES) {
        if ({}.hasOwnProperty.call(MODULES, moduleFunction)) {
            moduleFunction(PRIVATE, this);
        }
    }

    Object.freeze(this);
}

module.exports.Game = Game;
