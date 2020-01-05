const Client = function(PRIVATE, PUBLIC) {
    'use strict';

    PRIVATE.getClientExport = function(pTag) {
        'use strict';
        const clone = JSON.parse(JSON.stringify(PRIVATE));
        const ID = clone.playerList.findIndex((p) => p.idTag === pTag);

        if (ID !== -1) {
            delete clone.playerList[ID].gameActualRole;
            delete clone.playerList[ID].gameActualTeam;
        }

        const otherPlayers = clone.playerList.filter((p) => p.idTag !== pTag);
        otherPlayers.forEach(function(p) {
            p.visible = false;

            delete p.clientPlayerKnowledge;
            delete p.clientCenterKnowledge;

            delete p.gameActualRole;
            delete p.gameOriginalRole;

            delete p.gameActualTeam;
            delete p.gameOriginalTeam;

            delete p.eventActionState;
            delete p.eventAction;
            delete p.eventVote;
            delete p.eventEvaluate;
            delete p.eventEnd;
        });

        clone.centerList.forEach(function(c) {
            delete c.gameActualRole;

            delete c.gameActualTeam;
        });

        clone.roleList.forEach(function(r) {
            delete r.idTeam;
            delete r.setEventAction;
        });

        return clone;
    };


    PRIVATE.getIfPlayerExists = function(pTag) {
        return (PRIVATE.playerList.findIndex((p) => p.idTag === pTag) >= 0);
    };

    PUBLIC.getClientExport = PRIVATE.getClientExport;
    PUBLIC.getIfPlayerExists = PRIVATE.getIfPlayerExists;
};

module.exports.client = Client;
