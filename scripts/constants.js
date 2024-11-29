/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-ffgsw'
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
    armour: { id: 'armour', name: 'tokenActionHud.template.armor', type: 'system' },
    gear: { id: 'gear', name: 'tokenActionHud.template.equipment', type: 'system' },
    //consumables: { id: 'consumables', name: 'tokenActionHud.template.consumables', type: 'system' },
    weapons: { id: 'weapons', name: 'SWFFG.ItemsWeapons', type: 'system' },
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' },
    crewskills: { id: 'crewskills', name: 'SWFFG.Crew.Title', type: 'system' },
    General: { id: 'General', name: "SWFFG.SkillsGeneral", type: 'system' },
    Social: { id: 'Social', name: "SWFFG.SkillsSocial", type: 'system' },
    Knowledge: { id: 'Knowledge', name: "SWFFG.SkillsKnowledge", type: 'system' },
    Combat: { id: 'Combat', name: "SWFFG.SkillsCombat", type: 'system' },
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
* Item types
*/
export const MACRO = {
    strainRecovery: { id: 'stressRecovery', name: "tokenActionHud.macros.strainRecovery.name", type: 'script', groupId: "utility", icon: "icons/svg/regen.svg" },    
}
