const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room') || 'default-room';
let currentRoom = room;
const url = window.location.href;

function generateRoomId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for(let i=0; i<length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

document.getElementById('createGroupBtn').addEventListener('click', () => {
    alert ("Cada grupo que criar terá um link único")
    const newRoomId = generateRoomId();
    const newUrl = `${window.location.origin}?room=${newRoomId}`;
    window.open(newUrl, '_blank'); // <-- Abre em nova aba
});


function getPrivateRoomId(userId1, userId2) {
  // Ordena para que o ID da sala seja sempre o mesmo, independente de quem criou
  return [userId1, userId2].sort().join('_');
}