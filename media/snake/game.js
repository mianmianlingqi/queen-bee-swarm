/* global acquireVsCodeApi, SnakeLogic */
(function () {
  "use strict";

  const vscode = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null;

  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const stateEl = document.getElementById("state");
  const helpEl = document.getElementById("help");
  const restartBtn = document.getElementById("restart");
  const pauseBtn = document.getElementById("pause");

  const W = 20;
  const H = 20;
  const TICK_MS = 110;

  let state = SnakeLogic.createInitialState({ width: W, height: H, seed: Date.now() >>> 0 });
  let timer = null;
  let cells = [];
  let lastSnakeKeys = new Set();
  let lastFoodKey = null;

  function startLoop() {
    stopLoop();
    timer = setInterval(() => {
      state = SnakeLogic.tick(state);
      render();
      if (state.status === "gameover") stopLoop();
    }, TICK_MS);
  }

  function stopLoop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function setPaused(paused) {
    const next = paused ? "paused" : "playing";
    if (state.status === "gameover") return;
    if (state.status !== next) {
      state = SnakeLogic.togglePause(state);
      if (state.status === "playing") startLoop();
      if (state.status === "paused") stopLoop();
      render();
    }
  }

  function restart() {
    state = SnakeLogic.restart(state, { seed: Date.now() >>> 0 });
    lastSnakeKeys = new Set();
    lastFoodKey = null;
    startLoop();
    render();
  }

  function dirFromKey(ev) {
    const k = ev.key;
    if (k === "ArrowUp" || k === "w" || k === "W") return "up";
    if (k === "ArrowDown" || k === "s" || k === "S") return "down";
    if (k === "ArrowLeft" || k === "a" || k === "A") return "left";
    if (k === "ArrowRight" || k === "d" || k === "D") return "right";
    return null;
  }

  function initGrid() {
    boardEl.style.setProperty("--snake-w", String(W));
    boardEl.style.setProperty("--snake-h", String(H));
    boardEl.innerHTML = "";
    cells = new Array(W * H);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < W * H; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      frag.appendChild(cell);
      cells[i] = cell;
    }
    boardEl.appendChild(frag);
  }

  function indexForPoint(p) {
    return p.y * W + p.x;
  }

  function render() {
    scoreEl.textContent = String(state.score);

    const status =
      state.status === "gameover"
        ? "Game over"
        : state.status === "paused"
          ? "Paused"
          : "Playing";
    stateEl.textContent = status;

    restartBtn.disabled = false;
    pauseBtn.disabled = state.status === "gameover";
    pauseBtn.textContent = state.status === "paused" ? "Resume" : "Pause";

    // Diff update snake cells.
    const nextSnakeKeys = new Set();
    for (const p of state.snake) nextSnakeKeys.add(`${p.x},${p.y}`);
    for (const key of lastSnakeKeys) {
      if (!nextSnakeKeys.has(key)) {
        const [x, y] = key.split(",").map(Number);
        const idx = y * W + x;
        const el = cells[idx];
        if (el) el.classList.remove("snake");
      }
    }
    for (const key of nextSnakeKeys) {
      if (!lastSnakeKeys.has(key)) {
        const [x, y] = key.split(",").map(Number);
        const idx = y * W + x;
        const el = cells[idx];
        if (el) el.classList.add("snake");
      }
    }
    lastSnakeKeys = nextSnakeKeys;

    // Update food cell.
    if (lastFoodKey && (!state.food || lastFoodKey !== `${state.food.x},${state.food.y}`)) {
      const [x, y] = lastFoodKey.split(",").map(Number);
      const idx = y * W + x;
      const el = cells[idx];
      if (el) el.classList.remove("food");
      lastFoodKey = null;
    }
    if (state.food) {
      const key = `${state.food.x},${state.food.y}`;
      if (key !== lastFoodKey) {
        const idx = indexForPoint(state.food);
        const el = cells[idx];
        if (el) el.classList.add("food");
        lastFoodKey = key;
      }
    }

    helpEl.textContent = "Arrows/WASD to steer. Space or P to pause. R to restart.";

    if (vscode) {
      vscode.setState({ score: state.score, status: state.status });
    }
  }

  function wireInput() {
    window.addEventListener("keydown", (ev) => {
      const dir = dirFromKey(ev);
      if (dir) {
        ev.preventDefault();
        state = SnakeLogic.setNextDirection(state, dir);
        return;
      }
      if (ev.key === " " || ev.key === "p" || ev.key === "P") {
        ev.preventDefault();
        setPaused(state.status !== "paused");
        return;
      }
      if (ev.key === "r" || ev.key === "R") {
        ev.preventDefault();
        restart();
      }
    });

    restartBtn.addEventListener("click", () => restart());
    pauseBtn.addEventListener("click", () => setPaused(state.status !== "paused"));

    for (const btn of document.querySelectorAll("[data-dir]")) {
      btn.addEventListener("click", () => {
        const dir = btn.getAttribute("data-dir");
        state = SnakeLogic.setNextDirection(state, dir);
      });
    }
  }

  initGrid();
  wireInput();
  startLoop();
  render();
})();
