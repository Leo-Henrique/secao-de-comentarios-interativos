import {modal, openModal, closeModal} from "./modal.js"
import message from "./message.js";

export default function profile() {
    const modalBody = modal.querySelector(".modal-body-profile");
    const image = modalBody.querySelector(".profile-pic img");
    const inputImage = modalBody.querySelector("#addUserpic");
    const inputUsername = modalBody.querySelector("#addUsername");
    const btnConfirm = modalBody.querySelector(".btn-confirm");

    const setUserInfos = () => {
        const setInfos = (object) => {
            const userImages = document.querySelectorAll(`[data-user="image"] img`);
            const username = document.querySelectorAll(`[data-user="username"]`);

            userImages.forEach(element => {
                element.setAttribute("src", object.image);
                element.setAttribute("alt", `Foto de perfil de ${object.username}`);
            });
            username.forEach(element => element.innerText = object.username);
        }

        if (localStorage.currentUser) {
            setInfos(JSON.parse(localStorage.currentUser));
        } else {
            const resource = "../../data.json";

            fetch(resource).then(res => res.json())
            .then(data => localStorage.currentUser = JSON.stringify(data.currentUser))
            .then(currentUser => setInfos(JSON.parse(currentUser)));
        }
    }
    setUserInfos();


    const handleImage = () => {
        const imageChange = (callback) => {
            const labelImage = modalBody.querySelector(".profile-pic");
            
            labelImage.classList.add("transition");
            setTimeout(() => {
                callback();
                labelImage.classList.remove("transition");
            }, 300);
        }
        const imageRemove = () => {
            const btnRemove = modalBody.querySelector("#profilePicRemove");
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
                    message("Por favor, selecione um arquivo que contenha um formato de imagem.", 5500);
                }
            }
        }
        inputImage.addEventListener("input", fileChange);
    }
    handleImage();


    const handleUsername = () => {
        const value = inputUsername.value;
        const userImage = image.getAttribute("src");
        const existingUsernames = async () => {
            let comments = JSON.parse(localStorage.comments);
            const replies =  comments.map(comment => {
                if (comment.replies.length >=1 ) {
                    return comment.replies.filter(reply => reply);
                }
            }).filter(replies => replies)[0];
            comments = [...comments, ...replies];

            return comments.map(comment => comment.user.username);
        }
        const releaseUser = () => {
            const messages = document.querySelector(".messages");

            if (!messages.classList.contains("success")) {
                const currentUser = JSON.parse(localStorage.currentUser);
                const currentImage = image.getAttribute("src");
                const currentUsername =  inputUsername.value;
                let time;

                inputUsername.classList.remove("error");
                currentUser.image = currentImage;
                currentUser.username = currentUsername;
                localStorage.currentUser = JSON.stringify(currentUser);
                btnConfirm.setAttribute("disabled", "");
                setUserInfos();

                if (!localStorage.profileCreated) {
                    time = 6000;
                    localStorage.profileCreated = true;

                    message("Perfil criado com sucesso! Clique no seu nome de usuário após essa janela se fechar para alterá-lo quando quiser.", time, false);
                    setTimeout(closeModal, time);

                } else {
                    time = 2000;

                    message("Perfil atualizado com sucesso!", time, false);
                    setTimeout(closeModal, time);
                }
            }
        }

        (async () => {
            const error = (msg, time) => {
                inputUsername.focus();
                inputUsername.classList.add("error");
                message(msg, time);
            }
            const canContain = !(/^[A-Za-z\-\_]+$/).test(value);
            const usernames = await existingUsernames();
            const currentUser = JSON.parse(localStorage.currentUser);
            const sameInformations = currentUser.image === userImage && currentUser.username === value;

            if (value === "")
                error("Você deve mencionar um nome de usuário antes de continuar!", 3500);
            else if (value.length < 3)
                error("Seu nome de usuário deve ter no mínimo 3 caracteres.", 3500);
            else if (value.includes(" "))
                error("Seu nome de usuário não pode conter espaços.", 3500);
            else if (canContain)
                error("Seu nome de usuário deve conter apenas letras, hifens (-) e sublinhados (_).", 5000);
            else if (usernames.includes(value))
                error("O nome de usuário já está sendo utilizado. Por favor, escolha outro nome.", 5000)
            else if (sameInformations) 
                error("Você deve alterar ao menos uma informação para salvar as alterações.", 4000);
            else
                releaseUser();
        })();
    }
    inputUsername.addEventListener("input", () => inputUsername.classList.remove("error"));
    btnConfirm.addEventListener("click", handleUsername);


    const handleProfileEditing = () => {
        const btnEdit = document.getElementById("editProfile");
        const setUserInfos = () => {
            if (localStorage.profileCreated) {
                const editModal = () => {
                    const modalTitle = document.getElementById("modalLabel");
                    const labels = Object.values({
                        image: modalBody.querySelector(".profile-pic .label"),
                        username: inputUsername.previousElementSibling,
                    });
                    const btnCancel = modalBody.querySelector(".btn-cancel");
    
                    modalTitle.innerText = "Editar meu perfil de usuário";
                    labels.forEach(label => {
                        const text = () => {
                            const text = label.innerText.replace("Adicione", "").trim();
        
                            return text.charAt(0).toUpperCase() + text.slice(1);
                        }
                        label.innerText = text();
                    });
                    btnCancel.removeAttribute("disabled");
                    btnCancel.addEventListener("click", closeModal);
                    btnConfirm.innerText = "Confirmar"
                }
                const {image: userImage, username} = JSON.parse(localStorage.currentUser);
    
                editModal();
                image.setAttribute("src", userImage);
                image.setAttribute("alt", `Foto de perfil de ${username}`);
                inputUsername.value = username;
            }
        }
        setUserInfos();

        btnEdit.addEventListener("click", () => {
            setUserInfos();
            openModal(false);
            btnConfirm.removeAttribute("disabled");
        });
    }
    handleProfileEditing();
}
profile();