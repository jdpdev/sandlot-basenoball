var gameStateName = "Game";

var gameState = {

	homeTeam: new Team(),
	awayTeam: new Team(),

	preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');
	},

	create: function() {
		this.DrawField();

		//var player = new Player(game, null);
		//player.setPosition(100, 100);

		this.homeTeam.loadTeam(game.cache.getJSON("mutineers"));
		this.awayTeam.loadTeam(game.cache.getJSON("spacebutts"));
	},

	update: function() {

	},

	DrawField: function() {
		var fieldWidth = 800;
	    var fieldHeight = 800;
	    var infieldRadius = 250;
	    var basesRadius = 150;
	    
	    var homePlateX = 400;
	    var homePlateY = fieldHeight - 50;
	    
	    var graphics = game.add.graphics(0, 0);

	    // Grass
	    graphics.beginFill(0x00aa00, 1);
	    graphics.drawRect(0, 0, 800, 800);
	    graphics.endFill();
	    
	    // Infield
	    graphics.lineStyle(1, 0x8B4513, 1);
	    graphics.beginFill(0x8B4513, 1);
	    
	    graphics.moveTo(homePlateX, homePlateY);
	    graphics.lineTo(homePlateX - infieldRadius, homePlateY - infieldRadius);
	    graphics.lineTo(homePlateX + infieldRadius, homePlateY - infieldRadius);
	    graphics.lineTo(homePlateX, homePlateY);
	    graphics.arc(homePlateX, homePlateY, 
	    			Math.sqrt(infieldRadius * infieldRadius + infieldRadius * infieldRadius), game.math.degToRad(225), game.math.degToRad(315));
	    graphics.endFill();
	    
	    // Bases
	    this.DrawBase(homePlateX, homePlateY - 10, graphics, true);								// Home
	    this.DrawBase(homePlateX + basesRadius - 10, homePlateY - basesRadius, graphics); 	// First
	    this.DrawBase(homePlateX, homePlateY - basesRadius * 2, graphics);					// Second
	    this.DrawBase(homePlateX - basesRadius + 10, homePlateY - basesRadius, graphics);	// Third
	    
	    // Foul lines
	    graphics.lineStyle(2, 0xffffff, 1);
	    graphics.moveTo(homePlateX, homePlateY);
	    graphics.lineTo(homePlateX - fieldWidth * 0.5, homePlateY - fieldWidth * 0.5);
	    graphics.moveTo(homePlateX, homePlateY);
	    graphics.lineTo(homePlateX + fieldWidth * 0.5, homePlateY - fieldWidth * 0.5);
	    
	    // Back wall
	    graphics.arc(homePlateX, homePlateY, 
	    			Math.sqrt((fieldWidth * 0.5) * (fieldWidth * 0.5) + (fieldWidth * 0.5) * (fieldWidth * 0.5)), 0, 360);
	},

	DrawBase: function(cx, cy, graphics, bHome) {
	    graphics.lineStyle(0, 0xffffff, 1);
	    graphics.beginFill(0xffffff, 1);
	    //graphics.drawRect(cx - 7, cy - 7, 14, 14);

	    graphics.moveTo(cx - 10, cy);
	    graphics.lineTo(cx, 	cy + 10);
	    graphics.lineTo(cx + 10, cy);
	    graphics.lineTo(cx, 	cy - 10);
	    graphics.lineTo(cx - 10, cy);

	    if (bHome == true) {
	    	graphics.drawRect(cx - 10, cy - 10, 20, 10);
	    }

	    graphics.endFill();
	}
};