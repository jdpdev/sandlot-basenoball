var gameStateName = "Game";

var HOME = 0;
var FIRST = 1;
var SECOND = 2;
var THIRD = 3;

var LINE_DRIVE = 0;
var GROUND_BALL = 1;
var FLY_BALL = 2;

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

	// Number of runners currently in motion
	iRunningRunners: 0,

	pitchTimer: null,

	preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');

		actionManager.loadActions();
		lineManager.load();
	},

	create: function() {
		actionManager.parseActions();
		lineManager.parse();

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
			this.awayTeam.batTeam(this.bIsTopOfInning);	

			this.fieldingTeam = this.homeTeam;
			this.battingTeam = this.awayTeam;
		} else {
			this.homeTeam.batTeam(this.bIsTopOfInning);
			this.awayTeam.fieldTeam();

			this.fieldingTeam = this.awayTeam;
			this.battingTeam = this.homeTeam;
		}

		this.iInningOuts = 0;
		this.iBatterStrikes = 0;
		this.iBatterBalls = 0;
		this.aRunners = [null, null, null, null];

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

		this.showPlayerDialog(this.aRunners[HOME], true, "New Batter\n" + this.aRunners[HOME].getName(), function() {
			gameState.beginAtBat(gameState.aRunners[HOME], gameState.fieldingTeam.getPitcher());	
		});
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
		this.iBatterStrikes = 0;
		this.iBatterBalls = 0;

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
				this.recordStrike(true);
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
				this.handleHit(batPct - batRoll, battingSkill, battingPower);
			} else {
				console.log("swinging strike: " + batRoll + " <= " + batPct);
				this.recordStrike(false);
			}
		}
	},

	// Records a strike. Returns true on strike out.
	recordStrike: function(bLooking) {
		this.iBatterStrikes++;

		if (this.iBatterStrikes >= 3) {
			this.showUmpireDialog("Strike three! You're MEOW-t!", function() {
				gameState.recordOut(gameState.aRunners[HOME]);
			});
		} else {
			this.showUmpireDialog(lineManager.getStrikeLine(bLooking).text, function() {
				gameState.doPitch();
			});
		}
	},

	// Records a ball. Returns true on a walk.
	recordBall: function() {
		this.iBatterBalls++;

		if (this.iBatterBalls >= 4) {
			this.showUmpireDialog("Ball four!", function() {
				gameState.walkBatter();
			});
		} else {
			this.showUmpireDialog(lineManager.getBallLine().text, function() {
				gameState.doPitch();
			});
		}
	},

	// Records an out. Returns true on end-of-inning.
	recordOut: function(player) {
		this.iInningOuts++;
		console.log("Outs: " + this.iInningOuts);

		if (this.iInningOuts >= 3) {
			this.endInning();
		} else {
			this.sendBatterToDugout(player);
			this.callNewBatter();
		}
	},

	// Walk the batter and advance all forced runners
	walkBatter: function() {
		var startBase = HOME;
		var bIsForced = true;
		
		for (var i = startBase; i <= THIRD; i++) {
			if (this.aRunners[i] == null) {
				bIsForced = false;
				continue;
			}
			
			// TODO have some AI decide a not-forced runner
			var targetBase = i + 1;
			
			if (targetBase > THIRD) {
				targetBase = HOME;
			}
			
			this.iRunningRunners++;
			this.aRunners[i].advanceToBase(targetBase);
			bIsForced = true;
		}
	},

	// Handle getting bat on ball
	// margin is the difference between roll and what they were rolling for
	handleHit: function(margin, battingSkill, battingPower) {
		//this.recordOut();

		// Hit types: line drive, ground ball, fly ball
		// 	* Line drives require high margin, and are most productive
		//	* Ground ball medium margin
		//	* Fly ball low margin 
		//
		// Margin caps at .8

		// Line drive, ground ball, fly ball
		var weights = [3, 6, 5];
		var weightTotal = 14;
		var hitType = 2;
		var roll = Math.floor(Math.random() * weightTotal);

		for (var i = 0; i < weights.length; i++) {
			roll -= weights[i];

			if (roll <= 0) {
				hitType = i;
				break;
			}
		} 

		// Based on the type of hit, pick a fielder to be the general vicinity.
		// Difficulty for fielder is function of margin, batting skill and power.
		// Fielder counters with fielding skill and speed.
		//
		// Line drive picks infield or outfield 
		//	- Can pick infielders or outfielders with even odds
		//	- Bskill and margin for outfield, +bpower for infield
		//	- If goes to outfield, almost guarantee at least a single
		// Fly ball picks infield or outfield
		//	- Better margin goes flatter, power how far
		// Grounder picks infield
		//	- Bskill for base difficulty, power function of margin
		//
		// TODO what range should difficulty be normalized to?
		switch (hitType) {
			// Line drive
			case 0:
				// Select target fielder
				var targetFielder = Math.floor(Math.random() * 8);

				if (targetFielder == 8) {
					targetFielder--;
				}

				// Exclude the catcher (index 1)
				if (targetFielder > 0) {
					targetFielder + 1;
				}

				var difficulty = 0;

				// Infield and outfield use different math
				if (targetFielder < LEFT_FIELD) {
					difficulty = battingSkill * margin + battingPower;

					// Make it harder for the pitcher
					if (targetFielder == PITCHER && battingPower * margin >= 5) {
						difficulty *= 1.5;
					}
				} else {
					difficulty = battingSkill * margin * 2 + battingPower;
				}

				console.log("Line drive to " + targetFielder + " (difficulty: " + difficulty + ")");

				this.showUmpireDialog("Line drive to " + GetPlayerPositionName(targetFielder) + "!", function() {
					gameState.putBallInPlay(HOME);
				});
				break;

			// Ground ball
			case 1:
				// TODO 
				//	* see if fielders get it
				//	* see if runner makes it
				//	* runner action intercept
				console.log("Ground ball");
				this.showUmpireDialog("Grounder up the middle!", function() {
					gameState.putBallInPlay(HOME);
				});
				break;

			// Fly ball
			default:
			case 2:
				console.log("Fly ball");
				this.showUmpireDialog("Fly ball to shallow left!", function() {
					gameState.recordOut(gameState.aRunners[HOME]);
				});
				break;
		}
	},

	
	
	// Tell the runners that the ball is in play
	// Forced runners will all move to the next base. Non-forced will decide on their own.
	putBallInPlay: function(hitType, difficulty, targetFielder) {
		var startBase = HOME;
		var bIsForced = true;
		
		for (var i = startBase; i <= THIRD; i++) {
			if (this.aRunners[i] == null) {
				bIsForced = false;
				continue;
			}
			
			var targetBase = i + 1;
			
			if (targetBase > THIRD) {
				targetBase = HOME;
			}
			
			this.iRunningRunners++;
			this.aRunners[i].ballInPlay(targetBase, hitType, difficulty, targetFielder, bIsForced);
			bIsForced = true;
		}
	},

	// Called by runner when it's done, either when run complete or intercepted early
	// bAtBase true if reached base on its own
	runnerReportComplete: function(runner, targetBase, bAtBase) {
		this.iRunningRunners--;

		this.aRunners[targetBase] = runner;

		// TODO safe or out
		if (targetBase == HOME) {

		}

		if (this.iRunningRunners <= 0) {
			this.callNewBatter();
		}
	},

	// Show the umpire's dialog box
	showUmpireDialog: function(text, onClose) {
		var dialog = new DialogBox(this.umpire, true, onClose);

		dialog.setText(text);
		dialog.setY(420);
	},
	
	// Shows a generic dialog for a specific player
	showPlayerDialog: function(player, bLeft, text, onClose) {
		var dialog = new DialogBox(player, bLeft, onClose);

		dialog.setText(text);
		dialog.setY(30);
	},

	// Show a choice dialog for a player
	showChoiceDialog: function(player, text, choices, callback) {
		var dialog = new ChoiceDialog(player, true, callback);
		dialog.setupChoices(text, choices);
		dialog.setY(30);
	},

	sendBatterToDugout: function(player) {
		var dugoutPos;

		if (this.bIsTopOfInning) {
			dugoutPos = gameField.GetAwayDugoutPos();
		} else {
			dugoutPos = gameField.GetHomeDugoutPos();
		}

		player.returnToDugout(dugoutPos);
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