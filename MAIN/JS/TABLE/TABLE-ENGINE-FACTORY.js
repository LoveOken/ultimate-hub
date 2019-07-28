const { GAME } = require("./GAME/GAME-ENGINE-FACTORY.js");
const { CHAT } = require("./CHAT/CHAT-ENGINE-FACTORY.js");

function TABLE(name) {
    "use strict";
    this.id = name;

    this.game = new GAME(name);
    this.chat = new CHAT(name);

    this.chat.newFilter("Spectator", 1);
    this.chat.newFilter("Player", 1);
    this.chat.newFilter("Moderator", 2);
    this.chat.newFilter("System", 3);
};

module.exports.Table = TABLE;