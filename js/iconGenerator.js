var iconGenerator = {
    
    iconWidth: 125,
    iconHeight: 125,
    
    // Generate the icon described in a string
    // A.B.C.D.E.F.G.H
    //  A: base face shape, 00-FF
    //  B: face decorations, 00-FF
    //  C: head decorations, 00-FF
    //  D: shirt types, 00-FF
    //  E: skin color
    //  F: face color
    //  G: head color
    //  H: shirt color
    // Returns an object containing the icon
    generateIcon: function(iconString) {
        var FACE_SHAPE = 0;
        var FACE_DECO = 1;
        var HEAD_DECO = 2;
        var SHIRT = 3;
        var SKIN_COLOR = 4;
        var FACE_COLOR = 5;
        var HEAD_COLOR = 6;
        var SHIRT_COLOR = 7;
        
        var codes = iconString.split(".");
        var icon = game.add.graphics(0, 0);
        
        icon.lineStyle(1, 0xffffff, 1);
        icon.beginFill(0xddcccc, 1);
        icon.drawRect(0, 0, this.iconWidth, this.iconHeight);
        icon.endFill();
        
        this.drawShirt(icon, parseInt(codes[SHIRT], 16), parseInt(codes[SHIRT_COLOR], 16));
        this.drawHead(icon, parseInt(codes[FACE_SHAPE], 16), parseInt(codes[SKIN_COLOR], 16));
        this.drawHeadDeco(icon, parseInt(codes[HEAD_DECO], 16), parseInt(codes[HEAD_COLOR], 16));
        
        return icon;
    },
    
    // ******************************************************************************
    //  Head
    // ******************************************************************************
    
    drawHead: function(icon, type, colorCode) {
        var color = this.getSkinColor(colorCode);
        icon.lineStyle(0, 0, 0);
        
        // Neck
        var iNeckHeight = 60;
        icon.beginFill(color, 1);
        icon.drawRect(45, this.iconHeight - 15 - iNeckHeight, 10, iNeckHeight);
        icon.drawRect(35, this.iconHeight - 20, 30, 5);
        icon.endFill();
        
        // Face
        icon.beginFill(color, 1);
        
        switch (type) {
            default:

            // Standard squares *********
            case 0x00:
                icon.drawRect(30, 30, 60, 60);
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(55, 50, 5, 20);
                icon.drawRect(70, 50, 5, 20);
                icon.endFill();
                break;
                
            case 0x01:
                //icon.drawRect(30, 30, 60, 60);
                icon.drawPolygon(new Phaser.Point(30, 30), new Phaser.Point(90, 30), new Phaser.Point(90, 80), new Phaser.Point(80, 90), new Phaser.Point(35, 90), new Phaser.Point(30, 85));
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(50, 50, 10, 20);
                icon.drawRect(70, 50, 10, 20);
                icon.endFill();
                break;

            // Skinny heads ************
            case 0x02:
                icon.drawRect(40, 30, 40, 60);
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(55, 50, 5, 20);
                icon.drawRect(70, 50, 5, 20);
                icon.endFill();
                break;
                
            case 0x03:
                //icon.drawRect(40, 30, 40, 60);
                icon.drawPolygon(new Phaser.Point(40, 30), new Phaser.Point(80, 30), new Phaser.Point(80, 80), new Phaser.Point(70, 90), new Phaser.Point(45, 90), new Phaser.Point(40, 85), new Phaser.Point(40, 90));
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(50, 50, 10, 20);
                icon.drawRect(70, 50, 10, 20);
                icon.endFill();
                break;

            // Fat heads ****************
            case 0x04:
                //icon.drawRect(30, 30, 60, 60);
                icon.drawPolygon(new Phaser.Point(30, 30), new Phaser.Point(90, 30), new Phaser.Point(90, 60), new Phaser.Point(100, 70), 
                                 new Phaser.Point(100, 90), new Phaser.Point(90, 100), new Phaser.Point(30, 100), new Phaser.Point(20, 90),
                                 new Phaser.Point(20, 70), new Phaser.Point(30, 60));
                icon.drawRect(35, this.iconHeight - 15 - iNeckHeight, 30, iNeckHeight);

                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(55, 50, 5, 20);
                icon.drawRect(70, 50, 5, 20);
                icon.endFill();
                break;
                
            case 0x05:
                //icon.drawRect(40, 30, 40, 60);
                icon.drawPolygon(new Phaser.Point(30, 30), new Phaser.Point(90, 30), new Phaser.Point(90, 60), new Phaser.Point(100, 70), 
                                 new Phaser.Point(100, 90), new Phaser.Point(90, 100), new Phaser.Point(30, 100), new Phaser.Point(20, 90),
                                 new Phaser.Point(20, 70), new Phaser.Point(30, 60));
                icon.drawRect(35, this.iconHeight - 15 - iNeckHeight, 30, iNeckHeight);

                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(50, 50, 10, 20);
                icon.drawRect(70, 50, 10, 20);
                icon.endFill();
                break;

            // Cat head *****************
            case 0xfff:
                // Ears
                icon.beginFill(this.getSkinSecondaryColor(colorCode), 1);
                icon.drawPolygon(new Phaser.Point(40, 30), new Phaser.Point(10, 30), new Phaser.Point(10, 40), new Phaser.Point(40, 50));
                icon.drawPolygon(new Phaser.Point(90, 30), new Phaser.Point(110, 30), new Phaser.Point(110, 40), new Phaser.Point(90, 50));
                icon.endFill();
                
                icon.beginFill(0xeeaaaa, 1);
                icon.drawPolygon(new Phaser.Point(40, 35), new Phaser.Point(20, 35), new Phaser.Point(20, 40), new Phaser.Point(40, 45));
                icon.drawPolygon(new Phaser.Point(90, 35), new Phaser.Point(100, 35), new Phaser.Point(100, 40), new Phaser.Point(90, 45));
                icon.endFill();

                // Face
                icon.beginFill(color, 1);
                icon.drawPolygon(new Phaser.Point(40, 30), new Phaser.Point(90, 30), new Phaser.Point(90, 60), 
                                 new Phaser.Point(100, 60), new Phaser.Point(100, 80), new Phaser.Point(90, 80), new Phaser.Point(90, 90),
                                 new Phaser.Point(40, 90), new Phaser.Point(40, 80), new Phaser.Point(30, 80), 
                                 new Phaser.Point(30, 40), new Phaser.Point(40, 40));

                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(55, 45, 5, 20);
                icon.drawRect(70, 45, 5, 20);
                icon.endFill();

                // Nose
                icon.beginFill(0xffcccc, 1);
                icon.drawPolygon(new Phaser.Point(60, 70), new Phaser.Point(70, 70), new Phaser.Point(65, 75));
                icon.endFill();

                icon.lineStyle(2, 0xffcccc, 1);
                icon.moveTo(65, 75);
                icon.lineTo(60, 80);
                icon.lineTo(55, 75);

                icon.moveTo(65, 75);
                icon.lineTo(70, 80);
                icon.lineTo(75, 75);

                // Whiskers
                icon.lineStyle(2, 0xffffff, 1);
                icon.moveTo(55, 70);
                icon.lineTo(25, 70);
                icon.moveTo(50, 75);
                icon.lineTo(35, 80);

                icon.moveTo(75, 70);
                icon.lineTo(105, 65);
                icon.moveTo(80, 75);
                icon.lineTo(95, 80);

                break;
        }
        
        icon.endFill();
    },
    
    getSkinColor: function(code) {
        switch (code) {
            default:
            case 0x09:  return 0xDDA8A0;
            case 0x00:  return 0xFFDFC4;
            case 0x01:  return 0xEECEB3;
            case 0x02:  return 0xFFDCB2;
            case 0x03:  return 0xE79E6D;
            case 0x04:  return 0xCE967C;
            case 0x05:  return 0xBA6C49;
            case 0x06:  return 0xCB8442;
            case 0x07:  return 0x704139;
            case 0x08:  return 0x5C3836;

            // Special cat
            case 0xAA0: return 0xaaaaaa;
        }
    },

    getSkinSecondaryColor: function(code) {
        switch (code) {
            default:
                return this.getSkinColor(code);

            case 0xAA0:
                return 0x555555;
        }
    },
    
    // ******************************************************************************
    //  Shirt
    // ******************************************************************************
    
    // Draw the shirt component
    drawShirt: function(icon, type, color) {
        icon.lineStyle(0, 0, 0);
        icon.beginFill(this.getShirtPrimaryColor(color), 1);
        icon.drawRect(10, this.iconHeight - 20, 80, 20);
        icon.endFill();
        
        icon.lineStyle(0, 0, 0);
        icon.beginFill(this.getShirtSecondColor(color), 1);
        
        switch (type) {
            default:
            case 0x00:
                icon.drawRect(30, this.iconHeight - 20, 40, 10);
                break;
        }
        
        icon.endFill();
    },
    
    getShirtPrimaryColor: function(code) {
        switch (code) {
            default:
            
            // Grays
            case 0x00:  return 0x333333;
            case 0x01:  return 0x666666;
            case 0x02:  return 0x999999;
            case 0x03:  return 0xbbbbbb;
            case 0x04:  return 0xffffff;
            
            case 0x05:  return 0x330000;
            case 0x06:  return 0x660000;
            case 0x07:  return 0x990000;
            case 0x08:  return 0xbb0000;
            case 0x09:  return 0xff0000;
            
            case 0x0A:  return 0x003300;
            case 0x0B:  return 0x006600;
            case 0x0C:  return 0x009900;
            case 0x0D:  return 0x00bb00;
            case 0x0E:  return 0x00ff00;
            
            case 0x0F:  return 0x000033;
            case 0x10:  return 0x000066;
            case 0x11:  return 0x000099;
            case 0x12:  return 0x0000bb;
            case 0x13:  return 0x0000ff;

            // Umpire color
            case 0xFF:  return 0x87CEFA;
        }  
    },
    
    getShirtSecondColor: function(code) {
        switch (code) {
            default:
            
            // Grays
            case 0x00:  return 0x000000;
            case 0x01:  return 0x333333;
            case 0x02:  return 0x666666;
            case 0x03:  return 0x999999;
            case 0x04:  return 0xbbbbbb;
            
            case 0x05:  return 0x110000;
            case 0x06:  return 0x330000;
            case 0x07:  return 0x660000;
            case 0x08:  return 0x990000;
            case 0x09:  return 0xbb0000;
            
            case 0x0A:  return 0x001100;
            case 0x0B:  return 0x003300;
            case 0x0C:  return 0x006600;
            case 0x0D:  return 0x009900;
            case 0x0E:  return 0x00bb00;
            
            case 0x0F:  return 0x000011;
            case 0x10:  return 0x000033;
            case 0x11:  return 0x000066;
            case 0x12:  return 0x000099;
            case 0x13:  return 0x0000bb;

            // Umpire color
            case 0xFF:  return 0x888888;
        }  
    },

    // ******************************************************************************
    //  Hats/hair
    // ******************************************************************************

    drawHeadDeco: function(icon, type, color) {
        var primaryColor = this.getHeadDecoPrimaryColor(color);
        var secondaryColor = 0x000000;

        icon.lineStyle(0, 0, 0);
        icon.beginFill(primaryColor, 1);

        switch (type) {
            // Bald
            default:
            case 0x00:
                break;

            // Buzz cut
            case 0x01:
                icon.drawRect(30, 30, 60, 10);
                break;

            // Plain trimmed
            case 0x02:
                icon.drawRect(30, 30, 60, 10);
                icon.drawRect(30, 30, 10, 30);
                break;

            // Pompidor
            case 0x03:
                icon.drawPolygon(new Phaser.Point(30, 30), new Phaser.Point(40, 20), new Phaser.Point(80, 20), new Phaser.Point(90, 20), new Phaser.Point(90, 40), new Phaser.Point(30, 40));
                break;

            // Pony tail
            case 0x04:
                icon.drawRect(30, 30, 60, 10);
                icon.drawRect(30, 30, 15, 30);
                icon.drawRect(10, 50, 20, 30);
                break;

            // Bob
            case 0x05:
                icon.drawPolygon(new Phaser.Point(65, 35), new Phaser.Point(75, 35), new Phaser.Point(85, 45), new Phaser.Point(90, 55), new Phaser.Point(95, 55),
                                 new Phaser.Point(95, 30), new Phaser.Point(90, 25), new Phaser.Point(30, 25), new Phaser.Point(25, 30), new Phaser.Point(25, 50), new Phaser.Point(35, 60), new Phaser.Point(45, 65),
                                 new Phaser.Point(45, 45));
                break;
            // Emo
            case 0x06:
                break;

            // Afro
            case 0x07:
                break;

            // Mohawk
            case 0x08:
                break;
                
            // Pigtails
            case 0x09:
                break;

            // Baseball hat, bald
            case 0x20:
                //icon.drawRect(25, 20, 65, 20);
                icon.drawPolygon(new Phaser.Point(25, 20), new Phaser.Point(30, 15), new Phaser.Point(85, 15), new Phaser.Point(90, 20),
                                 new Phaser.Point(90, 40), new Phaser.Point(25, 40));
                icon.endFill();
                
                icon.beginFill(secondaryColor, 1);
                icon.drawRect(40, 30, 70, 10);
                break;

            // Baseball hat, trimmed
            case 0x21:
                break;

            // Baseball hat, pony tail
            case 0x22:
                break;
        }

        icon.endFill();
    },

    getHeadDecoPrimaryColor: function(code) {
        switch (code) {
            default:
            case 0x00:  return 0xffffff;    // White
            case 0x01:  return 0xffff00;    // Yellow
            case 0x02:  return 0xffbb00;    // Deep yellow
            case 0x03:  return 0x977961;    // Light brown
            case 0x04:  return 0x91553d;    // Med brown
            case 0x05:  return 0x504444;    // Dark brown
            case 0x06:  return 0x000000;    // Black
            case 0x07:  return 0xffb889;    // Light red
            case 0x08:  return 0xb55239;    // Dark red
            case 0x09:  return 0xff00ff;    // Magenta
            case 0x0A:  return 0xff1100;    // Red
            case 0x0B:  return 0xff9911;    // Orange
            case 0x0C:  return 0x11ff11;    // Green
            case 0x0D:  return 0x0033ff;    // Blue
            case 0x0E:  return 0x9900ff;    // Purple
            case 0x0F:  return 0x222299;    // Med blue
        }
    }
};