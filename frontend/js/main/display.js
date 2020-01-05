function Display() {
    'use strict';

    if (typeof display !== 'undefined') {
        return false;
    }

    const startupDisplay = function() {
        "use strict";
        document.getElementsByClassName("LOADER").forEach(function(element) {
            element.style.display = "none";
        });

        document.getElementsByClassName("CONFIGURATION-DEFAULT")[0].click();

        document.getElementById("CONFIGURATION").style.visibility = "visible";
        document.getElementById("GAME").style.visibility = "visible";
        document.getElementById("STATUS").style.display = "";

        document.getElementById("CHAT").style.visibility = "visible";
    }

    const unloggedDisplay = function() {
        document.getElementsByClassName("CONFIGURATION-SEATS").forEach(
            function(element) {
                element.style.display = "none";
            }
        );

        document.getElementById("CONTENTS-BUTTON-ON").style.display = "none";
        document.getElementById("CONTENTS-BUTTON-OFF").style.display = "none";
    }

    const defaultDisplay = function() {
        document.getElementById("SEATS-SIT").removeAttribute("disabled");

        document.getElementsByClassName("CARD").forEach(function(element) {
            if (element.getAttribute("DATA-ANIMATING") == "TRUE") {
                return;
            }

            element.style.display = "none";
        });

        document.getElementsByClassName("PLAYER-GRID").forEach(function(element) {
            element.style.display = "none";
        });

        document.getElementsByClassName("CENTER-GRID").forEach(function(element) {
            element.style.display = "none";
        });
    }

    const configurationTabs = function(pSegment, pTab) {
        "use strict";
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

        document.getElementById(pSegment).style.display = "block";

        pTab.style.backgroundColor = "#ececec";
        pTab.style.color = "#550022";
    }

    const configurationSeatsButton = function(pSeat, pReady) {
        "use strict";
        document.getElementsByClassName("CONFIGURATION-SEATS").forEach(
            function(element) {
                element.style.display = "none";
            }
        );

        if (pSeat === "SEATS-SIT") {
            document.getElementById("CONTENTS-READY").style.display = "none";
        } else {
            document.getElementById("CONTENTS-READY").style.display = "initial";
            document.getElementById("CONTENTS-READY-CHECKBOX").checked = pReady;
        };

        document.getElementById(pSeat).style.display = "";
    }

    const whenFull = function() {
        "use strict";
        document.getElementById("SEATS-SIT").setAttribute("disabled", true);
    }

    const onPosition = function(pLeading) {
        "use strict";
        if (pLeading) {
            document.getElementById("CONTENTS-BUTTON-ON").style.display = "block";
            document.getElementById("CONTENTS-BUTTON-OFF").style.display = "none";
            document.getElementById("CONTENTS-BUTTON-ON").removeAttribute("disabled");
            document.getElementById("ROLES-FIELDSET").removeAttribute("disabled");
        } else {
            document.getElementById("CONTENTS-BUTTON-OFF").style.display = "block";
            document.getElementById("CONTENTS-BUTTON-ON").style.display = "none";
            document
                .getElementById("CONTENTS-BUTTON-ON")
                .setAttribute("disabled", true);
            document.getElementById("ROLES-FIELDSET").setAttribute("disabled", true);
        };
    }

    const onStage = function(pStage, pRole, pWinners) {
        switch (pStage) {
            case 0:
                {
                    document.getElementById("GAME").style.top = "";
                    document.getElementById("CONFIGURATION").style.display = "";
                    document.getElementById("STATUS-HEADER").style.display = "none";
                    document.getElementById("STATUS-CONTENTS").style.display = "none";
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
            pRole.name + " is awake!",
            "Talk and discuss!",
            "Vote now!",
            "Everyone has voted!"
        ][stage];

        let ending =
            pWinners.length == 0 ?
            "Nobody has won." :
            "The winners are: " + pWinners.toString().replace(",", ", ");

        description.innerText = [
            "",
            "Cards are being shuffled and dealt.",
            pRole.description,
            "Everybody will discuss the events happened at night. " +
            "At the end of the day, everybody will vote to kill a person. " +
            "If that person is your target, you win.",
            "Everyone must vote now. " +
            "Vote the person which you think is the enemy. " +
            "You have limited time to vote. If you don't vote, your vote will be random.",
            ending
        ][stage];
    }

    const onReady = function(pReady) {
        "use strict";
        if (ready) {
            document
                .getElementById("CONTENTS-BUTTON-ON")
                .removeAttribute("disabled");
        } else {
            document
                .getElementById("CONTENTS-BUTTON-ON")
                .setAttribute("disabled", true);
        }
    }

    const forClock = function(pTime) {
        let clock = document.getElementById("STATUS-TIME");
        clock.innerText = time.secondsToMinutesAndSeconds();
    }

    this.startupDisplay = () => startupDisplay();
    this.unloggedDisplay = () => unloggedDisplay();
    this.defaultDisplay = () => defaultDisplay();
    this.configurationTabs = (s, t) => configurationTabs(s, t);
    this.configurationSeatsButton = (s, r) => configurationSeatsButton(s, r);
    this.whenFull = () => whenFull();
    this.onPosition = (l) => onPosition(l);
    this.onStage = (s, r, w) => onStage(s, r, w);
    this.onReady = (r) => onReady(r);
    this.forClock = (t) => forClock(t);

    Object.freeze(this);
}

const display = new Display();