import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Square from "./Square/Square";
import "./App.css";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];



const App = () =>{
   const [ gameState, setGameState] = useState<(number|string)[][]>(renderFrom);

   const [currentPlayer , setCurrentPlayer] = useState("circle");

   const [finishedState, setFinishedState] = useState<number|boolean|string>(false);

   const [finishedArrayState, setFinishedArrayState] = useState<number[]>([]);

   const [playOnline, setPlayOnline] = useState(false);

   const [socket, setSocket] = useState<WebSocket|null>(null);
   const [playerName, setPlayerName] = useState("");
   const [opponentName, setOpponentName] = useState<string|null>(null);
   const [playingAs, setPlayingAs] = useState<string|null>(null);


   const checkWinner =()=>{
    
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
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
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }
   

    const isDrawMatch = gameState.flat().every((e) => {
      if (e.toString() === "circle" || e.toString() === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
    


   }

   useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  


  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  async function playOnlineClick(){
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }
 
    const username = result.value;
    setPlayerName(username)

    const ws = new WebSocket('ws://localhost:8000')

    ws.onopen = () => {
      console.log('ws opened on browser');
      setPlayOnline(true);
      ws.send(JSON.stringify({username, type: 'request to play'}));
    };

    ws.onmessage=(event)=>{
       const data = JSON.parse(event.data)
       if(data.type == "OpponentNotFound"){
        setOpponentName(null)
       }
       if(data.type == "OpponentFound"){
        setPlayingAs(data.playingAs)
        setOpponentName(data.opponetname)
       }
       if(data.type == "OpponentLeftMatch"){
        setFinishedState("OpponentLeftMatch")
       }
       if(data.type == "moveFromServer"){
        const id = data.state.id;
        setGameState((prevState)=>{
          let newState = [...prevState];
          const rowIndex = Math.floor(id/3);
          const colIndex = id%3;
          newState[rowIndex][colIndex]=data.state.sign;
          return newState;
        });
        setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
       }
    }

    setSocket(ws);

    ws.onclose=()=>{
      console.log('ws closed on browser');
    }

    
  }


  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for opponent</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  currentElement={e}
                />
              );
            })
          )}
        </div>
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <h3 className="finished-state">
              {finishedState === playingAs ? "You " : finishedState} won the
              game
            </h3>
          )}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState === "draw" && (
            <h3 className="finished-state">It's a Draw</h3>
          )}
      </div>
      {!finishedState && opponentName && (
        <h2>You are playing against {opponentName}</h2>
      )}
      {finishedState && finishedState === "opponentLeftMatch" && (
        <h2>You won the match, Opponent has left</h2>
      )}
    </div>
  );
}

export default App