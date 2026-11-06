/** PRNG pequeño y estable: la misma semilla produce la misma secuencia. */
export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function pickSeeded<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)]!;
}

export function integerSeeded(
  min: number,
  max: number,
  random: () => number,
) {
  return Math.floor(random() * (max - min + 1)) + min;
}
