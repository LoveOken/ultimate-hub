const {Role} = require('./constructors.js');
const Vote = require('./votes.js');

const Roles = function(PRIVATE, PUBLIC) {
    'use strict';

    PRIVATE.roleTrackers = {
        werewolfInPlay: false,
        tannerInPlay: false,
    };

    PRIVATE.eventOptions.eventLoneWolf = false;

    const DOPPELGANGER = new Role(
        'DOPPELGANGER',
        1,
        'Undefined',
        'Doppelganger must look at another player\'s card and copy its role. ' +
    'Doppelganger then performs the action of said role. ' +
    'Doppelganger is now that role\'s team and must complete their goal.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                inputPlayer.eventAction = function(outputTarget) {
                    if (outputTarget === inputPlayer) {
                        return;
                    }

                    if (outputTarget === undefined) {
                        do {
                            outputTarget = PRIVATE.randomPlayer();
                        } while (outputTarget === inputPlayer);
                    }

                    PRIVATE.copyPlayer(inputPlayer, outputTarget);
                };
            };
        },
        false,
        30,
    );

    const WEREWOLF = new Role(
        'WEREWOLF',
        2,
        'Werewolf',
        'Werewolves recognize each other. ' +
    'If active, a Lone Wolf can look at a center card. ' +
    'The Werewolves\' goal is to survive and not be lynched.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                PRIVATE.roleTrackers.werewolfInPlay = true;

                inputPlayer.eventActionState = 1;

                if (PRIVATE.eventOptions.eventLoneWolf) {
                    WEREWOLF.eventTime = 20;
                }

                const eventVoid = function() {
                    console.log('No more actions for WEREWOLF');
                };

                const eventLoneWolf = function(outputTarget) {
                    if (
                        outputTarget === undefined ||
                        outputTarget === inputPlayer
                    ) {
                        return;
                    }

                    if (PRIVATE.peekCenter(inputPlayer, outputTarget)) {
                        inputPlayer.eventAction = eventVoid;
                    }
                };

                const werewolfHasFriends = PRIVATE.recognizePlayers(
                    inputPlayer,
                    'WEREWOLF',
                    (p) =>
                        p.gameOriginalRole !== 'MINION' &&
                        p.gameActualTeam === 'Werewolf' &&
                        p !== inputPlayer,
                );

                if (werewolfHasFriends || !PRIVATE.eventOptions.eventLoneWolf) {
                    inputPlayer.eventAction = eventVoid;
                } else {
                    inputPlayer.eventAction = eventLoneWolf;
                }
            };
        },
        true,
        5,
    );

    const MINION = new Role(
        'MINION',
        1,
        'Werewolf',
        'Minion knows which players are Werewolves. ' +
            'The Werewolves dont know who the Minion is. ' +
            'The Minion\'s goal is to protect Werewolves from accussations.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                PRIVATE.recognizePlayers(
                    inputPlayer,
                    'WEREWOLF',
                    (p) =>
                        p.gameOriginalRole !== 'MINION' &&
                        p.gameActualTeam === 'Werewolf' &&
                        p !== inputPlayer,
                );

                inputPlayer.eventAction = function() {
                    console.log('No more actions for MINION');
                };
            };
        },
        false,
        5,
    );

    const MASON = new Role(
        'MASON',
        2,
        'Villager',
        'Masons recognize each other. ' +
    'Masons are part of the Villager team, ' +
    'and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                PRIVATE.recognizePlayers(
                    inputPlayer,
                    'MASON',
                    (p) => p.gameOriginalRole === 'MASON' && p !== inputPlayer,
                );

                inputPlayer.eventAction = function() {
                    console.log('No more actions for MASON');
                };
            };
        },
        false,
        5,
    );

    const SEER = new Role(
        'SEER',
        1,
        'Villager',
        'Seer can view another player\'s card, or two of the center cards. ' +
    'Seer is part of the Villager team, and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                let lastTarget = undefined;

                const eventVoid = function() {
                    console.log('No more actions for SEER');
                };

                const eventPeek = function(outputTarget) {
                    if (
                        outputTarget === undefined ||
                        lastTarget === outputTarget
                    ) {
                        return;
                    }

                    if (PRIVATE.peekCenter(inputPlayer, outputTarget)) {
                        inputPlayer.eventAction = eventVoid;
                    }
                };

                inputPlayer.eventAction = function(outputTarget) {
                    if (
                        outputTarget === undefined ||
                        outputTarget === inputPlayer
                    ) {
                        return;
                    }

                    if (PRIVATE.peekOnPlayer(inputPlayer, outputTarget)) {
                        inputPlayer.eventAction = eventVoid;
                    }

                    if (PRIVATE.peekCenter(inputPlayer, outputTarget)) {
                        lastTarget = outputTarget;
                        inputPlayer.eventAction = eventPeek;
                    }
                };
            };
        },
        false,
        20,
    );

    const ROBBER = new Role(
        'ROBBER',
        1,
        'Villager',
        'Robber swaps cards with one player. ' +
    'Robber is now that role. Robber has now the goal of the stolen card. ' +
    'Robber is part of the Villager team, and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                const eventVoid = function() {
                    console.log('No more actions for ROBBER');
                };

                inputPlayer.eventAction = function(outputTarget) {
                    if (
                        outputTarget === undefined ||
                        outputTarget === inputPlayer
                    ) {
                        return;
                    }

                    if (PRIVATE.peekOnPlayer(inputPlayer, outputTarget)) {
                        PRIVATE.swapTwoPlayers(
                            inputPlayer,
                            inputPlayer,
                            outputTarget,
                        );
                        inputPlayer.eventAction = eventVoid;
                    }
                };
            };
        },
        false,
        20,
    );

    const TROUBLEMAKER = new Role(
        'TROUBLEMAKER',
        1,
        'Villager',
        'Troublemaker swaps two other players\' cards. ' +
    'Troublemaker does not know the cards that she is swapping. ' +
    'Troublemaker is part of the Villager team, ' +
    'and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                const eventVoid = function() {
                    console.log('No more actions for TROUBLEMAKER');
                };

                let lastTarget = undefined;

                inputPlayer.eventAction = function(outputTarget) {
                    if (
                        outputTarget === lastTarget ||
                        outputTarget === undefined ||
                        outputTarget === inputPlayer
                    ) {
                        return;
                    }

                    if (lastTarget === undefined) {
                        lastTarget = outputTarget;
                        return;
                    }

                    if (
                        PRIVATE.swapTwoPlayers(
                            inputPlayer,
                            lastTarget,
                            outputTarget,
                        )
                    ) {
                        inputPlayer.eventAction = eventVoid;
                    }
                };
            };
        },
        false,
        20,
    );

    const DRUNK = new Role(
        'DRUNK',
        1,
        'Villager',
        'Drunk swaps cards with one card of the center. ' +
    'Drunk does not know the role of the card swapped. ' +
    'Drunk is part of the Villager team, and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;

                const eventVoid = function() {
                    console.log('No more actions for DRUNK');
                };

                inputPlayer.eventAction = function(outputTarget) {
                    if (
                        outputTarget === undefined ||
                        outputTarget === inputPlayer
                    ) {
                        return;
                    }

                    if (
                        PRIVATE.swapPlayerCenter(
                            inputPlayer,
                            inputPlayer,
                            outputTarget,
                        )
                    ) {
                        inputPlayer.eventAction = eventVoid;
                    }
                };
            };
        },
        false,
        20,
    );

    const INSOMNIAC = new Role(
        'INSOMNIAC',
        1,
        'Villager',
        'Insomniac cant sleep at night. ' +
    'Insomniac looks at her card, to see if it has been swapped. ' +
    'Insomniac is part of the Villager team, ' +
    'and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                inputPlayer.eventActionState = 1;
                inputPlayer.gameOriginalRole = 'INSOMNIAC';

                const eventVoid = function() {
                    console.log('No more actions for INSOMNIAC');
                };

                if (PRIVATE.rolePlayingIs('INSOMNIAC')) {
                    PRIVATE.peekOnPlayer(inputPlayer, inputPlayer);
                    inputPlayer.eventAction = eventVoid;
                }
            };
        },
        false,
        5,
    );

    const VILLAGER = new Role(
        'VILLAGER',
        3,
        'Villager',
        'Villager doesn\'t wake up at night. ' +
    'Villager is part of the Villager team, ' +
    'and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                console.log('VILLAGER doesn\'t have a night action');
            };
        },
        false,
        0,
    );

    const HUNTER = new Role(
        'HUNTER',
        1,
        'Villager',
        'Hunter doesn\'t wake up at night. ' +
    'If the Hunter dies, the person that got voted by the Hunter also dies. ' +
    'Hunter is part of the Villager team, and must find the Werewolves to win.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.hunterVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                console.log('HUNTER doesn\'t have a night action');
            };
        },
        false,
        0,
    );

    const TANNER = new Role(
        'TANNER',
        1,
        'Tanner',
        'Tanner doesn\'t wake up at night. ' +
    'If Tanner gets lynched, he wins.',
        function(inputPlayer) {
            inputPlayer.eventVote = Vote.defaultVote(inputPlayer, PRIVATE);

            inputPlayer.eventAction = function() {
                console.log('TANNER doesn\'t have a night action');
            };
        },
        false,
        0,
    );

    PRIVATE.roleList = [
        DOPPELGANGER,
        WEREWOLF,
        MINION,
        MASON,
        SEER,
        ROBBER,
        TROUBLEMAKER,
        DRUNK,
        INSOMNIAC,
        VILLAGER,
        HUNTER,
        TANNER,
    ];

    PRIVATE.roleWin = function(inputPlayer) {
        'use strict';
        let statusWon;

        let deadWolf = false;
        let deadVillager = false;
        let deadTanner = false;

        const conditionCheck = function(outputTarget) {
            if (
                outputTarget.gameActualTeam === 'Werewolf' &&
                outputTarget.gameActualRole !== 'MINION'
            ) {
                deadWolf = true;
            }
            if (outputTarget.gameActualTeam === 'Villager') {
                deadVillager = true;
            }
            if (outputTarget.gameActualTeam === 'Tanner') {
                deadTanner = true;
            }
        };

        switch (inputPlayer.gameActualTeam) {
        case 'Villager': {
            const conditionDefinition = function(deadPlayers) {
                statusWon = true;

                deadPlayers.forEach(conditionCheck);

                if (PRIVATE.roleTrackers.werewolfInPlay && !deadWolf) {
                    statusWon = false;
                }

                if (!PRIVATE.roleTrackers.werewolfInPlay && deadVillager) {
                    statusWon = false;
                }

                if (deadTanner) {
                    statusWon = false;
                }

                inputPlayer.statusWon = statusWon;
                return statusWon;
            };

            inputPlayer.eventEvaluate = conditionDefinition;

            break;
        }

        case 'Werewolf': {
            const conditionDefinition = function(deadPlayers) {
                statusWon = false;

                deadPlayers.forEach(conditionCheck);

                if (PRIVATE.roleTrackers.werewolfInPlay && !deadWolf) {
                    statusWon = true;
                }

                if (!PRIVATE.roleTrackers.werewolfInPlay && deadVillager) {
                    statusWon = true;
                }

                if (deadTanner) {
                    statusWon = false;
                }

                inputPlayer.statusWon = statusWon;
                return statusWon;
            };

            inputPlayer.eventEvaluate = conditionDefinition;

            break;
        }

        case 'Tanner': {
            const conditionDefinition = function(deadPlayers) {
                statusWon = false;

                deadPlayers.forEach(conditionCheck);

                if (deadTanner) {
                    statusWon = true;
                }

                inputPlayer.statusWon = statusWon;
                return statusWon;
            };

            inputPlayer.eventEvaluate = conditionDefinition;

            break;
        }
        }
    };
};

module.exports.roles = Roles;
