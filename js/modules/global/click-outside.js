let handleClickOutside;

export default function clickOutside(elements, callback, cancel) {
    const attr = "data-clickOutside";
    const handleElements = () => {
        elements.forEach(parent => {
            const children = parent.querySelectorAll("*");
            const allElements = [parent, ...children];

            if (!parent.hasAttribute(attr))
                allElements.forEach(element => element.setAttribute(attr, ""));
            else 
                allElements.forEach(element => element.removeAttribute(attr));
        });
    }
    const addEvents = (add) => {
        const names = ["mousedown", "touchstart"];

        names.forEach(event => {
            if (add)   
                document.addEventListener(event, handleClickOutside);
            else
                document.removeEventListener(event, handleClickOutside);
        });
    }

    handleElements();

    if (cancel)
        addEvents(false);
    else {
        handleClickOutside = ({target}) => {
            if (!target.hasAttribute(attr)) {
                callback(target);
                handleElements();
                addEvents(false);
            }
        }
        addEvents(true);
    }
}