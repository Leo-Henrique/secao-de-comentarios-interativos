
export default function comments() {
    const listItens = Array.from(document.querySelectorAll(".comments-container > .comment-item"));

    class Comment {
        constructor(...dices) {
            this.content = dices[0],
            this.createdAt = dices[1],
            this.score = dices[2],
            this.image = dices[3],
            this.username = dices[4],
            this.replyingTo = dices[5]
        }
        setComment(li) {
            const infos = Object.keys(this);
            
            infos.forEach(info => {
                const elementWithInfo = li.querySelector(`[data-dice="${info}"]`);
                
                if (elementWithInfo) {
                    const isImageElement = elementWithInfo.getAttribute("data-dice") === "image";
                    const isContentElement =elementWithInfo.getAttribute("data-dice") === "content";
                    
                    if (isImageElement) {
                        const image = elementWithInfo.firstElementChild;

                        image.setAttribute("src", this["image"]);
                        image.setAttribute("alt", `Foto de perfil de ${this["username"]}`);
                    } else {
                        elementWithInfo.innerText = this[info];
                    }
                    if (isContentElement && this.replyingTo) {
                        const span = document.createElement("span");
                        span.classList.add("replying-to")
                        span.innerText = `@${this.replyingTo}`;

                        elementWithInfo.innerHTML = `${span.outerHTML} ${this[info]}`;
                    }
                }
            });
        }
    }

    const renderComments = (data) => {
        data.forEach((comment, index) => {
            const newComment = (object, li) => {
                const comment = new Comment(
                    object.content,
                    object.createdAt,
                    object.score,
                    object.user.image.png,
                    object.user.username,
                    object.replyingTo
                );
                comment.setComment(li);
            }
            const elements = listItens.filter((li => !li.classList.contains("comment-reply")));
            const answers = comment.replies;

            newComment(comment, elements[index]);
            if (answers.length >= 1) {
                const elements = listItens.filter((li => li.classList.contains("comment-reply")));

                answers.forEach((reply, index) => newComment(reply, elements[index]));
            }
        });
    }

    if (localStorage.comments) {
        const comments = JSON.parse(localStorage.comments);

        renderComments(comments);
    } else {
        const resource = "../../data.json";

        fetch(resource).then(res => res.json())
        .then(data => localStorage.comments = JSON.stringify(data.comments))
        .then(comments => renderComments(JSON.parse(comments)));
    }
}
comments();