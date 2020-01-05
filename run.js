const {Socket} = require('./backend/socket-io.js');

const SOCKET = new Socket(__dirname);

SOCKET.run(2000);

/* Use any port for local, Use process.env.PORT for Deploy in Heroku */
