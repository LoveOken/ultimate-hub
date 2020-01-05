const {Center} = require('./constructors.js');

const Stages = function(PRIVATE, PUBLIC) {
    'use strict';
    PRIVATE.runClock = function(onUpdate, onEnd) {
        'use strict';

        onUpdate();

        if (PRIVATE.stageClock > 0) {
            setTimeout(function() {
                PRIVATE.stageClock -= 1;
                PRIVATE.clockRun(onUpdate, onEnd);
            }, 1000);
        } else {
            onEnd();
        }
    };

    PRIVATE.prepareRoles = function() {
        'use strict';
        let rolePool;
        const roleList = PRIVATE.roleList;

        rolePool = '';

        const getRandomRole = function() {
            const randomFactor = Math.floor(
                (Math.random() * rolePool.length) / 2,
            );

            return rolePool.slice(2 * randomFactor, 2 * randomFactor + 2);
        };

        roleList.forEach(function(r, i) {
            const stringIndex = Math.floor(i / 10).toString() + (i % 10);

            const addRoleToPool = function(a) {
                if (a === true) {
                    rolePool += stringIndex;
                }
            };

            r.gameActive.forEach(addRoleToPool);
        });

        PRIVATE.playerList.forEach(function(p) {
            const role = getRandomRole();
            const roleIndex = parseInt(role, 10);

            rolePool = rolePool.replace(role, '');

            p.setRoleAs(roleList[roleIndex], true, true);
        });

        let i;
        for (i = 0; i < 3; i += 1) {
            const role = getRandomRole();
            const roleIndex = parseInt(role, 10);
            const cName = 'Center ' + (i + 1);

            rolePool = rolePool.replace(role, '');

            PRIVATE.centerList.push(new Center(cName, roleList[roleIndex]));
        }

        PRIVATE.debugPlayerList();
    };

    PRIVATE.prepareKnowledge = function() {
        'use strict';
        const initialPlayerKnowledge = [];
        const initialCenterKnowledge = [];

        PRIVATE.playerList.forEach(function() {
            initialPlayerKnowledge.push('UNKNOWN');
        });

        PRIVATE.centerList.forEach(function() {
            initialCenterKnowledge.push('UNKNOWN');
        });

        PRIVATE.playerList.forEach(function(p, i) {
            p.clientPlayerKnowledge = initialPlayerKnowledge.slice();
            p.centerPlayerKnowledge = initialCenterKnowledge.slice();

            p.clientPlayerKnowledge[i] = p.gameOriginalRole;
        });
    };

    PRIVATE.startGame = function(pTag, onUpdate) {
        'use strict';
        const ID = PRIVATE.playerList.findIndex((p) => p.idTag === pTag);

        try {
            if (ID !== 0) {
                throw new Error(
                    'The player who confirmed ' +
                    'game settings is not table leader. ' +
                    '(Modified Client)',
                );
            }
            if (!PRIVATE.setupReady) {
                throw new Error(
                    'The game is not ready to start, yet, ' +
                    'the button to start is unlocked. ' +
                    '(Modified Client)',
                );
            }
        } catch (e) {
            console.log(e);
            return;
        }

        PRIVATE.stageId = 1;
        PRIVATE.stageClock = 5;

        const onEnd = function() {
            PRIVATE.stageId = 2;
            PRIVATE.nightPhase(onUpdate, 0);
        };

        PRIVATE.prepareRoles();
        PRIVATE.prepareKnowledge();

        PRIVATE.runClock(onUpdate, onEnd);
    };

    PRIVATE.nightPhase = function(onUpdate, i) {
        'use strict';
        let playerList;
        const roleList =
      PRIVATE.roleList.filter((r) => r.gameActive.includes(true));

        if (roleList[i] !== undefined) {
            playerList = PRIVATE.playerList.filter(
                (p) => p.gameOriginalRole === roleList[i].idName,
            );
        } else {
            PRIVATE.discussionPhase(onUpdate);
            return;
        }

        PRIVATE.gameRoleOnPlay = PRIVATE.roleList.findIndex(
            (r) => r.idName === roleList[i].idName,
        );

        const currentAction = function() {
            playerList.forEach(function(p) {
                p.eventAction();
            });
        };

        const onEnd = function() {
            currentAction();
            PRIVATE.nightPhase(onUpdate, i + 1);
        };

        currentAction();

        const t =
            roleList[i].eventTime *
            PRIVATE.eventOptions.eventNightTimeMultiplier;

        if (t === 0) {
            PRIVATE.dayPhase(onUpdate);
            return;
        }

        PRIVATE.stageClock = t;

        PRIVATE.runClock(onUpdate, onEnd);
    };

    PRIVATE.dayPhase = function(onUpdate) {
        'use strict';

        const getGameResult = function() {
            PRIVATE.stageId = 5;

            let mostVotes = 0;

            const performVote = function(p) {
                p.eventVote();
            };

            const findMostVoted = function(p) {
                if (p.statusVoteCount > mostVotes) {
                    mostVotes = p.voteCount;
                }
            };

            PRIVATE.playerList.forEach(performVote);
            PRIVATE.playeList.forEach(findMostVoted);

            if (mostVotes !== 1) {
                PRIVATE.playerList
                    .filter((p) => p.statusVoteCount === mostVotes)
                    .forEach((p) => PRIVATE.killPlayer(p));
            }

            const deadPlayerList = PRIVATE.player_list.filter(
                (p) => p.statusAlive === false,
            );

            const winningConditionEvaluation = function(p) {
                if (
                    p.evaluate(deadPlayerList) &&
                    !PRIVATE.statusWinners.includes(p.actual_team)
                ) {
                    PRIVATE.statusWinners.push(p.gameActualTeam);
                }
            };

            const revealAll = function() {
                PRIVATE.playerList.forEach(function(t) {
                    PRIVATE.publicPlayerKnowledge.push(t.gameActualRole);
                });

                PRIVATE.centerList.forEach(function(t) {
                    PRIVATE.publicCenterKnowledge.push(t.gameActualRole);
                });
            };

            PRIVATE.playerList.forEach(winningConditionEvaluation);
            revealAll();

            PRIVATE.debugPlayerList();

            onUpdate();
        };

        const votingPhase = function() {
            PRIVATE.stageId = 4;
            PRIVATE.stageClock = PRIVATE.eventOptions.eventVotingTimeInSeconds;

            PRIVATE.runClock(onUpdate, getGameResult);
        };

        PRIVATE.stageId = 3;
        PRIVATE.stageClock = PRIVATE.options.eventDayTimeInMinutes * 60;

        PRIVATE.playerList.forEach((player) => PRIVATE.roleWin(player));

        PRIVATE.runClock(onUpdate, votingPhase);
    };

    PUBLIC.startGame = PRIVATE.startGame;
};

module.exports.stages = Stages;
