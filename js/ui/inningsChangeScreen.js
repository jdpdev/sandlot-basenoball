// Dialog to display on half-innings change.
var InningsChangeScreen = function(homeScore, awayScore, currentInning, bTop, battingTeam, fieldingTeam) {
	this.graphics = game.add.graphics(game.width * 0.5, 0);

	var signStart = new Phaser.Point(-300, 50);
    var signSize = new Phaser.Point(600, 300);

    // Main panel
    this.graphics.beginFill(0xDEB887);
    this.graphics.drawRect(signStart.x, signStart.y, signSize.x, signSize.y);
    this.graphics.endFill();

    // Perspective
    this.graphics.beginFill(0x6e531e);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x, signStart.y),
            new Phaser.Point(signStart.x + signSize.x, signStart.y),
            new Phaser.Point(signStart.x + signSize.x - 20, signStart.y - 20),
            new Phaser.Point(signStart.x + 20, signStart.y - 20),
        ]);
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + 40, signStart.y - 80, 40, 75);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + 80, signStart.y - 80),
            new Phaser.Point(signStart.x + 80, signStart.y - 5),
            new Phaser.Point(signStart.x + 90, signStart.y - 15),
            new Phaser.Point(signStart.x + 90, signStart.y - 80),
        ]);
    this.graphics.endFill();
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + signSize.x - 80, signStart.y - 80, 40, 75);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + signSize.x - 80, signStart.y - 80),
            new Phaser.Point(signStart.x + signSize.x - 80, signStart.y - 5),
            new Phaser.Point(signStart.x + signSize.x - 90, signStart.y - 15),
            new Phaser.Point(signStart.x + signSize.x - 90, signStart.y - 80),
        ]);
    this.graphics.endFill();

    var bigStencilStyle = { font: "30px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var smallStencilStyle = { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var writingStyle = { font: "20px elliotsixregular", fill: "#ffffff", align: "left"};
    var smallWritingStyle = { font: "14px elliotsixregular", fill: "#ffffff", align: "left"};

    // *******************************************************************
    var boxScoreX = signStart.x + 10;
    var boxScoreY = signStart.y + 10;

    // Boxscore Innings
    var inningWidth = 40;
	var inningX = boxScoreX + 150;
	var runsX = inningX + (9 * inningWidth);
	var hitsX = inningX + (10 * inningWidth);

    for (var i = 0; i < 9; i++) {
	    this.addPlainText(this.graphics, (i + 1) + "", smallStencilStyle, inningX + (i * inningWidth), boxScoreY);
	}

	this.addPlainText(this.graphics, "R", smallStencilStyle, runsX, boxScoreY);
	this.addPlainText(this.graphics, "H", smallStencilStyle, hitsX, boxScoreY);

    // Boxscore Teams
    var homeName;
    var awayName;
    var homeY = boxScoreY + 60;
    var awayY = boxScoreY + 30;

    if (bTop) {
    	homeName = fieldingTeam.name;
    	awayName = battingTeam.name;
    } else {
    	awayName = fieldingTeam.name;
    	homeName = battingTeam.name;
    }

    this.addPlainText(this.graphics, awayName, writingStyle, boxScoreX, awayY);
    this.addPlainText(this.graphics, homeName, writingStyle, boxScoreX, homeY);

    // Boxscore Scores
    var homeRuns = 0;
    var awayRuns = 0;

    for (var i = 0; i < 9; i++) {
    	if (i > currentInning) {
    		break;
    	}

    	if (i < currentInning || !bTop) {
    		homeRuns += homeScore[i];
    		awayRuns += awayScore[i];

    		this.addPlainText(this.graphics, homeScore[i].toString(), writingStyle, inningX + (i * inningWidth), homeY);
    		this.addPlainText(this.graphics, awayScore[i].toString(), writingStyle, inningX + (i * inningWidth), awayY);
    	} else {
    		awayRuns += awayScore[i];
    		this.addPlainText(this.graphics, awayScore[i].toString(), writingStyle, inningX + (i * inningWidth), awayY);
    	}
    }
    
    this.addPlainText(this.graphics, homeRuns.toString(), writingStyle, runsX, homeY);
    this.addPlainText(this.graphics, awayRuns.toString(), writingStyle, runsX, awayY);
	this.addPlainText(this.graphics, "0", writingStyle, hitsX, homeY);
	this.addPlainText(this.graphics, "0", writingStyle, hitsX, awayY);

    // *******************************************************************
    // Next up

    this.addPlainText(this.graphics, "Batting Next", bigStencilStyle, boxScoreX + 10, boxScoreY + 120);
    this.addPlainText(this.graphics, (bTop ? "Top" : "Bottom") + " of the " + (currentInning + 1) + " inning", 
    					writingStyle, boxScoreX + 245, boxScoreY + 130);

    var nextUpBatters = battingTeam.getBattersUpNext();
    var iconsX = boxScoreX + 10;
    var iconsY = boxScoreY + 170;
    var iconsSize = 75;
    var statsX;
    var icon;
    var iX, iY;
    var maxBarWidth = 80;

    for (var i = 0; i < nextUpBatters.length; i++) {
    	iX = iconsX + i * (iconsSize + 120);
    	iY = iconsY;
    	statsX = iX + iconsSize + 10

    	// Icon
    	icon = nextUpBatters[i].getPortrait();
    	this.graphics.addChild(icon);

    	icon.x = iX;
    	icon.y = iY;
    	icon.width = iconsSize;
    	icon.height = iconsSize;

    	// Name
    	this.addPlainText(this.graphics, nextUpBatters[i].getName() + "\n" + GetPlayerPositionName(nextUpBatters[i].fieldingPosition), 
    						smallWritingStyle, iX, iY + iconsSize);

    	// Stats
    	this.addPlainText(this.graphics, "H", smallWritingStyle, statsX, iY + 2);
    	this.addPlainText(this.graphics, "P", smallWritingStyle, statsX, iY + 27);
    	this.addPlainText(this.graphics, "S", smallWritingStyle, statsX, iY + 52);

    	this.graphics.beginFill(0x666666, 1);
    	this.graphics.drawRect(statsX + 15, iY + 2, maxBarWidth, 20);
    	this.graphics.drawRect(statsX + 15, iY + 27, maxBarWidth, 20);
    	this.graphics.drawRect(statsX + 15, iY + 52, maxBarWidth, 20);
    	this.graphics.endFill();

    	this.graphics.beginFill(0xffcc00, 1);
    	this.graphics.drawRect(statsX + 15, iY + 2, maxBarWidth * (nextUpBatters[i].getInfo().batting / 10), 20);
    	this.graphics.drawRect(statsX + 15, iY + 27, maxBarWidth * (nextUpBatters[i].getInfo().power / 10), 20);
    	this.graphics.drawRect(statsX + 15, iY + 52, maxBarWidth * (nextUpBatters[i].getInfo().speed / 10), 20);
    	this.graphics.endFill();
    }

    // *******************************************************************
    // Setup

    this.graphics.inputEnabled = true;
    this.graphics.events.onInputUp.add(function() {
    	gameState.closeInningsChangeScreen();
    }, this);

    gameState.dialogOpened(this);
}

InningsChangeScreen.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
}

InningsChangeScreen.prototype.close = function() {
	if (this.graphics.parent != undefined) {
		this.graphics.parent.removeChild(this.graphics);
		gameState.dialogClosed(this);
	}
}