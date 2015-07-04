var gameStateName = "Game";

var gameState = {

	homeTeam: new Team(),
	awayTeam: new Team(),
	field: new Field(),

	preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');
	},

	create: function() {
		this.field.DrawField(game);

		this.homeTeam.loadTeam(game.cache.getJSON("mutineers"));
		this.awayTeam.loadTeam(game.cache.getJSON("spacebutts"));
	},

	update: function() {

	}
};