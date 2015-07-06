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
        icon.beginFill(0xbbbbee, 1);
        icon.drawRect(0, 0, this.iconWidth, this.iconHeight);
        icon.endFill();
        
        this.drawShirt(icon, parseInt(codes[SHIRT], 16), parseInt(codes[SHIRT_COLOR], 16));
        this.drawHead(icon, parseInt(codes[FACE_SHAPE], 16), parseInt(codes[SKIN_COLOR], 16));
        
        return icon;
    },
    
    // ******************************************************************************
    //  Head
    // ******************************************************************************
    
    drawHead: function(icon, type, color) {
        var color = this.getSkinColor(color);
        icon.lineStyle(0, 0, 0);
        
        // Neck
        var iNeckHeight = 60;
        icon.beginFill(color, 1);
        icon.drawRect(45, this.iconHeight - 15 - iNeckHeight, 10, iNeckHeight);
        icon.endFill();
        
        // Face
        icon.beginFill(color, 1);
        
        switch (type) {
            default:
            case 0x00:
                icon.drawRect(30, 30, 60, 60);
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(55, 50, 5, 20);
                icon.drawRect(70, 50, 5, 20);
                icon.endFill();
                break;
                
            case 0x01:
                icon.drawRect(30, 30, 60, 60);
                
                // Eyes
                icon.beginFill(0xffffff, 1);
                icon.drawRect(50, 50, 10, 20);
                icon.drawRect(70, 50, 10, 20);
                icon.endFill();
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
                icon.drawRect(35, this.iconHeight - 20, 30, 10);
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
        }  
    }
};