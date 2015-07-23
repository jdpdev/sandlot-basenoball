var menuStateName = "Menu";

var menuState = {
    modalScreen: null,
    
    preload: function() {
		
	},

	create: function() {
		gameField.DrawField(game);
		
		this.modalScreen = game.add.graphics(0, 0);
		/*this.modalScreen.beginFill(0, 0.7);
		this.modalScreen.drawRect(0, 0, game.width, game.height);
		this.modalScreen.endFill();*/
		
		var menuScreen = new MainMenu(0, 0, game.width, game.height);
	},

	update: function() {

	},
	
	shutdown: function() {
	    game.removeChild(modalScreen);
	}
};