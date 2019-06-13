const CREATE_HORIZONTAL_SCROLLBAR = (scrollbar, scrollrail, field, container, content) => {
    scrollbar.style.width = (100 * container.offsetWidth / content.offsetWidth) + "%";

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

    scrollbar.onmousedown = start_dragging;
    scrollbar.onmouseover = deactivate_rail;
    scrollbar.onmouseout = activate_rail;
    field.onwheel = wheel_the_scrollbar;
}