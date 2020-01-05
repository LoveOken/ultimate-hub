const Interactions = function(PRIVATE, PUBLIC) {
    'use strict';

    PRIVATE.getPlayerInteraction = function(pTag, pType, pTo, clientUpdate) {
        'use strict';

        const ID = PRIVATE.playerList.find((p) => p.idTag === pTag);
        const TO = pType ? PRIVATE.centerList[pTo] : PRIVATE.playerList[pTo];

        try {
            if (ID === undefined || TO === undefined) {
                throw new Error('Both target and sender must be defined.');
            }
        } catch (err) {
            console.log(err);
            return;
        }

        switch (PRIVATE.stage) {
        case 2:
            if (
                ID.gameOriginalRole !==
                    PRIVATE.roleList[PRIVATE.gameRoleOnPlay].idName
            ) {
                return;
            }
            ID.eventAction(TO);
            break;
        case 4:
            ID.eventVote(TO);
            break;
        default:
            return;
        }

        clientUpdate();
    };

    PRIVATE.getRandomPlayer = function() {
        'use strict';
        const randomIndex =
            Math.floor(Math.random() * PRIVATE.playerList.length);

        return PRIVATE.playerList[randomIndex];
    };

    PRIVATE.getIfRoleIsActive = function(pRole) {
        'use strict';
        return PRIVATE.roleList[PRIVATE.gameRoleOnPlay].idName === pRole;
    };

    PRIVATE.copyPlayer = function(playerCopying, playerToCopy) {
        'use strict';

        const ID =
            PRIVATE.playerList.findIndex((player) => p === playerCopying);
        const TO = PRIVATE.playerList.findIndex((player) => p === playerToCopy);

        if (ID === -1 || TO === -1) {
            return false;
        }

        playerCopying.clientPlayerKnowledge[ID] = playerToCopy.gameActualRole;
        playerCopying.clientPlayerKnowledge[TO] = playerToCopy.gameActualRole;
        playerCopying.gameActualTeam = playerToCopy.gameActualTeam;

        const newRole = PRIVATE.roleList.find(
            (r) => r.name === playerToCopy.gameActualRole,
        );

        newRole.setEventAction(playerCopying);
        playerCopying.eventAction();

        return true;
    };

    PRIVATE.recognizePlayers = function(
        playerRecognizing,
        roleToFind,
        conditionToFind,
    ) {
        'use strict';
        let output;
        const ID = PRIVATE.playerList.findIndex((p) => p === playerRecognizing);
        output = false;

        if (ID === -1) {
            return output;
        }

        const recognitionStart = function(p, i) {
            if (conditionToFind(p)) {
                playerRecognizing.clientPlayerKnowledge[i] = roleToFind;
                output = true;
            }
        };

        PRIVATE.playerList.forEach(recognitionStart);

        return output;
    };

    PRIVATE.peekPlayer = function(playerPeeking, playerToPeek) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p === playerPeeking);
        const TO = PRIVATE.playerList.findIndex((p) => p === playerToPeek);

        if (ID === -1 || TO === -1) {
            return false;
        }

        playerPeeking.clientPlayerKnowledge[TO] = playerToPeek.gameActualRole;

        return true;
    };

    PRIVATE.peekCenter = function(playerPeeking, centerToPeek) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p === playerPeeking);
        const TO = PRIVATE.centerList.findIndex((c) => c === centerToPeek);

        if (ID === -1 || TO === -1) {
            return false;
        }

        playerPeeking.clientCenterKnowledge[TO] = centerToPeek.gameActualRole;

        return true;
    };

    PRIVATE.swapPlayerPlayer = function(
        playerSwapping,
        playerToSwapFrom,
        playerToSwapTo,
    ) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p === playerSwapping);
        const FROM =
            PRIVATE.playerList.findIndex((p) => p === playerToSwapFrom);
        const TO = PRIVATE.playerList.findIndex((p) => p === playerToSwapTo);

        if (ID === -1 || FROM === -1 || TO === -1) {
            return false;
        }

        placeholder = playerSwapping.clientPlayerKnowledge[TO];
        playerSwapping.clientPlayerKnowledge[TO] =
            playerSwapping.clientPlayerKnowledge[FROM];
        playerSwapping.clientPlayerKnowledge[FROM] = placeholder;

        placeholder = playerToSwapTo.gameActualRole;
        playerToSwapTo.gameActualRole = playerToSwapFrom.gameActualRole;
        playerToSwapFrom.actual_role = placeholder;

        placeholder = playerToSwapTo.gameActualTeam;
        playerToSwapTo.gameActualTeam = playerToSwapFrom.gameActualTeam;
        playerToSwapFrom.gameActualTeam = placeholder;

        return true;
    };

    PRIVATE.swapPlayerCenter = function(
        playerSwapping,
        playerToSwapFrom,
        centerToSwapTo,
    ) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p === playerSwapping);
        const FROM =
            PRIVATE.playerList.findIndex((p) => p === playerToSwapFrom);
        const TO = PRIVATE.centerList.findIndex((c) => c === centerToSwapTo);

        if (ID === -1 || FROM === -1 || TO === -1) {
            return false;
        }

        placeholder = playerSwapping.clientCenterKnowledge[TO];
        playerSwapping.clientCenterKnowledge[TO] =
            playerSwapping.clientPlayerKnowledge[FROM];
        playerSwapping.clientPlayerKnowledge[FROM] = placeholder;

        placeholder = centerToSwapTo.gameActualRole;
        centerToSwapTo.gameActualRole = playerToSwapFrom.gameActualRole;
        playerToSwapFrom.actual_role = placeholder;

        placeholder = centerToSwapTo.gameActualTeam;
        centerToSwapTo.gameActualTeam = playerToSwapFrom.gameActualTeam;
        playerToSwapFrom.gameActualTeam = placeholder;

        return true;
    };

    PRIVATE.votePlayer = function(playerToVote) {
        'use strict';
        const TO = PRIVATE.playerList.findIndex((p) => p === playerToVote);

        if (TO === -1) {
            return false;
        }

        playerVoted.statusVoteCount += 1;

        return true;
    };

    PRIVATE.killPlayer = function(playerToKill) {
        'use strict';
        const TO = PRIVATE.playerList.findIndex((p) => p === playerToKill);

        if (TO === -1) {
            return false;
        }

        playerToKill.statusAlive = false;
        playerToKill.eventEnd();

        return true;
    };

    PUBLIC.getPlayerInteraction = PRIVATE.getPlayerInteraction;
};

module.exports.interactions = Interactions;
