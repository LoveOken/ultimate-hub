const { Router } = require("./BACKEND/EXPRESS-ROUTING.js");
const { Socket } = require("./BACKEND/SOCKET-BACKEND.js");

let ROUTER = new Router(__dirname);
let SOCKET = new Socket(ROUTER);

ROUTER.routeStart();
SOCKET.socketStart();

ROUTER.routeRoot();
ROUTER.routeLogin();
ROUTER.routeLobby();

SOCKET.socketConnect();

ROUTER.serverListen(process.env.PORT);

/* Use any port for local, Use process.env.PORT for Deploy in Heroku */