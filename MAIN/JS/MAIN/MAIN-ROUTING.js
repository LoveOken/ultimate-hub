let container, fieldset, form, scrollbar, scrollrail, cards, card_sprites, player_seats, center_seats;

container = document.getElementById("ROLES");
fieldset = document.getElementById("ROLES-FIELDSET");
form = document.getElementById("ROLES-FORM");


scrollbar = document.getElementById("ROLES-SCROLLBAR");
scrollrail = document.getElementById("ROLES-SCROLLRAIL");

cards = document.getElementsByClassName("CARD");
card_sprites = document.getElementsByClassName("CARD-FRONT");

player_seats = document.getElementsByClassName("PLAYER-GRID");
center_seats = document.getElementsByClassName("CENTER-GRID");

let do_once_connected = () => {
    document.getElementsByClassName("LOADER").forEach(
        function(element) {
            element.style.display = "none";
        }
    );

    document.getElementsByClassName("CONFIGURATION-DEFAULT")[0].click();

    document.getElementById("CONFIGURATION").style.visibility = "visible";
    document.getElementById("GAME").style.visibility = "visible";
}

let roles_arent_displayed = () => form.children.length == 0;

let display_every_role = (role, index, active, subindex, onclick) => {
    CREATE_SELECTABLE_ROLE(form, role, index, active, subindex, onclick);
}

let do_after_roles_are_displayed = () => {
    CREATE_HORIZONTAL_SCROLLBAR(scrollbar, scrollrail, container, fieldset, form);
}

let update_active_roles = (role, index, active, subindex) => {
    document.getElementById(role.name + subindex).checked = active;
}

let display_if_seated = (my_player) => {
    document.getElementById("SEATS-STAND").style.display = "initial";

    document.getElementById("CONTENTS-READY").style.display = "initial";
    document.getElementById("CONTENTS-READY-CHECKBOX").checked = my_player.ready;
}

let display_if_stood_up = () => {
    document.getElementById("SEATS-SIT").style.display = "initial";

    document.getElementById("CONTENTS-READY").style.display = "none";
}

let display_default = () => {
    document.getElementById("SEATS-SIT").removeAttribute("disabled");

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

    center_seats.forEach(
        function(element) {
            element.style.display = "none";
        }
    );
}

let display_if_room_is_full = () => {
    document.getElementById("SEATS-SIT").setAttribute("disabled", true);
}

let display_player_seats = (player, index) => {
    let seat = player_seats[index];

    seat.style.display = "";
    seat.children[0].innerText = player.name;
}

let initialize_player_cards = (player, index) => {
    let seat = player_seats[index];
    let card = cards[index];

    if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

    card.style.display = "";
    card.style.left = seat.offsetLeft + "px";
    card.style.top = seat.offsetTop + "px";
}

let display_player_cards = (knowledge, index, public_knowledge, stage) => {
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
}

let display_center_seats = (center, index) => {
	let seat = center_seats[index];

    seat.style.display = "";
    seat.children[0].innerText = center.name;
}

let initialize_center_cards = (center, index) => {
    let seat = center_seats[index];
    let card = cards[10 + index];

    if (card.getAttribute("DATA-ANIMATING") == "TRUE") return;

    card.style.display = "";
    card.style.left = seat.offsetLeft + "px";
    card.style.top = seat.offsetTop + "px";
}

let display_center_cards = (knowledge, index, public_knowledge, stage) => {
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
} 

let display_when_table_leader = () => {
    document.getElementById("CONTENTS-BUTTON-ON").style.display = "block";
    document.getElementById("CONTENTS-BUTTON-OFF").style.display = "none";
    document.getElementById("CONTENTS-BUTTON-ON").removeAttribute("disabled");
    document.getElementById("ROLES-FIELDSET").removeAttribute("disabled");
}

let display_when_not_table_leader = () => {
    document.getElementById("CONTENTS-BUTTON-OFF").style.display = "block";
    document.getElementById("CONTENTS-BUTTON-ON").style.display = "none";
    document.getElementById("CONTENTS-BUTTON-ON").setAttribute("disabled", true);
    document.getElementById("ROLES-FIELDSET").setAttribute("disabled", true);
}

let display_based_on_stage = (stage, role_on_play, winners) => {
    switch (stage) {
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

    let title = document.getElementById("STATUS-TITLE");
    let subtitle = document.getElementById("STATUS-SUBTITLE");
    let description = document.getElementById("STATUS-DESCRIPTION");

    title.innerText = [
        "Game hasn't started yet.",
        "Game is about to start.",
        "Game has started. Night Stage.",
        "Game has started. Day Stage.",
        "Game has started. Day Finished.",
        "Game has ended."
    ][stage];

    subtitle.innerText = [
        "",
        "Get ready on your seats!",
        role_on_play.name + " is awake!",
        "Talk and discuss!",
        "Vote now!",
        "Everyone has voted!"
    ][stage];

    let ending_description = (winners.length == 0) ? "Nobody has won." : "The winners are: " + winners.toString().replace(",", ", ");

    description.innerText = [
        "",
        "Cards are being shuffled and dealt.",
        role_on_play.description,
        "Everybody will discuss the events happened at night. " +
        "At the end of the day, everybody will vote to kill a person. " +
        "If that person is your target, you win.",
        "Everyone must vote now. " +
        "Vote the person which you think is the enemy. " +
        "You have limited time to vote. If you don't vote, your vote will be random.",
        ending_description
    ][stage];
}

let display_based_on_ready_game = (ready) => {
    if (ready) {
        document.getElementById("CONTENTS-BUTTON-ON").removeAttribute("disabled");
    } else {
        document.getElementById("CONTENTS-BUTTON-ON").setAttribute("disabled", true);
    }
}

let display_clock = (time) => {
    let clock = document.getElementById("STATUS-TIME");
    clock.innerText = time.secondsToMinutesAndSeconds();
}

GAME_TO_CLIENT_INIT(
    do_once_connected,
    roles_arent_displayed,
    display_every_role,
    do_after_roles_are_displayed,
    update_active_roles,
    display_if_seated,
    display_if_stood_up,
    display_default,
    display_if_room_is_full,
    display_player_seats,
    initialize_player_cards,
    display_player_cards,
    display_center_seats,
    initialize_center_cards,
    display_center_cards,
    display_when_table_leader,
    display_when_not_table_leader,
    display_based_on_stage,
    display_based_on_ready_game,
    display_clock
)