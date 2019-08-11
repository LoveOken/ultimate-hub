function CHAT(name) {
    "use strict";
    this.id = name;

    let itself = {
        authors: [],
        filters: [],
        messages: []
    };

    let methods = new METHODS(itself);

    this.getMessages = () => JSON.parse(JSON.stringify(itself.messages));

    this.newAuthor = methods.newAuthor;
    this.newFilter = methods.newFilter;
    this.newMessage = methods.newMessage;

    this.addFilterToAuthor = methods.addFilterToAuthor;

    Object.freeze(this);
};

function AUTHOR(name, tag) {
    "use strict";
    this.name = name;
    this.filters = [];

    this.tag = tag;
};

function FILTER(name, priority) {
    "use strict";
    this.name = name;
    this.priority = priority;
};

function MESSAGE(content, author, time) {
    "use strict";
    this.content = content;

    this.name = author.name;
    this.filters = author.filters;

    this.time = time;
};

function METHODS(chat) {
    "use strict";

    this.newAuthor = function(name, tag) {
        "use strict";
        let from = chat.authors.findIndex(author => author.tag === tag);

        if (from === -1) {
            let author = new AUTHOR(name, tag);
            chat.authors.push(author);
        }
    };

    this.newFilter = function(name, priority) {
        "use strict";
        let filter = new FILTER(name, priority);
        chat.filters.push(filter);
    };

    this.newMessage = function(tag, content) {
        "use strict";
        let from = chat.authors.findIndex(author => author.tag === tag);

        if (from === -1) {
            return false;
        }

        let message = new MESSAGE(content, chat.authors[from], 0);
        chat.messages.push(message);

        return true;
    };

    this.addFilterToAuthor = function(name, tag) {
        "use strict";
        let filter = chat.filters.find(target => target.name === name);
        let author = chat.authors.find(target => target.tag === tag);

        if (filter === undefined || author === undefined) {
            return false;
        }

        author.filters
            .filter(target => target.priority === filter.priority)
            .forEach(function(target) {
                let index = author.filters.findIndex(filter => filter === target);
                author.filters.splice(index);
            });

        author.filters.push(filter);
    };
};

module.exports.CHAT = CHAT;