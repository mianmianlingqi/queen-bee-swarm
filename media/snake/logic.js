/* Classic Snake game logic (deterministic, testable).
 * UMD wrapper so the same module works in both:
 * - Node (tests): require(...)
 * - VS Code Webview (browser): window.SnakeLogic
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeLogic = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** @typedef {{x:number,y:number}} Point */
  /** @typedef {"up"|"down"|"left"|"right"} Dir */
  /** @typedef {"playing"|"paused"|"gameover"} Status */

  const DEFAULTS = Object.freeze({
    width: 20,
    height: 20,
    seed: 123456789,
  });

  function clampInt(n, min, max) {
    const x = Math.trunc(n);
    if (x < min) return min;
    if (x > max) return max;
    return x;
  }

  function pointKey(p) {
    return `${p.x},${p.y}`;
  }

  function samePoint(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function isOpposite(a, b) {
    return (
      (a === "up" && b === "down") ||
      (a === "down" && b === "up") ||
      (a === "left" && b === "right") ||
      (a === "right" && b === "left")
    );
  }

  function movePoint(p, dir) {
    switch (dir) {
      case "up":
        return { x: p.x, y: p.y - 1 };
      case "down":
        return { x: p.x, y: p.y + 1 };
      case "left":
        return { x: p.x - 1, y: p.y };
      case "right":
        return { x: p.x + 1, y: p.y };
      default:
        return p;
    }
  }

  // LCG (Numerical Recipes) for deterministic "random" numbers.
  function nextSeed(seed) {
    return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  }

  function randInt(seed, maxExclusive) {
    const next = nextSeed(seed);
    // Use upper bits for slightly better distribution.
    const value = (next >>> 8) % maxExclusive;
    return { seed: next, value };
  }

  function placeFood(width, height, snake, seed) {
    const occupied = new Set(snake.map(pointKey));
    const cells = width * height;
    if (occupied.size >= cells) {
      return { seed, food: null };
    }

    // Pick a random starting offset, then walk until we find an empty cell.
    let r = randInt(seed, cells);
    seed = r.seed;
    let idx = r.value;
    for (let i = 0; i < cells; i++) {
      const n = (idx + i) % cells;
      const x = n % width;
      const y = Math.floor(n / width);
      const candidate = { x, y };
      if (!occupied.has(pointKey(candidate))) {
        return { seed, food: candidate };
      }
    }

    // Should be unreachable due to size check.
    return { seed, food: null };
  }

  function createInitialState(opts) {
    const width = clampInt(opts && opts.width != null ? opts.width : DEFAULTS.width, 5, 60);
    const height = clampInt(opts && opts.height != null ? opts.height : DEFAULTS.height, 5, 60);
    let seed = (opts && opts.seed != null ? opts.seed : DEFAULTS.seed) >>> 0;

    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    const placed = placeFood(width, height, snake, seed);
    seed = placed.seed;

    return {
      width,
      height,
      seed,
      status: /** @type {Status} */ ("playing"),
      dir: /** @type {Dir} */ ("right"),
      nextDir: /** @type {Dir} */ ("right"),
      snake,
      food: placed.food,
      score: 0,
      ticks: 0,
    };
  }

  function setNextDirection(state, dir) {
    if (state.status === "gameover") return state;
    if (dir !== "up" && dir !== "down" && dir !== "left" && dir !== "right") return state;
    if (isOpposite(state.dir, dir)) return state;
    if (state.nextDir && isOpposite(state.nextDir, dir)) return state;
    return { ...state, nextDir: dir };
  }

  function togglePause(state) {
    if (state.status === "gameover") return state;
    return { ...state, status: state.status === "paused" ? "playing" : "paused" };
  }

  function tick(state) {
    if (state.status !== "playing") return state;

    const dir = state.nextDir || state.dir;
    const head = state.snake[0];
    const newHead = movePoint(head, dir);

    // Wall collision.
    if (newHead.x < 0 || newHead.x >= state.width || newHead.y < 0 || newHead.y >= state.height) {
      return { ...state, status: "gameover" };
    }

    const food = state.food;
    const willGrow = food != null && samePoint(newHead, food);

    // Self collision: when not growing, the tail moves away, so exclude last segment.
    const bodyLen = willGrow ? state.snake.length : state.snake.length - 1;
    for (let i = 0; i < bodyLen; i++) {
      if (samePoint(newHead, state.snake[i])) {
        return { ...state, status: "gameover" };
      }
    }

    let snake = [newHead, ...state.snake];
    let seed = state.seed;
    let score = state.score;
    let nextFood = state.food;

    if (willGrow) {
      score += 1;
      const placed = placeFood(state.width, state.height, snake, seed);
      seed = placed.seed;
      nextFood = placed.food;
    } else {
      snake = snake.slice(0, snake.length - 1);
    }

    return {
      ...state,
      seed,
      dir,
      snake,
      food: nextFood,
      score,
      ticks: state.ticks + 1,
    };
  }

  function restart(state, opts) {
    const merged = {
      width: (opts && opts.width != null ? opts.width : state.width) || DEFAULTS.width,
      height: (opts && opts.height != null ? opts.height : state.height) || DEFAULTS.height,
      seed: (opts && opts.seed != null ? opts.seed : state.seed) || DEFAULTS.seed,
    };
    return createInitialState(merged);
  }

  return {
    createInitialState,
    setNextDirection,
    togglePause,
    tick,
    restart,
    _internals: {
      placeFood,
      nextSeed,
      randInt,
      pointKey,
    },
  };
});
