const {Player} = require('./constructors.js');

const Configuration = function(PRIVATE, PUBLIC) {
    'use strict';

    PRIVATE.consoleLogGame = function() {
        'use strict';
        return false;
        console.log(PRIVATE.playerList);
        console.log(PRIVATE.centerList);
    };

    PRIVATE.createDebugPlayer = function() {
        'use strict';
        const debugPlayer = new Player('Dummy', -1);
        debugPlayer.setupReady = true;

        PRIVATE.playerList.push(debugPlayer);
        PRIVATE.setReady();
    };

    PRIVATE.createRealPlayer = function(pName, pTag) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p.idTag === pTag);
        const playerMaxReached =
            PRIVATE.playerList.length !== PRIVATE.playerMax;

        if (ID === -1) {
            if (playerMaxReached) {
                PRIVATE.playerList.push(new Player(pName, pTag));
                PRIVATE.setReady();
            }
        } else {
            PRIVATE.deleteRealPlayer(pTag);
        }
    };

    PRIVATE.deleteRealPlayer = function(pTag) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p.idTag === pTag);

        if (ID !== -1 && PRIVATE.stageId === 0) {
            PRIVATE.playerList.splice(ID, 1);
        }

        PRIVATE.setReady();
    };

    PRIVATE.toggleRoles = function(pTag, pValue, pWhich) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p.idTag === pTag);

        try {
            const possibleErrors = [
                'The player selecting roles is not table leader. ' +
                '(Modified Client)',
                'Invalid index. (Modified Client)',
                'Invalid subindex. (Modified Client)',
            ];

            if (ID !== 0) {
                throw new Error(possibleErrors[0]);
            }
            if (PRIVATE.roleList[pValue] === null) {
                throw new Error(possibleErrors[1]);
            }
            if (PRIVATE.roleList[pValue].gameActive[pWhich] === null) {
                throw new Error(possibleErrors[2]);
            }
        } catch (e) {
            console.log(e);
            return;
        }

        PRIVATE.roleList[pValue].gameActive[pWhich] = !PRIVATE.roleList[pValue]
            .gameActive[pWhich];

        PRIVATE.setReady();
    };

    PRIVATE.togglePlayers = function(pTag) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p.idTag === pTag);

        try {
            if (ID === -1) {
                throw new Error('The player is not seated. (Modified Client)');
            }
        } catch (e) {
            console.log(e);
            return;
        }

        PRIVATE.playerList[ID].setupReady = !PRIVATE.playerList[ID].setupReady;

        PRIVATE.setReady();
    };

    PRIVATE.setReady = function() {
        'use strict';
        let rolesAmount;
        rolesAmount = 0;

        const countActiveRoles = function(r) {
            const checkRoleActivity = function(a) {
                if (a === true) {
                    rolesAmount += 1;
                }
            };

            r.gameActive.forEach(checkRoleActivity);
        };

        PRIVATE.roleList
            .filter((r) => r.gameActive.includes(true))
            .forEach(countActiveRoles);

        const notEveryoneReady =
            PRIVATE.playerList.filter((p) => p.setupReady === false).length > 0;

        const notEnoughPlayers = PRIVATE.playerList.length < 3;

        const noNecessaryRolesActive =
            PRIVATE.roles.filter(
                (r) => r.gameNecessary === true && r.active.includes(true),
            ).length === 0;

        const cardsDontAlign = rolesAmount !== PRIVATE.playerList.length + 3;

        PRIVATE.setupReady = !(
            notEveryoneReady ||
            notEnoughPlayers ||
            noNecessaryRolesActive ||
            cardsDontAlign
        );
    };

    PUBLIC.createDebugPlayer = PRIVATE.createDebugPlayer;
    PUBLIC.createRealPlayer = PRIVATE.createRealPlayer;
    PUBLIC.deleteRealPlayer = PRIVATE.deleteRealPlayer;
    PUBLIC.toggleRole = PRIVATE.toggleRole;
    PUBLIC.togglePlayer = PRIVATE.togglePlayer;
};

module.exports.configuration = Configuration;
