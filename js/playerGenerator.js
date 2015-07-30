// Player sprite poses
var POSE_BATTER_LEFT = 0x00;
var POSE_BATTER_RIGHT = 0x01;
var POSE_BATTER_SWING_LEFT = 0x02;
var POSE_BATTER_SWING_RIGHT = 0x03;

var POSE_FIELDER_WAITING = 0x10;
var POSE_FIELDER_CATCHER = 0x11;
var POSE_FIELDER_CATCH_UP = 0x12;
var POSE_FIELDER_CATCH_LEFT = 0x13;
var POSE_FIELDER_CATCH_RIGHT = 0x14;
var POSE_FIELDER_CATCH_DOWN = 0x15;

var POSE_RUNNING_UP = 0x20;
var POSE_RUNNING_LEFT = 0x21;
var POSE_RUNNING_DOWN = 0x22;
var POSE_RUNNING_RIGHT = 0x23;

// Generate player world icons
function PlayerGenerator() {
    
}

// Size of player sprites
PlayerGenerator.width = 16;
PlayerGenerator.height = 30;

PlayerGenerator.normalWidth = 12;
PlayerGenerator.thinWidth = 10;
PlayerGenerator.fatWidth = 16;

// Generate a world icon based from a description string
PlayerGenerator.generateWorldIcon = function(desc, pose, teamColor, handedness) {
    var graphics = game.add.graphics(0, 0);
    
    if (pose <= POSE_BATTER_SWING_RIGHT) {
        return PlayerGenerator.drawBattingPose(graphics, desc, pose, teamColor);
    } else if (pose <= POSE_FIELDER_CATCH_DOWN) {
        return PlayerGenerator.drawFieldingPose(graphics, desc, pose, teamColor, handedness);
    } else if (pose <= POSE_RUNNING_RIGHT) {
        return PlayerGenerator.drawRunningPose(graphics, desc, pose, teamColor);
    }
}

PlayerGenerator.drawPlayerCore = function(graphics, desc, teamColor) {
    var bodyWidth = PlayerGenerator.normalWidth;
    
    if (iconGenerator.isFat(desc)) {
        bodyWidth = PlayerGenerator.fatWidth;
    } else if (iconGenerator.isSkinny(desc)) {
        bodyWidth = PlayerGenerator.thinWidth;
    }
    
    graphics.beginFill(teamColor, 1);
    graphics.drawRect(-5, -10, 10, 10);
    graphics.endFill();
    
    // ...core
    graphics.beginFill(iconGenerator.findShirtColor(desc), 1);
    graphics.drawRect(bodyWidth * -0.5, -20, bodyWidth, 10);
    graphics.endFill();
    
    // ...face
    graphics.beginFill(iconGenerator.findSkinColor(desc), 1);
    graphics.drawRect(-5, -30, 10, 10);
    graphics.endFill();
    
    // ...hat
    if (iconGenerator.hasHat(desc)) {
        graphics.beginFill(teamColor, 1);
        graphics.drawRect(-5, -30, 10, 3);
        graphics.endFill();
    }
    
    // ...hair
    else if (iconGenerator.hasHair(desc)) {
        graphics.beginFill(iconGenerator.findHeadColor(desc), 1);
        graphics.drawRect(-5, -30, 10, 3);
        graphics.endFill();
    }
    
    return bodyWidth;
}

PlayerGenerator.drawBattingPose = function(graphics, desc, pose, teamColor) {
    
    // *** Draw core body ****************************************
    var bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor);
    
    // *** Draw bat handedness ****************************************
    graphics.beginFill(0xDEB887, 1);
    
    switch (pose) {
        case POSE_BATTER_LEFT:
            graphics.drawRect(bodyWidth * 0.5, -35, 3, 20);
            break;
            
        case POSE_BATTER_RIGHT:
            graphics.drawRect(bodyWidth * -0.5 - 3, -35, 3, 20);
            break;
            
        case POSE_BATTER_SWING_LEFT:
            graphics.drawRect(bodyWidth * -0.5 - 20, -15, 20, 3);
            break;
            
        case POSE_BATTER_SWING_RIGHT:
            graphics.drawRect(bodyWidth * 0.5, -15, 20, 3);
            break;
    }
    
    graphics.endFill();
    
    return graphics;
}

PlayerGenerator.drawFieldingPose = function(graphics, desc, pose, teamColor, handedness) {
    
    // *** Draw core body ****************************************
    var bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor);
    var glovePos = new Phaser.Point();
    var gloveSize = new Phaser.Point(8, 9);
    
    switch (pose) {
        case POSE_FIELDER_WAITING:
            if (handedness) {
                glovePos.x = bodyWidth * 0.5 - 4;
                glovePos.y = -15;
            } else {
                glovePos.x = bodyWidth * -0.5 + 4;
                glovePos.y = -15;
            }
            break;
            
        case POSE_FIELDER_CATCHER:
            if (handedness) {
                glovePos.x = bodyWidth * 0.5;
                glovePos.y = -15;
            } else {
                glovePos.x = bodyWidth * -0.5;
                glovePos.y = -15;
            }
            
            gloveSize = new Phaser.Point(4, 8);
            break;
            
        case POSE_FIELDER_CATCH_UP:
            if (handedness) {
                glovePos.x = bodyWidth * 0.5;
                glovePos.y = -35;
            } else {
                glovePos.x = bodyWidth * -0.5;
                glovePos.y = -35;
            }
            break;
            
        case POSE_FIELDER_CATCH_DOWN:
            if (handedness) {
                glovePos.x = bodyWidth * 0.5;
                glovePos.y = -10;
            } else {
                glovePos.x = bodyWidth * -0.5;
                glovePos.y = -10;
            }
            break;
            
        case POSE_FIELDER_CATCH_LEFT:
            glovePos.x = bodyWidth * 0.5 + 5;
            glovePos.y = -25;
            break;
            
        case POSE_FIELDER_CATCH_RIGHT:
            glovePos.x = bodyWidth * -0.5 - 5;
            glovePos.y = -25;
            break;
    }
    
    graphics.beginFill(0x503716, 1);
    graphics.drawRect(glovePos.x, glovePos.y, gloveSize.x, gloveSize.y);
    graphics.endFill();
    
    return graphics;
}

PlayerGenerator.drawRunningPose = function(graphics, desc, pose, teamColor, handedness) {
    return graphics;
}