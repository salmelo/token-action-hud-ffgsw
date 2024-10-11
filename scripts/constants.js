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
export const REQUIRED_CORE_MODULE_VERSION = '1.5'

/**
 * Action types
 */
export const ACTION_TYPE = {
    item: 'tokenActionHud.template.item',
    utility: 'tokenActionHud.utility'
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
    //skills: { id: 'skills', name: 'SWFFG.Skills', type: 'system' },
    general: { id: 'General', name:"SWFFG.SkillsGeneral", type: 'system' },
    social: { id: 'Social', name:"SWFFG.SkillsSocial", type: 'system' },
    knowledge: { id: 'Knowledge', name:"SWFFG.SkillsKnowledge", type: 'system' },
    combatsw: { id: 'Combat', name:"SWFFG.SkillsCombat", type: 'system' },
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
export const SKILL_TYPE = {
    // knowledges: { groupId: 'Knowledges' },
    // main: { groupId: 'Main' },
    // combat: { groupId: 'Combat' },
    // social: { groupId: 'Social' }
  }
