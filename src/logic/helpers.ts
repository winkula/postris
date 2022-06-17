export function calculateScore(level: number, lines: number) {
  return [0, 100, 300, 500, 800][lines] * level;
}

export function calculateSpeed(level: number) {
  return 1000 * Math.pow(0.8 - (level - 1) * 0.007, level - 1);
}

export function calculateLevel(startLevel: number, lines: number) {
  const level = startLevel + Math.floor(lines / 10);
  return Math.min(level, 15);
}
