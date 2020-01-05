function Author(pName, pTag) {
    'use strict';
    this.idName = pName;
    this.idTag = pTag;

    this.badgeList = [];   
};

function Badges(pName, pPriority) {
    'use strict';
    this.idName = pName;

    this.chatPriority = pPriority;
};

function Message(pContent, pAuthor, pTime) {
    'use strict';
    this.idName = pAuthor.name;
    
    this.chatBadges = pAuthor.filters;
    this.chatContent = pContent;

    this.postTime = pTime;
};

module.exports.Author = Author;
module.exports.Badges = Badges;
module.exports.Message = Message;


function Chat(pName) {
    'use strict';

    const MODULES = {
        methods: require('./methods.js').methods,
    }

    const PRIVATE = {
        idName: pName,

        authorList: [],
        badgeList: [],

        chatMessages: [],
    };

    for (const moduleFunction in MODULES) {
        if ({}.hasOwnProperty.call(MODULES, moduleFunction)) {
            moduleFunction(PRIVATE, this);
        }
    }

    Object.freeze(this);
};

module.exports.Chat = Chat;
