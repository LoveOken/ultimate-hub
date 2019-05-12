Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

Number.prototype.secondsToMinutesAndSeconds = function() {
    let minutes = Math.floor(this/60);
    let seconds = this % 60;

    return (
        Math.floor(minutes / 10).toString() + (minutes % 10).toString() + ":" +
        Math.floor(seconds / 10).toString() + (seconds % 10).toString()
    )
}

HTMLCollection.prototype.forEach = function(todo) {
    let length_to_use = this.length;
    for (i = 0; length_to_use > i; i++) {
        todo(this[i], i);
    }
}