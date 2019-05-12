function ROLE(name, quantity, team, description, action, necessary) {
    this.name = name;
    
    this.team = team;

    this.description = description;

    this.action = action;

    this.active = Array(quantity).fill(false);

    this.necessary = necessary;
}

const CREATE_ROLE_LIST = (game) => {
    let output = new Array;
    output.push(
        new ROLE(
            "DOPPELGANGER",
            1,
            "Undefined",
            "Doppelganger looks at another player's card and copies its role. " +
            "Doppelganger then performs the action of said role. " +
            "Doppelganger is now that role's team and must complete their goal.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "WEREWOLF",
            2,
            "Werewolf",
            "Werewolves recognize each other. " +
            "If active, a Lone Wolf can look at a center card. " +
            "The Werewolves' goal is to survive and not be lynched",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            true
        )
    );
    output.push(
        new ROLE(
            "MINION",
            1,
            "Werewolf",
            "Minion knows which players are Werewolves. " +
            "The Werewolves dont know who the Minion is. " +
            "The Minion's goal is to protect Werewolves from accussations.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "MASON",
            2,
            "Villager",
            "Masons recognize each other. " +
            "Masons are part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "SEER",
            1,
            "Villager",
            "Seer can view another player's card, or two of the center cards. " +
            "Seer is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "ROBBER",
            1,
            "Villager",
            "Robber swaps cards with one player. " +
            "Robber is now that role. Robber has now the goal of the stolen card. " +
            "Robber is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "TROUBLEMAKER",
            1,
            "Villager",
            "Troublemaker swaps two other players' cards. " +
            "Troublemaker does not know the cards that she is swapping. " +
            "Troublemaker is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "DRUNK",
            1,
            "Villager",
            "Drunk swaps cards with one card of the center. " +
            "Drunk does not know the role of the card swapped. " +
            "Drunk is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "INSOMNIAC",
            1,
            "Villager",
            "Insomniac cant sleep at night. " +
            "Insomniac looks at her card, to see if it has been swapped. " +
            "Insomniac is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "HUNTER",
            1,
            "Villager",
            "Hunter doesn't wake up at night. " +
            "If the Hunter dies, the person that got voted by the Hunter also dies. " +
            "Hunter is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "VILLAGER",
            3,
            "Villager",
            "Villager doesn't wake up at night. " +
            "Villager is part of the Villager team, and must find the Werewolves to win.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );
    output.push(
        new ROLE(
            "TANNER",
            1,
            "Tanner",
            "Tanner doesn't wake up at night. " +
            "If Tanner gets lynched, he wins.",
            (player) => {
                player.action = () => {
                    console.log("Once");

                    player.action = () => {
                        console.log("Twice");
                    }
                }
            },
            false
        )
    );

    return output;
}


module.exports.CREATE_ROLE_LIST = CREATE_ROLE_LIST;