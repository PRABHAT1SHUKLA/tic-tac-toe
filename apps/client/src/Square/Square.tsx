import React, { useState } from "react";

const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

interface SquareProps {
  gameState: (string | number)[][];
  setGameState: React.Dispatch<React.SetStateAction<(string | number)[][]>>;
  socket: WebSocket;
  playingAs: string;
  currentElement: string | number;
  finishedArrayState: number[];
  finishedState: string | null;
  id: number;
  currentPlayer: string;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<string>>;
}

const Square: React.FC<SquareProps> = ({
  gameState,
  setGameState,
  socket,
  playingAs,
  currentElement,
  finishedArrayState,
  finishedState,
  id,
  currentPlayer,
  setCurrentPlayer,
}) => {

  const [icon, setIcon] = useState<JSX.Element | null>(null);

  const clickOnSquare = () => {
    if (playingAs !== currentPlayer) {
      return;
    }

    if (finishedState || icon) {
      return;
    }

    const myCurrentPlayer = currentPlayer;

    // Update icon locally
    setIcon(myCurrentPlayer === "circle" ? circleSvg : crossSvg);

    socket.send(
      JSON.stringify({
        type: "playerMoveFromClient",
        state: {
          id,
          sign: myCurrentPlayer
        }
      })
    )


  }

}

export default Square