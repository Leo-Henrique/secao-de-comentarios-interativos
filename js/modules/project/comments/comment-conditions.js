import message from "../../global/message.js";
import removeErrorWarning from "../../global/remove-error-warning.js";

export function preventUsernameDeletion(textarea, username) {
    const prevent = () => {
        const replyingTo = `@${username} `

        if (textarea.value.length <= replyingTo.length)
            textarea.value = replyingTo;
    }
    textarea.addEventListener("input", prevent);
}

export function commentConditions(configs) {
    const {editing, isReply, replyingTo} = configs.type;
    const {btn, callback} = configs.submit;
    const {element: textarea} = configs;
    const error = (text, time) =>  {
        textarea.focus();
        textarea.classList.add("error");
        removeErrorWarning([textarea, btn]);

        message({
            show: true,
            error: true,
            text,
            time,
        });
    }
    const {empty, minimum} = {
        content: textarea.value,
        isReply(replyCallback, mainCallback) {
            if (isReply)
                return replyCallback();
            else
                return mainCallback();
        },
        get replyingTo() {
            if (isReply)
                return replyingTo.length + 2; // characters @ + one escape in textarea value
        },
        get empty() {
            const reply = () => this.content.length <= this.replyingTo;
            const main = () => this.content === "";

            return this.isReply(reply, main);
        },
        get minimum() {
            const min = 3;
            const reply = () => this.content.length < this.replyingTo + min;
            const main = () => this.content.length < min;

            return this.isReply(reply, main);
        }
    }
    const {emptyMsg, minimumMsg} = {
        get emptyMsg() {
            if (editing)
                return "Você não pode deixar seu comentário vazio.";
            else
                return "Você não pode postar um comentário vazio.";
        },
        get minimumMsg() {
            return "Seu comentário deve ter no mínimo 3 caracteres.";
        }
    }

    if (empty)
        error(emptyMsg, 3000);
    else if (minimum)
        error(minimumMsg, 3000);
    else
        callback();
}