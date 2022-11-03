import Modal from "../global/modal.js"
import message from "../global/message.js";
import removeErrorWarning from "../global/remove-error-warning.js";

let profile;
const handleModal = () => {
    const configs = {
        create: {
            required: true,
            title: "Crie seu perfil de usuário!",
            content: "profile",
            btnConfirm: {
                text: "Criar meu perfil"
            }
        },
        edit: {
            required: false,
            title: "Editar meu perfil de usuário",
            content: "profile",
            btnCancel: {
                text: "Cancelar"
            },
            btnConfirm: {
                text: "Confirmar"
            }
        },
    }

    if (!localStorage.currentUser) {
        profile = new Modal(configs.create);
        window.addEventListener("load", () => profile.open());
    } else
        profile = new Modal(configs.edit);
}
handleModal();

const btnProfile = document.getElementById("editProfile");
const profileAttr = "data-profile";
let addEvents;
const handleForm = () => {
    const elements = {
        content: profile.modal.querySelector(`.${profile.content}`),
        get image() {return this.content.querySelector(".profile-pic img")},
        get inputImage() {return this.content.querySelector("#addUserpic")},
        get inputUsername() {return this.content.querySelector("#addUsername")}
    }
    const {content, image, inputImage, inputUsername} = elements;
    const {element: btnConfirm} = profile.btnConfirm;
    
    const handleImage = () => {
        const imageChange = (callback) => {
            const labelImage = content.querySelector(".profile-pic");
            
            labelImage.classList.add("transition");
            setTimeout(() => {
                callback();
                labelImage.classList.remove("transition");
            }, 300);
        }
        const imageRemove = () => {
            const btnRemove = content.querySelector("#profilePicRemove");
            const defaultImage = "images/user-profile-pic.svg";

            const remove = ({target}) => {
                imageChange(() => {
                    inputImage.value = "";
                    image.setAttribute("src", defaultImage);
                    target.classList.remove("active");
                    target.removeEventListener("click", remove);
                });
            }
            const imageChanged = new MutationObserver(handleButton);
            imageChanged.observe(image, {attributes: true, attributeFilter: ["src"]});

            function handleButton(mutation) {
                const image = mutation[0].target;
                const currentSrc = image.getAttribute("src");

                if (!btnRemove.classList.contains("active") && currentSrc !== defaultImage) {
                    btnRemove.classList.add("active");
                    btnRemove.addEventListener("click", remove);
                } 
            }
        }
        imageRemove();

        const fileChange = () => {
            const fileUploaded = inputImage.files[0];

            if (fileUploaded) {
                if (fileUploaded.type.includes("image")) {
                    const reader = new FileReader();
        
                    imageChange(() => {
                        reader.readAsDataURL(fileUploaded);
                        reader.addEventListener("load", (e) => image.setAttribute("src", e.target.result));
                    })
                } else {
                    inputImage.value = "";
                    message({
                        show: true,
                        error: true,
                        text: "Por favor, selecione um arquivo que contenha um formato de imagem.",
                        time: 5000,
                    });
                }
            }
        }
        inputImage.addEventListener("input", fileChange);
    }
    handleImage();

    const handleData = () => {
        const userImage = image.getAttribute("src");
        const username = inputUsername.value;
        let currentUser;
        
        if (localStorage.currentUser)
            currentUser = JSON.parse(localStorage.currentUser)

        const standardUsernames = async () => {
            const usernames = (comments) => {
                const commentsWithReplies = comments.filter(comment => {
                    return comment.replies.length >= 1
                });
                let replies = [];
                commentsWithReplies.forEach(comment => comment.replies.forEach(reply => replies.push(reply)));
                const allComments = [...comments, ...replies];
                const commentsWithUsernames = allComments.filter(comment => comment.user);
                const usernames = commentsWithUsernames.map(comment => comment.user.username);

                return usernames.filter(name => name !== "juliusomo");
            }

            if (!localStorage.comments) {
                return fetch("./data.json").then(res => res.json())
                .then(data => usernames(data.comments));
            } else
                return usernames(JSON.parse(localStorage.comments));
        }

        (async () => {
            const error = (text, time, focus = true) => {
                if (focus) {
                    inputUsername.focus();
                    inputUsername.classList.add("error");
                    removeErrorWarning([inputUsername, btnConfirm]);
                }

                message({
                    show: true,
                    error: true,
                    text,
                    time,
                });
            }
            const allowedCharacters = (/^[A-Za-z\-\_]+$/).test(username);
            const existingUsernames = await standardUsernames();
            const sameData = () => {
                if (currentUser) {
                    const currentImage = currentUser.image;
                    const currentUsername = currentUser.username;
                
                    return currentImage === userImage && currentUsername === username;
                }
            };

            if (username === "")
                error("Você deve mencionar um nome de usuário antes de continuar!", 3500);

            else if (username.length < 3)
                error("Seu nome de usuário deve ter no mínimo 3 caracteres.", 3500);

            else if (username.includes(" "))
                error("Seu nome de usuário não pode conter espaços.", 3500);

            else if (!allowedCharacters)
                error("Seu nome de usuário deve conter apenas letras (sem acentuações), hifens (-) e sublinhados (_).", 6000);

            else if (existingUsernames.includes(username))
                error("O nome de usuário já está sendo utilizado. Por favor, escolha outro nome.", 5000)

            else if (sameData()) 
                error("Você deve alterar ao menos uma informação para salvar as alterações.", 4000, false);

            else
                releaseUser();
        })();

        function releaseUser()  {
            const success = (text, time, data, closeCallback) => {
                const closeModal = setTimeout(() => {
                    if (closeCallback)
                        profile.close(closeCallback);
                    else
                        profile.close();
                }, time);
                const save = () => {
                    localStorage.currentUser = JSON.stringify(data);
                }

                message({
                    show: true,
                    error: false,
                    text,
                    time,
                });
                profile.closeCallStack = closeModal;
                save();
            }
            const createUser = () => {
                const data = {
                    image: userImage,
                    username,
                    createdAt: Date.now(),
                }

                profile.required = false;
                btnProfile.setAttribute(profileAttr, "created");
                success("Perfil criado com sucesso! Clique no seu nome de usuário após essa janela se fechar para alterá-lo quando quiser.", 6000, data, changeLabels);
            }
            const changeUser = () => {
                currentUser.image = userImage,
                currentUser.username = username;
                
                btnProfile.setAttribute(profileAttr, true);
                success("Perfil atualizado com sucesso!", 2000, currentUser);
            }

            btnConfirm.setAttribute("disabled", "");
            
            !currentUser ? createUser() : changeUser();
        }
    }

    addEvents = (profile) => {
        const {callbacks: confirmCallbacks} = profile.btnConfirm;

        confirmCallbacks.push(handleData);

        if (localStorage.currentUser) {
            const {callbacks: cancelCallbacks} = profile.btnCancel;

            cancelCallbacks.push(() => profile.close());
        }
    }
    addEvents(profile);

    function changeLabels() {
        const labels = Object.values({
            image: content.querySelector(".profile-pic .label"),
            username: inputUsername.previousElementSibling,
        });
    
        labels.forEach(label => {
            let text = label.innerText;
            const removeWords = ["Adicione", "(opcional)", "*"];
            
            removeWords.forEach(word => text = text.replace(word, "").trim());
            text = text.charAt(0).toUpperCase() + text.slice(1);
    
            label.innerText = text;
        });
    }
    if (localStorage.currentUser)
        changeLabels()
}
handleForm();

export const renderUserInfo = () => {
    if (localStorage.currentUser) {
        const imageElements = document.querySelectorAll(`[data-user="image"] img`);
        const usernameElements = document.querySelectorAll(`[data-user="username"]`);
        const {image, username} = JSON.parse(localStorage.currentUser);

        imageElements.forEach(element => {
            element.setAttribute("src", image);
            element.setAttribute("alt", `Sua foto de perfil, ${username}`);
        });
        usernameElements.forEach(element => {
            if (element.tagName === "INPUT")
                element.value = username;
            else {
                element.innerText = username;
                element.setAttribute("title", username);
            }
        });
    }
}
renderUserInfo();

export default function handleProfileChange() {
    const btnProfile = document.getElementById("editProfile");

    btnProfile.addEventListener("click", () => profile.open());   

    (() => {
        const change = ([mutation]) => {
            const currentAttr = mutation.target.getAttribute(profileAttr);
    
            renderUserInfo();
            if (currentAttr === "created") {
                handleModal();
                addEvents(profile);
            }
        }
        const check = new MutationObserver(change);
        const configs = {
            attributes: true,
            attributeFilter: [profileAttr],
        }
    
        check.observe(btnProfile, configs);
    })();
}
handleProfileChange();