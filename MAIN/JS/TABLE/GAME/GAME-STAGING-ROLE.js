const { ROLE } = require("./GAME-ENGINE-FACTORY.js");
const VOTE = require("./GAME-STAGING-VOTE.js");

const moduleRoles = function(game, accessor) {
    "use strict";

    game.roleTrack = function() {
        "use strict";
        game.trackers = {
            wolf_in_play: false,
            tanner_in_play: false
        };

        game.options.lone_wolf = false;
    };



    game.roleStage = function() {
        "use strict";
        const DOPPELGANGER = new ROLE(
            "DOPPELGANGER",
            1,
            "Undefined",
            "Doppelganger must look at another player's card and copy its role. " +
            "Doppelganger then performs the action of said role. " +
            "Doppelganger is now that role's team and must complete their goal.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    player.action = function(target) {
                        if (target === player) {
                            return;
                        }

                        if (target === undefined) {
                            do {
                                target = game.randomPlayer();
                            } while (target === player);
                        }

                        game.copyPlayer(player, target);
                    };
                };
            },
            false,
            30
        );

        const WEREWOLF = new ROLE(
            "WEREWOLF",
            2,
            "Werewolf",
            "Werewolves recognize each other. " +
            "If active, a Lone Wolf can look at a center card. " +
            "The Werewolves' goal is to survive and not be lynched.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    game.trackers.wolf_in_play = true;

                    player.action_state = 1;

                    if (game.options.lone_wolf) {
                        WEREWOLF.time = 20;
                    }

                    let no_more_actions = function() {
                        console.log("No more actions for WEREWOLF");
                    };

                    let lone_wolf_action = function(target) {
                        if (target === undefined || target === player) {
                            return;
                        }

                        if (game.peekCenter(player, target)) {
                            player.action = no_more_actions;
                        }
                    };

                    let not_alone = game.recognizePlayers(
                        player,
                        "WEREWOLF",
                        p =>
                        p.original_role !== "MINION" &&
                        p.actual_team === "Werewolf" &&
                        p !== player
                    );

                    if (not_alone || !game.options.lone_wolf) {
                        player.action = no_more_actions;
                    } else {
                        player.action = lone_wolf_action;
                    }
                };
            },
            true,
            5
        );

        const MINION = new ROLE(
            "MINION",
            1,
            "Werewolf",
            "Minion knows which players are Werewolves. " +
            "The Werewolves dont know who the Minion is. " +
            "The Minion's goal is to protect Werewolves from accussations.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    game.recognizePlayers(
                        player,
                        "WEREWOLF",
                        p =>
                        p.original_role !== "MINION" &&
                        p.actual_team === "Werewolf" &&
                        p !== player
                    );

                    player.action = function() {
                        console.log("No more actions for MINION");
                    };
                };
            },
            false,
            5
        );

        const MASON = new ROLE(
            "MASON",
            2,
            "Villager",
            "Masons recognize each other. " +
            "Masons are part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    game.recognizePlayers(
                        player,
                        "MASON",
                        p => p.original_role === "MASON" && p !== player
                    );

                    player.action = function() {
                        console.log("No more actions for MASON");
                    };
                };
            },
            false,
            5
        );

        const SEER = new ROLE(
            "SEER",
            1,
            "Villager",
            "Seer can view another player's card, or two of the center cards. " +
            "Seer is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    let last_target = undefined;

                    let no_more_actions = function() {
                        console.log("No more actions for SEER");
                    };

                    let repeat_center_peek = function(target) {
                        if (target === undefined || last_target === target) {
                            return;
                        }

                        if (game.peekCenter(player, target)) {
                            player.action = no_more_actions;
                        }
                    };

                    player.action = function(target) {
                        if (target === undefined || target === player) {
                            return;
                        }

                        if (game.peekOnPlayer(player, target)) {
                            player.action = no_more_actions;
                        }

                        if (game.peekCenter(player, target)) {
                            last_target = target;
                            player.action = repeat_center_peek;
                        }
                    };
                };
            },
            false,
            20
        );

        const ROBBER = new ROLE(
            "ROBBER",
            1,
            "Villager",
            "Robber swaps cards with one player. " +
            "Robber is now that role. Robber has now the goal of the stolen card. " +
            "Robber is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    let no_more_actions = function() {
                        console.log("No more actions for ROBBER");
                    };

                    player.action = function(target) {
                        if (target === undefined || target === player) {
                            return;
                        }

                        if (game.peekOnPlayer(player, target)) {
                            game.swapTwoPlayers(player, player, target);
                            player.action = no_more_actions;
                        }
                    };
                };
            },
            false,
            20
        );

        const TROUBLEMAKER = new ROLE(
            "TROUBLEMAKER",
            1,
            "Villager",
            "Troublemaker swaps two other players' cards. " +
            "Troublemaker does not know the cards that she is swapping. " +
            "Troublemaker is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    let no_more_actions = function() {
                        console.log("No more actions for TROUBLEMAKER");
                    };

                    let last_target = undefined;

                    player.action = function(target) {
                        if (
                            target === last_target ||
                            target === undefined ||
                            target === player
                        ) {
                            return;
                        }

                        if (last_target === undefined) {
                            last_target = target;
                            return;
                        }

                        if (game.swapTwoPlayers(player, last_target, target)) {
                            player.action = no_more_actions;
                        }
                    };
                };
            },
            false,
            20
        );

        const DRUNK = new ROLE(
            "DRUNK",
            1,
            "Villager",
            "Drunk swaps cards with one card of the center. " +
            "Drunk does not know the role of the card swapped. " +
            "Drunk is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;

                    let no_more_actions = function() {
                        console.log("No more actions for DRUNK");
                    };

                    player.action = function(target) {
                        if (target === undefined || target === player) {
                            return;
                        }

                        if (game.swapPlayerCenter(player, player, target)) {
                            player.action = no_more_actions;
                        }
                    };
                };
            },
            false,
            20
        );

        const INSOMNIAC = new ROLE(
            "INSOMNIAC",
            1,
            "Villager",
            "Insomniac cant sleep at night. " +
            "Insomniac looks at her card, to see if it has been swapped. " +
            "Insomniac is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    player.action_state = 1;
                    player.original_role = "INSOMNIAC";

                    let no_more_actions = function() {
                        console.log("No more actions for INSOMNIAC");
                    };

                    if (game.rolePlayingIs("INSOMNIAC")) {
                        game.peekOnPlayer(player, player);
                        player.action = no_more_actions;
                    }
                };
            },
            false,
            5
        );

        const VILLAGER = new ROLE(
            "VILLAGER",
            3,
            "Villager",
            "Villager doesn't wake up at night. " +
            "Villager is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    console.log("VILLAGER doesn't have a night action");
                };
            },
            false,
            0
        );

        const HUNTER = new ROLE(
            "HUNTER",
            1,
            "Villager",
            "Hunter doesn't wake up at night. " +
            "If the Hunter dies, the person that got voted by the Hunter also dies. " +
            "Hunter is part of the Villager team, and must find the Werewolves to win.",
            function(player) {
                player.vote = VOTE.Hunter(player, game);

                player.action = function() {
                    console.log("HUNTER doesn't have a night action");
                };
            },
            false,
            0
        );

        const TANNER = new ROLE(
            "TANNER",
            1,
            "Tanner",
            "Tanner doesn't wake up at night. " +
            "If Tanner gets lynched, he wins.",
            function(player) {
                player.vote = VOTE.Default(player, game);

                player.action = function() {
                    console.log("TANNER doesn't have a night action");
                };
            },
            false,
            0
        );

        game.roles = [
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
            TANNER
        ];
    };



    game.roleWin = function(player) {
        "use strict";
        let won;

        switch (player.actual_team) {
            case "Villager":
                {
                    let villager_win_condition = function(dead) {
                        let dead_wolf = false;
                        let dead_villager = false;
                        won = true;

                        let check_condition = function(target) {
                            if (target.actual_team === "Werewolf" && target.actual_role !== "MINION") {
                                dead_wolf = true;
                            }
                            if (target.actual_team === "Villager") {
                                dead_villager = true;
                            }
                            if (target.actual_team === "Tanner") {
                                won = false;
                            }
                        };

                        dead.forEach(check_condition);

                        if (game.trackers.wolf_in_play && !dead_wolf) {
                            won = false;
                        }

                        if (!game.trackers.wolf_in_play && dead_villager) {
                            won = false;
                        }

                        player.won = won;
                        return won;
                    };

                    player.evaluate = villager_win_condition;

                    break;
                }

            case "Werewolf":
                {
                    let werewolf_win_condition = function(dead) {
                        let dead_wolf = false;
                        let dead_villager = false;
                        let dead_tanner = false;
                        won = false;

                        let check_condition = function(target) {
                            if (target.actual_team === "Werewolf" && target.actual_role !== "MINION") {
                                dead_wolf = true;
                            }
                            if (target.actual_team === "Villager") {
                                dead_villager = true;
                            }
                            if (target.actual_team === "Tanner") {
                                dead_tanner = false;
                            }
                        };

                        dead.forEach(check_condition);

                        if (game.trackers.wolf_in_play && !dead_wolf) {
                            won = true;
                        }

                        if (!game.trackers.wolf_in_play && dead_villager) {
                            won = true;
                        }

                        if (dead_tanner) {
                            won = false;
                        }

                        player.won = won;
                        return won;
                    };

                    player.evaluate = werewolf_win_condition;

                    break;
                }

            case "Tanner":
                {
                    let tanner_win_condition = function(dead) {
                        won = false;

                        let check_condition = function(target) {
                            if (target.actual_team === "Tanner") {
                                won = true;
                            }
                        };

                        dead.forEach(check_condition);

                        player.won = won;
                        return won;
                    };

                    player.evaluate = tanner_win_condition;

                    break;
                }
        }
    };
};

module.exports.moduleRoles = moduleRoles;