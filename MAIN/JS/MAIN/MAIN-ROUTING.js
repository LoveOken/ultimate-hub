(function() {
    let cards = document.getElementsByClassName("CARD");
    let card_sprites = document.getElementsByClassName("CARD-FRONT");

    let player_seats = document.getElementsByClassName("PLAYER-GRID");
    let center_seats = document.getElementsByClassName("CENTER-GRID");

    function GENERAL() {
        "use strict";

        let itself = this;

        this.start = function() {
            let i;
            for (i = 0; 20 > i; i += 1) {
                FACTORY.cardStructure();
            }

            DISPLAY.startupDisplay()
        };

        this.unlogged = DISPLAY.unloggedDisplay;

        this.default = DISPLAY.defaultDisplay;

        this.sitting = function(my_player) {
            DISPLAY.configurationSeatsButton("SEATS-STAND", my_player.ready);
        };


        this.standing = function() {
            DISPLAY.configurationSeatsButton("SEATS-SIT", false);
        };


        this.full = DISPLAY.whenFull;

        this.leading = function() {
            DISPLAY.onPosition(true);
        };

        this.following = function() {
            DISPLAY.onPosition(false);
        };

        this.stage = DISPLAY.onStage;

        this.ready = DISPLAY.onReady;

        this.clock = DISPLAY.forClock;

        this.chatScroller = SCROLLBARS.createVertical(
            document.getElementById("CHAT-SCROLLBAR"),
            document.getElementById("CHAT-SCROLLRAIL"),
            document.getElementById("CHAT-FIELD"),
            document.getElementById("CHAT-SCROLLABLE"),
            document.getElementById("CHAT-CONTAINER")
        );

        this.chat = function(messages) {
            let at_bottom = itself.chatScroller.isAtBottom();

            messages.forEach(FACTORY.messageStructure);
            itself.chatScroller.scrollerUpdate();

            if (at_bottom) {
                itself.chatScroller.scrollToBottom();
            }
        };
    };

    function ROLES() {
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
            FACTORY.selectableRoleStructure(
                form,
                role,
                index,
                active,
                subindex,
                onclick
            );
        };

        this.after_display = function() {
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

    function PLAYERS() {
        "use strict";
        this.initialize = function(player, index) {
            let seat = player_seats[index];

            seat.style.display = "";
            seat.children[0].innerText = player.name;

            if (!player.alive) {
                seat.classList.add("DEAD");
            }
        };

        this.position = function(player, index) {
            let seat = player_seats[index];
            let card = cards[index];

            if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

            if (!player.alive) {
                card.classList.add("DEAD");
            }

            card.style.display = "";
            card.style.left = seat.offsetLeft + "px";
            card.style.top = seat.offsetTop + "px";
        };

        this.display = function(knowledge, index, public_knowledge, stage) {
            let sprite = card_sprites[index].children[0];
            let old_sprite_name = sprite.classList.item(1);

            let new_sprite_name;

            if (knowledge == undefined) {
                new_sprite_name = "UNKNOWN";
            } else {
                new_sprite_name = knowledge[index];
            }

            if (stage == 5) new_sprite_name = public_knowledge[index];

            if (old_sprite_name != new_sprite_name) {
                sprite.classList.remove(old_sprite_name);
                sprite.classList.add(new_sprite_name);
            }
        };
    };

    function CENTER() {
        "use strict";
        this.initialize = function(center, index) {
            let seat = center_seats[index];

            seat.style.display = "";
            seat.children[0].innerText = center.name;
        };

        this.position = function(center, index) {
            let seat = center_seats[index];
            let card = cards[10 + index];

            if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

            card.style.display = "";
            card.style.left = seat.offsetLeft + "px";
            card.style.top = seat.offsetTop + "px";
        };

        this.display = function(knowledge, index, public_knowledge, stage) {
            let sprite = card_sprites[10 + index].children[0];
            let old_sprite_name = sprite.classList.item(1);

            let new_sprite_name;

            if (knowledge == undefined) {
                new_sprite_name = "UNKNOWN";
            } else {
                new_sprite_name = knowledge[index];
            }

            if (stage == 5) new_sprite_name = public_knowledge[index];

            if (old_sprite_name != new_sprite_name) {
                sprite.classList.remove(old_sprite_name);
                sprite.classList.add(new_sprite_name);
            }
        };
    };

    CLIENT.INIT(new GENERAL(), new ROLES(), new PLAYERS(), new CENTER());
})();