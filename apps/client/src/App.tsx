import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];



const App = () =>{
   const [ gameState, setGamestate] = useState(renderFrom);

   const [currentPlayer , setCurrentPlayer] = useState("circle");

   const [finishedState, setFinishedState] = useState(false);

   const [finishedArrayState, setFinishedArrayState] = useState<number[]>([]);

   const [playOnline, setPlayOnline] = useState(false);


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
      setFinishedState(true);
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


   return (
    <div>

    </div>
   )

}

export default App