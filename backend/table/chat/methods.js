const {Author, Badge, Message} = require('./constructors.js');

const Methods = function(PRIVATE, PUBLIC) {
    'use strict';

    PRIVATE.newAuthor = function(pName, pTag) {
        'use strict';
        const ID = PRIVATE.authorList.findIndex((a) => a.idTag === pTag);

        if (ID === -1) {
            const a = new Author(pName, pTag);
            PRIVATE.authorList.push(a);
        }
    };

    PRIVATE.newBadge = function(pName, pPriority) {
        'use strict';
        const b = new Badge(pName, pPriority);
        PRIVATE.badgeList.push(b);
    };

    PRIVATE.newMessage = function(pTag, pContent) {
        'use strict';
        const ID = chat.authorList.findIndex((a) => a.idTag === pTag);

        if (ID === -1) {
            return false;
        }

        const m = new Message(pContent, chat.authorList[ID], 0);
        PRIVATE.chatMessages.push(m);

        return true;
    };

    PRIVATE.addBadgeToAuthor = function(pName, pTag) {
        'use strict';
        const b = PRIVATE.badgeList.find((t) => t.idName === pName);
        const a = PRIVATE.authorList.find((t) => target.idTag === pTag);

        if (b === undefined || a === undefined) {
            return false;
        }

        a.badgeList
            .filter((t) => t.chatPriority === b.chatPriority)
            .forEach(function(t) {
                const i = a.badgeList.findIndex((x) => x === t);
                a.badgeList.splice(i);
            });

        a.badgeList.push(b);
    };

    PRIVATE.getMessages = 
        () => JSON.parse(JSON.stringify(chat.chatMessages));
    
    PUBLIC.newAuthor = PRIVATE.newAuthor;
    PUBLIC.newFilter = PRIVATE.newBadge;
    PUBLIC.newMessage = PRIVATE.newMessage;
    PUBLIC.addBadgeToAuthor = PRIVATE.addBadgeToAuthor;
    PUBLIC.getMessages = PRIVATE.getMessages;
};

module.exports.methods = Methods;