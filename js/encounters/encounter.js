/**
 * Base class for encounters
 *  defense - The Player in the field involved with the encounter
 *  offense - The Player in the office involved with the encounter
 */
function Encounter(defense, offense) {
    this.defensePlayer = defense;
    this.offensePlayer = offense;
}

/**
 * Callback for when the defender selects their action
 */
Encounter.prototype.defenseSelectedAction = function(action) {
    
}

/**
 * Callback when the offense selects their action
 */
Encounter.prototype.offenseSelectedAction = function(action) {
    
}