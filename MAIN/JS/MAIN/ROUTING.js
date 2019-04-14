var socket = io();

socket.emit("update-process");

socket.on("update-start", () => {
    socket.emit("update-process");
});

socket.on("update-finish", (data) => {
    let game = data.game;
    let already_connected = data.already_connected;

    let my_player_index, player_seats, length_to_use;

    my_player_index = game.player_list.findIndex(player => player.visible === true);

    /* Once Connected */

    if (!already_connected) {
        document.getElementById("SEATS-SIT").style.display = "initial";
        socket.emit("validate-connection");
    }

    /* Role display */

    if (document.getElementById("ROLES-FORM").children.length == 0) {
        let form;
        form = document.getElementById("ROLES-FORM");

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

    /* Hide ready button */

    if (my_player_index != -1) {
        document.getElementById("CONTENTS-READY").style.display = "initial";
    } else {
        document.getElementById("CONTENTS-READY").style.display = "none";
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


})