import { useState } from "react";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];



const App = () =>{
   const [ gamestate, setGamestate] = useState(renderFrom);

   const [currentPlayer , setCurrentPlayer] = useState("circle");

   const [finishedState, setFinishetState] = useState(false);

   const [finishedArrayState, setFinishedArrayState] = useState([]);



   return (
    <div>

    </div>
   )

}

export default App