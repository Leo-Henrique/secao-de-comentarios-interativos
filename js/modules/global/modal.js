import message from "./message.js";

const animationDuration = 300;
let clickOutside;
let escapeKey;

export default class Modal {
    constructor(object) {
        const standardElements = () => {
            const modal = document.querySelector(".modal");
            const btns = Object.keys(this).filter(key => key.startsWith("btn"));

            this.modal = modal;
            btns.forEach(name => {
                const className = name.toLowerCase().replace("btn", "btn-");
                const element = this.modal.querySelector(`.${className}`);

                this[name].element = element;
                this[name].callbacks = [];
            });
        }

        this.configs.forEach(config => {
            if (object[config]) 
                this[config] = object[config];
        });
        standardElements();
    }
    get configs() {
        return [
            "required", 
            "content", 
            "title", 
            "description",
            "btnCancel", 
            "btnConfirm",
            "closeCallStacks"
        ];
    }
    events(set) {
        const standards = () => {
            if (set) {
                const warning = () => {
                    const element = this.modal;
        
                    if (!element.hasAttribute("data-transition")) {
                        element.setAttribute("data-transition", "");
                        element.classList.add("required");
                        setTimeout(() => element.classList.remove("required"), animationDuration);
                        setTimeout(() => element.removeAttribute("data-transition"), animationDuration * 2);
                    }
                }
                const trigger = (condition) => {
                    const callback = (callback) => {
                        if (condition)
                            callback();
                    }
                    this.required ? callback(warning) : callback(() => this.close());
                }
                
                clickOutside = ({target}) => trigger(target === this.modal);
                escapeKey = ({key}) => trigger(key === "Escape");
            }
            const events = {
                mousedown: clickOutside,
                touchstart: clickOutside,
                keydown: escapeKey
            }
    
            Object.keys(events).forEach(event => {
                if (set)
                    document.addEventListener(event, events[event]);
                else
                    document.removeEventListener(event, events[event]);
            });
        }
        standards();
        const buttons = Object.keys(this).filter(key => key.startsWith("btn"));
        
        buttons.forEach(name => {
            const btn = this[name].element;
            const callbacks = this[name].callbacks;
            btn.removeAttribute("disabled");

            if (set)
                callbacks.forEach(callback => btn.addEventListener("click", callback));
            else
                callbacks.forEach(callback => btn.removeEventListener("click", callback));
        });
    }
    open()  {
        const element = this.modal;
        this.setContent();

        if (!element.hasAttribute("data-transition")) {
            element.setAttribute("data-transition", "");
            element.setAttribute("role", "dialog");
            element.setAttribute("aria-modal", true);
            element.removeAttribute("aria-hidden");
            element.classList.add("display");
            document.body.classList.add("modal-scrollbar");
            setTimeout(() => element.classList.add("show"), 20);
            setTimeout(() => element.removeAttribute("data-transition"), animationDuration + 20);
            this.events(true);
        }
    }
    close(callback) {
        const element = this.modal;
        const callStack = this.closeCallStack;
        
        message({show: false});

        if (callStack)
            clearTimeout(callStack);

        if (!element.hasAttribute("data-transition")) {
            element.setAttribute("data-transition", "");
            element.setAttribute("aria-hidden", true);
            element.removeAttribute("role");
            element.removeAttribute("aria-modal");
            element.classList.remove("show");
            document.body.classList.remove("modal-scrollbar");
            setTimeout(() => {
                element.classList.remove("display");
                element.removeAttribute("data-transition");
                this.events(false);

                if (callback)
                    callback();
            }, animationDuration);
        }
    }
    setContent() {
        const elements = {
            dialog: this.modal.querySelector(".modal-dialog"),
            title: this.modal.querySelector("#modalLabel"),
            contents: Array.from(this.modal.querySelectorAll(".modal-body")),
            contentClass: this.content,
            get content() {
                return this.contents.filter(content => content.classList.contains(this.contentClass))[0];
            },
            get description() {
                return this.content;
            },
            buttons: Object.keys(this).filter(key => key.startsWith("btn")),
        }
        const {dialog, title, contents, content, buttons, description} = elements;
        const classesInDialog = Array.from(dialog.classList);
        const filterClassesInDialog = classesInDialog.filter(name => name.startsWith("dialog"));
        
        filterClassesInDialog.forEach(name => dialog.classList.remove(name));
        dialog.classList.add(`dialog-${this.content}`);
        title.innerText = this.title;
        contents.forEach(content => content.classList.remove("show"));
        content.classList.add("show");
        buttons.forEach(name => this[name].element.innerText = this[name].text);
        if (this.content === "confirmation")
            description.innerText = this.description;
    }
}