function Field() {

	this.fieldWidth = 800;
	this.fieldHeight = 800;
	this.backWallLength = 400;
	this.infieldRadius = 250;
    this.basesRadius = 150;
    
    this.homePlateX = 400;
    this.homePlateY = this.fieldHeight - 50;

    this.fieldGraphics;

	this.DrawField = function(game) {
		this.fieldGraphics = game.add.graphics(0, 0);
		graphics = this.fieldGraphics;

		// Grass
	    graphics.beginFill(0x00aa00, 1);
	    graphics.drawRect(0, 0, 800, 800);
	    graphics.endFill();

	    graphics.lineStyle(1, 0x8B4513, 1);
	    graphics.beginFill(0x8B4513, 1);
	    
	    graphics.moveTo(this.homePlateX, this.homePlateY);
	    graphics.lineTo(this.homePlateX - this.infieldRadius, this.homePlateY - this.infieldRadius);
	    graphics.lineTo(this.homePlateX + this.infieldRadius, this.homePlateY - this.infieldRadius);
	    graphics.lineTo(this.homePlateX, this.homePlateY);
	    graphics.arc(this.homePlateX, this.homePlateY, new Phaser.Point(this.infieldRadius, this.infieldRadius).getMagnitude(),
	    		 		game.math.degToRad(225), game.math.degToRad(315));
	    graphics.endFill();
	    
	    // Bases
	    this.DrawBase(this.homePlateX, this.homePlateY - 10, graphics, true);									// Home
	    this.DrawBase(this.homePlateX + this.basesRadius - 10, this.homePlateY - this.basesRadius, graphics); 	// First
	    this.DrawBase(this.homePlateX, this.homePlateY - this.basesRadius * 2, graphics);						// Second
	    this.DrawBase(this.homePlateX - this.basesRadius + 10, this.homePlateY - this.basesRadius, graphics);	// Third
	    
	    // Foul lines
	    graphics.lineStyle(2, 0xffffff, 1);
	    graphics.moveTo(this.homePlateX, this.homePlateY);
	    graphics.lineTo(this.homePlateX - this.fieldWidth * 0.5, this.homePlateY - this.fieldWidth * 0.5);
	    graphics.moveTo(this.homePlateX, this.homePlateY);
	    graphics.lineTo(this.homePlateX + this.fieldWidth * 0.5, this.homePlateY - this.fieldWidth * 0.5);
	    
	    // Back wall
	    graphics.arc(this.homePlateX, this.homePlateY, new Phaser.Point(this.backWallLength, this.backWallLength).getMagnitude(), 0, 360);
	}

	this.DrawBase = function(cx, cy, graphics, bHome) {
		//graphics = this.fieldGraphics;

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
}