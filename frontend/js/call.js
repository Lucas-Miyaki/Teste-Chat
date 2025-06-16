// /video/video-call.js
let localStream = null;
let peerConnection = null;
let isInCall = false;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const videoCallPanel = document.getElementById("videoCallPanel");
const videoCallUserName = document.getElementById("videoCallUserName");
const endCallBtn = document.getElementById("endCallBtn");

const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

let socket, user, selectedPrivateRecipient;

// Função para iniciar a chamada
export async function startVideoCall(recipientId, recipientName) {
    selectedPrivateRecipient = { id: recipientId, name: recipientName };
    videoCallUserName.textContent = recipientName;
    videoCallPanel.style.display = "block";
    isInCall = true;

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.send(JSON.stringify({
                type: 'video-candidate',
                to: recipientId,
                from: user.id,
                candidate: event.candidate
            }));
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.send(JSON.stringify({
        type: 'video-offer',
        offer,
        to: recipientId,
        from: user.id,
        name: user.name
    }));
}

export async function handleVideoOffer(msg) {
    selectedPrivateRecipient = { id: msg.from, name: msg.name };
    videoCallUserName.textContent = msg.name;
    videoCallPanel.style.display = "block";
    isInCall = true;

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.send(JSON.stringify({
                type: 'video-candidate',
                to: msg.from,
                from: user.id,
                candidate: event.candidate
            }));
        }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.send(JSON.stringify({
        type: 'video-answer',
        answer,
        to: msg.from,
        from: user.id
    }));
}

export async function handleVideoAnswer(msg) {
    const remoteDesc = new RTCSessionDescription(msg.answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}

export async function handleIceCandidate(msg) {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } catch (e) {
            console.error("Erro ao adicionar ICE candidate:", e);
        }
    }
}

export function endCall() {
    if (peerConnection) peerConnection.close();
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    peerConnection = null;
    localStream = null;
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    videoCallPanel.style.display = "none";
    isInCall = false;
}

export function initVideoCallModule(ws, currentUser) {
    socket = ws;
    user = currentUser;
    endCallBtn.addEventListener("click", endCall);
}

