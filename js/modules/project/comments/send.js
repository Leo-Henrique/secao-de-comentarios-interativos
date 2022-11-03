import clickOutside from "../../global/click-outside.js";
import elementAnimation from "../../global/element-animation.js";
import {Comment, Reply} from "./comment.js"
import {
    commentConditions,
    preventUsernameDeletion,
} from "./comment-conditions.js";


let allComments = document.querySelectorAll(".comments .comment-item");
const addCommentMain = document.getElementById("addComment");

const handleSend = ({target: btn}, replyingTo) => {
    allComments = document.querySelectorAll(".comments .comment-item");
    const addComment = btn.parentElement;
    const textarea = addComment.querySelector(".comment-input textarea");
    const send = () => {
        const data = {
            id: allComments.length + 1,
            createdAt: Date.now(),
            content: textarea.value,
            score: 0
        }
        const sendComment = () => {
            const comment = new Comment(data);
            const element = comment.create(true);
            
            comment.set(element);
            textarea.value = "";
        }
        const sendReply =  () => {
            data.replyingTo = replyingTo;
            const reply = new Reply(data);
            const element = reply.create(true);
            
            reply.set(element);
            closeAddComment(addComment);
        }
        addComment.hasAttribute("id") ? sendComment() : sendReply();
    }

    commentConditions({
        type: {
            isReply: !addComment.hasAttribute("id"),
            replyingTo,
        },
        submit: {
            btn,
            callback: send,
        },
        element: textarea,
    });
}

const showAddComment = (comment) => {
    const hasAddComment = (comment) => {
        const nextElement = comment.nextElementSibling;

        return !!(nextElement && nextElement.classList.contains("add-comment"))
    }
    let clone;
    const show = () => {
        clone = addCommentMain.cloneNode(true);
        const elements = {
            comment,
            clone,
            get commentElements() {
                return {
                    username: this.comment.querySelector("[data-dice='username']").innerText
                }
            },
            get cloneElements() {
                return {
                        textarea: this.clone.querySelector(".comment-input textarea"),
                        sendReply: this.clone.querySelector(".btn-send"),
                        elementsWithId: this.clone.querySelectorAll("[id]"),
                    }
            }
        }
        const {textarea, sendReply, elementsWithId} = elements.cloneElements;
        const {username: replyingTo} = elements.commentElements;
        
        allComments.forEach((element) => {
            if (hasAddComment(element)) 
                closeAddComment(element.nextElementSibling);
        });
        [clone, ...elementsWithId].forEach(element => element.removeAttribute("id"));
        comment.after(clone);
        elementAnimation({
            show: true,
            element: clone,
            duration: 300,
            callback() {
                clickOutside([comment, clone], () => closeAddComment(clone));
                return true;
            }
        });
        preventUsernameDeletion(textarea, replyingTo);
        textarea.setAttribute("placeholder", `Responda ${replyingTo}`);
        textarea.value = `@${replyingTo} `;
        textarea.focus();
        sendReply.innerText = "Responder";
        sendReply.addEventListener("click", (e) => handleSend(e, replyingTo));
    }
    const warning = () => {
        clone = comment.nextElementSibling;
        
        if (!clone.hasAttribute("data-transition")) {
            const left = "displacement-left"
            const right = "displacement-right";
            const duration = 200;

            clone.setAttribute("data-transition", "");
            clone.classList.add(left);
            setTimeout(() => clone.classList.add(right), duration);
            setTimeout(() => clone.classList.remove(left, right), duration * 2);
            setTimeout(() => clone.removeAttribute("data-transition"), duration * 3);
        }
    }

    !hasAddComment(comment) ? show() : warning();
}

const closeAddComment = (clone) => {
    elementAnimation({
        show: false,
        element: clone,
        duration: 300,
        callback() {
            setTimeout(() => clone.remove(), 300);
        }
    });
}

export default function handleEvents() {
    const sendComment = addCommentMain.querySelector("#btnSend");

    sendComment.addEventListener("click", handleSend);
    allComments.forEach(comment => {
        const btnReply = comment.querySelector(".btn-reply");

        if (btnReply)
            btnReply.addEventListener("click", () => showAddComment(comment));
    });
}
handleEvents();