const { GAME } = require("./GAME/GAME-ENGINE-FACTORY.js");
const { CHAT } = require("./CHAT/CHAT-ENGINE-FACTORY.js");

function TABLE(name) {
    "use strict";
    let id = name;

    let game = new GAME(name);
    let chat = new CHAT(name);

    chat.newFilter("Spectator", 1);
    chat.newFilter("Player", 1);
    chat.newFilter("Moderator", 2);
    chat.newFilter("System", 3);

    this.getID = () => id;
    this.getGame = () => game;
    this.getChat = () => chat;

    Object.freeze(this);
};

module.exports.Table = TABLE;