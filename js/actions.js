var actionManager = {

	actionPath: "./data/actions/",
	batterCache: "batterActions",
	
	batterActions: null,
	runnerActions: null,
	pitcherActions: null,
	fielderActions: null,

	// Called by game on statup
	loadActions: function() {
		game.load.json("batterActions", './data/actions/batter.json');
	},

	parseActions: function() {
		this.batterActions = game.cache.getJSON("batterActions")["actions"];
	}
}