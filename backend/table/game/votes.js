const defaultVote = function(inputPlayer, PRIVATE) {
    'use strict';

    const voteEnd = function() {
        console.log('No more votes');
    };

    const voteStart = function(outputTarget) {
        if (outputTarget === inputPlayer) {
            return;
        }

        if (outputTarget === undefined) {
            do {
                outputTarget = PRIVATE.randomPlayer();
            } while (outputTarget === inputPlayer);
        }

        if (game.voteFor(outputTarget)) {
            player.eventVote = voteEnd;
        }
    };

    return voteStart;
};

const hunterVote = function(inputPlayer, PRIVATE) {
    'use strict';

    const voteEnd = function() {
        console.log('No more votes');
    };

    const killEnd = function() {
        console.log('No more kills');
    };

    const voteStart = function(outputTarget) {
        if (outputTarget === inputPlayer) {
            return;
        }

        if (outputTarget === undefined) {
            do {
                outputTarget = PRIVATE.randomPlayer();
            } while (outputTarget === inputPlayer);
        }

        const killStart = function() {
            player.eventEnd = killEnd;
            game.killPlayer(outputTarget);
        };

        if (game.voteFor(outputTarget)) {
            player.eventVote = voteEnd;
            player.eventEnd = killStart;
        }
    };

    return voteStart;
};

module.exports.defaultVote = defaultVote;
module.exports.hunterVote = hunterVote;
