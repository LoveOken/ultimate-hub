function CHAT(name) {
    "use strict";
    this.id = name;

    this.authors = [];
    this.filters = [];
    this.messages = [];
}

function AUTHOR(name, tag) {
    "use strict";
    this.name = name;
    this.filters = [];

    this.tag = tag;
}

function FILTER(name, priority) {
    "use strict";
    this.name = name;
    this.priority = priority;
}

function MESSAGE(content, author, time) {
    "use strict";
    this.content = content;

    this.name = author.name;
    this.filters = author.filters;

    this.time = time;
}



CHAT.prototype.newAuthor = function(name, tag) {
    "use strict";
    let from = this.authors.findIndex(author => author.tag === tag);

    if (from === -1) {
        let author = new AUTHOR(name, tag);
        this.authors.push(author);
    }
};



CHAT.prototype.newFilter = function(name, priority) {
    "use strict";
    let filter = new FILTER(name, priority);
    this.filters.push(filter);
};



CHAT.prototype.newMessage = function(tag, content) {
    "use strict";
    let from = this.authors.findIndex(author => author.tag === tag);

    if (from === -1) {
        return false;
    }

    let message = new MESSAGE(content, this.authors[from], 0);
    this.messages.push(message);

    return true;
};



CHAT.prototype.addFilterToAuthor = function(name, tag) {
    "use strict";
    let filter = this.filters.find(target => target.name === name);
    let author = this.authors.find(target => target.tag === tag);

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



module.exports.CHAT = CHAT;