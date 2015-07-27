var menuStateName = "Menu";

var menuState = {
    modalScreen: null,
    currentScreen: null,
    
    preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');
	},

	create: function() {
		gameField.DrawField(game);
		
		/*this.modalScreen = game.add.graphics(0, 0);
		this.modalScreen.beginFill(0, 0.7);
		this.modalScreen.drawRect(0, 0, game.width, game.height);
		this.modalScreen.endFill();*/
		
		this.changeScreen(MainMenu);
	},

	update: function() {

	},
	
	shutdown: function() {
	    //game.removeChild(modalScreen);
	},
	
	changeScreen: function(screenType, param) {
	    if (this.currentScreen != null) {
	        this.currentScreen.close();
	    }
	    
	    this.currentScreen = new screenType(this, param);
	    this.currentScreen.open();
	},
	
	showHomeTeamSelection: function() {
	    this.changeScreen(ManageTeam, {home: true, otherTeam: null});
	},
	
	showAwayTeamSelection: function(homeTeam) {
	    this.changeScreen(ManageTeam, {home: false, otherTeam: homeTeam});
	},
	
	startGame: function(homeTeam, awayTeam) {
		GotoGame(homeTeam, awayTeam);
	}
};