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

    GAME_SEAT_REQUEST(will_sit);
}