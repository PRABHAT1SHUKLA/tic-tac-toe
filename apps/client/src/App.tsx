import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {WebSocket} from "ws"

type GameSquare = number | "circle" | "cross";

const renderFrom: GameSquare[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () =>{
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState<boolean | "opponentLeftMatch" | "draw" | "circle" | "cross">(false);
  const [finishedArrayState, setFinishedArrayState] = useState(Number[]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState<WebSocket|null>(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState<string|boolean>(null);
  const [playingAs, setPlayingAs] = useState(null);

  const CheckWinner = () => {

    for(let row =0 ; row<gameState.length; row++){
      if(
        gameState[row][0]== gameState[row][1] && gameState[row][1] == gameState[row][2]
      ){
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    
    const isDrawMatch = gameState.flat().every((e) => {
      return e === "circle" || e === "cross";
    });


    if (isDrawMatch) return "draw";
    
  }


  useEffect(()=>{
    const winner = CheckWinner();
    if(winner){
      setFinishedState(true)
    }
  },[gameState])


  const takePlayerName = async() =>{
    const result = await Swal.fire({
      title:"Enter your name",
      input:"text",
      showCancelButton:true,
      inputValidator:(value)=>{
        if(!value){
          return "Please Enter ur name "
        }
      }


    })

    return result;
  }

  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
  });

  socket?.on("playerMoveFromServer",(data)=>{
    const id = data.state.id;
    setGameState((prevState)=>{
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  })

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  async function playOnlineClick(){
    const result = await takePlayerName();

    if(!result.isConfirmed){
      return;
    }

    const username = result.value
    setPlayerName(username)

    const newSocket = new WebSocket("http://localhost:3000")

    newSocket.onopen =()=>{
      console.log("connection opened")
      newSocket.send("")
    }

    

 }




  return null;
}