// System Module Imports
import { ACTION_TYPE, ITEM_TYPE } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */a
        async buildSystemActions(groupIds) {
            console.log(this)
            // Set actor and token variables
            this.actors = (!this.actor) ? this.#getActors() : [this.actor]
            this.actorType = this.actor?.type
            // Settings
            this.displayUnequipped = Utils.getSetting('displayUnequipped')

            // Set items variable
            if (this.actor) {
                let items = this.actor.items
                items = coreModule.api.Utils.sortItemsByName(items)
                this.items = items
            }

            if (this.actorType === 'character' || this.actorType === 'minion' || this.actorType === 'rival' || this.actorType === 'nemesis') {
                this.inventorygroupIds = [
                    'weapons'
                ]
                await this.#buildCharacterActions()
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions() {
            await Promise.all([
                this.#buildInventory(),
            ])
            if (this.actorType !== 'vehicle') {
                this.#buildSkills()
            }

        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        #buildMultipleTokenActions() {
        }

        /**
         * Build inventory
         * @private
         */
        async #buildInventory() {
            
            if (this.items.size === 0) return

            const actionTypeId = 'item'
            const inventoryMap = new Map()

            for (const [itemId, itemData] of this.items) {
                const type = itemData.type
                const equipped = itemData.system?.equippable?.equipped

                if (equipped || this.displayUnequipped) {
                    const typeMap = inventoryMap.get(type) ?? new Map()
                    typeMap.set(itemId, itemData)
                    inventoryMap.set(type, typeMap)
                }
            }

            for (const [type, typeMap] of inventoryMap) {
                const groupId = ITEM_TYPE[type]?.groupId

                if (!groupId) continue

                const groupData = { id: groupId, type: 'system' }

                // Get actions
                const actions = [...typeMap].map(([itemId, itemData]) => {
                    const id = itemId
                    const name = itemData.name
                    const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
                    const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`
                    const encodedValue = [actionTypeId, id].join(this.delimiter)
                    const img = coreModule.api.Utils.getImage(itemData.img)

                    return {
                        id,
                        name,
                        img,
                        listName,
                        encodedValue
                    }
                })

                // TAH Core method to add actions to the action list
                this.addActions(actions, groupData)
            }
        }

        /**
         * Build skills
         * @private
         */
        #buildSkills() {
            //if (this.actorType !== 'character') return

            const skills = this.actor.system.skills
            const actionType = 'skill'
            const categoriesSkillsList = this.actor.system.skilltypes
            for (const [catId, category] of Object.entries(categoriesSkillsList)) {
                try {
                    // Create group data  SWFFG.SkillsCombat
                    const groupData = {
                        id: category.type,
                        name: category.label,
                        type: 'system'
                    }

                    // Create actions list
                    let actions = new Array()
                    Object.entries(skills).map((skill) => {

                        if (skill[1].type === category.type) {
                            const id = skill[1].value;
                            const encodedValue = [actionType, id].join(this.delimiter)
                            const name = skill[1].label
                            const actionTypeName = `${coreModule.api.Utils.i18n('SWFFG.Skills')}: ` ?? ''
                            const listName = `${actionTypeName}${name}`

                            actions.push({
                                id: id,
                                name: name,
                                encodedValue: encodedValue,
                                listName: listName
                            })
                        }

                    })
                    // Add actions to HUD
                    this.addActions(actions, groupData)
                } catch (error) {
                    coreModule.api.Logger.error(catId)
                    return null
                }

            }
        }

        /**
* Get actors
* @private
* @returns {object}
*/
        #getActors() {
            const allowedTypes = ['character', 'npc']
            const tokens = coreModule.api.Utils.getControlledTokens()
            const actors = tokens?.filter(token => token.actor).map((token) => token.actor)
            if (actors.every((actor) => allowedTypes.includes(actor.type))) {
                return actors
            } else {
                return []
            }
        }
    }
})
