var socket = io();

socket.emit("update-process");

socket.on("update-start", () => {
    socket.emit("update-process");
});

socket.on("update-finish", (data) => {
    let game, already_connected, my_player_index, my_player, player_seats, title, subtitle, description, clock;

    game = data.game;
    already_connected = data.already_connected;

    my_player_index = game.player_list.findIndex(player => player.visible === true);

    if (my_player_index != -1) {
        my_player = game.player_list[my_player_index];
    }

    /* Once Connected */

    if (!already_connected) {
        document.getElementsByClassName("LOADER").forEach(
            function(element) {
                element.style.display = "none";
            }
        );

        document.getElementsByClassName("CONFIGURATION-DEFAULT")[0].click();

        document.getElementById("CONFIGURATION").style.visibility = "visible";
        document.getElementById("GAME").style.visibility = "visible";

        socket.emit("validate-connection");
    }

    /* Role display */

    if (document.getElementById("ROLES-FORM").children.length == 0) {
        let container, form, fieldset, scrollbar, scrollrail;

        container = document.getElementById("ROLES");
        form = document.getElementById("ROLES-FORM");
        fieldset = document.getElementById("ROLES-FIELDSET");

        scrollbar = document.getElementById("ROLES-SCROLLBAR");
        scrollrail = document.getElementById("ROLES-SCROLLRAIL");

        game.roles.forEach(
            function(role, index) {
                role.active.forEach(
                    function(active, subindex) {
                        CREATE_SELECTABLE_ROLE(
                            form,
                            role,
                            index,
                            active,
                            subindex,
                            () => {
                                socket.emit("toggle-role-activity", {
                                    value: index,
                                    which: subindex
                                });

                                return false;
                            }
                        );
                    }
                );
            }
        );

        CREATE_HORIZONTAL_SCROLLBAR(scrollbar, scrollrail, container, fieldset, form);
    } else {
        game.roles.forEach(
            function(role) {
                role.active.forEach(
                    function(active, subindex) {
                        document.getElementById(role.name + subindex).checked = active
                    }
                )
            }
        );
    }

    /* Seating Display and Seat Button Control */

    if (my_player_index != -1) {
        document.getElementById("SEATS-STAND").style.display = "initial";
    } else {
        document.getElementById("SEATS-SIT").style.display = "initial";
    }

    document.getElementById("SEATS-SIT").removeAttribute("disabled");

    player_seats = document.getElementsByClassName("PLAYER-GRID");
    cards = document.getElementsByClassName("CARD");

    cards.forEach(
        function(element) {
            if (element.getAttribute("DATA-ANIMATING") == "TRUE") return;
            element.style.display = "none";
        }
    );

    player_seats.forEach(
        function(element) {
            element.style.display = "none";
        }
    );

    game.player_list.forEach(
        function(player, index) {
            let seat = player_seats[index];

            seat.style.display = "";
            seat.children[0].innerText = player.name;

            if (index + 1 == game.player_max) {
                document.getElementById("SEATS-SIT").setAttribute("disabled", true);
            }
        }
    );

    game.player_list.forEach(
        function(player, index) {
            let seat = player_seats[index];
            let card = cards[index];

            if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

            card.style.display = "";
            card.style.left = seat.offsetLeft + "px";
            card.style.top = seat.offsetTop + "px";
        }
    )

    /* Define Table Leadership */

    if (my_player_index == 0) {
        document.getElementById("CONTENTS-BUTTON-ON").style.display = "block";
        document.getElementById("CONTENTS-BUTTON-OFF").style.display = "none";
        document.getElementById("CONTENTS-BUTTON-ON").removeAttribute("disabled");
        document.getElementById("ROLES-FIELDSET").removeAttribute("disabled");
    } else {
        document.getElementById("CONTENTS-BUTTON-OFF").style.display = "block";
        document.getElementById("CONTENTS-BUTTON-ON").style.display = "none";
        document.getElementById("CONTENTS-BUTTON-ON").setAttribute("disabled", true);
        document.getElementById("ROLES-FIELDSET").setAttribute("disabled", true);
    }

    /* Ready button */

    if (my_player_index != -1) {
        document.getElementById("CONTENTS-READY").style.display = "initial";
        document.getElementById("CONTENTS-READY-CHECKBOX").checked = game.player_list[my_player_index].ready;
    } else {
        document.getElementById("CONTENTS-READY").style.display = "none";
    }

    /* Ready to start */

    if (game.ready) {
        document.getElementById("CONTENTS-BUTTON-ON").removeAttribute("disabled");
    } else {
        document.getElementById("CONTENTS-BUTTON-ON").setAttribute("disabled", true);
    }

    /* Stage Display Control */

    switch (game.stage) {
        case 0:
            {
                document.getElementById("GAME").style.top = "";
                document.getElementById("CONFIGURATION").style.display = "";
                document.getElementById("STATUS-HEADER").style.display = "none";
                document.getElementById("STATUS-CONTENTS").style.display = "none"
                break;
            }
        default:
            {
                document.getElementById("GAME").style.top = "0px";
                document.getElementById("CONFIGURATION").style.display = "none";
                document.getElementById("STATUS-HEADER").style.display = "";
                document.getElementById("STATUS-CONTENTS").style.display = "";
                break;
            }
    }

    /* Display title and subtitle */

    title = document.getElementById("STATUS-TITLE");
    subtitle = document.getElementById("STATUS-SUBTITLE");
    description = document.getElementById("STATUS-DESCRIPTION");

    title.innerText = [
        "Game hasn't started yet.",
        "Game is about to start.",
        "Game has started. Night Phase.",
    ][game.stage];

    subtitle.innerText = [
        "",
        "Preparation phase",
        game.roles[game.role_on_play].name + " is awake!",
    ][game.stage];

    description.innerText = [
        "",
        "Cards are being shuffled and dealt.",
        game.roles[game.role_on_play].description,
    ][game.stage];

    /* Display Clock */

    clock = document.getElementById("STATUS-TIME");
    clock.innerText = game.stage_clock.secondsToMinutesAndSeconds();

})