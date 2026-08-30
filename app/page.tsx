"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// --- Sound Synthesizer via Web Audio API (Zero External Files Needed) ---
class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playPop(pitchMultiplier = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      const startFreq = (500 + Math.random() * 150) * pitchMultiplier;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80 * pitchMultiplier, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio restrictions before gesture
    }
  }

  playSquish() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch { }
  }

  playDice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      for (let i = 0; i < 4; i++) {
        const time = this.ctx.currentTime + i * 0.05 + Math.random() * 0.02;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(300 + Math.random() * 400, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.03);
      }
    } catch { }
  }

  playRibbit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.05);
      osc.frequency.linearRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch { }
  }

  playChime(freq = 528) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch { }
  }
}

const soundManager = new SoundController();

const funnyQuotes = [
  "Achievement unlocked: You clicked a button. Glorious.",
  "Your stress was politely asked to vacate the premises.",
  "You are now 3.14% more legendary.",
  "Somewhere in the digital cosmos, a duck salutes you. 🦆",
  "Status update: Tension dropping to safely silly levels.",
  "Certified vibe check: Passed with flying sparkles.",
  "You pressed something! The dopamine has arrived.",
  "Take a deep breath. You're doing splendidly today."
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function Home() {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Click anything. Your brain deserves a playful break. 🌈");
  const [soundOn, setSoundOn] = useState(true);

  // 1. Bubble Wrap State (12 distinct bubbles with popped states)
  const [bubbles, setBubbles] = useState<boolean[]>(Array(12).fill(false));

  // 2. Balloon Panic State
  const [balloons, setBalloons] = useState<Array<{ id: number; emoji: string; popped: boolean; color: string }>>([
    { id: 1, emoji: "🎈", popped: false, color: "#f43f5e" },
    { id: 2, emoji: "🎈", popped: false, color: "#38bdf8" },
    { id: 3, emoji: "🎈", popped: false, color: "#a855f7" },
    { id: 4, emoji: "🎈", popped: false, color: "#eab308" },
    { id: 5, emoji: "🎈", popped: false, color: "#22c55e" }
  ]);

  // 3. Squishy Ball State
  const [squishCount, setSquishCount] = useState(0);
  const [squishing, setSquishing] = useState(false);

  // 4. Dice State
  const [dice, setDice] = useState("🎲");
  const [diceRolling, setDiceRolling] = useState(false);

  // 5. Frog State
  const [frog, setFrog] = useState({ x: 45, y: 40, caught: 0, hopping: false });

  // 6. 4-4-4 Breathing Cycle State
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 7. Pop-It Silicone Grid (16 dimples)
  const [popItGrid, setPopItGrid] = useState<boolean[]>(Array(16).fill(false));

  // 8. Fidget Spinner State
  const [spinnerAngle, setSpinnerAngle] = useState(0);
  const [spinnerVelocity, setSpinnerVelocity] = useState(0);
  const spinnerAnimRef = useRef<number | null>(null);

  // 9. Particle Explosion State
  const [particles, setParticles] = useState<Particle[]>([]);

  // 10. Ambient Zen Sounds
  const [ambientType, setAmbientType] = useState<"none" | "rain" | "waves" | "bowl">("none");
  const ambientNodesRef = useRef<{ source?: AudioNode; gain?: GainNode } | null>(null);

  // 11. Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [brushColor, setBrushColor] = useState("#a855f7");
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);

  // Toggle global sound
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.enabled = next;
  };

  const addScore = (points = 1) => {
    setScore(s => s + points);
  };

  const triggerMessage = () => {
    setMessage(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
  };

  // --- 1. Bubble Pop Handlers ---
  const handleBubbleClick = (index: number) => {
    if (bubbles[index]) return;
    const next = [...bubbles];
    next[index] = true;
    setBubbles(next);
    soundManager.playPop(1.1 + (index % 5) * 0.1);
    addScore(1);

    const poppedCount = next.filter(Boolean).length;
    if (poppedCount === 12) {
      soundManager.playChime(659.25);
      setMessage("🏆 BUBBLE MASTER! All bubbles cleared! +10 bonus!");
      addScore(10);
    } else {
      triggerMessage();
    }
  };

  const resetBubbles = () => {
    setBubbles(Array(12).fill(false));
    soundManager.playPop(0.9);
    setMessage("Fresh sheet of bubbles ready to pop!");
  };

  // --- 2. Balloon Panic Handlers ---
  const handleBalloonClick = (id: number) => {
    setBalloons(prev =>
      prev.map(b => (b.id === id ? { ...b, popped: true } : b))
    );
    soundManager.playPop(0.8);
    addScore(2);
    triggerMessage();
  };

  const replenishBalloons = () => {
    const colors = ["#f43f5e", "#38bdf8", "#a855f7", "#eab308", "#22c55e", "#ec4899", "#14b8a6"];
    setBalloons(Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      emoji: "🎈",
      popped: false,
      color: colors[i % colors.length]
    })));
    soundManager.playPop(1.2);
    setMessage("More balloons spawned! Pop to your heart's content.");
  };

  // --- 3. Squishy Button Handlers ---
  const handleSquish = () => {
    setSquishing(true);
    setSquishCount(s => s + 1);
    soundManager.playSquish();
    addScore(1);
    setTimeout(() => setSquishing(false), 200);

    if ((squishCount + 1) % 10 === 0) {
      soundManager.playChime(587.33);
      setMessage(`🔥 SQUISH COMBO! ${squishCount + 1} squishes delivered!`);
    } else {
      triggerMessage();
    }
  };

  // --- 4. Dice Roll Handler ---
  const rollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    soundManager.playDice();

    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    let counter = 0;
    const interval = setInterval(() => {
      setDice(faces[Math.floor(Math.random() * faces.length)]);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        const finalFace = faces[Math.floor(Math.random() * faces.length)];
        setDice(finalFace);
        setDiceRolling(false);
        addScore(1);
        setMessage(`The universe rolled a: ${finalFace} 🎲`);
      }
    }, 60);
  };

  // --- 5. Frog Catch Handler ---
  const catchFrog = () => {
    soundManager.playRibbit();
    setFrog(prev => ({
      x: Math.max(8, Math.min(82, Math.random() * 82)),
      y: Math.max(10, Math.min(75, Math.random() * 75)),
      caught: prev.caught + 1,
      hopping: true
    }));
    addScore(3);
    setTimeout(() => setFrog(f => ({ ...f, hopping: false })), 250);
    setMessage("🐸 FROG CAPTURED! It did a graceful backflip and escaped.");
  };

  // --- 6. Mindful Breathing Guide ---
  const startBreathing = () => {
    if (breathActive) {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathActive(false);
      setBreathPhase("Inhale");
      setMessage("Breathing exercise paused. Whenever you're ready!");
      return;
    }

    setBreathActive(true);
    setBreathPhase("Inhale");
    setBreathTimer(4);
    soundManager.playChime(440);
    setMessage("🌿 Mindful Breathing: Inhale gently through your nose...");

    let phase: "Inhale" | "Hold" | "Exhale" | "Rest" = "Inhale";
    let count = 4;

    breathIntervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (phase === "Inhale") {
          phase = "Hold";
          count = 4;
          soundManager.playChime(523.25);
          setMessage("🌿 Hold your breath gently... feel still...");
        } else if (phase === "Hold") {
          phase = "Exhale";
          count = 4;
          soundManager.playChime(392);
          setMessage("🌿 Exhale softly through your mouth... let it all out...");
        } else if (phase === "Exhale") {
          phase = "Rest";
          count = 2;
          setMessage("🌿 Rest and reset...");
        } else {
          phase = "Inhale";
          count = 4;
          soundManager.playChime(440);
          setMessage("🌿 Inhale gently once more...");
        }
        setBreathPhase(phase);
      }
      setBreathTimer(count);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  // --- 7. Pop-It Grid Handler ---
  const togglePopIt = (index: number) => {
    const next = [...popItGrid];
    next[index] = !next[index];
    setPopItGrid(next);
    soundManager.playPop(next[index] ? 1.4 : 1.0);
    addScore(1);
  };

  const resetPopIt = () => {
    setPopItGrid(Array(16).fill(false));
    soundManager.playPop(0.8);
    setMessage("Pop-it sheet flipped over!");
  };

  // --- 8. Fidget Spinner Physics ---
  const spinFaster = () => {
    setSpinnerVelocity(v => Math.min(v + 35, 120));
    soundManager.playPop(1.5);
    addScore(2);
    setMessage("🌪️ Spinner boosted! Feel the kinetic speed!");
  };

  useEffect(() => {
    let lastTime = performance.now();
    const updateSpinner = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setSpinnerVelocity(v => {
        if (Math.abs(v) < 0.1) return 0;
        return v * Math.pow(0.96, dt * 60); // Friction decay
      });

      setSpinnerAngle(a => (a + spinnerVelocity * dt * 18) % 360);
      spinnerAnimRef.current = requestAnimationFrame(updateSpinner);
    };

    spinnerAnimRef.current = requestAnimationFrame(updateSpinner);
    return () => {
      if (spinnerAnimRef.current) cancelAnimationFrame(spinnerAnimRef.current);
    };
  }, [spinnerVelocity]);

  // --- 9. Confetti / Particle Cannon ---
  const throwParticles = () => {
    soundManager.playChime(659);
    addScore(3);
    const colors = ["#f43f5e", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#38bdf8"];
    const now = Date.now();
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 25 + Math.random() * 45;
      return {
        id: now + i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8
      };
    });

    setParticles(newParticles);
    setMessage("✨ Sparkle cannon deployed! Maximum good vibes unleashed.");
    setTimeout(() => setParticles([]), 1800);
  };

  // --- 10. Ambient Zen Sounds Synthesizer ---
  const toggleAmbient = (type: "rain" | "waves" | "bowl") => {
    if (ambientType === type) {
      stopAmbient();
      setAmbientType("none");
      setMessage("Ambient sound stopped.");
      return;
    }

    stopAmbient();
    setAmbientType(type);
    playAmbientSound(type);
  };

  const stopAmbient = () => {
    if (ambientNodesRef.current?.gain) {
      try {
        const g = ambientNodesRef.current.gain;
        g.gain.linearRampToValueAtTime(0.001, g.context.currentTime + 0.3);
      } catch { }
    }
    ambientNodesRef.current = null;
  };

  const playAmbientSound = (type: "rain" | "waves" | "bowl") => {
    if (!soundOn || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.connect(ctx.destination);

      if (type === "rain") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        ambientNodesRef.current = { source: noise, gain };
        setMessage("🌧️ Gentle Rain ambient soundscape active.");
      } else if (type === "bowl") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(216, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(432, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        ambientNodesRef.current = { source: osc1, gain };
        setMessage("🔔 Tibetan Singing Bowl harmonic resonance active.");
      } else if (type === "waves") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        ambientNodesRef.current = { source: noise, gain };
        setMessage("🌊 Ocean Waves ambient soundscape active.");
      }
    } catch { }
  };

  // --- 11. Canvas Drawing Logic with Coordinate & Scale Fix ---
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    canvas.setPointerCapture(e.pointerId);

    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? "#0d1326" : brushColor;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    soundManager.playPop(1.3);
    setMessage("Canvas cleared! Fresh slate for your creativity.");
  };

  // Setup HiDPI Canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    // Save existing image data before resize
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    if (tempCtx && tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  // Master Reset
  const resetEverything = () => {
    setScore(0);
    setBubbles(Array(12).fill(false));
    replenishBalloons();
    setSquishCount(0);
    setFrog({ x: 45, y: 40, caught: 0, hopping: false });
    setPopItGrid(Array(16).fill(false));
    setSpinnerVelocity(0);
    clearCanvas();
    stopAmbient();
    setAmbientType("none");
    soundManager.playChime(528);
    setMessage("🌟 Fresh start! Everything reset to peaceful harmony.");
  };

  return (
    <main>
      {/* Dynamic Confetti & Sparkles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            ["--vx" as string]: `${p.vx}vw`,
            ["--vy" as string]: `${p.vy}vh`
          }}
        />
      ))}

      {/* Header */}
      <header>
        <div>
          <div className="badgeRow">
            <span className="eyebrow">NO ADS • NO LOGINS • 100% SEROTONIN</span>
            <button className={`soundToggle ${soundOn ? "active" : ""}`} onClick={toggleSound} title="Toggle Sounds">
              {soundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF"}
            </button>
          </div>
          <h1>Anti-Stress <span>Playground</span></h1>
          <p className="sub">A sensory digital retreat. Pop, squish, spin, doodle, breathe, and reset your mind.</p>
        </div>
        <div className="score">
          ✨ <b>{score}</b>
          <small>happy points collected</small>
        </div>
      </header>

      {/* Dynamic Message Banner */}
      <section className="message">
        <span className="msgIcon">💬</span>
        <span className="msgText">{message}</span>
      </section>

      {/* Main Interactive Grid */}
      <div className="grid">
        {/* 1. Bubble Wrap */}
        <article className="card bubbleCard">
          <div className="cardHead">
            <h2>🫧 Bubble Wrap Pop</h2>
            <button className="smallBtn" onClick={resetBubbles}>Reset All</button>
          </div>
          <p className="cardDesc">Click individual bubbles for instant tactile popping joy.</p>
          <div className="bubbleZone">
            {bubbles.map((popped, i) => (
              <button
                key={i}
                className={`bubbleBtn ${popped ? "popped" : ""}`}
                onClick={() => handleBubbleClick(i)}
                aria-label={`Bubble ${i + 1}`}
              >
                {popped ? "" : "🫧"}
              </button>
            ))}
          </div>
          <div className="cardFooter">
            <span>{bubbles.filter(Boolean).length} / 12 popped</span>
            {bubbles.every(Boolean) && <span className="bonusTag">🎉 All Clear! +10</span>}
          </div>
        </article>

        {/* 2. Silicone Pop-It Fidget */}
        <article className="card popItCard">
          <div className="cardHead">
            <h2>🟣 Silicone Pop-It</h2>
            <button className="smallBtn" onClick={resetPopIt}>Flip</button>
          </div>
          <p className="cardDesc">Press down the rainbow dimples back and forth.</p>
          <div className="popItGrid">
            {popItGrid.map((down, i) => (
              <button
                key={i}
                className={`popItDimple dimple-${i % 4} ${down ? "down" : "up"}`}
                onClick={() => togglePopIt(i)}
                aria-label={`Dimple ${i + 1}`}
              />
            ))}
          </div>
        </article>

        {/* 3. Balloon Panic */}
        <article className="card balloonCard">
          <div className="cardHead">
            <h2>🎈 Balloon Pop</h2>
            <button className="smallBtn" onClick={replenishBalloons}>More</button>
          </div>
          <p className="cardDesc">Tap to pop the floating balloons into thin air.</p>
          <div className="balloonRow">
            {balloons.map(b => (
              <button
                key={b.id}
                className={`balloonItem ${b.popped ? "balloonPopped" : ""}`}
                style={{ color: b.color }}
                onClick={() => !b.popped && handleBalloonClick(b.id)}
                disabled={b.popped}
              >
                {b.popped ? "💥" : b.emoji}
              </button>
            ))}
          </div>
          <p className="hint">They have done nothing wrong. Pop them anyway!</p>
        </article>

        {/* 4. Squishy Jelly Ball */}
        <article className="card squishyCard">
          <div className="cardHead">
            <h2>🧸 Squishy Jelly Button</h2>
          </div>
          <div className="squishContainer">
            <button
              className={`squishBtn ${squishing ? "squished" : ""}`}
              onClick={handleSquish}
            >
              <span className="squishEmoji">💜</span>
              <span>SQUISH ME</span>
            </button>
          </div>
          <p className="squishCount">{squishCount} squishes delivered with gentle enthusiasm.</p>
        </article>

        {/* 5. Kinetic Fidget Spinner */}
        <article className="card spinnerCard">
          <div className="cardHead">
            <h2>🌪️ Kinetic Spinner</h2>
            <button className="smallBtn" onClick={spinFaster}>+ Boost</button>
          </div>
          <p className="cardDesc">Tap to spin faster. Watch the soothing momentum.</p>
          <div className="spinnerContainer" onClick={spinFaster}>
            <div
              className="spinnerWheel"
              style={{ transform: `rotate(${spinnerAngle}deg)` }}
            >
              <div className="blade blade1">🌀</div>
              <div className="blade blade2">🌀</div>
              <div className="blade blade3">🌀</div>
              <div className="spinnerCore">✨</div>
            </div>
          </div>
          <div className="cardFooter">
            <span>Speed: {Math.round(Math.abs(spinnerVelocity))} RPM</span>
          </div>
        </article>

        {/* 6. Catch the Frog */}
        <article className="card frogCard">
          <div className="cardHead">
            <h2>🐸 Pond Hopper</h2>
            <span className="scoreBadge">{frog.caught} caught</span>
          </div>
          <p className="cardDesc">Test your reflexes. Can you tap the speedy frog?</p>
          <div className="frogZone">
            <div className="waterRipple" />
            <button
              className={`frogBtn ${frog.hopping ? "hopping" : ""}`}
              style={{ left: `${frog.x}%`, top: `${frog.y}%` }}
              onClick={catchFrog}
            >
              🐸
            </button>
          </div>
        </article>

        {/* 7. Quantum Random Dice */}
        <article className="card diceCard">
          <h2>🎲 Lucky Dice</h2>
          <p className="cardDesc">Ask a silly question. Roll for random cosmic wisdom.</p>
          <button
            className={`diceBtn ${diceRolling ? "rolling" : ""}`}
            onClick={rollDice}
            disabled={diceRolling}
          >
            {dice}
          </button>
          <p className="hint">Tap dice to roll</p>
        </article>

        {/* 8. Particle Sparkle Cannon */}
        <article className="card particleCard">
          <h2>✨ Sparkle Chaos</h2>
          <p className="cardDesc">Release a burst of colorful dopamine confetti.</p>
          <button className="chaosBtn" onClick={throwParticles}>
            RELEASE THE SPARKLES ✨
          </button>
        </article>

        {/* 9. Mindful Box Breathing */}
        <article className="card breathingCard">
          <div className="cardHead">
            <h2>🧘 4-4-4 Calm Breathing</h2>
            <span className="phaseBadge">{breathActive ? breathPhase : "Ready"}</span>
          </div>
          <p className="cardDesc">Follow the glowing orb for an instant nervous system reset.</p>
          <div className="breathOrbContainer">
            <div className={`breathOrb ${breathActive ? `breathing-${breathPhase.toLowerCase()}` : ""}`}>
              <span className="orbIcon">🌿</span>
              {breathActive && <span className="orbTimer">{breathTimer}s</span>}
            </div>
          </div>
          <button className={`breathActionBtn ${breathActive ? "stopBtn" : ""}`} onClick={startBreathing}>
            {breathActive ? "Stop Exercise" : "Start Guided Cycle"}
          </button>
        </article>

        {/* 10. Ambient Zen Sounds */}
        <article className="card ambientCard">
          <h2>🎵 Ambient Soundscapes</h2>
          <p className="cardDesc">Soothing background sounds generated in real-time.</p>
          <div className="ambientButtons">
            <button
              className={`ambientBtn ${ambientType === "rain" ? "active" : ""}`}
              onClick={() => toggleAmbient("rain")}
            >
              🌧️ Soft Rain
            </button>
            <button
              className={`ambientBtn ${ambientType === "waves" ? "active" : ""}`}
              onClick={() => toggleAmbient("waves")}
            >
              🌊 Ocean Waves
            </button>
            <button
              className={`ambientBtn ${ambientType === "bowl" ? "active" : ""}`}
              onClick={() => toggleAmbient("bowl")}
            >
              🔔 Singing Bowl
            </button>
          </div>
        </article>

        {/* 11. Finger Paint Canvas */}
        <article className="card doodleCard wide">
          <div className="cardHead">
            <h2>🖌️ Finger Paint & Zen Canvas</h2>
            <div className="canvasControls">
              {/* Color Palette */}
              <div className="colorPalette">
                {["#a855f7", "#ec4899", "#38bdf8", "#22c55e", "#f59e0b", "#ffffff"].map(c => (
                  <button
                    key={c}
                    className={`colorDot ${brushColor === c && !isEraser ? "selected" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => { setBrushColor(c); setIsEraser(false); }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>

              {/* Tools */}
              <div className="toolBtns">
                <button
                  className={`smallBtn ${isEraser ? "activeTool" : ""}`}
                  onClick={() => setIsEraser(!isEraser)}
                >
                  🧹 {isEraser ? "Eraser ON" : "Eraser"}
                </button>
                <button
                  className="smallBtn"
                  onClick={() => setBrushSize(s => (s === 4 ? 8 : s === 8 ? 16 : 4))}
                >
                  Size: {brushSize}px
                </button>
                <button className="smallBtn" onClick={clearCanvas}>Clear</button>
              </div>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="paintCanvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <p className="hint">Doodle freely. There are no mistakes here, only happy little lines. 🎨</p>
        </article>
      </div>

      {/* Footer */}
      <footer>
        <button className="bigResetBtn" onClick={resetEverything}>
          ↻ Reset Everything
        </button>
        <p className="footerText">
          @ by jesy_yuri
        </p>
      </footer>
    </main>
  );
}