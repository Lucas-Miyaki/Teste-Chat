import { cadastrarUsuario } from "./firebase.js";

const signup = document.querySelector(".signup");

const signupButton = document.querySelector(".signup__button");
const signupError = document.querySelector(".signup-error");

signupButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const email = document.querySelector(".signup__email").value;
    const password = document.querySelector(".signup__password").value;

    const result = await cadastrarUsuario(email, password);

    if (result.success) {
        const nome = document.querySelector(".signup__name").value;
        const firebaseUser = auth.currentUser;
        await salvarPerfilUsuario(firebaseUser .uid, nome);

        signupError.textContent = "Usuário criado com sucesso! Agora faça login.";
    } else {
        signupError.textContent = "Erro: " + result.message;
    }
});