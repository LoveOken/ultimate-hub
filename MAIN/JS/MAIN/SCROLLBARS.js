const CREATE_HORIZONTAL_SCROLLBAR = (scrollbar, scrollrail, field, container, content) => {
    let w = (100 * container.offsetWidth / content.offsetWidth);

    if (w > 100) {
        scrollrail.style.display = "none";
        return;
    }

    scrollrail.style.display = "";
    scrollbar.style.width = w + "%";
    scrollbar.style.left = (-content.offsetLeft * scrollrail.offsetWidth / content.offsetWidth) + "px";

    let pos1 = 0;
    let pos2 = 0;

    let deactivate_rail = (e) => {
        e = e || window.event;
        e.preventDefault();

        scrollrail.onmousedown = null;
    }

    let activate_rail = (e) => {
        e = e || window.event;
        e.preventDefault();

        scrollrail.onmousedown = attract_the_scrollbar;
    }

    let start_dragging = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos2 = e.clientX;

        document.onmouseup = stop_dragging;
        document.onmousemove = drag_the_scrollbar;
        field.onwheel = null;
    }

    let drag_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos2 - e.clientX;
        pos2 = e.clientX;

        scrollbar.style.left =
            (scrollbar.offsetLeft - pos1).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-content.offsetWidth, 0) + "px";
    }

    let wheel_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        delta = e.deltaY.clamp(-1, 1);

        scrollbar.style.left =
            (scrollbar.offsetLeft + delta * 20).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-content.offsetWidth, 0) + "px";
    }

    let attract_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        let pos = e.clientX;

        scrollbar.style.left =
            (pos - scrollrail.offsetLeft - scrollbar.offsetWidth / 2).clamp(0, scrollrail.offsetWidth - scrollbar.offsetWidth) + "px";

        content.style.left =
            (-scrollbar.offsetLeft * container.offsetWidth / scrollbar.offsetWidth).clamp(-content.offsetWidth, 0) + "px";

        scrollbar.onmousedown();
    }

    let stop_dragging = (e) => {
        e = e || window.event;
        e.preventDefault();

        document.onmouseup = null;
        document.onmousemove = null;
        field.onwheel = wheel_the_scrollbar;
    }

    scrollrail.onmousedown = attract_the_scrollbar;
    scrollbar.onmousedown = start_dragging;
    scrollbar.onmouseover = deactivate_rail;
    scrollbar.onmouseout = activate_rail;
    field.onwheel = wheel_the_scrollbar;
}




const CREATE_VERTICAL_SCROLLBAR = (scrollbar, scrollrail, field, container, content) => {
    let h = (100 * container.offsetHeight / content.offsetHeight);
    let t = (100 * -content.offsetTop / content.offsetHeight).clamp(0, 100 - h);

    if (h > 100) {
        scrollrail.style.display = "none";

        scrollrail.onmousedown = null;
        scrollbar.onmousedown = null;
        scrollbar.onmouseover = null;
        scrollbar.onmouseout = null;
        field.onwheel = null;

        return;
    }

    console.log(h, t);

    scrollrail.style.display = "";
    scrollbar.style.height = h + "%";
    scrollbar.style.top = t + "%";

    let pos1 = 0;
    let pos2 = 0;

    let deactivate_rail = (e) => {
        e = e || window.event;
        e.preventDefault();

        scrollrail.onmousedown = null;
    }

    let activate_rail = (e) => {
        e = e || window.event;
        e.preventDefault();

        scrollrail.onmousedown = attract_the_scrollbar;
    }

    let start_dragging = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos2 = e.clientY;

        document.onmouseup = stop_dragging;
        document.onmousemove = drag_the_scrollbar;
        field.onwheel = null;
    }

    let drag_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos2 - e.clientY;
        pos2 = e.clientY;

        diff = (100 * -pos1 / scrollrail.offsetHeight);
        t = (t + diff).clamp(0, 100 - h);

        scrollbar.style.top = t + "%";
        content.style.top = (-t * content.offsetHeight / 100) + "px";
    }

    let wheel_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        delta = e.deltaY.clamp(-1, 1);

        diff = (100 * delta * 20 / scrollrail.offsetHeight);
        t = (t + diff).clamp(0, 100 - h);

        scrollbar.style.top = t + "%";
        content.style.top = (-t * content.offsetHeight / 100) + "px";
    }

    let attract_the_scrollbar = (e) => {
        e = e || window.event;
        e.preventDefault();

        let pos = e.clientY;

        diff = (100 * (pos - scrollrail.offsetTop - scrollbar.offsetHeight / 2) / scrollrail.offsetHeight);
        t = diff.clamp(0, 100 - h);

        scrollbar.style.top = t + "%";
        content.style.top = (-t * content.offsetHeight / 100) + "px";

        scrollbar.onmousedown();
    }

    let stop_dragging = (e) => {
        e = e || window.event;
        e.preventDefault();

        document.onmouseup = null;
        document.onmousemove = null;
        field.onwheel = wheel_the_scrollbar;
    }

    scrollrail.onmousedown = attract_the_scrollbar;
    scrollbar.onmousedown = start_dragging;
    scrollbar.onmouseover = deactivate_rail;
    scrollbar.onmouseout = activate_rail;
    field.onwheel = wheel_the_scrollbar;

    return {
        scrollToBottom: () => {
            t = (100 - h);

            scrollbar.style.top = t + "%";
            content.style.top = (-t * content.offsetHeight / 100) + "px";
        },
        scrollUp: () => {
            t = 0;

            scrollbar.style.top = t + "%";
            content.style.top = (-t * content.offsetHeight / 100) + "px";
        }
    };
}