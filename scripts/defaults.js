import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'inventory',
                id: 'inventory',
                name: game.i18n.localize('SWFFG.Combat'),
                settings: {
                    image: "systems/starwarsffg/images/mod-weapon.png",
                    grid: true,
                    showTitle: true,
                },
                groups: [
                    { ...groups.weapons, nestId: 'inventory_weapon' },                    
                    { ...groups.Combat, nestId: 'inventory_combat' }
                    // { ...groups.armour, nestId: 'inventory_armour' },
                    // { ...groups.gear, nestId: 'inventory_gear' },
                    // { ...groups.consumables, nestId: 'inventory_consumables' }
                ]
            },
            {
                nestId: 'skills',
                id: 'skills',
                name: game.i18n.localize('SWFFG.Skills'),
                settings: {
                    image: "systems/starwarsffg/images/dice/starwars/whiteHex.png",
                    grid: true,
                    showTitle: true,
                },

                groups: [
                    { ...groups.General, nestId: 'skills_general' },
                    { ...groups.Social, nestId: 'skills_social' },
                    { ...groups.Knowledge, nestId: 'skills_knowledge' },
                    { ...groups.crewskills, nestId: 'skills_crewskills' },
                    { ...groups.Other, nestId: 'skills_otherskills' },

                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: game.i18n.localize('tokenActionHud.utility'),
                settings: {
                    //image: "systems/starwarsffg/images/dice/starwars/whiteHex.png",
                    grid: true,
                    showTitle: true,
                },
                groups: [
                    { ...groups.combat, nestId: 'utility_combat' },
                    { ...groups.token, nestId: 'utility_token' },
                    { ...groups.rests, nestId: 'utility_rests' },
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
