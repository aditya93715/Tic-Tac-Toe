document.addEventListener('DOMContentLoaded', () => {
	const cells = document.querySelectorAll('.cell');
	const message = document.querySelector('.message');
	const restartModal = document.getElementById('restart-modal');
	const confirmRestartBtn = document.getElementById('confirm-restart');
	const cancelRestartBtn = document.getElementById('cancel-restart');
	const modalMessage = document.getElementById('modal-message');
  
	const bgMusic = document.getElementById('bg-music');
	const musicToggleBtn = document.getElementById('music-toggle');
  
	// Celebration sound effect audio
	const celebrationSound = new Audio('audio/celebration.mp3');
  
	let boardState = ['', '', '', '', '', '', '', '', ''];
	let currentPlayer = 'X';
	let gameActive = true;
  
	const winPatterns = [
	  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
	  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
	  [0, 4, 8], [2, 4, 6]             // Diagonals
	];
  
	function celebrate() {
	  if (typeof confetti === 'function') {
		confetti({
		  particleCount: 150,
		  spread: 70,
		  origin: { y: 0.6 }
		});
	  }
	}
  
	function checkWin() {
	  for (const pattern of winPatterns) {
		const [a, b, c] = pattern;
		if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
		  return boardState[a];
		}
	  }
	  return null;
	}
  
	function checkDraw() {
	  return !boardState.includes('');
	}
  
	function updateMessage(text) {
	  message.textContent = text;
	}
  
	function stopBackgroundMusic() {
	  if (!bgMusic.paused) {
		bgMusic.pause();
	  }
	}
  
	function playBackgroundMusic() {
	  if (bgMusic.paused) {
		bgMusic.play().catch(() => {
		  // Autoplay might be blocked; ignore errors
		});
	  }
	}
  
	function cellClick(cell, index) {
	  if (boardState[index] === '' && gameActive) {
		boardState[index] = currentPlayer;
		cell.textContent = currentPlayer;
		cell.disabled = true;
  
		const winningPlayer = checkWin();
		if (winningPlayer) {
		  updateMessage(`🎉 Player ${winningPlayer} wins! 🎉`);
		  modalMessage.innerHTML = `🎉 <b>Player ${winningPlayer} wins!</b><br>Congratulations!<br>Do you want to play again?`;
		  celebrate();
		  celebrationSound.play().catch(() => { /* ignore play errors */ });
		  stopBackgroundMusic();
		  gameActive = false;
		  endGame();
		} else if (checkDraw()) {
		  updateMessage("🤝 It's a draw! Well played!");
		  modalMessage.innerHTML = `🤝 <b>It's a draw!</b><br>Well played!<br>Do you want to play again?`;
		  stopBackgroundMusic();
		  gameActive = false;
		  endGame();
		} else {
		  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
		  updateMessage(`${currentPlayer}'s turn`);
		  if (currentPlayer === 'O' && gameActive) {
			aiMove();
		  }
		}
	  }
	}
  
	function aiMove() {
	  gameActive = false;
	  updateMessage("AI is thinking...");
  
	  setTimeout(() => {
		let bestMove;
		let bestScore = -Infinity;
		for (let i = 0; i < boardState.length; i++) {
		  if (boardState[i] === '') {
			boardState[i] = 'O';
			let score = minimax(boardState, 0, false);
			boardState[i] = '';
			if (score > bestScore) {
			  bestScore = score;
			  bestMove = i;
			}
		  }
		}
		boardState[bestMove] = 'O';
		cells[bestMove].textContent = 'O';
		cells[bestMove].disabled = true;
  
		const winningPlayer = checkWin();
		if (winningPlayer) {
		  updateMessage(`🎉 Player ${winningPlayer} wins! 🎉`);
		  modalMessage.innerHTML = `🎉 <b>Player ${winningPlayer} wins!</b><br>Congratulations!<br>Do you want to play again?`;
		  celebrate();
		  celebrationSound.play().catch(() => { /* ignore play errors */ });
		  stopBackgroundMusic();
		  gameActive = false;
		  endGame();
		} else if (checkDraw()) {
		  updateMessage("🤝 It's a draw! Well played!");
		  modalMessage.innerHTML = `🤝 <b>It's a draw!</b><br>Well played!<br>Do you want to play again?`;
		  stopBackgroundMusic();
		  gameActive = false;
		  endGame();
		} else {
		  currentPlayer = 'X';
		  updateMessage(`${currentPlayer}'s turn`);
		  gameActive = true;
		}
	  }, 500);
	}
  
	function minimax(board, depth, isMaximizing) {
	  let scores = {
		'X': -1,
		'O': 1,
		'draw': 0
	  };
  
	  let result = checkWin();
	  if (result !== null) {
		return scores[result];
	  }
  
	  if (!board.includes('')) {
		return scores['draw'];
	  }
  
	  if (isMaximizing) {
		let bestScore = -Infinity;
		for (let i = 0; i < board.length; i++) {
		  if (board[i] === '') {
			board[i] = 'O';
			let score = minimax(board, depth + 1, false);
			board[i] = '';
			bestScore = Math.max(score, bestScore);
		  }
		}
		return bestScore;
	  } else {
		let bestScore = Infinity;
		for (let i = 0; i < board.length; i++) {
		  if (board[i] === '') {
			board[i] = 'X';
			let score = minimax(board, depth + 1, true);
			board[i] = '';
			bestScore = Math.min(score, bestScore);
		  }
		}
		return bestScore;
	  }
	}
  
	function restartGame() {
	  boardState = ['', '', '', '', '', '', '', '', ''];
	  currentPlayer = 'X';
	  gameActive = true;
	  updateMessage(`${currentPlayer}'s turn`);
	  cells.forEach(cell => {
		cell.textContent = '';
		cell.disabled = false;
	  });
	  restartModal.classList.add('hidden');
	  playBackgroundMusic();
	}
  
	function endGame() {
	  restartModal.classList.remove('hidden');
	  gameActive = false;
	}
  
	cells.forEach((cell, index) => {
	  cell.addEventListener('click', () => cellClick(cell, index));
	});
  
	confirmRestartBtn.addEventListener('click', () => {
	  restartGame();
	});
  
	cancelRestartBtn.addEventListener('click', () => {
	  restartModal.classList.add('hidden');
	  // Game remains ended, no restart
	});
  
	musicToggleBtn.addEventListener('click', () => {
	  if (bgMusic.paused) {
		bgMusic.play();
		musicToggleBtn.textContent = '🔊 Music On';
	  } else {
		bgMusic.pause();
		musicToggleBtn.textContent = '🔈 Music Off';
	  }
	});
  
	updateMessage(`${currentPlayer}'s turn`);
  });
  