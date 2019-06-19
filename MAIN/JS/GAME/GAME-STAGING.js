function ROLE(name, quantity, team, description, action, necessary, time) {
    this.name = name;
    this.team = team;
    this.description = description;

    this.action = action;

    this.active = Array(quantity).fill(false);

    this.necessary = necessary;

    this.time = time;
}

const CREATE_ROLE_CARDS = (game) => {
    let output = new Array;

    /* Vote Functions */

    let default_vote = (player) => {
        let vote_end = () => {
            console.log("No more votes");
        }

        let vote_function = (target) => {
            if (target == player) return;

            if (target == undefined) {
                do {
                    target = game.randomPlayer();
                } while (target == player);
            }

            if (game.voteFor(target)) {
                player.vote = vote_end;
            }
        };

        return vote_function;
    }

    let hunter_vote = (player) => {
        let kill_end = () => {
            console.log("No more kills");
        }

        let vote_end = () => {
            console.log("No more votes");
        }

        let vote_function = (target) => {
            if (target == player) return;

            if (target == undefined) {
                do {
                    target = game.randomPlayer();
                } while (target == player);
            }

            let kill_voted_player = () => {
                player.end = kill_end;
                game.killPlayer(target);
            }

            if (game.voteFor(target)) {
                player.vote = vote_end;
                player.end = kill_voted_player;
            }
        }

        return vote_function;
    }

    /* Role Definitions */

    const DOPPELGANGER = new ROLE(
        "DOPPELGANGER",
        1,
        "Undefined",
        "Doppelganger looks at another player's card and copies its role. " +
        "Doppelganger then performs the action of said role. " +
        "Doppelganger is now that role's team and must complete their goal.",
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                player.action = (target) => {
                    if (target == player) return;
                    if (target == undefined) {
                        do {
                            target = game.randomPlayer();
                        } while (target == player);
                    };

                    game.copyPlayer(player, target);
                }
            }
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
        "The Werewolves' goal is to survive and not be lynched",
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                if (game.lone_wolf) {
                    WEREWOLF.time = 20;
                }

                let no_more_actions = () => {
                    console.log("No more actions for WEREWOLF");
                }

                let lone_wolf_action = (target) => {
                    if (target == undefined) return;
                    if (target == player) return;

                    if (game.peekCenter(player, target)) {
                        player.action = no_more_actions;
                    };
                }

                let not_alone = game.recognizePlayers(
                    player,
                    "WEREWOLF",
                    p => p.original_role != "MINION" && p.actual_team == "Werewolf" && p != player
                )

                if (not_alone || !game.lone_wolf) {
                    player.action = no_more_actions;
                } else {
                    player.action = lone_wolf_action;
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                game.recognizePlayers(
                    player,
                    "WEREWOLF",
                    p => p.original_role != "MINION" && p.actual_team == "Werewolf" && p != player
                )

                player.action = () => {
                    console.log("No more actions for MINION");
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                game.recognizePlayers(
                    player,
                    "MASON",
                    p => p.original_role == "MASON" && p != player
                )

                player.action = () => {
                    console.log("No more actions for MASON");
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                let last_target = undefined;

                let no_more_actions = () => {
                    console.log("No more actions for SEER");
                }

                let repeat_center_peek = (target) => {
                    if (target == undefined) return;
                    if (last_target == target) return;

                    if (game.peekCenter(player, target)) {
                        player.action = no_more_actions;
                    };
                }

                player.action = (target) => {
                    if (target == undefined) return;
                    if (target == player) return;

                    if (game.peekOnPlayer(player, target)) {
                        player.action = no_more_actions;
                    }

                    if (game.peekCenter(player, target)) {
                        last_target = target;
                        player.action = repeat_center_peek;
                    }
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                let no_more_actions = () => {
                    console.log("No more actions for ROBBER");
                }

                player.action = (target) => {
                    if (target == undefined) return;
                    if (target == player) return;

                    if (game.peekOnPlayer(player, target)) {
                        game.swapTwoPlayers(player, player, target)
                        player.action = no_more_actions;
                    }
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                let no_more_actions = () => {
                    console.log("No more actions for TROUBLEMAKER");
                }

                let last_target = undefined

                player.action = (target) => {
                    if (target == last_target) return;
                    if (target == undefined) return;
                    if (target == player) return;

                    if (last_target == undefined) {
                        last_target = target;
                        return;
                    }

                    if (game.swapTwoPlayers(player, last_target, target)) {
                        player.action = no_more_actions;
                    }
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;

                let no_more_actions = () => {
                    console.log("No more actions for DRUNK");
                }

                player.action = (target) => {
                    if (target == undefined) return;
                    if (target == player) return;

                    if (game.swapPlayerCenter(player, player, target)) {
                        player.action = no_more_actions;
                    }
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                player.action_state = 1;
                player.original_role = "INSOMNIAC";

                let no_more_actions = () => {
                    console.log("No more actions for INSOMNIAC");
                }

                if (game.rolePlayingIs("INSOMNIAC")) {
                    game.peekOnPlayer(player, player);
                    player.action = no_more_actions;
                }
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                console.log("VILLAGER doesn't have a night action");
            }
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
        (player) => {
            player.vote = hunter_vote(player);

            player.action = () => {
                console.log("HUNTER doesn't have a night action");
            }
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
        (player) => {
            player.vote = default_vote(player);

            player.action = () => {
                console.log("TANNER doesn't have a night action");
            }
        },
        false,
        0
    );

    /* Role Loading */

    output.push(
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
    );

    return output;
}

const CREATE_WIN_CONDITIONS = (player) => {
    switch (player.actual_team) {
        case "Villager":
            {
                let villager_win_condition = (dead) => {
                    let tanner_is_dead = false;
                    let won = false;

                    let check_condition = (target) => {
                        if (target.actual_team == "Werewolf" && target.actual_role != "MINION" && !tanner_is_dead) {
                            won = true;
                        }
                        if (target.actual_team == "Tanner") {
                            tanner_is_dead = true;
                            won = false;
                        }
                    }

                    dead.forEach(check_condition);
                    player.won = won;
                }

                player.evaluate = villager_win_condition;

                break;
            }

        case "Werewolf":
            {
                let werewolf_win_condition = (dead) => {
                    let won = true;

                    let check_condition = (target) => {
                        if (target.actual_team == "Werewolf" && target.actual_role != "MINION") {
                            won = false;
                        }
                        if (target.actual_team == "Tanner") {
                            won = false;
                        }
                    }

                    dead.forEach(check_condition);
                    player.won = won;
                }

                player.evaluate = werewolf_win_condition;

                break;
            }

        case "Tanner":
            {
                let tanner_win_condition = (dead) => {
                    let won = false;

                    let check_condition = (target) => {
                        if (target.actual_team == "Tanner") {
                            won = true;
                        }
                    }

                    dead.forEach(check_condition);
                    player.won = won;
                }

                player.evaluate = tanner_win_condition;

                break;
            }
    }
}

module.exports.CREATE_ROLE_CARDS = CREATE_ROLE_CARDS;
module.exports.CREATE_WIN_CONDITIONS = CREATE_WIN_CONDITIONS;