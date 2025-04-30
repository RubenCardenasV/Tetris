import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import './Tetris.css';

const Tetris = () => {
  const [board, setBoard] = useState(Array(20).fill().map(() => Array(10).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
  ];

  const resetGame = useCallback(() => {
    setBoard(Array(20).fill().map(() => Array(10).fill(0)));
    setScore(0);
    setGameOver(false);
    setCurrentPiece(null);
  }, []);

  const createNewPiece = useCallback(() => {
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const newPiece = {
      shape: randomPiece,
      position: { x: 4, y: 0 }
    };

    if (!isValidMove(newPiece)) {
      setGameOver(true);
      return;
    }

    setCurrentPiece(newPiece);
  }, [pieces]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const rotatedShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    const newPiece = {
      ...currentPiece,
      shape: rotatedShape
    };

    if (isValidMove(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, gameOver]);

  const movePiece = useCallback((direction) => {
    if (!currentPiece || gameOver) return;

    const newPosition = {
      ...currentPiece,
      position: {
        ...currentPiece.position,
        x: currentPiece.position.x + direction
      }
    };

    if (isValidMove(newPosition)) {
      setCurrentPiece(newPosition);
    }
  }, [currentPiece, gameOver]);

  const isValidMove = useCallback((piece) => {
    return piece.shape.every((row, y) => {
      return row.every((cell, x) => {
        if (!cell) return true;
        const newX = x + piece.position.x;
        const newY = y + piece.position.y;
        return (
          newX >= 0 &&
          newX < 10 &&
          newY < 20 &&
          (newY < 0 || board[newY][newX] === 0)
        );
      });
    });
  }, [board]);

  const checkLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isLineFull = row.every(cell => cell === 1);
      if (isLineFull) linesCleared++;
      return !isLineFull;
    });

    while (newBoard.length < 20) {
      newBoard.unshift(Array(10).fill(0));
    }

    if (linesCleared > 0) {
      setScore(prev => prev + (linesCleared * 100));
      setBoard(newBoard);
    }
  }, [board]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const newPosition = {
      ...currentPiece,
      position: {
        ...currentPiece.position,
        y: currentPiece.position.y + 1
      }
    };

    if (isValidMove(newPosition)) {
      setCurrentPiece(newPosition);
    } else {
      const newBoard = [...board];
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            newBoard[y + currentPiece.position.y][x + currentPiece.position.x] = 1;
          }
        });
      });
      setBoard(newBoard);
      setCurrentPiece(null);
      checkLines();
    }
  }, [currentPiece, board, isValidMove, checkLines, gameOver]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver) return;

    let dropDistance = 0;
    let newPosition = { ...currentPiece };

    // Encontrar la distancia máxima que puede caer
    while (true) {
      const testPosition = {
        ...currentPiece,
        position: {
          ...currentPiece.position,
          y: currentPiece.position.y + dropDistance + 1
        }
      };
      
      if (isValidMove(testPosition)) {
        dropDistance++;
        newPosition = testPosition;
      } else {
        break;
      }
    }

    // Colocar la pieza en la posición más baja posible
    const newBoard = [...board];
    newPosition.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          newBoard[y + newPosition.position.y][x + newPosition.position.x] = 1;
        }
      });
    });

    // Bonus de puntos por hard drop
    setScore(prev => prev + (dropDistance * 2));
    setBoard(newBoard);
    setCurrentPiece(null);
    checkLines();
  }, [currentPiece, board, isValidMove, checkLines, gameOver]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart || !currentPiece || gameOver) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Umbral para evitar movimientos accidentales
      if (diff > 0) {
        movePiece(-1);
      } else {
        movePiece(1);
      }
      setTouchStart(touchEnd);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleControlPress = (action) => {
    if (gameOver) {
      resetGame();
      return;
    }
    switch (action) {
      case 'left':
        movePiece(-1);
        break;
      case 'right':
        movePiece(1);
        break;
      case 'rotate':
        rotatePiece();
        break;
      case 'drop':
        hardDrop();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1);
          break;
        case 'ArrowRight':
          movePiece(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, moveDown, rotatePiece, gameOver, resetGame, hardDrop]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      createNewPiece();
    }
  }, [currentPiece, createNewPiece, gameOver]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(moveDown, 1000);
      return () => clearInterval(interval);
    }
  }, [moveDown, gameOver]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="tetris">
      <div className="container">
        <div className="row justify-content-center">
          {(!isMobile) && (
            <div className="col-md-3">
              <div className="card bg-dark text-white mb-4">
                <div className="card-header bg-primary">
                  <h2 className="h5 mb-0">Controles</h2>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled">
                    <li className="mb-2">← → : Mover lateralmente</li>
                    <li className="mb-2">↑ : Rotar pieza</li>
                    <li className="mb-2">↓ : Acelerar caída</li>
                    <li className="mb-2">Espacio : Bajar instantáneamente</li>
                    <li>Enter : Reiniciar juego</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="col-md-6">
            <div className="board-container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`score ${isMobile ? 'score-mobile' : ''}`}>
                  <span className="badge bg-primary p-2">
                    Puntuación: {score}
                  </span>
                </div>
              </div>
              {gameOver && (
                <div className="game-over card bg-dark text-white mb-4">
                  <div className="card-body text-center">
                    <h2 className="card-title text-danger">¡Game Over!</h2>
                    <p className="card-text">Puntuación final: {score}</p>
                    <p className="card-text">
                      {isMobile ? 'Presiona cualquier botón para reiniciar' : 'Presiona Enter para reiniciar'}
                    </p>
                  </div>
                </div>
              )}
              <Board board={board} currentPiece={currentPiece} />
              {(isMobile) && (
                <div className="mobile-controls mt-4">
                  <div className="dpad">
                    <button 
                      className="control-button left btn btn-primary"
                      onTouchStart={() => handleControlPress('left')}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button 
                      className="control-button right btn btn-primary"
                      onTouchStart={() => handleControlPress('right')}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="control-button rotate btn btn-warning"
                      onTouchStart={() => handleControlPress('rotate')}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button 
                      className="control-button drop btn btn-danger"
                      onTouchStart={() => handleControlPress('drop')}
                    >
                      <i className="bi bi-chevron-double-down"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris; 