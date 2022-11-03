import CommentDate from "./date.js";
import elementAnimation from "../../global/element-animation.js";
import Modal from "../../global/modal.js";
import message from "../../global/message.js";
import {renderUserInfo} from "../profile.js";
import clickOutside from "../../global/click-outside.js";
import {
    commentConditions,
    preventUsernameDeletion,
} from "./comment-conditions.js";


export class Comment {
    constructor(data) {
        this.infos.forEach(info => {
            if (data[info] !== undefined) 
                this[info] = data[info];
            else (!data.replies)
                this["replies"] = [];
       });
    }
    get infos() {
        return [
            "id",  
            "user",
            "createdAt", 
            "content", 
            "score",
        ];
    }
    get setEachInfo() {
        return {
            id: (info, element) => {
                element.setAttribute("id", this[info]);
            },
            image: (info, element) => {
                const image = element.firstElementChild;

                image.setAttribute("src", this.user[info]);
                image.setAttribute("alt", `Foto de perfil de ${this[info]}`);
            },
            username: (info, element) => {
                element.setAttribute("title", this.user[info]);
                element.innerText = this.user[info]; 
            },
            createdAt: (info, element) => {
                const createdAt = this[info];
                const handleInitialComment = () => {
                    const date = +createdAt.match(/\d+/)[0];
                    const period = () => {
                        let text = createdAt.replace((/\d+/), "")
                        text = text.replace("ago", "").trim();
    
                        if (date > 1)
                            return text.replace(text.slice(-1), "");
                        else
                            return text;
                    }
                    const commentDate = new CommentDate(true, date, period())
    
                    element.innerText = commentDate.time;
                }
                const handleUserComment = () => {
                    const commentDate = new CommentDate(false, createdAt);
                    const {second, minute, hour} = commentDate.periods;
                    const intervals = {
                        agora: second * 15,
                        segundo: second * 15,
                        minuto: minute,
                        hora: hour
                    }
                    const periods = Object.keys(intervals);
                    const updateTime = () => {
                        element.classList.add("change");
                        setTimeout(() => {
                            element.innerText = commentDate.time;
                            element.classList.remove("change");
                        }, 200)
                    };
                    let interval;
                    const handlePeriod = (MutationRecord) => {
                        const text = MutationRecord[0].addedNodes[0].textContent;

                        clearInterval(interval);
                        periods.forEach(period => {
                            if (text.includes(period)) {
                                interval = setInterval(updateTime, intervals[period]);
                            }
                        });                      
                    }

                    periods.forEach(period => {
                        if (commentDate.time.includes(period)) {
                            const observeCreationDate = new MutationObserver(handlePeriod);
                            
                            observeCreationDate.observe(element, {childList: true, characterData: true});
                        }
                    })
                    element.innerText = commentDate.time;
                }

                if (typeof createdAt === "string")
                    handleInitialComment();
                else
                    handleUserComment();
            },
            default: (info, element) => {
                element.innerText = this[info];
            }
        }
    }
    set(element) {
        const commentInfo = Object.keys(this);
        const attr = "data-dice";
        const handleEachInfo = (infoElement) => {
            if (infoElement) {
                const eachInfo = Object.keys(this.setEachInfo);
                const info = infoElement.getAttribute(attr);

                if (eachInfo.includes(info))
                    this.setEachInfo[info](info, infoElement);
                else 
                    this.setEachInfo.default(info, infoElement);
            }
        }

        commentInfo.forEach(info => {
            if (info === "id") {
                handleEachInfo(element);

            } else if (info === "user") {
                const image = element.querySelector(`[${attr}="image"]`);
                const username = element.querySelector(`[${attr}="username"]`);

                handleEachInfo(image);
                handleEachInfo(username);

            } else {
                const infoElement = element.querySelector(`[${attr}="${info}"]`);

                handleEachInfo(infoElement);
            }
        });

        (() => {
            const events = ["delete", "edit"];
            const setEvents = (event, name, btn) => {
                const parents = event.composedPath().filter(element => element.parentElement);
                const comment = parents.filter(element => element.classList.contains("comment-item"))[0];
                const container = comment.parentElement;
                const elements = {
                    element: comment,
                    container,
                    btn
                }
                this[name](elements);
            }
            events.forEach(name => {
                const btn = element.querySelector(`.btn-${name}`);

                if (btn)
                    btn.addEventListener("click", (event) => setEvents(event, name, btn));
            });
            this.votes(element);
        })();
    }
    get savedComments() {
        return JSON.parse(localStorage.comments);
    }
    get globalActions() {
        return {
            create(element, callback) {
                const show = () => {
                    const duration = 300;
                    const btnsContainer = element.querySelector(".comment-btns");
                    const showBtns = () => {    
                        btnsContainer.style.transitionDuration = `${duration}ms`;
                        btnsContainer.classList.add("show");
                    }
                    const animationConfigs = {
                        show: true,
                        element,
                        duration,
                        callback: showBtns,
                    }
        
                    callback();
                    renderUserInfo();
                    btnsContainer.classList.remove("show");
                    elementAnimation(animationConfigs);
                    element.scrollIntoView({block: "center", behavior: "smooth"});
                }
                const {commentHTML} = JSON.parse(localStorage.currentUser);
        
                element.classList.add("comment-item");
                element.setAttribute("data-dice", "id");
                element.setAttribute("data-user", "comment");
                element.innerHTML = commentHTML;
        
                setTimeout(show);
            },
            async save(comments) {
                try {
                    localStorage.comments = JSON.stringify(comments);
                }
                catch {
                    message({
                        show: true,
                        error: true,
                        text: "Desculpe, não foi possível salvar as alterações.",
                        time: 3000
                    });
                }
            },
            delete: (element, removeElement) => {
                const configs = {
                    required: false,
                    content: "confirmation",
                    title: "Excluir comentário",
                    description: "Tem certeza de que deseja excluir este comentário? Isso o excluirá definitivamente e não poderá ser desfeito.",
                    btnCancel: {
                        text: "Não, cancelar"
                    },
                    btnConfirm: {
                        text: "Sim, excluir"
                    }
                }
                const modal = new Modal(configs);
                const {callbacks: cancelCallbacks} = modal.btnCancel;
                const {callbacks: confirmCallbacks} = modal.btnConfirm;
        
                cancelCallbacks.push(() => modal.close());
                confirmCallbacks.push(() => modal.close(confirmed));
                modal.open();
                
                const confirmed = () => {
                    const commentIdRemoved = +element.id;
                    const remove = (animationDuration) => {
                        const update = ({comment, index, array}, saveChange) => {
                            const updateIDs = () => {
                                const allElements = Array.from(document.querySelectorAll(".comment-item"));
                                const comments = JSON.parse(localStorage.comments);
                                const changeId = (comment) => {
                                    if (+comment.id > commentIdRemoved)
                                        comment.id -= 1;
                                }
                                
                                [...allElements, ...comments].forEach(comment => {
                                    changeId(comment)

                                    if (comment.replies && comment.replies.length >= 1)
                                        comment.replies.forEach(reply => changeId(reply));
                                });
                                this.globalActions.save(comments);
                            }
                            const success = () => {
                                const animationConfigs = {
                                    show: false,
                                    element,
                                    duration: animationDuration,
                                    callback: () => removeElement()
                                }
                                const btnsContainer = element.querySelector(".comment-btns");

                                updateIDs();
                                btnsContainer.style.transitionDuration = `${100}ms`;

                                btnsContainer.classList.remove("show");
                                elementAnimation(animationConfigs);
                                message({
                                    show: true,
                                    error: false,
                                    text: "Seu comentário foi excluído!",
                                    time: 3000
                                });
                            }
                            const error = () => {
                                message({
                                    show: true,
                                    error: true,
                                    text: "Desculpe, não foi possível excluir seu comentário. Por favor, atualize a página e tente novamente.",
                                    time: 5000
                                });
                            }

                            array.splice(index, 1);
                            saveChange();
                            !array.includes(comment) ? success() : error();
                        }

                        this.changeComment(commentIdRemoved, update);
                    }
                    const commentVisible = ([entries]) => {
                        const animationDuration = 300;

                        if (entries.isIntersecting) {
                            setTimeout(() => {
                                remove(animationDuration);
                                commentRemoved.disconnect();
                            }, animationDuration * 2)
                        }
                    }
                    const commentRemoved = new IntersectionObserver(commentVisible);
                    
                    element.scrollIntoView({block: "center", behavior: "smooth"});
                    commentRemoved.observe(element, {threshold: 1.0});
                }  
            },
            edit: (element, btnEdit, replaceContent, callbackAfterDisplay) => {
                const content = element.querySelector(`[data-dice="content"]`);
                const contentHeight = content.offsetHeight;
                const contentContainer = content.parentElement;
                const transitionDuration = 300;
                let textarea;
                let updateBtn;
        
                const showEditing = () => {
                    textarea = document.createElement("textarea");
                    const characters = content.innerText.length;
                    const handleHeight = () => {
                        const breakpoint = matchMedia("(max-width: 575.98px)").matches;
                        let textareaHeight = 115;
            
                        if (contentHeight > textareaHeight || breakpoint)
                            textareaHeight = 150;
            
                        textarea.style.height = `${contentHeight}px`;
                        setTimeout(() => textarea.style.height = `${textareaHeight}px`);
                    }
                    const handleBtnUpdate = () =>  {
                        updateBtn = document.createElement("button");
        
                        updateBtn.id = "updateBtn";
                        updateBtn.innerText = "Atualizar";
                        contentContainer.appendChild(updateBtn);
                        updateBtn.addEventListener("click", handleUpdate);
                        elementAnimation({
                            show: true,
                            element: updateBtn,
                            duration: transitionDuration,
                        });
                    }
        
                    btnEdit.setAttribute("disabled", "");
                    textarea.innerText = content.innerText;
                    textarea.setAttribute("data-dice", "content");
                    textarea.setAttribute("spellcheck", true);
                    contentContainer.replaceChild(textarea, content);
                    textarea.setSelectionRange(characters, characters);
                    textarea.focus();
                    textarea.classList.add("edit");
                    handleHeight();
                    handleBtnUpdate();
                    setTimeout(() => {
                        textarea.classList.add("scrollbar");
                        textarea.scrollTop = textarea.scrollHeight;
                        clickOutside([element], cancel);
                        
                    }, transitionDuration);

                    if (callbackAfterDisplay)
                        callbackAfterDisplay(textarea);
                }
                const closeEditing = (newContent) => {
                    textarea.classList.remove("edit");
                    textarea.style.height = `${contentHeight}px`;
                    setTimeout(() => {
                        contentContainer.replaceChild(content, textarea);
                        btnEdit.removeAttribute("disabled");

                        if (newContent) {
                            const update = ({comment}, saveChange) => {
                                const infos = {
                                    contentElement: content,
                                    contentObject: comment,
                                    newContent,
                                }
    
                                replaceContent(infos);
                                saveChange();
                            }

                            this.changeComment(element.id, update);

                        }
                    }, transitionDuration);
        
                    elementAnimation({
                        show: false,
                        element: updateBtn,
                        duration: transitionDuration,
                        callback: () => updateBtn.remove(),
                    });
                    return true;
                }
                const cancelEditing = () => {
                    const configs = {
                        required: true,
                        content: "confirmation",
                        title: "Cancelar alterações",
                        description: "Tem certeza que deseja cancelar as alterações no seu comentário? Todo texto não salvo será perdido.",
                        btnCancel: {
                            text: "Continuar editando"
                        },
                        btnConfirm: {
                            text: "Cancelar as alterações"
                        }
                    }
                    const modal =  new Modal(configs);
                    const {callbacks: cancelCallbacks} = modal.btnCancel;
                    const {callbacks: confirmCallbacks} = modal.btnConfirm;
                    const keep = () => {
                        textarea.scrollIntoView({block: "center", behavior: "smooth"});
                        textarea.focus();
                        clickOutside([element], cancel);
                    }
        
                    cancelCallbacks.push(() => modal.close(keep));
                    confirmCallbacks.push(() => modal.close(closeEditing));
                    modal.open();
                }
                const cancel = () => {
                    content.innerText === textarea.value ? closeEditing() : cancelEditing();
                }
                const handleUpdate = () => {
                    const isReply = () => {
                        const parent = element.parentElement;

                        return parent.classList.contains("comment-replies");
                    }
                    const submit = () => {
                        clickOutside([element], null, true);
                        closeEditing(textarea.value);
                    }

                    commentConditions({
                        type: {
                            editing: true,
                            isReply: isReply(),
                            replyingTo: this.replyingTo,
                        },
                        submit: {
                            btn: updateBtn,
                            callback: submit,
                        },
                        element: textarea,
                    });
                }
        
                showEditing();
            }
        }
    }
    changeComment(id, callback) {
        const comments = JSON.parse(localStorage.comments);
        const saveChange = () => this.globalActions.save(comments);

        comments.forEach((comment, index, array) => {
            if (comment.id == id) {
                callback({comment, index, array}, saveChange);

            } else if (comment.replies.length) {
                comment.replies.forEach((comment, index, array) => {
                    if (comment.id == id)
                        callback({comment, index, array}, saveChange);
                });
            }
        });
    }
    create(save) {
        const container = document.querySelector(".comments");
        const parent = document.createElement("li");
        const element = document.createElement("div");
        const insert = () => container.appendChild(parent);

        parent.classList.add("comment-container");
        parent.appendChild(element);
        this.globalActions.create(element, insert);
        if (save) {
            const comments = JSON.parse(localStorage.comments);

            comments.push(this);
            this.globalActions.save(comments);
        }

        return element;
    }
    delete({element, container}) {
        const removeElement = () => container.remove();

        this.globalActions.delete(element, removeElement);
    }
    edit({element, btn: btnEdit}) {
        const replaceContent = ({contentElement, contentObject, newContent}) => {
            contentElement.innerText = newContent;
            contentObject.content = newContent;
        }

        this.globalActions.edit(element, btnEdit, replaceContent);
    }
    votes(element) {
        const container = element.querySelector(".comment-votes");
        const btnPlus = container.querySelector(".btn-plus");
        const btnMinus = container.querySelector(".btn-minus");
        const allBtns = [btnPlus, btnMinus];
        const handleCommentUser = () => {
            const warning = () => {
                message({
                    show: true,
                    error: true,
                    text: "Você não pode votar no seu próprio comentário!",
                    time: 3000
                });
            }

            allBtns.forEach(btn => btn.addEventListener("click", warning));
        }
        const handleVoting = () => {
            const handleBtns = ({comment}, saveChange) => {
                const votingKey = "voted";
                const scoreElement = container.querySelector(`[data-dice="score"]`);
                const buttons = new MutationObserver(updateButtons);
                let activeBtn;
                let inactiveBtn;
                function updateButtons() {
                    const btns = {
                        get activeBtn() {
                            return !comment[votingKey] ? btnPlus : btnMinus;
                        },
                        get inactiveBtn() {
                            return allBtns.filter(btn => btn !== this.activeBtn)[0];
                        }
                    }
                    activeBtn = btns.activeBtn;
                    inactiveBtn = btns.inactiveBtn;
                }
                updateButtons();
                buttons.observe(scoreElement, {childList: true});

                const changeScore = () => {
                    if (!scoreElement.hasAttribute("data-transition")) {
                        const transition = 300;
                        const show = () => {
                            const score = comment.score;
                            const change = (operation) => {
                                scoreElement.innerText = operation;
                                comment.score = operation;
        
                                if (operation > score)
                                    comment[votingKey] = true;
                                else 
                                    delete comment[votingKey];
        
                                saveChange();
                            }
    
                            activeBtn === btnPlus ? change(score + 1) : change(score - 1);
                            activeBtn.setAttribute("disabled", "");
                            inactiveBtn.removeAttribute("disabled", "");
                            inactiveBtn.addEventListener("click", changeScore);
                            scoreElement.classList.remove("change");
                            setTimeout(() => scoreElement.removeAttribute("data-transition"), transition);
                        }
    
                        scoreElement.setAttribute("data-transition", "")
                        scoreElement.classList.add("change");
                        setTimeout(show, transition)
                    }
                }

                activeBtn.addEventListener("click", changeScore);
                inactiveBtn.setAttribute("disabled", "");
            }

            this.changeComment(element.id, handleBtns);
        }

        element.hasAttribute("data-user") ? handleCommentUser() : handleVoting();
    }
}

export class Reply extends Comment {
    constructor(data) {
        super(data);
        this.replyingTo = data.replyingTo;
        this.content = data.content.replace(`@${data.replyingTo} `, "");
    }
    get setEachInfo() {
        const infos = super.setEachInfo;
        const newInfos = {
            replyingTo: (info, element) => {
                element.innerText = `@${this[info]}`;
            },
            content: (info, element) => {
                const replyingToElement = element.firstElementChild;
    
                element.innerHTML = `${replyingToElement.outerHTML} ${this[info]}`;
            }
        }
        const newInfosNames = Object.keys(newInfos);

        newInfosNames.forEach(name => infos[name] = newInfos[name]);
        return infos;
    }
    get baseComment() {
        const allComments = Array.from(document.querySelectorAll(".comment-item"));
        const commentReplied = allComments.filter(comment => {
            const username = comment.querySelector(`[data-dice="username"]`);

            if (username)
                return username.innerText === this.replyingTo;
        })[0];
        const container = commentReplied.parentElement;
        const baseComment = {};

        if (container.classList.contains("comment-container"))
            baseComment["element"] = container.firstElementChild;
        else
            baseComment["element"] = container.previousElementSibling;

        JSON.parse(localStorage.comments).forEach((comment, index) => {
            if (comment.id === +baseComment.element.id) {
                baseComment["object"] = comment;
                baseComment["index"] = index;
            }
        });
            
        return baseComment;
    }
    create(save) {
        const {element: baseComment} = this.baseComment;
        let {container, replyContainer, element} = {
            container: baseComment.parentElement,
            get replyContainer() {
                return this.container.lastElementChild;
            },
            element: document.createElement("li"),
        }
        const hasReplyContainer = replyContainer.classList.contains("comment-replies");

        if (!hasReplyContainer) {
            replyContainer = document.createElement("ol");
            replyContainer.classList.add("comment-replies");
            container.appendChild(replyContainer);
        }
        
        this.globalActions.create(element, () => replyContainer.appendChild(element));
        if (save) {
            const comments = JSON.parse(localStorage.comments);
            const {index: baseIndex} = this.baseComment;
            
            comments[baseIndex].replies.push(this);
            this.globalActions.save(comments);
        }

        return element;
    }
    delete({element, container}) {
        const removeElement = () => {
            const replies = container.querySelectorAll(".comment-item");

            replies.length <= 1 ? container.remove() : element.remove();
        }

        this.globalActions.delete(element, removeElement);
    }
    edit({element, btn: btnEdit}) {
        const replaceContent = ({contentElement, contentObject, newContent}) => {
            const replyingToHTML = contentElement.firstElementChild.outerHTML;
            newContent = newContent.replace(`@${this.replyingTo}`, "").trim();

            contentElement.innerHTML = `${replyingToHTML} ${newContent}`;
            contentObject.content = newContent;
        }
        const callbackAfterDisplay = (textarea) => {
            preventUsernameDeletion(textarea, this.replyingTo);
        }

        this.globalActions.edit(element, btnEdit, replaceContent, callbackAfterDisplay);
    }
}