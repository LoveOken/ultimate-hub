/**
 * Controls everything related to the Express module.
 * @param {string} pDirname Location of the project's directory.
 * @return {void}
 */
function Express(pDirname) {
    'use strict';
    const express = require('express');

    const http = require('http');
    const path = require('path');

    const app = express();
    const server = http.Server(app);

    const session = require('express-session')({
        secret: 'ultimatehub',
        resave: true,
        saveUninitialized: true,
    });

    const routeStart = function() {
        app.set('port', 2000);
        app.set('trust proxy', 1);

        app.use(express.urlencoded());
        app.use(express.static(pDirname + '/frontend'));
        app.use(session);
    };

    const routeRoot = function() {
        app.get('/', function(request, response) {
            'use strict';

            if (request.session.logged) {
                response.redirect('/lobby');
            } else {
                response.redirect('/login');
            }

            response.end();
        });
    };

    const routeLogin = function() {
        app.get('/login', function(request, response) {
            'use strict';
            response.sendFile(path.join(pDirname, '/frontend/login.html'));

            request.session.room = 'Login';
            request.session.save();
        });

        app.post('/login', function(request, response) {
            'use strict';

            request.session.logged = true;

            request.session.username = request.body.username;
            request.session.password = request.body.password;

            request.session.save();

            response.redirect('/lobby');
            response.end();
        });
    };

    const routeLobby = function(TableRequest) {
        app.get('/lobby', function(request, response) {
            'use strict';
            response.sendFile(path.join(pDirname, '/frontend/lobby.html'));

            request.session.room = 'Lobby';
            request.session.save();
        });

        app.post('/lobby', function(request, response) {
            'use strict';
            const target = new TableRequest(request.body.title);

            routeMain(target.foundation, target.table);

            response.redirect('/main/' + target.foundation);
            response.end();
        });
    };

    const routeMain = function(pFoundation, pTable) {
        app.get('/main/' + pFoundation, function(request, response) {
            'use strict';
            response.sendFile(path.join(pDirname, '/frontend/main.html'));

            request.session.room = 'Main';
            request.session.table = pTable;
            request.session.save();
        });
    };

    this.getServer = () => server;
    this.getSession = () => session;

    this.routeStart = () => routeStart();
    this.routeMain = () => routeMain();

    this.initialRoutingSetup = function(TableRequest) {
        routeRoot();
        routeLogin();
        routeLobby(TableRequest);
    };

    this.serverListen = function(pPort) {
        server.listen(pPort);
    };

    Object.freeze(this);
}

module.exports.Express = Express;
