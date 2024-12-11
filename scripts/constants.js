/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-ffgsw',
    localizeID: "tokenActionHud",
    iconPath: "modules/token-action-hud-ffgsw/artwork/icons/"
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '2.0'

/**
 * Action types
 */
export const ACTION_TYPE = {
    item: 'tokenActionHud.template.item',
    utility: 'tokenActionHud.utility',
    skill: "SWFFG.Skills",
    macro: "macro",
}

/**
 * Groups
 */
export const GROUP = {
    armour: { id: 'armour', name: MODULE.localizeID + '.template.armor', type: 'system' },
    gear: { id: 'gear', name: MODULE.localizeID + '.template.equipment', type: 'system' },
    weapons: { id: 'weapons', name: 'SWFFG.ItemsWeapons', type: 'system' },
    combat: { id: 'combat', name: MODULE.localizeID + '.combat', type: 'system' },
    token: { id: 'token', name: MODULE.localizeID + '.token', type: 'system' },
    utility: { id: 'utility', name: MODULE.localizeID + '.utility', type: 'system' },
    crewskills: { id: 'crewskills', name: 'SWFFG.Crew.Title', type: 'system' },
    General: { id: 'General', name: "SWFFG.SkillsGeneral", type: 'system' },
    Social: { id: 'Social', name: "SWFFG.SkillsSocial", type: 'system' },
    Knowledge: { id: 'Knowledge', name: "SWFFG.SkillsKnowledge", type: 'system' },
    Combat: { id: 'Combat', name: "SWFFG.SkillsCombat", type: 'system' },
    Other: { id: 'Other', name: "Other", type: 'system' },
}

/**
 * Item types
 */
export const ITEM_TYPE = {
    armour: { groupId: 'armour' },
    // consumable: { groupId: 'consumables' },
    gear: { groupId: 'gear' },
    weapon: { groupId: 'weapons' },
    shipweapon: { groupId: 'weapons' },
}

/**
* Macros
*/
export const MACRO = {
    strainRecovery: { id: 'stressRecovery', name: MODULE.localizeID + ".macros.strainRecovery.name", type: 'script', groupId: "utility", icon: "icons/svg/regen.svg" },
    diceboost: {
        id: 'diceboost', name: MODULE.localizeID + ".macros.boost.name", type: 'script', groupId: "combat", icon: "systems/starwarsffg/images/dice/starwars/blue.png",
        cssClass: "minus-plus", icon1: '<i id="diceboost-minus" class="fas fa-minus" title="Reduce"></i>', icon2: '<i id="diceboost-plus" class="fas fa-plus" title="Add"></i>'
    },
    dicesetback: {
        id: 'dicesetback', name: MODULE.localizeID + ".macros.setback.name", type: 'script', groupId: "combat", icon: "systems/starwarsffg/images/dice/starwars/black.png",
        cssClass: "minus-plus", icon1: '<i id="dicesetback-minus" class="fas fa-minus" title="Reduce"></i>', icon2: '<i id="dicesetback-plus" class="fas fa-plus" title="Add"></i>'
    },
}

/**
* Status effect
*/
export const STATUSEFFECT = {
    diceboostplus: {
        "id": 'diceboost-plus-tah',
        "name": "Add boost dice (tah)",
        "img": MODULE.iconPath + "diceboost-plus.png",
        "pooleffectdice": "boost",
        "pooleffectaction": "add"
    },
    diceboostminus: {
        "id": 'diceboost-minus-tah',
        "name": "Reduce boost dice (tah)",
        "img": MODULE.iconPath + "diceboost-minus.png",
        "pooleffectdice": "boost",
        "pooleffectaction": "reduce"
    },
    dicesetbackplus: {
        "id": 'setback-plus-tah',
        "name": "Add setback dice (tah)",
        "img": MODULE.iconPath + "dicesetback-plus.png",
        "pooleffectdice": "setback",
        "pooleffectaction": "add"
    },
    dicesetbackminus: {
        "id": 'setback-minus-tah',
        "name": "Reduce setback dice (tah)",
        "img": MODULE.iconPath + "dicesetback-minus.png",
        "pooleffectdice": "setback",
        "pooleffectaction": "reduce"
    },
}
