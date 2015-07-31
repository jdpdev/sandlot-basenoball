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

var POSE_RUNNING_WAITING = 0x20;
var POSE_RUNNING_UP = 0x21;
var POSE_RUNNING_LEFT = 0x22;
var POSE_RUNNING_DOWN = 0x23;
var POSE_RUNNING_RIGHT = 0x24;

// Generate player world icons
function PlayerGenerator() {
    
}

// Size of player sprites
PlayerGenerator.width = 16;
PlayerGenerator.height = 40;

PlayerGenerator.normalWidth = 16;
PlayerGenerator.thinWidth = 12;
PlayerGenerator.fatWidth = 20;

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

PlayerGenerator.drawPlayerCore = function(graphics, desc, teamColor, bDrawLeftArm, bDrawRightArm) {
    var bodyWidth = PlayerGenerator.normalWidth;
    
    if (bDrawLeftArm == undefined) {
        bDrawLeftArm = true;
    }
    
    if (bDrawRightArm == undefined) {
        bDrawRightArm = true;
    }
    
    if (iconGenerator.isFat(desc)) {
        bodyWidth = PlayerGenerator.fatWidth;
    } else if (iconGenerator.isSkinny(desc)) {
        bodyWidth = PlayerGenerator.thinWidth;
    }
    
    // ...legs
    graphics.beginFill(teamColor, 1);
    graphics.drawRect(bodyWidth * -0.5, -10, bodyWidth, 15);
    graphics.endFill();
    
    // ...core
    graphics.beginFill(iconGenerator.findShirtColor(desc), 1);
    graphics.drawRect(bodyWidth * -0.5, -20, bodyWidth, 15);
    
    
    // ...arms
    graphics.drawRect(bodyWidth * -0.5 - 4, -20, bodyWidth + 8, 6);
    graphics.endFill();
    
    graphics.beginFill(iconGenerator.findSkinColor(desc), 1);
    if (bDrawRightArm) graphics.drawRect(bodyWidth * -0.5 - 4, -14, 4, 8);
    if (bDrawLeftArm)  graphics.drawRect(bodyWidth * 0.5, -14, 4, 8);
    
    // ...face
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

PlayerGenerator.drawSidePlayerCore = function(graphics, desc, teamColor) {
    var bodyWidth = PlayerGenerator.normalWidth / 2;
    
    if (iconGenerator.isFat(desc)) {
        bodyWidth = PlayerGenerator.fatWidth / 2;
    } else if (iconGenerator.isSkinny(desc)) {
        bodyWidth = PlayerGenerator.thinWidth / 1.5;
    }
    
    // ...legs
    graphics.beginFill(teamColor, 1);
    graphics.drawRect(bodyWidth * -0.5, -10, bodyWidth, 15);
    graphics.endFill();
    
    // ...core
    graphics.beginFill(iconGenerator.findShirtColor(desc), 1);
    graphics.drawRect(bodyWidth * -0.5, -20, bodyWidth, 15);
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
    var bodyWidth = PlayerGenerator.drawSidePlayerCore(graphics, desc, teamColor);
    
    // *** Draw bat handedness ****************************************
    graphics.beginFill(0xDEB887, 1);
    
    switch (pose) {
        case POSE_BATTER_LEFT:
            graphics.drawRect(bodyWidth * 0.5 - 5, -20, 20, 4);
            break;
            
        case POSE_BATTER_RIGHT:
            graphics.drawRect(bodyWidth * -0.5 - 15, -20, 20, 3);
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
    var bodyWidth = 0;
    var glovePos = new Phaser.Point();
    var gloveSize = new Phaser.Point(8, 8);
    
    switch (pose) {
        case POSE_FIELDER_WAITING:
            bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor);
            
            if (handedness) {
                glovePos.x = bodyWidth * 0.5 - 2;
                glovePos.y = -13;
            } else {
                glovePos.x = bodyWidth * -0.5 - 6;
                glovePos.y = -13;
            }
            break;
            
        case POSE_FIELDER_CATCHER:
            if (handedness) {
                bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor, false, true);
                glovePos.x = bodyWidth * 0.5;
                glovePos.y = -15;
            } else {
                bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor, true, false);
                glovePos.x = bodyWidth * -0.5;
                glovePos.y = -15;
            }
            
            gloveSize = new Phaser.Point(4, 8);
            break;
            
        case POSE_FIELDER_CATCH_UP:
            if (handedness) {
                bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor, false, true);
                glovePos.x = bodyWidth * 0.5 + 5;
                glovePos.y = -35;
            } else {
                bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor, true, false);
                glovePos.x = bodyWidth * -0.5 - 15;
                glovePos.y = -35;
            }
            break;
            
        case POSE_FIELDER_CATCH_DOWN:
            bodyWidth = PlayerGenerator.drawPlayerCore(graphics, desc, teamColor);
            
            if (handedness) {
                glovePos.x = bodyWidth * 0.5 + 2;
                glovePos.y = -8;
            } else {
                glovePos.x = bodyWidth * -0.5 - 6;
                glovePos.y = -8;
            }
            break;
            
        case POSE_FIELDER_CATCH_LEFT:
            bodyWidth = PlayerGenerator.drawSidePlayerCore(graphics, desc, teamColor);
            glovePos.x = bodyWidth * 0.5 + 10;
            glovePos.y = -22;
            break;
            
        case POSE_FIELDER_CATCH_RIGHT:
            bodyWidth = PlayerGenerator.drawSidePlayerCore(graphics, desc, teamColor);
            glovePos.x = bodyWidth * -0.5 - 10;
            glovePos.y = -22;
            break;
    }
    
    graphics.beginFill(0x503716, 1);
    graphics.drawRect(glovePos.x, glovePos.y, gloveSize.x, gloveSize.y);
    graphics.endFill();
    
    return graphics;
}

PlayerGenerator.drawRunningPose = function(graphics, desc, pose, teamColor, handedness) {
    
    switch (pose) {
        case POSE_RUNNING_WAITING:
        case POSE_RUNNING_UP:
        case POSE_RUNNING_DOWN:
            PlayerGenerator.drawPlayerCore(graphics, desc, teamColor);
            break;
     
     
        case POSE_RUNNING_LEFT:
        case POSE_RUNNING_RIGHT:
            PlayerGenerator.drawSidePlayerCore(graphics, desc, teamColor);
            break;
    }
    
    return graphics;
}