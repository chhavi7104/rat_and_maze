 const mazeContainer = document.getElementById('maze-container');
    const generateBtn = document.getElementById('generate');
    const solveBtn = document.getElementById('solve');
    const resetBtn = document.getElementById('reset');
    const nextLevelBtn = document.getElementById('next-level');
    const playerInput = document.getElementById('player');
    const levelSelect = document.getElementById('level');
    const levelCompleteDiv = document.getElementById('level-complete');
    
    // Touch controls
    const upBtn = document.getElementById('up-btn');
    const leftBtn = document.getElementById('left-btn');
    const downBtn = document.getElementById('down-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Info displays
    const playerNameDisplay = document.getElementById('player-name');
    const currentLevelDisplay = document.getElementById('current-level');
    const currentScoreDisplay = document.getElementById('current-score');
    const currentTimeDisplay = document.getElementById('current-time');
    const completeTimeDisplay = document.getElementById('complete-time');
    const completeScoreDisplay = document.getElementById('complete-score');
    
    // Game variables
    let maze = [];
    let mazeSize = 15;
    let ratPosition = { x: 1, y: 1 };
    let cheesePosition = { x: 1, y: 1 };
    let solutionPath = [];
    let isSolving = false;
    let startTime = 0;
    let timerInterval = null;
    let currentScore = 0;
    let currentLevel = 1;
    let playerName = "Guest";
    let cellSize = 0;
    
    // Initialize the game
    document.addEventListener('DOMContentLoaded', () => {
      updatePlayerName();
      generateMaze();
      
      // Set up event listeners
      generateBtn.addEventListener('click', generateMaze);
      solveBtn.addEventListener('click', toggleSolution);
      resetBtn.addEventListener('click', resetRatPosition);
      nextLevelBtn.addEventListener('click', startNextLevel);
      playerInput.addEventListener('input', updatePlayerName);
      levelSelect.addEventListener('change', updateLevel);
      
      // Set up keyboard controls
      document.addEventListener('keydown', handleKeyPress);
      
      // Set up touch controls
      upBtn.addEventListener('touchstart', () => moveRat(0, -1));
      leftBtn.addEventListener('touchstart', () => moveRat(-1, 0));
      downBtn.addEventListener('touchstart', () => moveRat(0, 1));
      rightBtn.addEventListener('touchstart', () => moveRat(1, 0));
      
      // Prevent touch controls from scrolling
      document.querySelectorAll('.touch-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
      });
      
      // Handle window resize
      window.addEventListener('resize', adjustMazeSize);
    });
    
    // Update player name
    function updatePlayerName() {
      playerName = playerInput.value || "Guest";
      playerNameDisplay.textContent = playerName;
    }
    
    // Update level
    function updateLevel() {
      currentLevel = parseInt(levelSelect.value);
      currentLevelDisplay.textContent = currentLevel;
      generateMaze();
    }
    
    // Generate maze based on current level
    function generateMaze() {
      // Clear any existing timer
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Set maze size based on level
      switch(currentLevel) {
        case 1: mazeSize = 11; break;
        case 2: mazeSize = 15; break;
        case 3: mazeSize = 21; break;
        case 4: mazeSize = 25; break;
        case 5: mazeSize = 31; break;
        default: mazeSize = 15;
      }
      
      // Generate the maze
      maze = generateMazeArray(mazeSize);
      
      // Set start and end positions
      ratPosition = { x: 1, y: 1 };
      cheesePosition = { x: mazeSize - 2, y: mazeSize - 2 };
      
      // Render the maze
      renderMaze();
      
      // Start timer
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 100);
    }
    
    
    // Adjust maze size when window resizes
    function adjustMazeSize() {
      if (maze.length > 0) {
        renderMaze();
      }
    }
    
    // Generate a maze using Depth-First Search algorithm
    function generateMazeArray(size) {
      // Initialize grid with all walls
      const grid = Array(size).fill().map(() => Array(size).fill(1));
      
      // Ensure size is odd
      if (size % 2 === 0) size--;
      
      // Carve out paths
      function carve(x, y) {
        grid[y][x] = 0;
        
        // Set directions in random order
        const directions = [
          {dx: 0, dy: -2}, // up
          {dx: 0, dy: 2},  // down
          {dx: -2, dy: 0}, // left
          {dx: 2, dy: 0}   // right
        ].sort(() => Math.random() - 0.5);
        
        for (const dir of directions) {
          const nx = x + dir.dx;
          const ny = y + dir.dy;
          
          if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
            grid[y + dir.dy/2][x + dir.dx/2] = 0; // Remove wall between
            carve(nx, ny);
          }
        }
      }
      
      // Start carving from (1,1)
      carve(1, 1);
      
      // Set entrance and exit
      grid[1][0] = 0; // Entrance
      grid[size-2][size-1] = 0; // Exit
      
      return grid;
    }
    
    // Render the maze
    function renderMaze() {
        document.documentElement.style.setProperty('--maze-size', mazeSize);
      mazeContainer.innerHTML = '';
      
      // Calculate cell size based on container
      const containerSize = Math.min(
        mazeContainer.parentElement.clientWidth,
        mazeContainer.parentElement.clientHeight
      );
      cellSize = containerSize / mazeSize;
      
      // Set maze container dimensions
      mazeContainer.style.width = `${mazeSize * cellSize}px`;
      mazeContainer.style.height = `${mazeSize * cellSize}px`;
      
      // Create cells
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          
          if (maze[y][x] === 1) {
            cell.classList.add('wall');
          } else {
            cell.classList.add('path');
            
            if (x === 1 && y === 1) {
              cell.classList.add('start');
            } else if (x === mazeSize - 2 && y === mazeSize - 2) {
              cell.classList.add('end');
            }
          }
          
          // Highlight solution path if showing
          
         
          // In the renderMaze function, update the solution path highlighting:
           if (isSolving && solutionPath.some(pos => pos.x === x && pos.y === y)) {
             cell.classList.add('solution');
               cell.style.zIndex = '3'; // Ensure solution appears above other elements
            }
          mazeContainer.appendChild(cell);
        }
      }
      
      // Create rat
      const rat = document.createElement('div');
      rat.id = 'rat';
      updateRatPosition();
      mazeContainer.appendChild(rat);
      
      // Create cheese
      const cheese = document.createElement('div');
      cheese.id = 'cheese';
      cheese.style.left = `${cheesePosition.x * cellSize}px`;
      cheese.style.top = `${cheesePosition.y * cellSize}px`;
      cheese.style.width = `${cellSize * 0.8}px`;
      cheese.style.height = `${cellSize * 0.8}px`;
      mazeContainer.appendChild(cheese);
    }
    
    // Update rat position on screen
    function updateRatPosition() {
      const rat = document.getElementById('rat');
      if (rat) {
        rat.style.left = `${ratPosition.x * cellSize + cellSize * 0.1}px`;
        rat.style.top = `${ratPosition.y * cellSize + cellSize * 0.1}px`;
        rat.style.width = `${cellSize * 0.8}px`;
        rat.style.height = `${cellSize * 0.8}px`;
      }
    }
    
    // Handle movement
    function moveRat(dx, dy) {
      if (isSolving) return;
      
      const newX = ratPosition.x + dx;
      const newY = ratPosition.y + dy;
      
      // Check if move is valid
      if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] === 0) {
        ratPosition = { x: newX, y: newY };
        updateRatPosition();
        
        // Check if reached cheese
        if (ratPosition.x === cheesePosition.x && ratPosition.y === cheesePosition.y) {
          levelCompleted();
        }
      }
    }
    
    // Handle keyboard controls
    function handleKeyPress(e) {
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveRat(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          moveRat(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveRat(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRat(1, 0);
          break;
      }
    }
    
    // Toggle solution display
    function toggleSolution() {
      if (isSolving) {
        isSolving = false;
        solveBtn.textContent = "Show Solution";
      } else {
        // Solve the maze using A* algorithm
        solutionPath = solveMaze(ratPosition, cheesePosition);
        isSolving = true;
        solveBtn.textContent = "Hide Solution";
      }
      renderMaze();
    }
    
    // Solve the maze using A* algorithm
    function solveMaze(start, end) {
      // Heuristic function (Manhattan distance)
      function heuristic(pos) {
        return Math.abs(pos.x - end.x) + Math.abs(pos.y - end.y);
      }
      
      // Initialize open and closed sets
      const openSet = [start];
      const cameFrom = {};
      const gScore = {};
      const fScore = {};
      
      // Initialize scores
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          gScore[`${x},${y}`] = Infinity;
          fScore[`${x},${y}`] = Infinity;
        }
      }
      
      gScore[`${start.x},${start.y}`] = 0;
      fScore[`${start.x},${start.y}`] = heuristic(start);
      
      // A* algorithm
      while (openSet.length > 0) {
        // Find node in openSet with lowest fScore
        let current = openSet[0];
        let currentIndex = 0;
        
        for (let i = 1; i < openSet.length; i++) {
          const node = openSet[i];
          if (fScore[`${node.x},${node.y}`] < fScore[`${current.x},${current.y}`]) {
            current = node;
            currentIndex = i;
          }
        }
        
        // Check if we've reached the end
        if (current.x === end.x && current.y === end.y) {
          // Reconstruct path
          const path = [current];
          while (`${current.x},${current.y}` in cameFrom) {
            current = cameFrom[`${current.x},${current.y}`];
            path.unshift(current);
          }
          return path;
        }
        
        // Move current from openSet to closed set
        openSet.splice(currentIndex, 1);
        
        // Check neighbors
        const neighbors = [
          {x: current.x, y: current.y - 1}, // up
          {x: current.x, y: current.y + 1}, // down
          {x: current.x - 1, y: current.y}, // left
          {x: current.x + 1, y: current.y}  // right
        ];
        
        for (const neighbor of neighbors) {
          // Skip if out of bounds or wall
          if (neighbor.x < 0 || neighbor.x >= mazeSize || 
              neighbor.y < 0 || neighbor.y >= mazeSize || 
              maze[neighbor.y][neighbor.x] === 1) {
            continue;
          }
          
          // Calculate tentative gScore
          const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
          
          if (tentativeGScore < gScore[`${neighbor.x},${neighbor.y}`]) {
            // This path to neighbor is better than any previous one
            cameFrom[`${neighbor.x},${neighbor.y}`] = current;
            gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
            fScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore + heuristic(neighbor);
            
            if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
              openSet.push(neighbor);
            }
          }
        }
      }
      
      // No solution found
      return [];
    }
    
    // Reset rat position to start
    function resetRatPosition() {
      ratPosition = { x: 1, y: 1 };
      updateRatPosition();
    }
    
    // Update timer display
    function updateTimer() {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      currentTimeDisplay.textContent = `${elapsed}s`;
    }
    
    // Handle level completion
    function levelCompleted() {
      // Stop timer
      clearInterval(timerInterval);
      timerInterval = null;
      
      // Calculate time and score
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const levelScore = calculateScore(timeTaken, currentLevel);
      currentScore += levelScore;
      currentScoreDisplay.textContent = currentScore;
      
      // Show completion message
      completeTimeDisplay.textContent = timeTaken;
      completeScoreDisplay.textContent = levelScore;
      levelCompleteDiv.style.display = 'block';
    }
    
    // Calculate score based on time and level
    function calculateScore(time, level) {
      // Base score is 1000 for level 1, increasing by 500 per level
      const baseScore = 1000 + (level - 1) * 500;
      
      // Deduct 10 points per second
      const timePenalty = time * 10;
      
      // Minimum score is 100
      return Math.max(100, baseScore - timePenalty);
    }
    
    // Start next level
    function startNextLevel() {
      levelCompleteDiv.style.display = 'none';
      
      // Increase level if not at max
      if (currentLevel < 5) {
        currentLevel++;
        currentLevelDisplay.textContent = currentLevel;
        levelSelect.value = currentLevel;
      }
      
      generateMaze();
    }