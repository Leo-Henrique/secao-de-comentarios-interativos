import {Comment, Reply} from "./comment.js";

const firstRender = () => {
    const btnProfile = document.getElementById("editProfile");
    const profileAttr = "data-profile";
    const profileCreated = new MutationObserver(saveAndRender);
    const configs = {
        attributes: true,
        attributeFilter: [profileAttr]
    }
    function saveAndRender([mutation]) {
        const currentAttr = mutation.target.getAttribute(profileAttr);

        if (currentAttr === "created") {
            const saveUserComment = () => {
                const currentUser = JSON.parse(localStorage.currentUser);
                const userComment = document.querySelector(`[data-user="comment"]`);

                currentUser.commentHTML = userComment.innerHTML;
                localStorage.currentUser = JSON.stringify(currentUser);
            }
            const standardComments = async () => {
                const response = await fetch("./data.json");
                const data = await response.json();
                const comments = data.comments;
                
                localStorage.comments = JSON.stringify(comments);
                render(comments);
            }

            saveUserComment();
            standardComments();
            profileCreated.disconnect();
        }
    }

    profileCreated.observe(btnProfile, configs);
}

const render = (comments) => {
    const commentElement = document.querySelectorAll(".comment-container > .comment-item");
    const replyElement = document.querySelectorAll(".comment-replies > .comment-item");
    const handleRender = (isReply, data, index) => {
        let comment;
        let element;

        if (!isReply) {
            comment = new Comment(data);
            element = commentElement[index];

        } else {
            comment = new Reply(data);
            element = replyElement[index];
        }
        element ? comment.set(element) : comment.set(comment.create());
    }

    comments.forEach((data, index) =>  {
        const replies = data.replies;

        handleRender(false, data, index);

        if (replies.length >= 1) {
            if (data.id !== 2)
                replies.forEach(reply => handleRender(true, reply, null));
            else {
                replies.forEach((reply, index, array) => {
                    handleRender(true, reply, index)

                    if (array.length <= 1) {
                        replyElement[1].remove();
                    }
                });
            }

        }
    });
}

export default function handleRenders() {
    if (!localStorage.comments)
        firstRender();
    else
        render(JSON.parse(localStorage.comments));
}
handleRenders();