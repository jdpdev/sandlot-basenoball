var lineManager = {
    path: "./data/lines/",
    
    ballLines: null,
    swingingStrikeLines: null,
    lookingStrikeLines: null,
    
    // Called by game on statup
	load: function() {
		game.load.json("balls", this.path + 'balls.json');
		game.load.json("strikes", this.path + 'strikes.json');
	},

	parse: function() {
		// Balls
		var lines = game.cache.getJSON("balls")["lines"];
		this.ballLines = [];

		for (var i = 0; i < lines.length; i++) {
			this.ballLines.push(lines[i]);
		}

		// Strikes
		lines = game.cache.getJSON("strikes")["lines"];
		this.swingingStrikeLines = [];
		this.lookingStrikeLines = [];

		for (var i = 0; i < lines.length; i++) {
		    switch (lines[i].special) {
		        case 0:
		            this.swingingStrikeLines.push(lines[i]);
                    break;
                    
		        case 1:
		            this.lookingStrikeLines.push(lines[i]);
                    break;
                    
		        case 2:
		            this.swingingStrikeLines.push(lines[i]);
		            this.lookingStrikeLines.push(lines[i]);
                    break;
		    }
		}
	},
	
	getBallLine: function() {
	    var random = Math.floor(Math.random() * this.ballLines.length);
	    
	    for (var i = 0; i < this.ballLines.length; i++) {
	        random -= 1;
	        
	        if (random <= 0) {
	            return this.ballLines[i];
	        }
	    }
	    
	    return this.ballLines[this.ballLines.length - 1];
	},
	
	getStrikeLine: function(bSwinging) {
	    var lines = bSwinging ? this.swingingStrikeLines : this.lookingStrikeLines;
	    var random = Math.floor(Math.random() * lines.length);
	    
	    for (var i = 0; i < lines.length; i++) {
	        random -= 1;
	        
	        if (random <= 0) {
	            return lines[i];
	        }
	    }
	    
	    return lines[lines.length - 1];
	}
};