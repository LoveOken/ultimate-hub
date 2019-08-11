const { Socket } = require("./BACKEND/SOCKET-BACKEND.js");

let SOCKET = new Socket(__dirname);

<<<<<<< HEAD
SOCKET.express.routeStart();
SOCKET.socketStart();

SOCKET.express.initialRoutingSetup();

SOCKET.socketConnect();
SOCKET.express.serverListen(2000);
=======
SOCKET.run(2000);
>>>>>>> heroku

/* Use any port for local, Use process.env.PORT for Deploy in Heroku */