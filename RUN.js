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

const GAME_READY_TO_START = () => {
    let roles, players, amount_of_cards_picked;
    let not_everyone_is_ready, not_enough_players, no_necessary_roles_active, cards_dont_align;

    roles = game.roles;
    players = game.player_list;

    amount_of_cards_picked = 0;

    roles.filter(role => role.active.includes(true)).forEach(
        function(role) {
            role.active.forEach(function(active) {
                if (active == true) amount_of_cards_picked += 1;
            })
        }
    );

    not_everyone_is_ready = (players.filter(player => player.ready === false).length > 0);
    not_enough_players = (players.length < 3);
    no_necessary_roles_active = (roles.filter(role => role.necessary === true && role.active.includes(true)).length == 0);
    cards_dont_align = (amount_of_cards_picked != players.length + 3);

    if (
        not_everyone_is_ready ||
        not_enough_players ||
        no_necessary_roles_active ||
        cards_dont_align
    ) {
        return false;
    } else {
        return true;
    }
}

const SHUFFLE_ROLES = () => {
    let roles_to_pick_from;

    roles_to_pick_from = "";

    game.roles.forEach(
        function(role, index) {
            console.log(index);
            let string_index;
            string_index = Math.floor(index / 10).toString() + (index % 10).toString();

            role.active.forEach(function(active) {
                if (active == true) roles_to_pick_from += string_index;
            })
        }
    );

    game.player_list.forEach(
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

        game.center_cards.push(role_index);
    }
}

const INITIALIZE_PLAYER_KNOWLEDGE = () => {
	let initial_player_knowledge, initial_center_knowledge;
	initial_player_knowledge = new Array;
	initial_center_knowledge = new Array;

	game.player_list.forEach(
		function() {
			initial_player_knowledge.push(-1);
		}
	)

	game.center_cards.forEach(
		function() {
			initial_center_knowledge.push(-1);
		}
	)

	game.player_list.forEach(
		function(player) {
			player.player_knowledge = initial_player_knowledge.slice();
			player.center_knowledge = initial_center_knowledge.slice();

			console.log(player);
		}
	)
}

var game = new GAME();

game.player_list.push(new PLAYER("Test", -2));
game.player_list.push(new PLAYER("Test 2", -2));

game.player_list[0].ready = true;
game.player_list[1].ready = true;

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

    socket.on("seat-request", (data) => {
        try {
            if (game.player_list.length == game.player_max && data.will_sit) {
                throw (Error("The player list is full. (Modified Client)"));
            };
            if (game.player_list.findIndex(player => player.tag === session.tag) != -1 && data.will_sit) {
                throw (Error("The client is already seated on the game. (Modified Client)"));
            }
            if (game.player_list.findIndex(player => player.tag === session.tag) == -1 && !data.will_sit) {
                throw (Error("The client has not seated yet wants to stand. (Modified Client)"));
            }
        } catch (e) {
            console.log(e);
            return;
        }

        if (data.will_sit) {
            game.player_list.unshift(new PLAYER(session.username, session.tag));
        } else {
            game.player_list.splice(game.player_list.findIndex(player => player.tag === session.tag), 1);
        }

        game.ready = GAME_READY_TO_START();

        io.sockets.emit("update-start");
    })

    socket.on("toggle-role-activity", (data) => {
        let me = game.player_list.findIndex(player => player.tag === session.tag);

        try {
            if (me != 0) {
                throw (Error("The player selecting roles is not table leader. (Modified Client)"));
            }
        } catch (e) {
            console.log(e);
            return;
        }

        game.roles[data.value].active[data.which] = !game.roles[data.value].active[data.which];

        game.ready = GAME_READY_TO_START();

        io.sockets.emit("update-start");
    });

    socket.on("set_ready_to_play", (data) => {
        let me = game.player_list.findIndex(player => player.tag === session.tag);
        game.player_list[me].ready = !game.player_list[me].ready;

        game.ready = GAME_READY_TO_START();

        io.sockets.emit("update-start");
    })

    socket.on("confirm-settings", (data) => {
        let me = game.player_list.findIndex(player => player.tag === session.tag);

        try {
            if (me != 0) {
                throw (Error("The player who confirmed the game settings is not table leader. (Modified Client)"));
            }
            if (!game.ready) {
                throw (Error("The game is not ready to start yet the button to start is unlocked. (Modified Client)"));
            }
        } catch (e) {
            console.log(e);
            return;
        }

        console.log("Confirm!");

        game.stage = 1;

        SHUFFLE_ROLES();
        INITIALIZE_PLAYER_KNOWLEDGE();

        io.sockets.emit("update-start");
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
            game.player_list.splice(me, 1)
        }

        io.sockets.emit("update-start");
    })
})

server.listen(2000);