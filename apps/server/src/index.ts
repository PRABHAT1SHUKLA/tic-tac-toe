import { WebSocket } from "ws"
import http from "http"
import cors from "cors"

var httpServer = http.createServer(function (request: any, response: any) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});


const wss = new WebSocket.Server({ server: httpServer });

interface User {
  ws: WebSocket;
  online: boolean;
  playerName?: string;
  playing?: boolean;
}

const allUsers: { [key: string]: User } = {};

const allRooms = []

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}


wss.on("connection", (ws) => {

  const userId = generateUniqueId();

  allUsers[userId] = {
    ws,
    online: true,
  };


  ws.on('request to play', (data) => {
    const currentUser = allUsers[userId]
    currentUser!.playerName = data.playerName

    let opponentPlayer

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user) {
        if (user.online && !user.playing && user.ws !== ws) {
          opponentPlayer = user;
          break;
        }
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser
      })

      currentUser?.ws.send(
        JSON.stringify({
          type: "OpponentFound",
          opponentName: opponentPlayer.playerName,
          playingAs: "circle",
        })
      );

      opponentPlayer?.ws.send(
        JSON.stringify({
          type: "OpponentFound",
          opponentName: currentUser!.playerName,
          playingAs: "cross",
        })
      );

      currentUser?.ws.on("playerMoveFromClient", (data) => {
        opponentPlayer.ws.send("playerMoveFromServer", {
          ...data
        })
      })

      opponentPlayer?.ws.on("playerMoveFromClient", (data) => {
        currentUser!.ws.send("playerMoveFromServer", {
          ...data
        }

        )
      })


    }else{
      currentUser?.ws.send("OpponentNotFound");
    }

  })
})


httpServer.listen(8000, function () {
  console.log((new Date()) + ' Server running at http://127.0.0.8000')
}
)