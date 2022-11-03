"use strict";

const container = document.getElementById("loading");
const show = () => {
    container.classList.add("display");
    document.body.classList.add("loading-scrollbar");
    setTimeout(() => container.classList.add("show"), 20);
}
const hidden = () => {
    container.classList.remove("show");
    setTimeout(() => {
        container.classList.remove("display");
        document.body.classList.remove("loading-scrollbar");
    }, 200);
}

show();
window.addEventListener("pageshow", hidden);