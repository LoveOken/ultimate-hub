const CONFIGURATION_TABS_OPEN = (content_to_see, tab_to_see) => {
    try {
        if (!tab_to_see.classList.contains('CONFIGURATION-TABS')) { 
            throw (Error("Not a valid configuration tab."));
        }
        if (!document.getElementById(content_to_see).classList.contains('CONFIGURATION-CONTENTS')) {
            throw(Error("Not a valid configuration content."))
        };
    } catch(e) {
        console.log(e);
        return;
    }

    let i, configuration_contents, configuration_tabs, length_to_use;

    configuration_contents = document.getElementsByClassName("CONFIGURATION-CONTENTS");
    length_to_use = configuration_contents.length;
    for (i = 0; length_to_use > i; i++) {
        configuration_contents[i].style.display = "none";
    }

    configuration_tabs = document.getElementsByClassName("CONFIGURATION-TABS");
    length_to_use = configuration_tabs.length;
    for (i = 0; length_to_use > i; i++) {
        configuration_tabs[i].style.backgroundColor = "";
        configuration_tabs[i].style.color = "";
    }

    document.getElementById(content_to_see).style.display = "block";

    tab_to_see.style.backgroundColor = "#dedede";
    tab_to_see.style.color = "#1c1c1c";
}

const CONFIGURATION_SEATS_CLICK = (button_to_see) => {
    try {
        if (!document.getElementById(button_to_see).classList.contains('CONFIGURATION-SEATS')) {
            throw(Error("Not a valid configuration seat button."))
        };
        if (document.getElementById(button_to_see).style.display == "initial") {
            throw(Error("This button is already on display."))
        };
    } catch(e) {
        console.log(e);
        return;
    }

    let i, configuration_seats, length_to_use, will_sit;

    if (button_to_see == "SEATS-STAND") {
        will_sit = true;
    } else {
        will_sit = false;
    }

    configuration_seats = document.getElementsByClassName("CONFIGURATION-SEATS");
    length_to_use = configuration_seats.length;
    for (i = 0; length_to_use > i; i++) {
        configuration_seats[i].style.display = "none";
    }

    document.getElementById(button_to_see).style.display = "initial";

    socket.emit("seat-request", {
        will_sit: will_sit
    });
}

const CONFIGURATION_CONFIRM_SETTINGS {
    socket.emit("start-game");
}

document.getElementsByClassName("CONFIGURATION-DEFAULT")[0].click();
document.getElementById("SEATS-STAND").style.display = "none";
document.getElementById("SEATS-SIT").style.display = "none";