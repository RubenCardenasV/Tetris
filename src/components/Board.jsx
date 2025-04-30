import React from 'react';
import './Board.css';

const Board = ({ board, currentPiece }) => {
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = y + currentPiece.position.y;
            const boardX = x + currentPiece.position.x;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              displayBoard[boardY][boardX] = 1;
            }
          }
        });
      });
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="row">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`cell ${cell ? 'filled' : ''}`}
          />
        ))}
      </div>
    ));
  };

  return <div className="board">{renderBoard()}</div>;
};

export default Board; 