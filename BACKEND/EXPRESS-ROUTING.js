function ROUTER(dirname) {
    "use strict";
    let express = require("express");

    let http = require("http");
    let path = require("path");

    let app = express();
    let server = http.Server(app);

    let session = require("express-session")({
        secret: "ultimatehub",
        resave: true,
        saveUninitialized: true
    });

    const routeStart = function() {
        app.set("port", 2000);
        app.set("trust proxy", 1);

        app.use(express.urlencoded());
        app.use(express.static(dirname + "/MAIN"));
        app.use(session);
    };

    const routeRoot = function() {
        app.get("/", function(request, response) {
            "use strict";

            if (request.session.logged) {
                response.redirect("/lobby");
            } else {
                response.redirect("/login");
            }

            response.end();
        });
    };

    const routeLogin = function() {
        app.get("/login", function(request, response) {
            "use strict";
            response.sendFile(path.join(dirname, "/MAIN/LOGIN.html"));

            request.session.room = "Login";
            request.session.save();
        });

        app.post("/login", function(request, response) {
            "use strict";

            request.session.logged = true;

            request.session.username = request.body.username;
            request.session.password = request.body.password;

            request.session.save();

            response.redirect("/lobby");
            response.end();
        });
    };

   	const routeLobby = function(tableRequest) {
        app.get("/lobby", function(request, response) {
            "use strict";
            response.sendFile(path.join(dirname, "/MAIN/LOBBY.html"));

            request.session.room = "Lobby";
            request.session.save();
        });

        app.post("/lobby", function(request, response) {
            "use strict";
            let target = new tableRequest(request.body.title);

            routeMain(target.foundation, target.table);

            response.redirect("/main/" + target.foundation);
            response.end();
        });
    };

    const routeMain = function(foundation, table) {
        app.get("/main/" + foundation, function(request, response) {
            "use strict";
            response.sendFile(path.join(dirname, "/MAIN/MAIN.html"));

            request.session.room = "Main";
            request.session.table = table;
            request.session.save();
        });
    };

    this.getServer = server;
    this.getSession = session;

    this.routeStart = () => routeStart();
    this.routeMain = () => routeMain();

    this.initialRoutingSetup = function(tableRequest) {
        routeRoot();
        routeLogin();
        routeLobby(tableRequest);
    };

    this.serverListen = function(port) {
        server.listen(port);
    };

    Object.freeze(this);
}

module.exports.Router = ROUTER;