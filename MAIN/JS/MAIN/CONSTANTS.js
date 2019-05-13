const CREATE_HORIZONTAL_SCROLLBAR = (scrollbar, scrollrail, field, container, content) => {
    scrollbar.style.width = (100 * container.offsetWidth / content.offsetWidth) + "%";

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
        field.onwheel = null;
    }

    let drag_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos2 - e.clientX;
        pos2 = e.clientX;

        scrollbar.style.left =
            (scrollbar.offsetLeft - pos1).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-container.offsetWidth, 0) + "px";
    }

    let wheel_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        delta = e.deltaY.clamp(-1, 1);

        scrollbar.style.left =
            (scrollbar.offsetLeft + delta * 20).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-container.offsetWidth, 0) + "px";
    }

    let attract_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        let pos = e.clientX;

        scrollbar.style.left =
            (pos - scrollrail.offsetLeft - scrollbar.offsetWidth / 2).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-container.offsetWidth, 0) + "px";

        scrollbar.onmousedown();
    }

    let stop_dragging = (e) => {
        e = e || window.event;
        e.preventDefault();

        document.onmouseup = null;
        document.onmousemove = null;
        field.onwheel = wheel_the_scrollbar;
    }

    scrollbar.onmousedown = start_dragging;
    scrollbar.onmouseover = deactivate_rail;
    scrollbar.onmouseout = activate_rail;
    field.onwheel = wheel_the_scrollbar;
}

const CREATE_SELECTABLE_ROLE = (form, role, index, active, subindex, onclick) => {
    let grid, checkbox, label, card;

    grid = document.createElement("DIV");
    checkbox = document.createElement("INPUT");
    checkmark = document.createElement("SPAN");
    label = document.createElement("LABEL");
    card = document.createElement("DIV");

    grid.classList.add("ROLE-GRID");

    checkbox.id = role.name + subindex;
    checkbox.type = "checkbox";
    checkbox.value = index;
    checkbox.checked = active;
    checkbox.onclick = onclick;

    checkmark.classList.add("CHECKMARK");
    checkmark.onclick = function() {
        checkbox.click();
    }

    label.htmlFor = checkbox.id;

    card.classList.add("CARD-SPRITE");
    card.classList.add(role.name);

    label.appendChild(card);
    grid.appendChild(checkbox);
    grid.appendChild(checkmark);
    grid.appendChild(label);
    form.appendChild(grid);
}

const CREATE_CARDS = () => {
    document.getElementsByClassName("CARD-GRID").forEach(
        function() {
            card = document.createElement("div");
            card_contents = document.createElement("div");
            card_front = document.createElement("div");
            card_back = document.createElement("div");

            card.setAttribute("DATA-FLIP", "FRONT");
            card.setAttribute("DATA-ANIMATING", "FALSE");

            card.classList.add("CARD");
            card_contents.classList.add("CARD-CONTENTS");
            card_front.classList.add("CARD-FRONT");
            card_back.classList.add("CARD-BACK");

            card_sprite_front = document.createElement("div");
            card_sprite_back = document.createElement("div");

            card_sprite_front.classList.add("CARD-SPRITE");
            card_sprite_front.classList.add("UNDEFINED");
            card_sprite_back.classList.add("CARD-SPRITE");
            card_sprite_back.classList.add("UNDEFINED");


            card_front.appendChild(card_sprite_front);
            card_back.appendChild(card_sprite_back);
            card_contents.appendChild(card_front);
            card_contents.appendChild(card_back);
            card.appendChild(card_contents);

            card.style.display = "none";

            document.getElementById("GAME").append(card);
        }
    );
}

const CONFIGURATION_TABS_OPEN = (content_to_see, tab_to_see) => {
    try {
        if (!tab_to_see.classList.contains('CONFIGURATION-TABS')) {
            throw (Error("Not a valid configuration tab."));
        }
        if (!document.getElementById(content_to_see).classList.contains('CONFIGURATION-CONTENTS')) {
            throw (Error("Not a valid configuration content."))
        };
    } catch (e) {
        console.log(e);
        return;
    }

    document.getElementsByClassName("CONFIGURATION-CONTENTS").forEach(
        function(element) {
            element.style.display = "none";
        }
    );

    document.getElementsByClassName("CONFIGURATION-TABS").forEach(
        function(element) {
            element.style.backgroundColor = "";
            element.style.color = "";
        }
    );

    document.getElementById(content_to_see).style.display = "block";

    tab_to_see.style.backgroundColor = "#dedede";
    tab_to_see.style.color = "#1c1c1c";
}

const CONFIGURATION_SEATS_CLICK = (button_to_see) => {
    try {
        if (!document.getElementById(button_to_see).classList.contains('CONFIGURATION-SEATS')) {
            throw (Error("Not a valid configuration seat button."))
        };
        if (document.getElementById(button_to_see).style.display == "initial") {
            throw (Error("This button is already on display."))
        };
    } catch (e) {
        console.log(e);
        return;
    }

    let will_sit;

    if (button_to_see == "SEATS-STAND") {
        will_sit = true;
    } else {
        will_sit = false;
    }

    document.getElementsByClassName("CONFIGURATION-SEATS").forEach(
        function(element) {
            element.style.display = "none";
        }
    )

    socket.emit("seat-request", {
        will_sit: will_sit
    });
}

const CONFIGURATION_READY_TO_PLAY = () => {
    socket.emit("set_ready_to_play");
}

const CONFIGURATION_CONFIRM_SETTINGS = () => {
    socket.emit("confirm-settings");
}

const PLAYER_TO_GAME_INTERACTION = (element) => {
    console.log(element);

    socket.emit("player-interaction");
}

CREATE_CARDS();