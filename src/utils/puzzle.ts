
export type Grid = number[];

export const createSolvedGrid = (size: number): Grid => {
  return Array.from({ length: size * size }, (_, i) => i);
};

export const isSolved = (grid: Grid): boolean => {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== i) return false;
  }
  return true;
};

export const shuffleGrid = (size: number, levelIndex: number = 20): Grid => {
  const grid = createSolvedGrid(size);
  let emptyIndex = size * size - 1;
  let previousIndex = -1;

  // Sufficient number of moves to randomize the board
  let moves = size * size * 50; 
  if (levelIndex < 15) {
    moves = Math.max(2, levelIndex + 2); // 2 to 16 moves for easy start
  }

  for (let i = 0; i < moves; i++) {
    const possibleMoves: number[] = [];
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    if (row > 0) possibleMoves.push(emptyIndex - size); // Up
    if (row < size - 1) possibleMoves.push(emptyIndex + size); // Down
    if (col > 0) possibleMoves.push(emptyIndex - 1); // Left
    if (col < size - 1) possibleMoves.push(emptyIndex + 1); // Right

    // Filter out the move that would undo the previous move to avoid immediate backtracking
    let validMoves = possibleMoves.filter(idx => idx !== previousIndex);
    
    // Fallback if trapped (shouldn't happen in grid, but for safety)
    if (validMoves.length === 0) validMoves = possibleMoves;

    const randomMoveIndex = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    [grid[emptyIndex], grid[randomMoveIndex]] = [grid[randomMoveIndex], grid[emptyIndex]];
    previousIndex = emptyIndex;
    emptyIndex = randomMoveIndex;
  }

  return grid;
};

export const canMove = (index: number, emptyIndex: number, size: number): boolean => {
  const row = Math.floor(index / size);
  const col = index % size;
  const emptyRow = Math.floor(emptyIndex / size);
  const emptyCol = emptyIndex % size;

  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  );
};

export const moveTile = (grid: Grid, index: number, emptyIndex: number): Grid => {
  const newGrid = [...grid];
  [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
  return newGrid;
};

export const getManhattanDistance = (grid: Grid, size: number): number => {
  let distance = 0;
  for (let i = 0; i < grid.length; i++) {
    const value = grid[i];
    if (value === size * size - 1) continue; // Skip empty tile
    const targetRow = Math.floor(value / size);
    const targetCol = value % size;
    const currentRow = Math.floor(i / size);
    const currentCol = i % size;
    distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
  }
  return distance;
};

export const getSuggestedMove = (grid: Grid, size: number): number | null => {
  const emptyIndex = grid.indexOf(size * size - 1);
  const possibleMoves: number[] = [];
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;

  if (row > 0) possibleMoves.push(emptyIndex - size); // Up
  if (row < size - 1) possibleMoves.push(emptyIndex + size); // Down
  if (col > 0) possibleMoves.push(emptyIndex - 1); // Left
  if (col < size - 1) possibleMoves.push(emptyIndex + 1); // Right

  let bestMove = -1;
  let minDistance = Infinity;

  // If already solved, return null
  if (isSolved(grid)) return null;

  for (const moveIndex of possibleMoves) {
    const newGrid = [...grid];
    // Swap
    [newGrid[emptyIndex], newGrid[moveIndex]] = [newGrid[moveIndex], newGrid[emptyIndex]];
    
    const distance = getManhattanDistance(newGrid, size);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestMove = moveIndex;
    }
  }

  return bestMove !== -1 ? bestMove : null;
};
