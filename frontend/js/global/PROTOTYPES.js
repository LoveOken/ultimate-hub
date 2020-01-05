Number.prototype.clamp = function(min, max) {
    "use strict";
    return Math.min(Math.max(this, min), max);
};

Number.prototype.secondsToMinutesAndSeconds = function() {
    "use strict";
    let minutes = Math.floor(this/60);
    let seconds = this % 60;

    return (
        Math.floor(minutes / 10).toString() + (minutes % 10) + ":" +
        Math.floor(seconds / 10).toString() + (seconds % 10)
    );
};

HTMLCollection.prototype.forEach = function(todo) {
    "use strict";
    let length_to_use = this.length;
    let i;
    for (i = 0; length_to_use > i; i++) {
        todo(this[i], i);
    }
};