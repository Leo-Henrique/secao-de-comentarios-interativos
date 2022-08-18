import message from "./message.js";
export const modal = document.querySelector(".modal");
const modalTransition = 300;
let clickOutside;
let escapeKey;
     
const modalRequired = () => {
    if (!modal.hasAttribute("data-transition")) {
        modal.setAttribute("data-transition", "");
        modal.classList.add("required");
        setTimeout(() => modal.classList.remove("required"), modalTransition);
        setTimeout(() => modal.removeAttribute("data-transition"), modalTransition * 2);
    }
}
export const openModal = (required) => {
    if (!modal.hasAttribute("data-transition")) {
        modal.setAttribute("data-transition", "");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", true);
        modal.removeAttribute("aria-hidden");
        modal.classList.add("display");
        setTimeout(() => modal.classList.add("show"), 20);
        setTimeout(() => modal.removeAttribute("data-transition"), modalTransition + 20);

        if (required) {
            clickOutside = (event) => {
                if (event.target === modal) 
                    modalRequired();
            }
            escapeKey = (event) => {
                if (event.key === "Escape") 
                    modalRequired();
            }
        } else {
            clickOutside = (event) => {
                if (event.target === modal) 
                    closeModal();
            }
            escapeKey = (event) => {
                if (event.key === "Escape") 
                    closeModal();
            }
        }
        document.addEventListener("mousedown", clickOutside);
        document.addEventListener("keydown", escapeKey);
    }
}
export function closeModal() {
    if (!modal.hasAttribute("data-transition")) {
        modal.setAttribute("data-transition", "");
        modal.setAttribute("aria-hidden", true);
        modal.removeAttribute("role");
        modal.removeAttribute("aria-modal");
        modal.classList.remove("show");
        setTimeout(() => {
            modal.classList.remove("display");
            modal.removeAttribute("data-transition");

            document.removeEventListener("mousedown", clickOutside);
            document.removeEventListener("keydown", escapeKey);

        }, modalTransition);
    }
}
export default function handleModal() {
    if (!localStorage.profileCreated) 
        window.addEventListener("load", () => openModal(true));
}
handleModal();