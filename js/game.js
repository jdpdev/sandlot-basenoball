var gameStateName = "Game";

var HOME = 0;
var FIRST = 1;
var SECOND = 2;
var THIRD = 3;

var gameState = {

	// The teams
	homeTeam: new Team(),
	awayTeam: new Team(),

	battingTeam: null,
	fieldingTeam: null,

	// Game state
	iCurrentInning: 0,
	bIsTopOfInning: true,

	aHomeInnings: [0, 0, 0, 0, 0, 0, 0, 0, 0],
	aAwayInnings: [0, 0, 0, 0, 0, 0, 0, 0, 0],

	// Inning state
	iInningOuts: 0,
	iBatterStrikes: 0,
	iBatterBalls: 0,

	// Player object that occupies each base: home, first, second, third
	aRunners: [null, null, null, null],

	preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');

		actionManager.loadActions();
	},

	create: function() {
		actionManager.parseActions();

		gameField.DrawField(game);

		this.homeTeam.loadTeam(game.cache.getJSON("mutineers"));
		this.awayTeam.loadTeam(game.cache.getJSON("spacebutts"));

		this.startGame();
	},

	update: function() {

	},

	startGame: function() {
		this.startInning();
	},

	startInning: function() {
		if (this.bIsTopOfInning) {
			this.homeTeam.fieldTeam();
			this.awayTeam.batTeam();	

			this.fieldingTeam = this.homeTeam;
			this.battingTeam = this.awayTeam;
		} else {
			this.homeTeam.batTeam();
			this.awayTeam.fieldTeam();

			this.fieldingTeam = this.awayTeam;
			this.battingTeam = this.homeTeam;
		}

		this.iInningOuts = 0;
		this.iBatterStrikes = 0;
		this.iBatterBalls = 0;

		this.callNewBatter();
	},

	endInning: function() {
		// Check for end of game
		if (this.iCurrentInning >= 8 || (this.iCurrentInning == 7 && this.bIsTopOfInning)) {

		}

		if (!this.bIsTopOfInning) {
			this.iCurrentInning++;
		}

		this.bIsTopOfInning = !this.bIsTopOfInning;
		this.startInning();
	},

	endGame: function() {

	},

	callNewBatter: function() {
		this.aRunners[HOME] = this.battingTeam.presentNextBatter();

		this.beginAtBat(this.aRunners[HOME], this.fieldingTeam.getPitcher());
	},

	/* *** Game Logic *****************************************************************
		- Begin at-bat
			1) Players make AP bets in secret
			2) Highest bid choses first
			3) Resolve base on stats and argument mods, have umpire announce
			...and so on
		- Ball in play
			1) Umpire decides where ball is going and how

	*/	

	// Begin an at bat between a batter and a pitcher
	beginAtBat: function(batter, pitcher) {
		openWagerDialog(pitcher.getName(), "Pitcher", pitcher.getAP(), function(wagerAmount) {
			var pitcherWager = wagerAmount;

			openWagerDialog(batter.getName(), "Batter", batter.getAP(), function(wagerAmount) {
				gameState.handleAtBatWagers(wagerAmount, pitcherWager);
			});
		});
	},

	handleAtBatWagers: function(batterWager, pitcherWager) {
		console.log("Batter Wager: " + batterWager + ", Pitcher Wager: " + pitcherWager);
	}
};