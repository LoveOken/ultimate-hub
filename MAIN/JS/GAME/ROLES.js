function ROLE(name, quantity, team, description, action, necessary) {
    this.name = name;

    this.quantity = quantity;
    this.team = team;

    this.description = description;

    this.action = action;

    this.active = new Array;
    for (let i =  0; quantity > i; i++) {
    	this.active.push(false);
    }

    this.necessary = necessary;
}

const CREATE_ROLE_LIST = () => {
	let output = new Array;
    output.push(
        new ROLE(
            "DOPPELGANGER",
            1,
            "Undefined",
            "Doppelganger looks at another player's card and copies its role. " +
            "Doppelganger then performs the action of said role. " +
            "Doppelganger is now that role's team and must complete their goal.",
            0,
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
            0,
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
            0,
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
            0,
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
            0,
            false
        )
    );
    output.push(
        new ROLE(
            "ROBBER",
            1,
            "Villager",
            "Robber switches cards with one player. " +
            "Robber is now that role. Robber has now the goal of the stolen card. " +
            "Robber is part of the Villager team, and must find the Werewolves to win.",
            0,
            false
        )
    );
    output.push(
    	new ROLE(
            "TROUBLEMAKER",
            1,
            "Villager",
            "Troublemaker switches two other players' cards. " +
            "Troublemaker does not know the cards that she is switching. " +
            "Troublemaker is part of the Villager team, and must find the Werewolves to win.",
            0,
            false
        )
    )
    return output;
}


module.exports.CREATE_ROLE_LIST = CREATE_ROLE_LIST;
