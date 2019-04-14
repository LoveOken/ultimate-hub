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
}

function PLAYER(name, tag) {
    this.name = name;
    this.tag = tag;

    this.ready = false;

    this.visible = true;

    this.player_knowledge = new Array;
    this.center_knowledge = new Array;

    this.role = 0;
    this.team = 0;    
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

    socket.on("seat-request", (data) => {
    	try {
    		if (game.player_list.length == game.player_max && data.will_sit) {
    			throw(Error("The player list is full. (Modified Client)"));
    		};
    		if (game.player_list.findIndex(player => player.tag === session.tag) != -1 && data.will_sit) {
    			throw(Error("The client is already seated on the game. (Modified Client)"));
    		}
    		if (game.player_list.findIndex(player => player.tag === session.tag) == -1 && !data.will_sit) {
    			throw(Error("The client has not seated yet wants to stand. (Modified Client"));
    		}
    	} catch(e) {
    		console.log(e);
    		return;
    	}

        if (data.will_sit) {
            game.player_list.push(new PLAYER(session.username, session.tag));
        } else {
            game.player_list.splice(game.player_list.findIndex(player => player.tag === session.tag), 1);
        }

        io.sockets.emit("update-start");
    })

  	socket.on("toggle-role-activity", (data) => {
  		game.roles[data.value].active[data.which] = ! game.roles[data.value].active[data.which];

  		io.sockets.emit("update-start");
  	});

  	socket.on("confirm-settings", (data) => {
  		console.log("game storted");
  	})

    socket.on("update-process", () => {
    	let output = JSON.parse(JSON.stringify(game));

    	let other_players = output.player_list.filter(player => player.tag != session.tag);
    	other_players.forEach(function(player) {
    		player.visible = false;

    		delete player.player_knowledge;
    		delete player.center_knowledge;

    		delete player.role;
    		delete player.team;
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
    	try {
    		game.player_list.splice(game.player_list.findIndex(player => player.tag === session.tag), 1)
    	} catch (err) {
    		/* No index found */
    	}

    	io.sockets.emit("update-start");
    })
})

server.listen(2000);