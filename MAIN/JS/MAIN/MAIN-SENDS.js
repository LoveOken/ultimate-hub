const SENDS = {
    sendMessage: function() {
        "use strict";
        let input = document.getElementById('CHAT-INPUT');

        if (input.value === "") {
            return false;
        }

        if (input.value.length > input.max) {
            return false;
        }

        CLIENT.sendMessage(input.value);
        input.value = "";
    }
}

Object.freeze(SENDS);