/* Variable Declaration */

var express = require('express');
var socketIO = require('socket.io');

var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var session = require('express-session')({
    secret: 'ultimatehub',
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

/* Express Routing */

app.set('port', 2000);
app.set('trust proxy', 1);

app.use(session);
io.use(sharedsession(session, {
    autoSave: true
}));

app.use(express.urlencoded());

app.use(express.static(__dirname + "/MAIN"));

app.get('/', function(request, response) {
    if (request.session.is_logged_in == null) {
        response.sendFile(path.join(__dirname, '/MAIN/LOGIN.html'));
    } else {
        response.sendFile(path.join(__dirname, '/MAIN/MAIN.html'));
        request.body.responseTest = "Hello World";
    }
});

app.post('/login-submission', function(request, response) {
    request.session.is_logged_in = true;

    request.session.username = request.body.username;

    request.session.save();

    response.redirect('/');
    response.end();
})

/* Game Itself */

const { CREATE_ROLE_LIST } = require("./MAIN/JS/GAME/ROLES");

function GAME() {
    this.id = "Game Test";

    this.player_list = new Array;
    this.player_max = 10;

    this.center_cards = new Array;

    this.roles = CREATE_ROLE_LIST();

    this.stage = 0;
    this.stage_clock = 0;

    this.ready = false;
}

function PLAYER(name, tag) {
    this.name = name;
    this.tag = tag;

    this.ready = false;

    this.visible = true;

    this.player_knowledge = new Array;
    this.center_knowledge = new Array;

    this.actual_role = -1;
    this.original_role = -1;

    this.action_state = 0;
}

GAME.prototype.seatRequest = function(name, tag, seating) {
    try {
        if (this.player_list.length == this.player_max && seating) {
            throw (Error("The player list is full. (Modified Client)"));
        };
        if (this.player_list.findIndex(player => player.tag === tag) != -1 && seating) {
            throw (Error("The client is already seated on the game. (Modified Client)"));
        }
        if (this.player_list.findIndex(player => player.tag === tag) == -1 && !seating) {
            throw (Error("The client has not seated yet wants to stand. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    if (seating) {
        this.player_list.push(new PLAYER(name, tag));
    } else {
        this.player_list.splice(this.player_list.findIndex(player => player.tag === tag), 1);
    }

    this.setReady();
}

GAME.prototype.toggleRole = function(tag, value, which) {
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from != 0) {
            throw (Error("The player selecting roles is not table leader. (Modified Client)"));
        }
        if (this.roles[value] == null) {
            throw (Error("Invalid index. (Modified Client)"));
        }
        if (this.roles[value].active[which] == null) {
            throw (Error("Invalid subindex. (Modified Client)"));


        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.roles[value].active[which] = !this.roles[value].active[which];

    this.setReady();
}

GAME.prototype.togglePlayerReady = function(tag) {
    from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from == -1) {
            throw (Error("The player is not seated. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.player_list[from].ready = !this.player_list[from].ready;

    this.setReady();
}

GAME.prototype.setReady = function() {
    let amount_of_cards_picked;
    let not_everyone_is_ready, not_enough_players, no_necessary_roles_active, cards_dont_align;

    amount_of_cards_picked = 0;

    this.roles.filter(role => role.active.includes(true)).forEach(
        function(role) {
            role.active.forEach(function(active) {
                if (active == true) amount_of_cards_picked += 1;
            })
        }
    );

    not_everyone_is_ready = (this.player_list.filter(player => player.ready === false).length > 0);
    not_enough_players = (this.player_list.length < 3);
    no_necessary_roles_active = (this.roles.filter(role => role.necessary === true && role.active.includes(true)).length == 0);
    cards_dont_align = (amount_of_cards_picked != this.player_list.length + 3);

    if (
        not_everyone_is_ready ||
        not_enough_players ||
        no_necessary_roles_active ||
        cards_dont_align
    ) {
        this.ready = false;
    } else {
        this.ready = true;
    }
}

GAME.prototype.shuffleRoles = function() {
    let roles_to_pick_from;

    roles_to_pick_from = "";

    this.roles.forEach(
        function(role, index) {
            let string_index;
            string_index = Math.floor(index / 10).toString() + (index % 10).toString();

            role.active.forEach(function(active) {
                if (active == true) roles_to_pick_from += string_index;
            })
        }
    );

    this.player_list.forEach(
        function(player) {
            let random_factor, random_role, role_index;
            random_factor = Math.floor(Math.random() * roles_to_pick_from.length / 2);
            random_role = roles_to_pick_from.slice(2 * random_factor, 2 * random_factor + 2);

            roles_to_pick_from = roles_to_pick_from.replace(random_role, '');

            role_index = eval(random_role);

            player.actual_role = role_index;
            player.original_role = role_index;
        }
    )

    for (let i = 0; 3 > i; i++) {
        let random_factor, random_role, role_index;
        random_factor = Math.floor(Math.random() * roles_to_pick_from.length / 2);
        random_role = roles_to_pick_from.slice(2 * random_factor, 2 * random_factor + 2);

        roles_to_pick_from = roles_to_pick_from.replace(random_role, '');

        role_index = eval(random_role);

        this.center_cards.push(role_index);
    }
}

GAME.prototype.initializeKnowledge = function() {
    let initial_player_knowledge, initial_center_knowledge;
    initial_player_knowledge = new Array;
    initial_center_knowledge = new Array;

    this.player_list.forEach(
        function() {
            initial_player_knowledge.push(-1);
        }
    )

    this.center_cards.forEach(
        function() {
            initial_center_knowledge.push(-1);
        }
    )

    this.player_list.forEach(
        function(player) {
            player.player_knowledge = initial_player_knowledge.slice();
            player.center_knowledge = initial_center_knowledge.slice();
        }
    )
}

GAME.prototype.clockStart = function(end_function) {
    io.sockets.emit("update-start");

    if (this.stage_clock > 0) {
        setTimeout(
            () => {
                this.stage_clock--;
                this.clockStart(end_function);
            }, 1000);
    } else {
        end_function();
    }
}

GAME.prototype.prepare = function(tag) {
    let from = this.player_list.findIndex(player => player.tag === tag);

    try {
        if (from != 0) {
            throw (Error("The player who confirmed the game settings is not table leader. (Modified Client)"));
        }
        if (!this.ready) {
            throw (Error("The game is not ready to start yet the button to start is unlocked. (Modified Client)"));
        }
    } catch (e) {
        console.log(e);
        return;
    }

    this.stage = 1;
    this.stage_clock = 5;

    this.shuffleRoles();
    this.initializeKnowledge();
    this.clockStart(
        function() {
            console.log("Finished");
        }
    )
}

GAME.prototype.playersRecognitionByCondition = function() {
}

var game = new GAME();

/* Socket.io Routing */

global.SOCKET_LIST = {};
global.SOCKETS_ONLINE = 0;

io.sockets.on("connection", function(socket) {
    var session = socket.handshake.session;

    socket.already_connected = false;

    if (session.is_logged_in) {
        if (session.tag == null) {
            session.tag = SOCKETS_ONLINE;
            SOCKETS_ONLINE++;

            session.save();
        }

        SOCKET_LIST[session.tag] = socket;
    }

    socket.on("debug-player", () => {
        dummy = new PLAYER("Dummy", -1);
        dummy.ready = true;
        game.player_list.push(dummy);

        game.setReady();

        io.sockets.emit("update-start");
    })

    socket.on("seat-request", (data) => {
        game.seatRequest(session.username, session.tag, data.will_sit);
        io.sockets.emit("update-start");
    })

    socket.on("toggle-role-activity", (data) => {
        game.toggleRole(session.tag, data.value, data.which);
        io.sockets.emit("update-start");
    });

    socket.on("set_ready_to_play", (data) => {
        game.togglePlayerReady(session.tag);
        io.sockets.emit("update-start");
    })

    socket.on("confirm-settings", (data) => {
        game.prepare(session.tag);
    })

    socket.on("update-process", () => {
        let output = JSON.parse(JSON.stringify(game));

        let me = output.player_list.findIndex(player => player.tag === session.tag);
        if (me != -1) {
            delete output.player_list[me].actual_role;
        }

        let other_players = output.player_list.filter(player => player.tag != session.tag);
        other_players.forEach(function(player) {
            player.visible = false;

            delete player.player_knowledge;
            delete player.center_knowledge;

            delete player.actual_role;
            delete player.original_role;

            delete player.action_state;
        });

        delete output.center_cards;

        output.roles.forEach(function(role) {
            delete role.team;
            delete role.action;
        })

        socket.emit("update-finish", {
            game: output,
            already_connected: socket.already_connected
        });
    });

    socket.on("validate-connection", function() {
        socket.already_connected = true;
    })

    socket.on("disconnect", () => {
        let me = game.player_list.findIndex(player => player.tag === session.tag);

        if (me != -1 && game.stage == 0) {
            game.player_list.splice(me, 1);
        }

        io.sockets.emit("update-start");
    })
})

server.listen(2000);