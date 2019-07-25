const SEND_MESSAGE = function() {
    "use strict";
    let input = document.getElementById('CHAT-INPUT');

    if (input.value === "") {
        return false;
    }

    if (input.value.length > input.max) {
        return false;
    }

    CHAT_SEND_MESSAGE(input.value);
    input.value = "";
};