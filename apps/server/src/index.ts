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

// const getrandom = () => {
//   return Math.floor(Math.random() * 1000000) + 1
// }

wss.on("connection", (socket) => {
  console.log("Client connected")
  const id = generateId(); // Generate a unique ID for the socket
  allUsers[id] = { socket, online: true };

  console.log(allUsers)
  socket.on('message', (message) => {
    console.log(message)
    const data = JSON.parse(message.toString())

    if (data.type === 'request to play') {
      console.log("inside request to play")
      handleRequestToPlay(id, data);
    } else if (data.type === 'playerMoveFromClient') {
      handlePlayerMove(id, data);
    }
  })

  socket.on('close', () => handleDisconnect(id));
})





function handleRequestToPlay(socketId:string , data:{ username:string , type:string}){
  const currentUser = allUsers[socketId]
  currentUser!.playerName = data.username;

  let opponentPlayer : Player | undefined;
  console.log(currentUser , opponentPlayer)

  for(const key in allUsers){
    const user = allUsers[key];
    console.log("inside loop",user)
    if (user!.online && !user!.playing && key !== socketId) {
      opponentPlayer = user;
      console.log("opponentPlayer should not be initialized", opponentPlayer)
      break;
    }
  }
  console.log("chen chapak tumtum")
  console.log(opponentPlayer)
  if(opponentPlayer){
    const room:Room = {player1: opponentPlayer , player2: currentUser!}
    allRooms.push(room);

    opponentPlayer.playing = true;
    currentUser!.playing = true;
    console.log("about to send msg to the client", opponentPlayer.playerName)
    sendMessage(currentUser!.socket, {
      type:  'OpponentFound',
      opponentName: opponentPlayer.playerName,
      playingAs: 'circle',
    });

    sendMessage(opponentPlayer.socket, {
      type:  'OpponentFound',
      opponentName: currentUser!.playerName,
      playingAs: 'cross',
    });
  }else{
    sendMessage(currentUser!.socket, {type:'OpponentNotFound'});
  }
}

function handlePlayerMove(socketId: string, data: any) {
  const room = allRooms.find(
    ({ player1, player2 }) =>
      player1.socket === allUsers[socketId]?.socket ||
      player2.socket === allUsers[socketId]?.socket
  );

  if (room) {
    const opponent =
      room.player1.socket === allUsers[socketId]?.socket
        ? room.player2.socket
        : room.player1.socket;

    data.type = "playerMoveFromServer"    
    sendMessage(opponent,  data);
  }
}


function sendMessage(socket: WebSocket, data?: any) {
  const message = JSON.stringify({ data });
  console.log("inside send mesage function ", message)
  socket.send(message);
}


function handleDisconnect(socketId: string) {
  const currentUser = allUsers[socketId];
  currentUser!.online = false;
  currentUser!.playing = false;

  allRooms.forEach((room, index) => {
    const { player1, player2 } = room;
    if (player1.socket === currentUser!.socket) {
      sendMessage(player2.socket, { type:'opponentLeftMatch'});
      allRooms.splice(index, 1);
    } else if (player2.socket === currentUser!.socket) {
      sendMessage(player1.socket, { type:'opponentLeftMatch'});
      allRooms.splice(index, 1);
    }
  });
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});





