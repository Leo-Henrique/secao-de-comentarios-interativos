export default function elementAnimation({show, element, duration, delay, callback}) {
    const height = element.scrollHeight + "px"
    const display = () => {
        element.classList.add("hidden");
        element.style.height = 0;
        
        setTimeout(() => {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.add("show");
            element.style.height = height;
        }, 20);

        setTimeout(() => {
            element.style.removeProperty("height");

            if (callback)
                callback();
        }, duration + 20);
    }
    const hide = () => {
        element.style.height = height;
        element.style.transitionDuration = `${duration}ms`;

        setTimeout(() => {
            element.classList.remove("show");
            element.style.height = 0;
        }, 20);

        if (callback)
            setTimeout(callback, duration + 20);
    }
    const run = (callback) => {
        !delay ? callback() : setTimeout(callback, delay);
    }

    show ? run(display) : run(hide);
}