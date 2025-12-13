const SIZE = 4;

export function generatePuzzle(shuffles) {
  let puzzle = [...Array(15).keys()].map(i => i + 1).concat(null);

  for (let i = 0; i < shuffles; i++) {
    const empty = puzzle.indexOf(null);
    const r = Math.floor(empty / SIZE);
    const c = empty % SIZE;

    const neighbors = [];
    [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc]) => {
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        neighbors.push(nr * SIZE + nc);
      }
    });

    const swap = neighbors[Math.floor(Math.random() * neighbors.length)];
    [puzzle[empty], puzzle[swap]] = [puzzle[swap], puzzle[empty]];
  }

  return puzzle;
}

export function isSolved(puzzle) {
  return puzzle.slice(0, 15).every((v, i) => v === i + 1);
}
