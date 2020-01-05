function Factory() {
    "use strict"

    if (typeof factory !== 'undefined') {
        return false;
    }

    const roleCheckboxStructure = function(
        pForm,
        pRole,
        pIndex,
        pActive,
        pSubindex,
        onClick
    ) {
        "use strict";
        let grid, checkbox, checkmark, label, card;

        grid = document.createElement("DIV");
        checkbox = document.createElement("INPUT");
        checkmark = document.createElement("SPAN");
        label = document.createElement("LABEL");
        card = document.createElement("DIV");

        grid.classList.add("ROLE-GRID");

        checkbox.id = pRole.name + pSubindex;
        checkbox.type = "checkbox";
        checkbox.value = pIndex;
        checkbox.checked = pActive;

        checkmark.classList.add("CHECKMARK");

        let ontouch = e => {
            e = e || window.event;
            e.preventDefault();

            onClick();

            return false;
        };

        checkmark.onclick = onclick;
        checkmark.ontouchend = ontouch;

        label.onclick = onclick;
        label.ontouchend = ontouch;

        card.classList.add("CARD-SPRITE");
        card.classList.add(pRole.name);

        label.appendChild(card);
        grid.appendChild(checkbox);
        grid.appendChild(checkmark);
        grid.appendChild(label);
        pForm.appendChild(grid);
    };

    const cardStructure = function() {
        "use strict";
        let card, cardContents, cardFront, cardBack;
        card = document.createElement("div");
        cardContents = document.createElement("div");
        cardFront = document.createElement("div");
        cardBack = document.createElement("div");

        card.setAttribute("DATA-FLIP", "FRONT");
        card.setAttribute("DATA-ANIMATING", "FALSE");

        card.classList.add("CARD");
        cardContents.classList.add("CARD-CONTENTS");
        cardFront.classList.add("CARD-FRONT");
        cardBack.classList.add("CARD-BACK");

        let cardSpriteFront, cardSpriteBack;

        cardSpriteFront = document.createElement("div");
        cardSpriteBack = document.createElement("div");

        cardSpriteFront.classList.add("CARD-SPRITE");
        cardSpriteFront.classList.add("UNDEFINED");
        cardSpriteBack.classList.add("CARD-SPRITE");
        cardSpriteBack.classList.add("UNDEFINED");

        cardFront.appendChild(cardSpriteFront);
        cardBack.appendChild(cardSpriteBack);
        cardContents.appendChild(cardFront);
        cardContents.appendChild(cardBack);
        card.appendChild(cardContents);

        card.style.display = "none";

        document.getElementById("GAME").appendChild(card);
    };

    const messageStructure = function(pMessage, pTag) {
        "use strict";
        let container, paragraph, author, divider, content, badges;

        container = document.createElement("div");
        paragraph = document.createElement("p");
        author = document.createElement("span");
        divider = document.createElement("span");
        content = document.createElement("span");
        badges = document.createElement("span");

        container.setAttribute("DATA-TAG", pTag.toString());

        author.innerText = pMessage.name;
        divider.innerText = ": ";
        content.innerText = pMessage.content;

        badges.classList.add("MESSAGE-BADGES");
        author.classList.add("MESSAGE-AUTHOR");
        content.classList.add("MESSAGE-CONTENT");
        container.classList.add("MESSAGE");

        message.filters.forEach(function(filter) {
            switch (filter.name) {
                case "Spectator":
                    {
                        container.classList.add("SPECTATOR");
                        badges.innerText += "(Spectator)";

                        break;
                    }
                case "Player":
                    {
                        container.classList.add("PLAYER");

                        break;
                    }
            }
        });

        paragraph.appendChild(badges);
        paragraph.appendChild(author);
        author.appendChild(divider);
        paragraph.appendChild(content);

        container.appendChild(paragraph);

        let current = document.querySelector(
            '.MESSAGE[DATA-TAG="' + pTag + '"]'
        );

        if (current === null) {
            document.getElementById("CHAT-CONTAINER").appendChild(container);
        } else {
            if (!current.isEqualNode(container)) {
                document
                    .getElementById("CHAT-CONTAINER")
                    .insertBefore(container, current);
                current.remove();
            }
        }
    };

    this.roleCheckboxStructure =
        (f, r, i, a, s, o) => roleCheckboxStructure(f, r, i, a, s, o);
    this.cardStructure = () => cardStructure();
    this.messageStructure = (m, t) => messageStructure(m, t);

    Object.freeze(this);
}

const factory = new Factory();