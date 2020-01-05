function Sends() {
    'use strict';

    if (typeof sends !== 'undefined') {
        return false;
    }

    const sendMessage = function() {
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

    this.sendMessage = () => sendMessage();
}

const sends = new Sends();