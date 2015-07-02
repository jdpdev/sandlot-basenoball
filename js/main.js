var game;

function InitializeGame() {
	game = new Phaser.Game(800, 800, Phaser.AUTO, '');

	// gameState is defined in game.js
	game.state.add(gameStateName, gameState);
	game.state.start(gameStateName);
}