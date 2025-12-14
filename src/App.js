import { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, isSolved } from "./puzzle";
import { launchConfetti } from "./confetti";

const SIZE = 4;
const TILE_PX = 78; // must match CSS --tile
const GAP_PX = 10;  // must match CSS --gap

// --- Simple sound FX (no audio files needed) ---
function createSoundFX() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  const ensureRunning = async () => {
    if (ctx.state !== "running") {
      try { await ctx.resume(); } catch {}
    }
  };

  const beep = async ({ freq = 660, duration = 0.05, type = "triangle", gain = 0.06 } = {}) => {
    await ensureRunning();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(g);
    g.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const move = () => beep({ freq: 740, duration: 0.045, type: "triangle", gain: 0.05 });
  const bump = () => beep({ freq: 220, duration: 0.06, type: "sine", gain: 0.03 });

  const win = async () => {
    await beep({ freq: 784, duration: 0.08, type: "triangle", gain: 0.06 });
    await beep({ freq: 988, duration: 0.08, type: "triangle", gain: 0.06 });
    await beep({ freq: 1319, duration: 0.12, type: "triangle", gain: 0.06 });
  };

  return { move, bump, win };
}

function makeSnowflakes(count = 24) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,                 // vw
    size: 8 + Math.random() * 10,              // px
    opacity: 0.35 + Math.random() * 0.5,
    duration: 6 + Math.random() * 8,           // s
    delay: Math.random() * 6,                  // s
    drift: 12 + Math.random() * 18             // px
  }));
}

export default function App() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(generatePuzzle(40));
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);

  const sfxRef = useRef(null);
  useEffect(() => { sfxRef.current = createSoundFX(); }, []);

  const snow = useMemo(() => makeSnowflakes(26), []);

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (won) {
      launchConfetti();
      sfxRef.current?.win?.();
    }
  }, [won]);

  const difficultyShuffles = 40 + level * 25;

  function shuffle(resetStats = true) {
    setPuzzle(generatePuzzle(difficultyShuffles));
    setWon(false);
    if (resetStats) {
      setMoves(0);
      setTime(0);
    }
  }

  function moveTile(index) {
    if (won) return;

    const empty = puzzle.indexOf(null);
    const r1 = Math.floor(index / SIZE);
    const c1 = index % SIZE;
    const r2 = Math.floor(empty / SIZE);
    const c2 = empty % SIZE;

    const isNeighbor = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (!isNeighbor) {
      sfxRef.current?.bump?.();
      return;
    }

    // FIXED: was [.puzzle] in your file; should be [...puzzle]
    const next = [...puzzle];
    [next[index], next[empty]] = [next[empty], next[index]];

    setPuzzle(next);
    setMoves((m) => m + 1);
    sfxRef.current?.move?.();

    if (isSolved(next)) setWon(true);
  }

  function nextLevel() {
    setLevel((l) => l + 1);
    setPuzzle(generatePuzzle(40 + level * 25));
    setMoves(0);
    setTime(0);
    setWon(false);
  }

  // board size in px (tile + gap)
  const boardSize = SIZE * TILE_PX + (SIZE - 1) * GAP_PX + 2 * GAP_PX;


  return (
    <>
      {/* Snow overlay */}
      <div className="snow" aria-hidden="true">
        {snow.map((s) => (
          <div
            key={s.id}
            className="snowflake"
            style={{
              left: `${s.left}vw`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              "--drift": `${s.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="game">
        <header className="header">
          <h1>🎅 Santa’s Workshop</h1>
          <p className="subtitle">Slide the tiles — help the elves finish the toys!</p>
        </header>

        <div className="stats">
          <span>🎁 Level {level}</span>
          <span>⏱ {time}s</span>
          <span>🧩 {moves}</span>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => shuffle(true)} disabled={won}>
            Shuffle
          </button>
          <button className="btn ghost" onClick={() => shuffle(false)} disabled={won}>
            Reshuffle (keep stats)
          </button>
        </div>

        {/* Sliding board (absolute-positioned tiles) */}
        <div
          className="board"
          style={{ width: boardSize, height: boardSize }}
          role="grid"
          aria-label="Sliding puzzle board"
        >
          {/* draw empty slot visually */}
          <div
            className="empty-slot"
            style={{
              transform: (() => {
                const empty = puzzle.indexOf(null);
                const r = Math.floor(empty / SIZE);
                const c = empty % SIZE;
                return `translate(${c * (TILE_PX + GAP_PX)}px, ${r * (TILE_PX + GAP_PX)}px)`;
              })(),
            }}
          />

          {puzzle.map((tile, idx) => {
            if (tile === null) return null;
            const r = Math.floor(idx / SIZE);
            const c = idx % SIZE;

            return (
              <button
                key={tile}
                type="button"
                className="tile"
                onClick={() => moveTile(idx)}
                disabled={won}
                style={{
                  transform: `translate(${c * (TILE_PX + GAP_PX)}px, ${r * (TILE_PX + GAP_PX)}px)`,
                }}
                aria-label={`Tile ${tile}`}
              >
                {tile}
              </button>
            );
          })}
        </div>

        {won && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-content">
              <h2>Puzzle Complete!</h2>
              <p>The elves celebrate your success!</p>
              <button className="btn primary" onClick={nextLevel}>
                Next Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
