import { WebSocket, WebSocketServer } from "ws"
import http from "http"



const wss = new WebSocketServer({ port: 8000 })




interface User {
  ws: WebSocket;
  online: boolean;
  playerName?: string;
  playing?: boolean;
}



const allUsers: { [key: string]: User } = {};

const allRooms: Array<{ player1: User; player2: User }> = [];

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}


wss.on("connection", (ws) => {

  const userId = generateUniqueId();

  allUsers[userId] = {
    ws,
    online: true,
  };



  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the WebSocket server!' }));

  Object.keys(allUsers).forEach((userId) => {
    if (allUsers[userId]?.ws != ws) {
      allUsers[userId]!.ws.send("new User Joined")
    }
  })




  // ws.on("bros", (data)=>{
  //    ws.send("hello")
  // })

  ws.on("message", (message) => {

    console.log(message.toString())

    const data = message.toString()
    // const data = JSON.parse(message.toString());
    const obj = JSON.parse(data)

    if (obj.type === "bros") {
      console.log("Bros event triggered with data:", obj.payload);
      ws.send("fuck it");

      Object.keys(allUsers).forEach((userId) => {
        if (allUsers[userId]?.ws != ws) {
          let gh = JSON.stringify(obj.payload)
          allUsers[userId]!.ws.send(`message received ${gh}`)
        }
      })
    }

    if (obj.type === "request to play") {

      const currentUser = allUsers[userId]
      currentUser!.playerName = obj.playerName

      let opponentPlayer

      for (const userId in allUsers) {
        if (allUsers[userId]?.ws !== ws && allUsers[userId]?.online && !allUsers[userId].playing) {
          opponentPlayer = allUsers[userId];
          opponentPlayer.playing = true
          currentUser!.playing=true
          break;

        }

      }

      if (opponentPlayer && currentUser) {
        allRooms.push({
          player1: currentUser,
          player2: opponentPlayer,
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
      }


    }
  });

  // ws.on('request to play', (data) => {
  //   const currentUser = allUsers[userId]
  //   currentUser!.playerName = data.playerName

  //   let opponentPlayer

  //   for (const key in allUsers) {
  //     const user = allUsers[key];
  //     if (user) {
  //       if (user.online && !user.playing && user.ws !== ws) {
  //         opponentPlayer = user;
  //         break;
  //       }
  //     }
  //   }

  //   if (opponentPlayer && currentUser) {
  //     allRooms.push({
  //       player1: opponentPlayer,
  //       player2: currentUser
  //     })

  //     currentUser?.ws.send(
  //       JSON.stringify({
  //         type: "OpponentFound",
  //         opponentName: opponentPlayer.playerName,
  //         playingAs: "circle",
  //       })
  //     );

  //     opponentPlayer?.ws.send(
  //       JSON.stringify({
  //         type: "OpponentFound",
  //         opponentName: currentUser!.playerName,
  //         playingAs: "cross",
  //       })
  //     );

  //     currentUser?.ws.on("playerMoveFromClient", (data) => {
  //       opponentPlayer.ws.send("playerMoveFromServer", {
  //         ...data
  //       })
  //     })

  //     opponentPlayer?.ws.on("playerMoveFromClient", (data) => {
  //       currentUser!.ws.send("playerMoveFromServer", {
  //         ...data
  //       }

  //       )
  //     })


  //   } else {
  //     currentUser?.ws.send("OpponentNotFound");
  //   }

  // })

  ws.on("close", function () {
    const currentUser = allUsers[userId]
    currentUser!.online = false
    currentUser!.playing = false




    for (let index = 0; index < allRooms.length; index++) {

      const room = allRooms[index]

      if (room && room.player1 && room.player2) {
        const { player1, player2 } = room


        if (player1.ws === ws) {
          player2.ws.send(JSON.stringify({ type: "opponentLeftMatch" }));
          allRooms.splice(index, 1);
          break;
        } else if (player2.ws === ws) {
          player1.ws.send(JSON.stringify({ type: "opponentLeftMatch" }));
          allRooms.splice(index, 1);


          break;
        }
      }
    }
  }
  )

});





