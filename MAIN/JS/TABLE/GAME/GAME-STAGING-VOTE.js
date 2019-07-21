const Default = function(player, game) {
    "use strict";

    let vote_end = function() {
        console.log("No more votes");
    };

    let vote_function = function(target) {
        if (target === player) {
            return;
        }

        if (target === undefined) {
            do {
                target = game.randomPlayer();
            } while (target === player);
        }

        if (game.voteFor(target)) {
            player.vote = vote_end;
        }
    };

    return vote_function;
};

const Hunter = function(player, game) {
    "use strict";

    let kill_end = function() {
        console.log("No more kills");
    };

    let vote_end = function() {
        console.log("No more votes");
    };

    let vote_function = function(target) {
        if (target === player) {
            return;
        }

        if (target === undefined) {
            do {
                target = game.randomPlayer();
            } while (target === player);
        }

        let kill_voted_player = function() {
            player.end = kill_end;
            game.killPlayer(target);
        };

        if (game.voteFor(target)) {
            player.vote = vote_end;
            player.end = kill_voted_player;
        }
    };

    return vote_function;
};

module.exports.Default = Default;
module.exports.Hunter = Hunter;