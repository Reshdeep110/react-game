import React, { useEffect, useRef, useState } from "react";

const COLORS = [
  { name: "violet", hex: "#8B5CF6" },
  { name: "indigo", hex: "#6366F1" },
  { name: "blue", hex: "#3B82F6" },
  { name: "green", hex: "#10B981" },
  { name: "yellow", hex: "#FACC15" },
  { name: "orange", hex: "#F97316" },
  { name: "red", hex: "#EF4444" },
];

function randomColor(excludeName) {
  const pool = COLORS.filter((c) => c.name !== excludeName);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Rainbow() {
  const [current, setCurrent] = useState(() => randomColor());
  const [countdown, setCountdown] = useState(3);
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const [round, setRound] = useState(0);
  const [answeredRound, setAnsweredRound] = useState(-1);

  const inputRef = useRef(input);
  const inputElementRef = useRef(null);
  const currentRef = useRef(current);
  const answeredRoundRef = useRef(answeredRound);
  const runningRef = useRef(running);
  const livesRef = useRef(lives);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    answeredRoundRef.current = answeredRound;
  }, [answeredRound]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    if (running && !gameOver && inputElementRef.current) {
      inputElementRef.current.focus();
    }
  }, [running, gameOver, round, input]);

  function evaluateRound(roundId, userInput, colorName) {
    if (answeredRoundRef.current >= roundId) return;

    setAnsweredRound(roundId);
    answeredRoundRef.current = roundId;

    const answer = (userInput || "").trim().toLowerCase();
    const correct = (colorName || currentRef.current.name || "").toLowerCase();

    if (answer === correct) {
      setScore((prevScore) => {
        const ns = prevScore + 1;
        setHighScore((h) => {
          if (ns > h) {
            return ns;
          }
          return h;
        });
        return ns;
      });
    } else {
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        livesRef.current = newLives;
        if (newLives <= 0) {
          setGameOver(true);
          setRunning(false);
          runningRef.current = false;
        }
        return newLives;
      });
    }

    setInput("");

    setTimeout(() => {
      if (!runningRef.current) return;
      if (livesRef.current <= 0) return;
      setRound((r) => r + 1);

      setTimeout(() => {
        if (inputElementRef.current && runningRef.current) {
          inputElementRef.current.focus();
        }
      }, 100);
    }, 250);
  }

  useEffect(() => {
    if (!running) return;
    setCountdown(3);

    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          evaluateRound(round, inputRef.current, currentRef.current?.name);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, round]);

  useEffect(() => {
    if (round <= 0) return;
    setCurrent((prev) => randomColor(prev?.name));
    setCountdown(3);
    setInput("");
  }, [round]);

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!running || gameOver) return;
    if (answeredRoundRef.current >= round) return;
    if (countdown === 0) return;

    evaluateRound(round, inputRef.current, currentRef.current?.name);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    inputRef.current = e.target.value;
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    livesRef.current = 3;
    setCountdown(3);
    setInput("");
    setRunning(true);
    runningRef.current = true;
    setGameOver(false);
    setRound(1);
    setAnsweredRound(-1);
    answeredRoundRef.current = -1;

    setTimeout(() => {
      if (inputElementRef.current) {
        inputElementRef.current.focus();
      }
    }, 100);
  };

  const stopGame = () => {
    setRunning(false);
    runningRef.current = false;
    setGameOver(true);
  };

  const resetHighScore = () => {
    setHighScore(0);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center  p-6 bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 ">
      <div className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 backdrop-blur-xl bg-white/10 border border-white/30">
        {/* Left side: Game panel */}
        <div
          className="p-8 flex flex-col  items-center justify-center transition-all duration-700"
          style={{ background: current.hex }}
        >
          <h2 className="text-4xl d-flex font-extrabold text-white drop-shadow tracking-wide-xl animate-bounce">
            🌈 Rainbow Colour Race
          </h2>
          <p className="mt-2 text-sm text-white/90">
            Type the colour name before time runs out!
          </p>

          {gameOver && (
            <div className="mt-4 p-4 bg-red-500/80 rounded-xl text-white text-center">
              <h3 className="text-2xl font-bold">Game Over!</h3>
              <p>Final Score: {score}</p>
              {score === highScore && score > 0 && (
                <p className="text-yellow-300">🎉 New High Score!</p>
              )}
            </div>
          )}

          {/* Scoreboard */}
          <div className="flex items-center gap-10 mt-10 mb-10">
            <div className="text-center">
              <div className="text-sm text-white/80">⏳ Time</div>
              <div className="text-6xl font-extrabold text-white animate-pulse">
                {Math.max(0, countdown)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80">⭐ Score</div>
              <div className="text-6xl font-extrabold text-yellow-300 drop-shadow-lg animate-pulse">
                {score}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80">❤️ Lives</div>
              <div className="text-3xl font-bold text-red-300 animate-bounce">
                {"❤".repeat(Math.max(0, lives))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-3 w-full max-w-md">
            <input
              ref={inputElementRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={(e) => {
                if (running && !gameOver) {
                  setTimeout(() => {
                    if (inputElementRef.current && runningRef.current) {
                      inputElementRef.current.focus();
                    }
                  }, 10);
                }
              }}
              placeholder="Type color name..."
              className="flex-1 rounded-xl p-3 border border-white/40 bg-white/30 text-white placeholder-white/70 outline-none focus:ring-4 focus:ring-yellow-300 focus:scale-105 transition"
              disabled={!running || gameOver || answeredRound >= round}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!running || gameOver || answeredRound >= round}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-200 text-black font-semibold shadow-lg hover:scale-110 transition disabled:opacity-50"
            >
              ✅ Check
            </button>
          </div>

          {/* Controls */}
          {!running || gameOver ? (
            <div className="mt-8 flex gap-4">
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow hover:scale-110 transition"
              >
                ▶ {gameOver ? "Play Again" : "Start Game"}
              </button>
              <button
                onClick={resetHighScore}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-black text-white shadow hover:scale-110 transition"
              >
                🔄 Reset High Score
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <button
                onClick={stopGame}
                onMouseDown={(e) => e.preventDefault()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow hover:scale-110 transition"
              >
                ⏸ Stop Game
              </button>
            </div>
          )}
        </div>

        {/* Right side: Info */}
        <div className="p-8 bg-white/95">
          <h3 className="text-2xl font-extrabold mb-4 text-gray-800">📜 Game Info</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>• A new random colour appears every 3 seconds.</li>
            <li>• Type the colour name (case-insensitive) and press Enter.</li>
            <li>• Correct answer = +1 score. Wrong/timeout = -1 life.</li>
            <li>• You have 3 lives. Lose all → Game Over.</li>
            <li>• High score is saved during your session.</li>
          </ul>

          <div className="mt-6">
            <h4 className="text-sm text-gray-500">🏆 High Score</h4>
            <div className="text-4xl font-extrabold text-indigo-600 drop-shadow-md">
              {highScore}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm text-gray-500 mb-2">🎨 Color List</h4>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {COLORS.map((c) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-2 p-2 rounded-lg border bg-white shadow hover:scale-105 transition ${current?.name === c.name && running ? "ring-2 ring-blue-500" : ""
                    }`}
                >
                  <div
                    style={{ background: c.hex }}
                    className="w-6 h-6 rounded-full shadow-inner"
                  />
                  <div className="text-sm font-medium capitalize">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-500 italic">
            ⚡ Tip: Keep your eyes on the color and type quickly!
          </p>
        </div>
      </div>
    </div>
  );
}