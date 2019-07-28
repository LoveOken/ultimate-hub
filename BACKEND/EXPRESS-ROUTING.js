function ROUTER(dirname) {
    "use strict";
    let router = this;

    this.express = require("express");

    this.http = require("http");
    this.path = require("path");

    this.app = this.express();
    this.server = this.http.Server(this.app);

    this.session = require("express-session")({
        secret: "ultimatehub",
        resave: true,
        saveUninitialized: true
    });

    this.routeStart = function() {
        router.app.set("port", 2000);
        router.app.set("trust proxy", 1);

        router.app.use(router.express.urlencoded());
        router.app.use(router.express.static(dirname + "/MAIN"));
        router.app.use(router.session);
    };

    this.routeRoot = function() {
        router.app.get("/", function(request, response) {
            "use strict";

            if (request.session.logged) {
                response.redirect("/lobby");
            } else {
                response.redirect("/login");
            }

            response.end();
        });
    };

    this.routeLogin = function() {
        router.app.get("/login", function(request, response) {
            "use strict";
            response.sendFile(router.path.join(dirname, "/MAIN/LOGIN.html"));

            request.session.room = "Login";
            request.session.save();
        });

        router.app.post("/login/handshake", function(request, response) {
            "use strict";

            request.session.logged = true;

            request.session.username = request.body.username;
            request.session.password = request.body.password;

            request.session.save();

            response.redirect("/lobby");
            response.end();
        });
    };

    this.routeLobby = function() {
        router.app.get("/lobby", function(request, response) {
            "use strict";
            response.sendFile(router.path.join(dirname, "/MAIN/LOBBY.html"));

            request.session.room = "Lobby";
            request.session.save();
        });
    };

    this.routeMain = function(foundation, table) {
        router.app.get("/main/" + foundation, function(request, response) {
            "use strict";
            response.sendFile(router.path.join(dirname, "/MAIN/MAIN.html"));

            request.session.room = "Main";
            request.session.table = table;
            request.session.save();
        });
    };

    this.serverListen = function() {
    	router.server.listen(2000);
    }
}

module.exports.Router = ROUTER;