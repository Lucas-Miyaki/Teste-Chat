import { login, cadastrarInfo, cadastrarEmail, auth, fs } from "./firebase.js";
import { startVideoCall, handleVideoOffer, handleVideoAnswer, handleIceCandidate, initVideoCallModule } from './call.js';
import { createMessageSelfElement, createMessageOtherElement } from "./messages.js"

const socket = new WebSocket('ws://localhost:8080');

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room') || 'default-room';

const user = { id: "", name:"", color: "" };
let selectedPrivateRecipient = null;
let onlineUsersCache = [];
let currentRoom = room;
const url = window.location.href;

const tempo = new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const ADMINS = ['1@gmail.com', 'admin@gmail.com'];
let userEmail = ''; // vai armazenar o email logado

initVideoCallModule(socket, user);

// Em eventos do socket:
socket.addEventListener('message', async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'video-offer' && msg.to === user.id) {
        await handleVideoOffer(msg);
    } else if (msg.type === 'video-answer' && msg.to === user.id) {
        await handleVideoAnswer(msg);
    } else if (msg.type === 'video-candidate' && msg.to === user.id) {
        await handleIceCandidate(msg);
    }
});

// login elements
const loginSection = document.querySelector(".card");
const loginName = loginSection.querySelector(".login__name");


// chat elements
const sidebar = document.querySelector(".sidebar")
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const privateChatHeader = document.getElementById("privateChatHeader");
const privateChatText = document.getElementById("privateChatText");
const exitPrivateChatBtn = document.getElementById("exitPrivateChatBtn");

const colors = [
    "aqua",
    "aquamarine",
    "blueviolet",
    "deeppink",
    "chocolate",
    "crimson",
    "gold",
    "hotpink",
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "chartreuse",
    "cyan",
    "firebrick"
]

document.getElementById('showRegister').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('card').classList.add('flipped');
});

document.getElementById('showLogin').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('card').classList.remove('flipped');
});

const createCallButton = (userId, userName) => {
    const btn = document.createElement("button");
    btn.textContent = "📞 Ligar";
    btn.style.marginLeft = "10px";
    btn.addEventListener("click", () => {
        startVideoCall(userId, userName);
    });
    return btn;
};

function getPrivateRoomId(userId1, userId2) {
  // Ordena para que o ID da sala seja sempre o mesmo, independente de quem criou
  return [userId1, userId2].sort().join('_');
}

function updatePrivateChatHeader() {
    if (selectedPrivateRecipient) {
        privateChatText.textContent = `Conversando com ${selectedPrivateRecipient.name}`;
        privateChatHeader.style.display = "flex";
    } else {
        privateChatHeader.style.display = "none";
    }
}

exitPrivateChatBtn.addEventListener("click", () => {
    selectedPrivateRecipient = null;
    updatePrivateChatHeader();

    // Voltar para sala pública
    socket.send(JSON.stringify({
        type: 'joinPrivateRoom',
        room: room, // sala pública padrão (ex: 'default-room')
        userId: user.id,
        userName: user.name,
        userColor: user.color
    }));
    currentRoom = room
    alert("Você saiu da conversa privada.");
});

// Receber lista de usuários online
socket.addEventListener('message', async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'banned') {
        alert(msg.reason || "Você foi banido pelo administrador.");
        socket.close();
        window.location.reload();
        return;
    }

    if (msg.type === "onlineUsers") {
        onlineUsersCache = msg.users;

        // Atualiza lista lateral de usuários (sem botão)
        const listContainer = document.getElementById('onlineUsersSidebarList');
        listContainer.innerHTML = '';
        msg.users.forEach(onlineUser => {
            const li = document.createElement('li');
            li.textContent = onlineUser.name;
            li.dataset.id = onlineUser.id;
            li.style.cursor = "pointer";

            // Se for admin, adiciona botão de banir para cada usuário (exceto ele mesmo)
            if (ADMINS.includes(userEmail) && onlineUser.id !== user.id) {
                const banBtn = document.createElement("button");
                banBtn.textContent = "🚫 Banir";
                banBtn.style.marginLeft = "10px";
                banBtn.addEventListener("click", () => {
                    if (confirm(`Tem certeza que deseja banir ${onlineUser.name}?`)) {
                        socket.send(JSON.stringify({
                            type: "ban-user",
                            targetId: onlineUser.id
                        }));
                    }
                });
                li.appendChild(banBtn);
            }
            listContainer.appendChild(li);
        });

        // Atualiza lista com botão de chamada
        const callListContainer = document.getElementById('callUsersSidebarList');
        callListContainer.innerHTML = '';
        msg.users.forEach(onlineUser => {
            const li = document.createElement('li');
            li.textContent = onlineUser.name;
            li.dataset.id = onlineUser.id;

            // Evita adicionar botão para o próprio usuário
            if (onlineUser.id !== user.id) {
                const callBtn = createCallButton(onlineUser.id, onlineUser.name);
                li.appendChild(callBtn);
            }

            callListContainer.appendChild(li);
        });
    } else if (msg.type === "aviso") {
        const avisosList = document.getElementById("avisosList");

        const li = document.createElement("li");
        li.textContent = msg.content;
        li.classList.add("aviso-item");

        // Se for admin, adiciona botão de remoção
        if (ADMINS.includes(userEmail)) {
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remover";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => {
                li.remove();
            });
            li.appendChild(removeBtn);
        }

        avisosList.appendChild(li);

    } else if (msg.type === "message") {
        const { userId, userName, userColor, content, image, gif, audio, video, file, fileName, timestamp, } = msg;

        const message = userId === user.id
            ? createMessageSelfElement(content, image, gif, audio, video, file, fileName, timestamp, msg.privateTo)
            : createMessageOtherElement(content, userName, userColor, image, gif, audio, video, file, fileName, timestamp, msg.privateTo);

        chatMessages.appendChild(message);
        scrollScreen();
    }
});

const loginButton = document.querySelector(".login__button");
const loginError = document.querySelector(".login-error");

loginButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const email = document.querySelector(".login__email").value;
    const password = document.querySelector(".login__password").value;
    const name = document.querySelector(".login__name").value;


    const result = await login(email, password);
    await cadastrarEmail(name, email)

    if (result.success) {
            userEmail = email;
            user.id = email;
            user.name = loginName.value;
            user.color = getRandomColor();
        
            loginSection.style.display = "none";
            chat.style.display = "flex";
            sidebar.style.display = "flex";
        
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "login", id: user.id, name: user.name, userColor: user.color, room }));
            } else {
                socket.addEventListener('open', () => {
                    socket.send(JSON.stringify({ type: "login", id: user.id, name: user.name, userColor: user.color, room }));
                });
            }
    } else {
        loginError.textContent = "Erro: " + result.message;
    }
    if (ADMINS.includes(userEmail)) {
        document.getElementById('adminAvisoPanel').style.display = "block";
    }
});

document.getElementById("avisoForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const aviso = document.getElementById("avisoInput").value.trim();

    if (!aviso) return;

    socket.send(JSON.stringify({
        type: 'aviso',
        content: aviso,
        duration: tempo  // envia tempo para o servidor/clientes
    }));

    document.getElementById("avisoInput").value = "";
});

document.querySelectorAll('.sidebar button').forEach(button => {
  button.addEventListener('click', () => {
    const panelId = button.getAttribute('data-panel');
    const panel = document.getElementById('panel-' + panelId);

    if (!panel) return;

    const isActive = panel.classList.contains('active');

    // Remove todas as abas ativas
    document.querySelectorAll('.sidebar-panel').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    if (!isActive) {
      panel.classList.add('active');
      panel.style.display = 'block';
    }
  });
});


window.addEventListener("DOMContentLoaded", () => {
  // Usuários Online – copia do painel original para o lateral
  const onlineOriginal = document.getElementById("onlineUsersSidebarList");
  const onlineSidebar = document.getElementById("onlineUsersSidebarList");

  const syncOnlineUsers = () => {
    onlineSidebar.innerHTML = onlineOriginal.innerHTML;
  };
  setInterval(syncOnlineUsers, 1000); // atualiza a cada 1s

  // Avisos – conteúdo e formulário
  const avisosOriginal = document.getElementById("avisosContent");
  const adminFormOriginal = document.getElementById("adminAvisoPanel");
  const avisosSidebar = document.getElementById("avisosSidebarContent");
  const formSidebar = document.getElementById("adminAvisoPanelSidebar");

  // Mover apenas uma vez após o carregamento
  if(avisosSidebar){
  avisosSidebar.appendChild(avisosOriginal);
  formSidebar.appendChild(adminFormOriginal);
  }
});

// Emojis
const emojiPicker = document.getElementById("emojiPicker");
const emojis = ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊","😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗","🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥","😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜","😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️","🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨","😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵","😡", "😠", "😷", "🤒", "🤕", "🤧", "😇","🥳", "🥸", "😈", "👿", "💀", "☠️", "👻", "👾", "🤖","🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾","🌀", "🌁", "🌂", "🌃", "🌄", "🌅", "🌆", "🌇", "🌈", "🌉", "🌌", "🌍", "🌎", "🌏", "🌐", "🌑", "🌒", "🌓","🌔", "🌕", "🌖", "🌗", "🌘", "🌙", "🌚", "🌛", "🌜", "🌝","🌞", "🌟", "🌠", "🌡", "🌢", "🌣", "🌤", "🌥", "🌦", "🌧","🌨", "🌩", "🌪", "🌭", "🌮", "🌯", "🌰", "🌱","🌲", "🌳", "🌴", "🌵", "🌶", "🌷", "🌸", "🌹", "🌺", "🌻","🌼", "🌽", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🍅","🍆", "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🍎", "🍏","🍐", "🍑", "🍒", "🍓", "🍔", "🍕", "🍖", "🍗", "🍘", "🍙","🍚", "🍛", "🍜", "🍝", "🍞", "🍟", "🍠", "🍡", "🍢", "🍣","🍤", "🍥", "🍦", "🍧", "🍨", "🍩", "🍪", "🍫", "🍬", "🍭","🍮", "🍯", "🍰", "🍱", "🍲", "🍳", "🍴", "🍵", "🍶", "🍷","🍸", "🍹", "🍺", "🍻", "🍼", "🍽", "🍾", "🍿", "🎀", "🎁","🎂", "🎄", "🎅", "🎆", "🎇", "🎈", "🎉", "🎊", "🎌","🎍", "🎏", "🎐", "🎑", "🎒", "🎓", "🎔", "🎕", "🎖","🎗", "🎜", "🎝", "🎠","🎡", "🎢", "🎣", "🎤", "🎥", "🎦", "🎧", "🎨", "🎩", "🎪","🎫", "🎬", "🎭", "🎮", "🎯", "🎰", "🎱", "🎲", "🎳", "🎴","🎵", "🎶", "🎷", "🎸", "🎹", "🎺", "🎻", "🎼", "🎽", "🎾","🎿", "🏀", "🏁", "🏂", "🏃", "🏄", "🏅", "🏆", "🏇", "🏈","🏉", "🏊", "🏋", "🏌", "🏏", "🏐", "🏑", "🏒","🏓", "🏠", "🏡", "🏢", "🏣", "🏤", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭","🏱", "🏲", "🏳", "🏴", "🏶", "🏸", "🏹", "🏺", "🐀", "🐁", "🐂", "🐃", "🐄","🐅", "🐆", "🐇", "🐈", "🐉", "🐊", "🐋", "🐌", "🐍", "🐎","🐏", "🐐", "🐑", "🐒", "🐓", "🐔", "🐕", "🐖", "🐗", "🐘","🐙", "🐚", "🐛", "🐜", "🐝", "🐞", "🐟", "🐠", "🐡", "🐢","🐣", "🐤", "🐥", "🐦", "🐧", "🐨", "🐩", "🐪", "🐫", "🐬","🐭", "🐮", "🐯", "🐰", "🐱", "🐲", "🐳", "🐴", "🐵", "🐶","🐷", "🐸", "🐹", "🐺", "🐻", "🐼", "🐾", "👀", "👆", "👇", "👈", "👉", "👊","👋", "👌", "👍", "👎", "👏", "👒", "👓", "👔","👕", "👖", "👗", "👘", "👚", "👜", "👞","👟", "👠", "👢", "👣", "👤", "👥", "👦", "👧", "👨","👩", "👫", "👬", "👭", "👮", "👯", "👰", "👱", "👲","👳", "👴", "👵", "👶", "💁","💂", "💃", "💄", "💉", "💊", "💋", "💍", "💎", "💐", "💒", "💓", "💔", "💕","💖", "💗", "💘", "💙", "💚", "💛", "💜", "💝", "💞", "💟","💠", "💡", "💢", "💣", "💤", "💥", "💦", "💧", "💨","💪", "💫", "💬", "💭", "💮", "💯", "💰", "💱", "💲", "💳","💴", "💵", "💶", "💷", "💸", "💹", "💺", "💻", "💼","💾", "💿", "📁", "📂", "📃", "📄", "📅", "📆", "📇","📈", "📉", "📊", "📋", "📌", "📍", "📎", "📏", "📐", "📑","📒", "📓", "📔", "📕", "📖", "📝", "📞", "📟", "📠", "📡", "📢", "📣", "📤", "📥","📦", "📧", "📨", "📩", "📪", "📫", "📬", "📭", "📮", "📯","📰", "📱", "📲", "📳", "📴", "📵", "📶", "📷", "📸", "📹","📺", "📻", "📼", "📽", "📾", "📿", "🔀", "🔁", "🔂", "🔃","🔄", "🔅", "🔆", "🔇", "🔈", "🔉", "🔊", "🔋", "🔌", "🔍","🔎", "🔏", "🔐", "🔑", "🔒", "🔓", "🔔", "🔕", "🔖", "🔗","🔘", "🔙", "🔚", "🔛", "🔜", "🔝", "🔥", "🔦", "🔧", "🔨", "🔩", "🔪", "🔫","🔬", "🔭", "🔮", "🔰", "🔱", "🔲", "🔳", "🔴", "🔵","🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "🔼", "🔽", "🕋", "🕌", "🕍", "🕐", "🕑", "🕒", "🕓","🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝","🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧", "🕴", "🕵", "🕶", "🕷", "🕸", "🕺", "🕻", "🕽", "🖂", "🖈", "🖉","🖐", "🖑", "🖒", "🖓", "🖖", "🖤", "🗲","🗴", "🗵", "🗷", "🗸", "🗹", "🗺", "🗻", "🗼", "🗽", "🗿", "🙅", "🙆", "🙇", "🙋", "🙌","🙍", "🙎", "🙼", "🙽", "🙾","🙿", "🚀", "🚓", "🚔", "🚕", "🚖", "🚗", "🚘", "🚙", "🚚", "🚛", "🚜", "🚥", "🚦","🚧", "🚨", "🚩", "🚪", "🚫", "🚬", "🚭", "🚮", "🚯", "🚰","🚱", "🚲", "🚳", "🚴", "🚵", "🚶", "🚷", "🚸", "🛑", "🛒", "🛝", "🛟", "🛫", "🛬","🛵", "🛹"];
const toggleEmojiPicker = document.querySelector(".toggleEmojiPicker")
toggleEmojiPicker.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
    if (emojiPicker.innerHTML.trim() === "") {
        emojis.forEach(emoji => {
            const span = document.createElement("span");
            span.textContent = emoji;
            span.style.cursor = "pointer";
            span.style.fontSize = "1rem";
            span.style.margin = "1px";
            span.onclick = () => insertEmoji(emoji);
            emojiPicker.appendChild(span);
        });
    }
})

function insertEmoji(emoji) {
    chatInput.value += emoji;
    chatInput.focus();
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

document.getElementById('onlineUsersSidebarList').addEventListener('click', (e) => {
    const targetId = e.target.dataset.id;
    if (!targetId || targetId === user.id) return;

    const recipient = onlineUsersCache.find(u => u.id === targetId);
    if (recipient) {
        selectedPrivateRecipient = recipient;

        // Cria ID da sala privada
        const privateRoomId = getPrivateRoomId(user.id, selectedPrivateRecipient.id);

        // Envia joinPrivateRoom para o servidor
        socket.send(JSON.stringify({
            type: 'joinPrivateRoom',
            room: privateRoomId,
            userId: user.id,
            userName: user.name,
            userColor: user.color
        }));
        currentRoom = privateRoomId
        updatePrivateChatHeader();
    }
});


const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        type: "message",
        room: currentRoom,
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value.replace(/</g,"&lt;").replace(/>/g,"&gt;").trim(),
        image: selectedImageBase64,
        gif: selectedGifBase64,
        audio: selectedAudioBase64,
        video: selectedVideoBase64,
        file: selectedGenericFile,
        fileName: selectedGenericFileName,
        timestamp: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        privateTo: selectedPrivateRecipient?.id || null
    };

    socket.send(JSON.stringify(message));

    chatInput.value = "";
    selectedImageBase64 = null;
    selectedGifBase64 = null;
    selectedAudioBase64 = null;
    selectedVideoBase64 = null;
    selectedGenericFile = null;
    selectedGenericFileName = "";

    const audio = document.getElementById('audioPreview');
    audio.style.display = "none";
    emojiPicker.style.display = "none";
    const pdfPreview = document.getElementById("pdfPreview");
    pdfPreview.style.display = "none";

    document.getElementById('fileLink').style.display = "none";
    document.getElementById('output').src = "";
    document.getElementById('audioPreview').src = "";
    document.getElementById('videoPreview').src = "";
    document.getElementById('videoPreview').style.display = "none";
    
};

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await cadastrarInfo(user.name, user.id, chatInput.value, url, tempo);
    sendMessage(event);
});