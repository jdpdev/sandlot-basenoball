var game;

function InitializeGame() {
	game = new Phaser.Game(800, 600, Phaser.AUTO, '');

	// gameState is defined in game.js
	game.state.add(gameStateName, gameState);
	game.state.start(gameStateName);
}