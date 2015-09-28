/**
 * The at-bat encounter, pitcher vs batter
 *  defense - The pitcher Player
 *  offense - The batter Player
 */
function AtBatEncounter(defense, offense) {
    Encounter.call(this, defense, offense);
}

AtBatEncounter.prototype = Object.create(Encounter.prototype);
AtBatEncounter.prototype.constructor = AtBatEncounter;