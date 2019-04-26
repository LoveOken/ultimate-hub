var socket = io();

socket.emit("update-process");

socket.on("update-start", () => {
    socket.emit("update-process");
});

socket.on("update-finish", (data) => {
    let game = data.game;
    let already_connected = data.already_connected;

    let my_player_index, player_seats, length_to_use, clock, title, status_messages;

    my_player_index = game.player_list.findIndex(player => player.visible === true);

    /* Once Connected */

    if (!already_connected) {
        let loaders = document.getElementsByClassName("LOADER");
        let length_to_use = loaders.length;
        for (let i = 0; length_to_use > i; i++) {
            loaders[i].style.display = "none";
        }

        document.getElementById("CONFIGURATION").style.visibility = "visible";
        document.getElementById("GAME").style.visibility = "visible";

        document.getElementById("SEATS-SIT").style.display = "initial";

        socket.emit("validate-connection");
    }

    /* Role display */

    if (document.getElementById("ROLES-FORM").children.length == 0) {
        let form, fieldset, container;

        form = document.getElementById("ROLES-FORM");
        fieldset = document.getElementById("ROLES-FIELDSET");

        game.roles.forEach(function(role, index) {
            let length_to_use;
            length_to_use = role.quantity;

            for (let i = 0; length_to_use > i; i++) {
                let grid, checkbox, label, card;

                grid = document.createElement("DIV");
                checkbox = document.createElement("INPUT");
                checkmark = document.createElement("SPAN");
                label = document.createElement("LABEL");
                card = document.createElement("DIV");

                grid.classList.add("ROLE-GRID");

                checkbox.id = role.name + i;
                checkbox.type = "checkbox";
                checkbox.value = index;
                checkbox.checked = role.active[i];
                checkbox.onclick = function() {
                    socket.emit("toggle-role-activity", {
                        value: index,
                        which: i
                    });

                    return false;
                };

                checkmark.classList.add("CHECKMARK");
                checkmark.onclick = function() {
                    checkbox.click();
                }

                label.htmlFor = role.name + i;

                card.classList.add("CARD-SPRITE");
                card.classList.add(role.name);

                label.appendChild(card);
                grid.appendChild(checkbox);
                grid.appendChild(checkmark);
                grid.appendChild(label);
                form.appendChild(grid);
            }
        });

        let scrollbar, scrollrail;
        scrollbar = document.getElementById("ROLES-SCROLLBAR");
        scrollrail = document.getElementById("ROLES-SCROLLRAIL");
        container = document.getElementById("ROLES");

        scrollbar.style.width = (100 * fieldset.offsetWidth / form.offsetWidth) + "%";

        let pos1 = 0;
        let pos2 = 0;

        let deactivate_rail = (e) => {
            e = e || window.event;
            e.preventDefault();

            scrollrail.onmousedown = null;
        }

        let activate_rail = (e) => {
            e = e || window.event;
            e.preventDefault();

            scrollrail.onmousedown = attract_the_scrollbar;
        }

        let start_dragging = (e) => {
            e = e || window.event;
            e.preventDefault();

            pos2 = e.clientX;

            document.onmouseup = stop_dragging;
            document.onmousemove = drag_the_scrollbar;
        }

        let drag_the_scrollbar = (e) => {
            e = e || window.event;
            e.preventDefault();

            pos1 = pos2 - e.clientX;
            pos2 = e.clientX;

            scrollbar.style.left =
                (scrollbar.offsetLeft - pos1).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

            form.style.left =
                (-scrollbar.offsetLeft * fieldset.offsetWidth / scrollbar.offsetWidth).clamp(-fieldset.offsetWidth, 0) + "px";
        }

        let wheel_the_scrollbar = (e) => {
            e = e || window.event;
            e.preventDefault();

            delta = e.deltaY.clamp(-1, 1);

            scrollbar.style.left =
                (scrollbar.offsetLeft + delta * 20).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

            form.style.left =
                (-scrollbar.offsetLeft * fieldset.offsetWidth / scrollbar.offsetWidth).clamp(-fieldset.offsetWidth, 0) + "px";
        }

        let attract_the_scrollbar = (e) => {
            e = e || window.event;
            e.preventDefault();

            let pos = e.clientX;

            scrollbar.style.left =
                (pos - scrollrail.offsetLeft - scrollbar.offsetWidth / 2).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

            form.style.left =
                (-scrollbar.offsetLeft * fieldset.offsetWidth / scrollbar.offsetWidth).clamp(-fieldset.offsetWidth, 0) + "px";

            scrollbar.onmousedown();
        }

        let stop_dragging = (e) => {
            e = e || window.event;
            e.preventDefault();

            document.onmouseup = null;
            document.onmousemove = null;
        }

        scrollbar.onmousedown = start_dragging;
        scrollbar.onmouseover = deactivate_rail;
        scrollbar.onmouseout = activate_rail;
        container.onwheel = wheel_the_scrollbar;
    } else {
        game.roles.forEach(function(role, index) {
            let length_to_use;
            length_to_use = role.quantity;

            for (let i = 0; length_to_use > i; i++) {
                document.getElementById(role.name + i).checked = role.active[i];
            }
        });
    }

    /* Seating Display and Seat Button Control */

    document.getElementById("SEATS-SIT").removeAttribute("disabled");
    player_seats = document.getElementsByClassName("PLAYER-GRID");
    length_to_use = player_seats.length;
    for (i = 0; length_to_use > i; i++) {
        player_seats[i].style.display = "none";
    }
    game.player_list.forEach(function(player, index) {
        player_seats[index].style.display = "inline-block";
        player_seats[index].children[0].innerText = player.name;
        if (index + 1 == game.player_max) {
            document.getElementById("SEATS-SIT").setAttribute("disabled", true);
        }
    })

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
                document.getElementById("STATUS-TITLE").style.display = "block";
                break;
            }
        default:
            {
                document.getElementById("GAME").style.top = "0px";
                document.getElementById("CONFIGURATION").style.display = "none";
                document.getElementById("STATUS-TITLE").style.display = "block";
                document.getElementById("STATUS-HEADER").style.display = "block";
                document.getElementById("STATUS-TIME").style.display = "block";
                document.getElementById("STATUS-SUBTITLE").style.display = "block";
                document.getElementById("STATUS-CONTENTS").style.display = "table";
                break;
            }
    }

    /* Display title and subtitle */

    title = document.getElementById("STATUS-TITLE");
    status_messages = [
        "Game hasn't started yet. Get ready on your seats!",
        "Game is about to start!",
    ]
    title.innerText = status_messages[game.stage];

    /* Display Clock */

    clock = document.getElementById("STATUS-TIME");
    clock.innerText =
        Math.floor(Math.floor(game.stage_clock / 60) / 10).toString() + (Math.floor(game.stage_clock / 60) % 10).toString() + ":" +
        Math.floor((game.stage_clock % 60) / 10).toString() + ((game.stage_clock % 60) % 10).toString();
})