const CREATE_SELECTABLE_ROLE = function(form, role, index, active, subindex, onclick) {
    "use strict";
    let grid, checkbox, checkmark, label, card;

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
    };

    label.htmlFor = checkbox.id;

    card.classList.add("CARD-SPRITE");
    card.classList.add(role.name);

    label.appendChild(card);
    grid.appendChild(checkbox);
    grid.appendChild(checkmark);
    grid.appendChild(label);
    form.appendChild(grid);
};

const CREATE_CARD = function() {
    "use strict";
    let card, card_contents, card_front, card_back;
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

    let card_sprite_front, card_sprite_back;

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

    document.getElementById("GAME").appendChild(card);
};

const CREATE_MESSAGE = function(message) {
    "use strict";
    let container, paragraph, author, divider, content, emblems;

    container = document.createElement("div");
    paragraph = document.createElement("p");
    author = document.createElement("span");
    divider = document.createElement("span");
    content = document.createElement("span");
    emblems = document.createElement("p");

    author.innerText = message.name;
    divider.innerText = ": ";
    content.innerText = message.content;

    author.classList.add("MESSAGE-AUTHOR");
    content.classList.add("MESSAGE-CONTENT");
    container.classList.add("MESSAGE");

    message.filters.forEach(
        function(filter) {
            switch (filter.name) {
                case "Spectator":
                    {
                        container.classList.add("SPECTATOR");
                        emblems.innerText += "(Spectator)"

                        break;
                    }
                case "Player":
                    {
                        container.classList.add("PLAYER");

                        break;
                    }
            }
        }
    );

    author.appendChild(divider);
    paragraph.appendChild(author);
    paragraph.appendChild(content);

    container.appendChild(emblems);
    container.appendChild(paragraph);

    document.getElementById("CHAT-CONTAINER").appendChild(container);
}