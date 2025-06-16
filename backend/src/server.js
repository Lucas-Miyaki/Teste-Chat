const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let onlineUsers = new Map(); // Map<ws, {id, name}>

let rooms = new Map(); //Map<roomId, Set<ws>>

const bannedUserIds = new Set(); // <--- Armazena IDs de usuários banidos

function broadcastOnlineUsers(roomId) {
  const clientsInRoom = rooms.get(roomId);
  if (!clientsInRoom) return;

  // Array dos usuários online naquela sala
  const users = Array.from(clientsInRoom)
    .map(ws => onlineUsers.get(ws))
    .filter(Boolean)
    .map(u => ({ id: u.id, name: u.name }));

  const message = JSON.stringify({ type: 'onlineUsers', users });

  for (const client of clientsInRoom) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function broadcastMessage(roomId, messageObj, exceptWs = null) {
  const clientsInRoom = rooms.get(roomId);
  if (!clientsInRoom) return;

  const message = JSON.stringify(messageObj);

  for (const client of clientsInRoom) {
    if (client.readyState === WebSocket.OPEN && client !== exceptWs) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {

    ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'aviso':
          // Broadcast global
          const avisoMsg = JSON.stringify({ type: 'aviso', content: msg.content, duration: msg.duration });
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(avisoMsg);
            }
          });
          break;

        case 'ban-user':
        const targetId = msg.targetId;
        bannedUserIds.add(targetId); // Adiciona ID na lista de banidos

        for (const [client, userInfo] of onlineUsers.entries()) {
          if (userInfo.id === targetId) {
            const roomId = userInfo.roomId;

            // Remove cliente da sala atual
            const roomClients = rooms.get(roomId);
            if (roomClients) {
              roomClients.delete(client);
              if (roomClients.size === 0) {
                rooms.delete(roomId);
              }
            }

            // Remove cliente da lista de usuários online
            onlineUsers.delete(client);

            // Envia aviso de banimento e desconecta
            client.send(JSON.stringify({ type: 'banned', reason: 'Você foi banido por um administrador.' }));
            client.close();

            console.log(`Usuário ${userInfo.name} (${targetId}) foi banido e desconectado.`);

            // Atualiza lista para os demais usuários da sala
            broadcastOnlineUsers(roomId);

            break;
          }
        }
        break;

        case 'login':
          const { id, name, room, userColor } = msg;
          if (bannedUserIds.has(id)) {
            ws.send(JSON.stringify({ type: 'ban-notice', reason: 'Você foi banido pelo administrador.' }));
            ws.close();
            return;
          }

          onlineUsers.set(ws, { id, name, roomId: room, userColor });

          if (!rooms.has(room)) rooms.set(room, new Set());
          rooms.get(room).add(ws);

          broadcastOnlineUsers(room);
          break;

        case 'joinPrivateRoom':
          const { room: privateRoom, userId, userName, userColor: color } = msg;

          for (const [roomId, clients] of rooms.entries()) {
            if (clients.has(ws)) {
              clients.delete(ws);
              if (clients.size === 0) rooms.delete(roomId);
              else broadcastOnlineUsers(roomId);
            }
          }

            if (bannedUserIds.has(userId)) {
              ws.send(JSON.stringify({ type: 'ban-notice', reason: 'Você está banido e não pode entrar em salas.' }));
              ws.close();
              return;
            }

          if (!rooms.has(privateRoom)) rooms.set(privateRoom, new Set());
          rooms.get(privateRoom).add(ws);

          onlineUsers.set(ws, { id: userId, name: userName, roomId: privateRoom, userColor: color });

          broadcastOnlineUsers(privateRoom);
          break;

        case 'message':
          const user = onlineUsers.get(ws);
          if (!user) return;

          const messageObj = {
            type: 'message',
            userId: user.id,
            userName: user.name,
            userColor: user.userColor,
            content: msg.content,
            image: msg.image,
            gif: msg.gif,
            audio: msg.audio,
            video: msg.video,
            file: msg.file,
            fileName: msg.fileName,
            timestamp: msg.timestamp,
            privateTo: msg.privateTo || null
          };

          if (msg.privateTo) {
            for (const [client, u] of onlineUsers.entries()) {
              if (u.id === msg.privateTo || client === ws) {
                if (client.readyState === WebSocket.OPEN) {
                  const isSender = client === ws;
                  const messageForClient = {
                    ...messageObj,
                    isPrivate: true,
                    self: isSender,
                    toUserId: msg.privateTo
                  };
                  client.send(JSON.stringify(messageForClient));
                }
              }
            }
          } else {
            broadcastMessage(user.roomId, messageObj);
          }
          break;
      }

    } catch (e) {
      console.error('Erro no parse da mensagem:', e);
    }
  });



  ws.on('close', () => {
    const user = onlineUsers.get(ws);
    if (user) {
      const { roomId } = user;
      onlineUsers.delete(ws);

      const clientsInRoom = rooms.get(roomId);
      if (clientsInRoom) {
        clientsInRoom.delete(ws);
        if (clientsInRoom.size === 0) {
          rooms.delete(roomId);
        } else {
          broadcastOnlineUsers(roomId);
        }
      }
    }
  });
});

console.log('Servidor WebSocket rodando na porta 8080');