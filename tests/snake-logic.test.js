const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const SnakeLogic = require(path.join(__dirname, '..', 'media', 'snake', 'logic.js'));

test('tick moves snake forward without growing', () => {
  const s0 = SnakeLogic.createInitialState({ width: 10, height: 10, seed: 1 });
  const head0 = s0.snake[0];
  const s1 = SnakeLogic.tick(s0);
  assert.equal(s1.status, 'playing');
  assert.equal(s1.snake.length, s0.snake.length);
  assert.equal(s1.score, 0);
  assert.deepEqual(s1.snake[0], { x: head0.x + 1, y: head0.y });
});

test('cannot reverse direction directly', () => {
  const s0 = SnakeLogic.createInitialState({ width: 10, height: 10, seed: 1 });
  const s1 = SnakeLogic.setNextDirection(s0, 'left');
  assert.equal(s1.nextDir, 'right');
});

test('eating food grows snake and increments score', () => {
  let s0 = SnakeLogic.createInitialState({ width: 10, height: 10, seed: 1 });
  const head0 = s0.snake[0];
  s0 = { ...s0, food: { x: head0.x + 1, y: head0.y } };
  const s1 = SnakeLogic.tick(s0);
  assert.equal(s1.score, 1);
  assert.equal(s1.snake.length, s0.snake.length + 1);
  assert.deepEqual(s1.snake[0], { x: head0.x + 1, y: head0.y });
  assert.ok(s1.food, 'food respawns');
  assert.ok(!s1.snake.some((p) => p.x === s1.food.x && p.y === s1.food.y), 'food not on snake');
});

test('wall collision triggers gameover', () => {
  const base = SnakeLogic.createInitialState({ width: 5, height: 5, seed: 1 });
  const s0 = {
    ...base,
    dir: 'right',
    nextDir: 'right',
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
  };
  const s1 = SnakeLogic.tick(s0);
  assert.equal(s1.status, 'gameover');
});

test('self collision triggers gameover', () => {
  const base = SnakeLogic.createInitialState({ width: 10, height: 10, seed: 1 });
  const s0 = {
    ...base,
    dir: 'left',
    nextDir: 'left',
    snake: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
    ],
    food: { x: 9, y: 9 },
  };
  const s1 = SnakeLogic.tick(s0);
  assert.equal(s1.status, 'gameover');
});

test('deterministic food placement for same seed', () => {
  const a0 = SnakeLogic.createInitialState({ width: 12, height: 12, seed: 42 });
  const b0 = SnakeLogic.createInitialState({ width: 12, height: 12, seed: 42 });
  assert.deepEqual(a0.food, b0.food);

  const a1 = SnakeLogic.tick(a0);
  const b1 = SnakeLogic.tick(b0);
  assert.deepEqual(a1.food, b1.food);
  assert.deepEqual(a1.snake, b1.snake);
});
