const DISPLAY_CONFIGURATION_TAB = function(content_to_see, tab_to_see) {
    "use strict";
    try {
        if (!tab_to_see.classList.contains('CONFIGURATION-TABS')) {
            throw (new Error("Not a valid configuration tab."));
        }
        if (!document.getElementById(content_to_see).classList.contains('CONFIGURATION-CONTENTS')) {
            throw (new Error("Not a valid configuration content."));
        }
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
};

const DISPLAY_CONFIGURATION_SEAT = function(seat) {
    "use strict";
    document.getElementsByClassName("CONFIGURATION-SEATS").forEach(
        function(element) {
            element.style.display = "none";
        }
    )

    document.getElementById(seat).style.display = "";
};