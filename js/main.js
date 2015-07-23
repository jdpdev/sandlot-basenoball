var game;

function InitializeGame() {
	game = new Phaser.Game(800, 600, Phaser.AUTO, '');

	// menuState is defined in menuState.js
	game.state.add(menuStateName, menuState);
	
	// gameState is defined in game.js
	game.state.add(gameStateName, gameState);
	
	game.state.start(menuStateName);
}