var game;

function InitializeGame() {
	game = new Phaser.Game(800, 600, Phaser.AUTO, "appParent");

	// menuState is defined in menuState.js
	game.state.add(menuStateName, menuState);
	
	// gameState is defined in game.js
	game.state.add(gameStateName, gameState);
	
	GotoMainMenu();
}

function GotoMainMenu() {
	game.state.start(menuStateName, true, false);
}

function GotoGame(homeTeam, awayTeam) {
	game.stage.backgroundColor = 0x00cc00;
	game.state.start(gameStateName, true, false, homeTeam, awayTeam);
}