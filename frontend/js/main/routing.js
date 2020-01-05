(function() {
    let cards = document.getElementsByClassName("CARD");
    let cardSprites = document.getElementsByClassName("CARD-FRONT");

    let playerSeats = document.getElementsByClassName("PLAYER-GRID");
    let centerSeats = document.getElementsByClassName("CENTER-GRID");

    function General() {
        "use strict";

        const itself = this;

        this.start = function() {
            let i;
            for (i = 0; 20 > i; i += 1) {
                factory.cardStructure();
            }

            display.startupDisplay()
        };

        this.unlogged = display.unloggedDisplay;

        this.default = display.defaultDisplay;

        this.sitting = function(player) {
            display.configurationSeatsButton("SEATS-STAND", player.setupReady);
        };


        this.standing = function() {
            display.configurationSeatsButton("SEATS-SIT", false);
        };


        this.full = display.whenFull;

        this.leading = function() {
            display.onPosition(true);
        };

        this.following = function() {
            display.onPosition(false);
        };

        this.stage = display.onStage;

        this.ready = display.onReady;

        this.clock = display.forClock;

        this.chatScroller = SCROLLBARS.createVertical(
            document.getElementById("CHAT-SCROLLBAR"),
            document.getElementById("CHAT-SCROLLRAIL"),
            document.getElementById("CHAT-FIELD"),
            document.getElementById("CHAT-SCROLLABLE"),
            document.getElementById("CHAT-CONTAINER")
        );

        this.chat = function(messages) {
            const atBottom = itself.chatScroller.isAtBottom();

            messages.forEach(factory.messageStructure);
            itself.chatScroller.scrollerUpdate();

            if (atBottom) {
                itself.chatScroller.scrollToBottom();
            }
        };
    };

    function Roles() {
        "use strict";

        let container,
            fieldset,
            form,
            scrollbar,
            scrollrail;

        container = document.getElementById("ROLES");
        fieldset = document.getElementById("ROLES-FIELDSET");
        form = document.getElementById("ROLES-FORM");

        scrollbar = document.getElementById("ROLES-SCROLLBAR");
        scrollrail = document.getElementById("ROLES-SCROLLRAIL");

        this.undisplayed = () => form.children.length == 0;

        this.display = function(role, index, active, subindex, onclick) {
            factory.selectableRoleStructure(
                form,
                role,
                index,
                active,
                subindex,
                onclick
            );
        };

        this.displayAfter = function() {
            SCROLLBARS.createHorizontal(
                scrollbar,
                scrollrail,
                container,
                fieldset,
                form
            );
        };

        this.update = function(role, index, active, subindex) {
            document.getElementById(role.name + subindex).checked = active;
        };
    };

    function Players() {
        "use strict";
        this.initialize = function(player, index) {
            let seat = playerSeats[index];

            seat.style.display = "";
            seat.children[0].innerText = player.name;

            if (!player.alive) {
                seat.classList.add("DEAD");
            }
        };

        this.position = function(player, index) {
            let seat = playerSeats[index];
            let card = cards[index];

            if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

            if (!player.alive) {
                card.classList.add("DEAD");
            }

            card.style.display = "";
            card.style.left = seat.offsetLeft + "px";
            card.style.top = seat.offsetTop + "px";
        };

        this.display = function(knowledge, index, publicKnowledge, stage) {
            let sprite = cardSprites[index].children[0];
            let oldSpriteName = sprite.classList.item(1);

            let newSpriteName;

            if (knowledge == undefined) {
                newSpriteName = "UNKNOWN";
            } else {
                newSpriteName = knowledge[index];
            }

            if (stage == 5) newSpriteName = publicKnowledge[index];

            if (oldSpriteName != newSpriteName) {
                sprite.classList.remove(oldSpriteName);
                sprite.classList.add(newSpriteName);
            }
        };
    };

    function Centers() {
        "use strict";
        this.initialize = function(center, index) {
            let seat = centerSeats[index];

            seat.style.display = "";
            seat.children[0].innerText = center.name;
        };

        this.position = function(center, index) {
            let seat = centerSeats[index];
            let card = cards[10 + index];

            if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

            card.style.display = "";
            card.style.left = seat.offsetLeft + "px";
            card.style.top = seat.offsetTop + "px";
        };

        this.display = function(knowledge, index, publicKnowledge, stage) {
            let sprite = cardSprites[10 + index].children[0];
            let oldSpriteName = sprite.classList.item(1);

            let newSpriteName;

            if (knowledge == undefined) {
                newSpriteName = "UNKNOWN";
            } else {
                newSpriteName = knowledge[index];
            }

            if (stage == 5) newSpriteName = publicKnowledge[index];

            if (oldSpriteName != newSpriteName) {
                sprite.classList.remove(oldSpriteName);
                sprite.classList.add(newSpriteName);
            }
        };
    };

    client.startClient(new General(), new Roles(), new Players(), new Centers());
})();