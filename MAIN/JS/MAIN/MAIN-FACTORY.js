const FACTORY = {
    selectableRoleStructure: function(form, role, index, active, subindex, onclick) {
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

        checkmark.classList.add("CHECKMARK");

        let ontouch = (e) => {
            e = e || window.event;
            e.preventDefault();

            onclick();

            return false;
        };

        checkmark.onclick = onclick;
        checkmark.ontouchend = ontouch;

        label.onclick = onclick;
        label.ontouchend = ontouch;

        card.classList.add("CARD-SPRITE");
        card.classList.add(role.name);

        label.appendChild(card);
        grid.appendChild(checkbox);
        grid.appendChild(checkmark);
        grid.appendChild(label);
        form.appendChild(grid);
    },
    cardStructure: function() {
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
    },
    messageStructure: function(message, tag) {
        "use strict";
        let container, paragraph, author, divider, content, emblems;

        container = document.createElement("div");
        paragraph = document.createElement("p");
        author = document.createElement("span");
        divider = document.createElement("span");
        content = document.createElement("span");
        emblems = document.createElement("span");

        container.setAttribute("DATA-TAG", tag.toString());

        author.innerText = message.name;
        divider.innerText = ": ";
        content.innerText = message.content;

        emblems.classList.add("MESSAGE-EMBLEMS");
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

        paragraph.appendChild(emblems);
        paragraph.appendChild(author);
        author.appendChild(divider);
        paragraph.appendChild(content);

        container.appendChild(paragraph);

        let current = document.querySelector('.MESSAGE[DATA-TAG="' + tag + '"]');

        if (current === null) {
            document.getElementById("CHAT-CONTAINER").appendChild(container);
        } else {
            if (!current.isEqualNode(container)) {
                document.getElementById("CHAT-CONTAINER").insertBefore(container, current);
                current.remove();
            }
        }
    }
};

Object.freeze(FACTORY);