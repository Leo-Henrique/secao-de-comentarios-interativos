let timeouts = [];
export default function message(message, time, error = true) {
    const element = document.querySelector(".messages");
    const text = element.querySelector(".text");
    const elementTransition = 300;
    const messageType = () => {
        const icon = element.querySelector(".icon");
        
        if (error) {
            element.classList.remove("success");
            element.classList.add("error");
            icon.innerText = "!";
        } else {
            element.classList.remove("error");
            element.classList.add("success");
            icon.innerHTML= "&check;"
        }
    }

    if (!element.hasAttribute("data-transition")) {
        const closeMessage = () => {
            element.setAttribute("data-transition", "");
            element.classList.remove("show");
            element.style.setProperty("--timeBar-duration", `${elementTransition}ms`);

            setTimeout(() => {
                element.removeAttribute("data-transition");
                element.classList.remove("display", "finally");
            }, elementTransition);
        }
        const showMessage = () => {
            element.setAttribute("data-transition", "");
            text.innerText = message;
            element.classList.add("display");

            if (timeouts.length >= 1) {
                timeouts = [];
            }
            timeouts.push(setTimeout(() => {
                messageType();
                element.classList.add("show");
                element.style.setProperty("--timeBar-duration", `${time}ms`);
    
                timeouts.push(setTimeout(() => element.removeAttribute("data-transition"), elementTransition));
                timeouts.push(setTimeout(() => element.classList.add("finally"), time - 200));
                timeouts.push(setTimeout(closeMessage, time));
            }, 20));
        }
        if (!element.classList.contains("show")) {
            showMessage();
        } else {
            closeMessage();
            timeouts.forEach(id => clearTimeout(id));
            setTimeout(showMessage, elementTransition);
        }
    }
}