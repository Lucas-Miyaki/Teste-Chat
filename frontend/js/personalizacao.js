// === ELEMENTOS ===
const formaMsg = document.getElementById('forma-msg');
const corTexto = document.getElementById('cor-texto');
const corFundoMsg = document.getElementById('cor-fundo-msg');
const bordaEspessura = document.getElementById('borda-espessura');
const bordaCor = document.getElementById('borda-cor');
const bordaEstilo = document.getElementById('borda-estilo');
const fundoChat = document.getElementById('fundo-chat');
const previewChat = document.getElementById('preview-chat');
const fonte = document.getElementById('fonte');
const tamanhoFonte = document.getElementById('tamanhoFonte');
const negrito = document.getElementById('negrito');
const italico = document.getElementById('italico');
const usarGradiente = document.getElementById('usarGradiente');
const gradienteInicio = document.getElementById('gradienteInicio');
const gradienteFim = document.getElementById('gradienteFim');
const alinhamento = document.getElementById('alinhamento');
const paddingMsg = document.getElementById('paddingMsg');
const imagemFundoChat = document.getElementById('imagemFundoChat');

const chatPrincipal = document.querySelector('.site');
const mensagensPreview = document.querySelectorAll('.message') || [];

// === SALVA PERSONALIZAÇÕES ===
function salvarPersonalizacao() {
    localStorage.setItem("corTexto", corTexto.value);
    localStorage.setItem("corFundoMsg", corFundoMsg.value);
    localStorage.setItem("bordaEspessura", bordaEspessura.value + "px");
    localStorage.setItem("bordaCor", bordaCor.value);
    localStorage.setItem("bordaEstilo", bordaEstilo.value);
    localStorage.setItem("fonte", fonte.value);
    localStorage.setItem("tamanhoFonte", tamanhoFonte.value + "px");
    localStorage.setItem("negrito", negrito.checked);
    localStorage.setItem("italico", italico.checked);
    localStorage.setItem("alinhamento", alinhamento.value);
    localStorage.setItem("paddingMsg", paddingMsg.value + "px");
    localStorage.setItem("usarGradiente", usarGradiente.checked);
    localStorage.setItem("gradienteInicio", gradienteInicio.value);
    localStorage.setItem("gradienteFim", gradienteFim.value);
    localStorage.setItem("imagemFundoChat", imagemFundoChat.value);
    localStorage.setItem("fundoChat", fundoChat.value);
    localStorage.setItem("formaMsg", formaMsg.value);
}

// === APLICA ESTILOS ÀS MENSAGENS ===
function aplicarEstiloMensagens(mensagens) {
    mensagens.forEach(msg => {
        msg.classList.remove('retangular', 'arredondada', 'bolha');
        msg.classList.add(formaMsg.value);

        msg.style.color = corTexto.value;
        msg.style.border = `${bordaEspessura.value}px ${bordaEstilo.value} ${bordaCor.value}`;
        msg.style.fontFamily = fonte.value;
        msg.style.fontSize = tamanhoFonte.value + "px";
        msg.style.fontWeight = negrito.checked ? "bold" : "normal";
        msg.style.fontStyle = italico.checked ? "italic" : "normal";
        msg.style.textAlign = alinhamento.value;
        msg.style.padding = paddingMsg.value + "px";

        if (usarGradiente.checked) {
            msg.style.background = `linear-gradient(to right, ${gradienteInicio.value}, ${gradienteFim.value})`;
        } else {
            msg.style.background = corFundoMsg.value;
        }
    });
}

// === APLICA TEMA GLOBAL (variáveis CSS do site) ===
function aplicarTemaGlobal() {
    const bgColor = localStorage.getItem("background-color");
    const textColor = localStorage.getItem("text-color");
    const primaryColor = localStorage.getItem("primary-color");

    if (bgColor) document.documentElement.style.setProperty("--background-color", bgColor);
    if (textColor) document.documentElement.style.setProperty("--text-color", textColor);
    if (primaryColor) document.documentElement.style.setProperty("--primary-color", primaryColor);
}

// === APLICA PERSONALIZAÇÕES GERAIS (mensagens + fundo) ===
function atualizarPreview() {
    const mensagensChatPrincipal = document.querySelectorAll('.message'); // ← movido pra dentro
    aplicarEstiloMensagens(mensagensPreview);
    aplicarEstiloMensagens(mensagensChatPrincipal);
    
    const fundo = imagemFundoChat.value
        ? `url(${imagemFundoChat.value}) center/cover no-repeat`
        : fundoChat.value;

    if (previewChat) previewChat.style.background = fundo;
    if (chatPrincipal) chatPrincipal.style.background = fundo;

    salvarPersonalizacao();
    aplicarTemaGlobal();
}

// === LISTENERS PARA CORES DO SITE ===
document.getElementById("fundo-chat").addEventListener("change", (e) => {
    const value = e.target.value;
    document.documentElement.style.setProperty("--background-color", value);
    localStorage.setItem("background-color", value);
});

document.getElementById("cor-texto").addEventListener("change", (e) => {
    const value = e.target.value;
    document.documentElement.style.setProperty("--text-color", value);
    localStorage.setItem("text-color", value);
});

document.getElementById("cor-fundo-msg").addEventListener("change", (e) => {
    const value = e.target.value;
    document.documentElement.style.setProperty("--primary-color", value);
    localStorage.setItem("primary-color", value);
});

// === MONITORAMENTO DE INPUTS ===
const inputs = [
    formaMsg, corTexto, corFundoMsg, bordaEspessura, bordaCor, bordaEstilo,
    fundoChat, fonte, tamanhoFonte, negrito, italico,
    usarGradiente, gradienteInicio, gradienteFim,
    alinhamento, paddingMsg, imagemFundoChat
];

inputs.forEach(el => {
    if (el) {
        el.addEventListener("input", atualizarPreview);
        el.addEventListener("change", atualizarPreview);
    }
});

// === APLICA AO CARREGAR A PÁGINA ===
document.addEventListener("DOMContentLoaded", () => {
  aplicarTemaGlobal();
  atualizarPreview();

  const botaoAbaChat = document.querySelector(".menu__item[data-tab='chat']");
  if (botaoAbaChat) {
    botaoAbaChat.addEventListener("click", atualizarPreview);
  }
});

aplicarTemaGlobal();
atualizarPreview();