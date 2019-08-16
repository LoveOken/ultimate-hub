const { Socket } = require("./BACKEND/SOCKET-BACKEND.js");

let SOCKET = new Socket(__dirname);

SOCKET.run(2000);

/* Use any port for local, Use process.env.PORT for Deploy in Heroku */