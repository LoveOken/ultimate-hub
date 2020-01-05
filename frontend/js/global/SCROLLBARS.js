const SCROLLBARS = {
    createHorizontal: function(scrollbar, scrollrail, field, container, content) {
        let w, l;

        let output = {
            scrollerUpdate: () => {
                w = (100 * container.offsetWidth / content.offsetWidth).clamp(0, 100);
                l = (100 * -content.offsetLeft / content.offsetWidth).clamp(0, 100 - w);

                (w >= 100) ? scrollrail.style.visibility = "hidden": scrollrail.style.visibility = "visible";
                scrollbar.style.width = w + "%";

                scrollbar.style.left = l + "%";
                content.style.left = (-l * content.offsetWidth / 100) + "px";

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

                    diff = (100 * -pos1 / scrollrail.offsetWidth);
                    l = (l + diff).clamp(0, 100 - w);

                    scrollbar.style.left = l + "%";
                    content.style.left = (-l * content.offsetWidth / 100) + "px";
                }

                let wheel_the_scrollbar = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    delta = e.deltaY.clamp(-1, 1);

                    diff = (100 * delta * 20 / scrollrail.offsetWidth);
                    l = (l + diff).clamp(0, 100 - w);

                    scrollbar.style.left = l + "%";
                    content.style.left = (-l * content.offsetWidth / 100) + "px";
                }

                let attract_the_scrollbar = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    let pos = e.clientX;

                    diff = (100 * (pos - scrollrail.offsetLeft - scrollbar.offsetWidth / 2) / scrollrail.offsetWidth);
                    l = diff.clamp(0, 100 - w);

                    scrollbar.style.left = l + "%";
                    content.style.left = (-l * content.offsetWidth / 100) + "px";

                    scrollbar.onmousedown();
                }

                let stop_dragging = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    document.onmouseup = null;
                    document.onmousemove = null;
                    field.onwheel = wheel_the_scrollbar;
                }

                scrollbar.onmouseover = deactivate_rail;
                scrollrail.onmousedown = attract_the_scrollbar;
                scrollbar.onmousedown = start_dragging;
                scrollbar.onmouseout = activate_rail;
                field.onwheel = wheel_the_scrollbar;

                let start_dragging_touch = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    pos2 = e.touches[0].clientX;

                    document.ontouchend = stop_dragging_touch;
                    document.ontouchmove = drag_the_scrollbar_touch;
                    document.ontouchcancel = stop_dragging_touch;
                }

                let drag_the_scrollbar_touch = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    pos1 = pos2 - e.touches[0].clientX;
                    pos2 = e.touches[0].clientX;

                    diff = (100 * -pos1 / scrollrail.offsetWidth);
                    l = (l + diff).clamp(0, 100 - w);

                    scrollbar.style.left = l + "%";
                    content.style.left = (-l * content.offsetWidth / 100) + "px";
                }

                let stop_dragging_touch = (e) => {
                    e = e || window.event;
                    e.preventDefault();

                    document.ontouchend = null;
                    document.ontouchmove = null;
                }

                scrollbar.ontouchstart = start_dragging_touch;
            },
            resizeTranslate: (xl, xw) => {
                (xw < 100) ? l = (xl * (100 - w) / (100 - xw)).clamp(0, 100 - w): l = 0;

                scrollbar.style.left = l + "%";
                content.style.left = (-l * content.offsetWidth / 100) + "px";
            },
            scrollRight: () => {
                l = (100 - w);

                scrollbar.style.left = l + "%";
                content.style.left = (-l * content.offsetWidth / 100) + "px";
            },
            scrollLeft: () => {
                l = 0;

                scrollbar.style.left = l + "%";
                content.style.left = (-l * content.offsetWidth / 100) + "px";
            },
            isAtRight: () => l === (100 - w)
        };

        window.addEventListener('resize', () => {
            let xl = l;
            let xw = w;
            output.scrollerUpdate();
            output.resizeTranslate(xl, xw);
        });

        output.scrollerUpdate();

        return output;
    },
    createVertical: function(scrollbar, scrollrail, field, container, content) {
        let h, t;

        let output = {
            scrollerUpdate: () => {
                h = (100 * container.offsetHeight / content.offsetHeight).clamp(0, 100);
                t = (100 * -content.offsetTop / content.offsetHeight).clamp(0, 100 - h);

                (h >= 100) ? scrollrail.style.visibility = "hidden": scrollrail.style.visibility = "visible";
                scrollbar.style.height = h + "%";

                scrollbar.style.top = t + "%";
                content.style.top = (-t * content.offsetHeight / 100) + "px";

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

                scrollbar.onmouseover = deactivate_rail;
                scrollrail.onmousedown = attract_the_scrollbar;
                scrollbar.onmousedown = start_dragging;
                scrollbar.onmouseout = activate_rail;
                field.onwheel = wheel_the_scrollbar;
            },
            resizeTranslate: (xt, xh) => {
                (xh < 100) ? t = (xt * (100 - h) / (100 - xh)).clamp(0, 100 - h): t = 0;

                scrollbar.style.top = t + "%";
                content.style.top = (-t * content.offsetHeight / 100) + "px";
            },
            scrollToBottom: () => {
                t = (100 - h);

                scrollbar.style.top = t + "%";
                content.style.top = (-t * content.offsetHeight / 100) + "px";
            },
            scrollUp: () => {
                t = 0;

                scrollbar.style.top = t + "%";
                content.style.top = (-t * content.offsetHeight / 100) + "px";
            },
            isAtBottom: () => t === (100 - h)
        };

        window.addEventListener('resize', () => {
            let xt = t;
            let xh = h;
            output.scrollerUpdate();
            output.resizeTranslate(xt, xh);
        });

        output.scrollerUpdate();

        return output;
    }
};

Object.freeze(SCROLLBARS);