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

CREATE_CARDS();