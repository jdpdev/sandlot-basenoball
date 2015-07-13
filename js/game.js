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

	umpire: null,

	selectedBatterAction: null,
	selectedPitcherAction: null,

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

	pitchTimer: null,

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

		//this.iconTest();

		/*var dialog = new DialogBox(this.homeTeam.getPitcher(), true);
		dialog.setY(40);*/
	},

	update: function() {

	},

	startGame: function() {
		var umpireInfo = {name: "Umpire Cat", icon: "FFF.FF.20.FF.AA0.FF.0F.FF"};
		this.umpire = new Player(0, umpireInfo, 0x222299);

		this.showUmpireDialog("Play ball!", function(option) {
			gameState.startInning();
		});

		//this.startInning();
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
		this.doPitch();
	},

	// Do a pitch for the current at-bat
	doPitch: function() {
		this.selectedBatterAction = null;
		this.selectedPitcherAction = null;

		this.selectPitcherAction();
	},

	// Have the pitcher select their action
	selectPitcherAction: function() {
		var pitcher = this.fieldingTeam.getPitcher();
		this.showChoiceDialog(pitcher, "Pitcher select action:", actionManager.getAvailablePitcherActions(pitcher, 20), 
			function(action) {
				console.log("Pitcher selected action: " + action.text);
				gameState.selectedPitcherAction = action;

				gameState.selectBatterAction();
			});
	},

	// Have the batter select their action
	selectBatterAction: function() {
		var batter = this.aRunners[HOME];
		this.showChoiceDialog(batter, "Batter select action:", actionManager.getAvailableBatterActions(batter, 20), 
			function(action) {
				console.log("Batter selected action: " + action.text);
				gameState.selectedBatterAction = action;

				gameState.throwPitch();
			});
	},

	// Once actions have been selected, throw the pitch
	throwPitch: function() {
		if (this.pitchTimer != null) {
			this.pitchTimer.destroy();
		}

		this.pitchTimer = this.game.time.create(true);
		this.pitchTimer.add(250, pitchTimerResolvePitch, this);
		this.pitchTimer.start();
	},

	// Resolve the current pitch
	resolvePitch: function() {
		this.pitchTimer.stop();
		//this.showUmpireDialog("Strike one!", null);

		var pitcher = this.fieldingTeam.getPitcher();
		var batter = this.aRunners[HOME];

		var pitchSkill = this.selectedPitcherAction.modStat(STAT_PITCHING, pitcher.getInfo().pitching);
		var pitchPower = this.selectedPitcherAction.modStat(STAT_PITCH_POWER, pitcher.getInfo().pitchPower);
		var battingSkill = this.selectedBatterAction.modStat(STAT_BATTING, batter.getInfo().batting);
		var battingPower = this.selectedBatterAction.modStat(STAT_POWER, batter.getInfo().power);
		
		var roll = Math.random();
		var bInStrikeZone = roll <= pitchSkill / 10;

		// Unopposed pitch strike chance: pskill / 10
		if (this.selectedBatterAction.getActionType() == ACTION_START_BATTER_LEAVE) {
			console.log("pitcher rolls " + roll + " <= " + (pitchSkill / 10));

			if (bInStrikeZone) {
				this.recordStrike();
			} else {
				this.recordBall();
			}
		}

		// Batter contact chance: 
		//	delta: Total pitch skill - batting skill
		//	* d15  (25) = 80/20  miss/hit	
		//	* d0   (10) = 50/50
		//	* d-10 (0)  = 20/80
		else {
			if (!bInStrikeZone) {
				battingSkill -= 2;
				battingSkill = Math.max(0, battingSkill);
			}

			var pitchTotal = pitchSkill + pitchPower;
			var delta = pitchTotal - battingSkill + 10;
			var pitchPct = .2 + .6 * (delta / 25);
			var batPct = .8 - .6 * (delta / 25);
			var batRoll = Math.random();

			// Made contact
			if (batRoll <= batPct) {
				console.log("batter made contact: " + batRoll + " <= " + batPct);
			} else {
				console.log("swinging strike: " + batRoll + " <= " + batPct);
				this.recordStrike();
			}
		}
	},

	// Records a strike. Returns true on strike out.
	recordStrike: function() {
		this.iBatterStrikes++;

		if (this.iBatterStrikes >= 3) {
			this.showUmpireDialog("Strike three! You're MEOW-t!", function() {
				gameState.recordOut();
			});
		} else {
			this.showUmpireDialog("Steeeeeee-rike!", function() {
				gameState.doPitch();
			});
		}
	},

	// Records a ball. Returns true on a walk.
	recordBall: function() {
		this.iBatterBalls++;

		if (this.iBatterBalls >= 4) {
			this.showUmpireDialog("Ball four!", function() {
				
			});
		} else {
			this.showUmpireDialog("(Licks some dirt off.)", function() {
				gameState.doPitch();
			});
		}
	},

	// Records an out. Returns true on end-of-inning.
	recordOut: function() {

	},

	handleAtBatWagers: function(batterWager, pitcherWager) {
		console.log("Batter Wager: " + batterWager + ", Pitcher Wager: " + pitcherWager);

		// Pitcher wins ties
		if (pitcherWager >= batterWager) {

		} else {

		}
	},
	

	// Show the umpire's dialog box
	showUmpireDialog: function(text, onClose) {
		var dialog = new DialogBox(this.umpire, true, onClose);

		dialog.setText(text);
		dialog.setY(420);
	},

	// Show a choice dialog for a player
	showChoiceDialog: function(player, text, choices, callback) {
		var dialog = new ChoiceDialog(player, true, callback);
		dialog.setupChoices(text, choices);
		dialog.setY(30);
	},
	
	iconTest: function() {
		var teamA = 0xff0000;
		var teamB = 0x0000ff;
		
		//
		var icon = iconGenerator.generateIcon("00.00.00.00.00.00.00.00", teamA);
		icon.x = 0;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("01.00.04.00.01.00.03.01", teamB);
		icon.x = 150;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("02.00.08.00.02.00.02.02", teamA);
		icon.x = 300;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("03.00.21.00.03.00.01.03", teamB);
		icon.x = 450;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("04.00.00.00.04.00.00.04", teamA);
		icon.x = 600;
		icon.y = 0;
		
		//
		icon = iconGenerator.generateIcon("05.00.01.00.05.00.0E.05", teamB);
		icon.x = 0;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("00.00.05.00.06.00.0D.06", teamA);
		icon.x = 150;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("01.00.22.00.07.00.0C.07", teamB);
		icon.x = 300;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("02.00.00.00.08.00.0B.08", teamA);
		icon.x = 450;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("03.00.00.00.09.00.0A.09", teamB);
		icon.x = 600;
		icon.y = 150;
		
		//
		icon = iconGenerator.generateIcon("04.00.02.00.00.00.09.0A", teamA);
		icon.x = 0;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("05.00.06.00.01.00.08.0B", teamB);
		icon.x = 150;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("00.00.09.00.02.00.07.0C", teamA);
		icon.x = 300;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("01.00.00.00.03.00.06.0D", teamB);
		icon.x = 450;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("02.00.00.00.04.00.05.0E", teamA);
		icon.x = 600;
		icon.y = 300;
		
		//
		icon = iconGenerator.generateIcon("03.00.03.00.05.00.04.0F", teamB);
		icon.x = 0;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("04.00.07.00.06.00.03.10", teamA);
		icon.x = 150;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("05.00.20.00.07.00.02.11", teamB);
		icon.x = 300;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("00.00.00.00.08.00.01.12", teamA);
		icon.x = 450;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("01.00.00.00.09.00.00.13", teamB);
		icon.x = 600;
		icon.y = 450;

		// 
		icon = iconGenerator.generateIcon("FFF.FF.20.FF.AA0.FF.0F.FF", 0);
		icon.x = 0;
		icon.y = 600;
	}
};

function pitchTimerResolvePitch() {
	gameState.resolvePitch();
}