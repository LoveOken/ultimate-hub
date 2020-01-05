const {Game} = require('./game/constructors.js');
const {Chat} = require('./chat/constructors.js');

/**
 * Creates a Table object.
 * @param {string} pName The displayed table's name.
 * @param {number} pUrl A unique URL used to locate the table.
 * @return {void}
 */
function Table(pName, pUrl) {
    'use strict';
    const ID = pName;

    const game = new Game(pName, pUrl);
    const chat = new Chat(pName);

    chat.newFilter('Spectator', 1);
    chat.newFilter('Player', 1);
    chat.newFilter('Moderator', 2);
    chat.newFilter('System', 3);

    this.getID = () => ID;
    this.getGame = () => game;
    this.getChat = () => chat;

    Object.freeze(this);
};

module.exports.Table = Table;
