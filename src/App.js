import { useEffect, useState } from "react";
import { generatePuzzle, isSolved } from "./puzzle";
import { launchConfetti } from "./confetti";

const SIZE = 4;

export default function App() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(generatePuzzle(40));
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (won) launchConfetti();
  }, [won]);

  function moveTile(index) {
    const empty = puzzle.indexOf(null);
    const r1 = Math.floor(index / SIZE);
    const c1 = index % SIZE;
    const r2 = Math.floor(empty / SIZE);
    const c2 = empty % SIZE;

    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
      const next = [...puzzle];
      [next[index], next[empty]] = [next[empty], next[index]];
      setPuzzle(next);
      setMoves(m => m + 1);
      if (isSolved(next)) setWon(true);
    }
  }

  function nextLevel() {
    setLevel(l => l + 1);
    setPuzzle(generatePuzzle(40 + level * 25)); // dynamic difficulty
    setMoves(0);
    setTime(0);
    setWon(false);
  }

  return (
    <div className="game">
      <h1>🎅 Santa’s Workshop</h1>

      <div className="stats">
        <span>🎁 Level {level}</span>
        <span>⏱ {time}s</span>
        <span>🧩 {moves}</span>
      </div>

      <div className="grid">
        {puzzle.map((tile, i) => (
          <div
            key={i}
            className={`tile ${tile === null ? "empty" : ""}`}
            onClick={() => tile && moveTile(i)}
          >
            {tile}
          </div>
        ))}
      </div>

      {won && (
        <div className="modal">
          <div className="modal-content">
            <h2>🎄 Puzzle Complete!</h2>
            <p>The elves celebrate your success!</p>
            <button onClick={nextLevel}>Next Challenge</button>
          </div>
        </div>
      )}
    </div>
  );
}
