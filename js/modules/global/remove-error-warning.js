export default function removeErrorWarning(parents) {
    const input = parents[0];
    const attr = "data-removeError";
    const remove = () => input.classList.remove("error");

    if (!input.hasAttribute(attr)) {
        parents.forEach(parent => {
            const children = parent.querySelectorAll("*");
            const elements = [parent, ...children];

            elements.forEach(element => element.setAttribute(attr, ""));
        });
        document.addEventListener("click", handleClickOutside);
        input.addEventListener("input", remove);
    } 

    function handleClickOutside(event) {
        if (!event.target.hasAttribute(attr)) {
            remove();
            parents.forEach(parent => {
                const children = parent.querySelectorAll("*");
                const elements = [parent, ...children];
    
                elements.forEach(element => element.removeAttribute(attr));
            });
            document.removeEventListener("click", handleClickOutside);
            input.removeEventListener("input", remove);
        }
    }
}