import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import express from 'express'


const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

interface Player {
  socket: WebSocket;
  playerName?: string;
  online: boolean;
  playing?: boolean;
}

interface Room {
  player1: Player;
  player2: Player;
}

const allUsers: Record<string, Player> = {};
const allRooms: Room[] = [];

const getrandom = () => {
  return Math.floor(Math.random() * 1000000) + 1
}

wss.on("connection", (socket) => {
  console.log("Client connected")
  const id = getrandom(); // Generate a unique ID for the socket
  allUsers[id] = { socket, online: true };

  socket.on('message', (message) => {
    const data = JSON.parse(message.toString())

    if (data.type === 'request to play') {
      handleRequestToPlay(id, data);
    } else if (data.type === 'playerMoveFromClient') {
      handlePlayerMove(id, data);
    }
  })

  socket.on('close', () => handleDisconnect(id));
})


const PORT = 8000;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});





