// System Module Imports
import { ACTION_TYPE, GROUP, MACRO, MODULE } from './constants.js'
import { Utils } from './utils.js'
import { get_dice_pool } from "../../../systems/starwarsffg/modules/helpers/dice-helpers.js";
import { skills as skillsList } from "../../../systems/starwarsffg/modules/config/ffg-skills.js";

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
            // Set actor and token variables
            this.actors = (!this.actor) ? this.#getValidActors() : [this.actor]
            this.tokens = (!this.token) ? this.#getValidTokens() : [this.token]

            // Set items variable
            if (this.actor) {
                this.items = coreModule.api.Utils.sortItemsByName(this.actor.items);
            }

            // Settings
            this.displayUnequipped = Utils.getSetting('displayUnequipped')

            if (this.actor?.type === 'character' || this.actor?.type === 'minion' || this.actor?.type === 'rival' || this.actor?.type === 'nemesis') {
                this.inventorygroupIds = [
                    'weapons'
                ]
                await this.#buildCharacterActions()
            } else if (this.actor?.type === "vehicle") {
                this.inventorygroupIds = [
                    'weapons'
                ]
                await this.#buildVehicleActions();
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }

            if (game.settings.get(MODULE.ID, "displayDicepool") == true) {
                Hooks.once('renderTokenActionHud', async (app) => {
                    const skillElements = document.querySelectorAll(".tah-skill")
                    const weaponElements = document.querySelectorAll(".tah-weapon")
                    const crewElements = document.querySelectorAll(".tah-crew")
                    const actor = this.actor
                    const delimiter = this.delimiter

                    Array.from(skillElements).forEach(function (element, index) {
                        const container = element.querySelector(".tah-info-container")
                        get_dice_pool(actor.id, element.dataset['actionId'], new DicePoolFFG()).renderPreview(container)
                    });

                    Array.from(weaponElements).forEach(async function (element, index) {
                        const container = element.querySelector(".tah-info-container")
                        const weapon = coreModule.api.Utils.getItem(actor, element.dataset['actionId']);
                        get_dice_pool(actor.id, weapon.system.skill.value, await game.ffg.DiceHelpers.getModifiers(new DicePoolFFG(), weapon)).renderPreview(container)
                    });

                    Array.from(crewElements).forEach(async function (element, index) {
                        const container = element.querySelector(".tah-info-container")
                        const [crewId, crewRole] = element.dataset['actionId'].split(delimiter);
                        const role = game.settings.get("starwarsffg", "arrayCrewRoles").filter(role => role.role_name === crewRole);
                        let skillId = ""
                        if (crewRole === "Pilot") {
                            if (actor?.system?.spaceShip) {
                                skillId = "Piloting: Space";
                            } else {
                                skillId = "Piloting: Planetary";
                            }
                        } else {
                            skillId = role[0].role_skill
                        }
                        get_dice_pool(crewId, skillId, new DicePoolFFG()).renderPreview(container)
                    });
                })
            }
        }

        /**
         * Build character actions
         * @private
         * @returns {object}
         */
        async #buildCharacterActions() {
            await Promise.all([
                this.#buildInventory(),
            ])
            this.#buildSkills()
            this.buidlMacros()
        }

        /**
         * Build vehicle actions
         * @private
         * @returns {object}
         */
        async #buildVehicleActions() {
            await Promise.all([
                this.#buildInventory(),
            ])
            this.#buildCrewSkills()
        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        #buildMultipleTokenActions() {
            this.#buildSkills();
        }

        /**
         * Build inventory
         * @private
         */
        async #buildInventory() {
            if (this.items.size === 0) return

            let actionType = '';
            const inventoryMap = new Map([
                ["weapons", new Map()]
            ]);

            for (const [itemId, itemData] of this.items) {

                if (this.#isEquippedItem(itemData) || itemData.type === "shipweapon") {
                    switch (itemData.type) {
                        case "shipweapon":
                            actionType = "shipweapon"
                            inventoryMap.get("weapons").set(itemId, itemData);
                            break;
                        case "weapon":
                            actionType = "weapon"
                            inventoryMap.get("weapons").set(itemId, itemData);
                            break;
                    }
                }
            }

            for (const groupId of this.inventorygroupIds) {
                const actionData = inventoryMap.get(groupId);
                if (!actionData || actionData.size === 0) continue;

                // Create group data
                const groupData = {
                    id: groupId,
                    name: game.i18n.localize(GROUP[groupId].name)
                };

                const data = { groupData, actionData, actionType };
                // Build actions and activations
                await this.buildActions(data);

            }
        }

        /**
         * Build skills
         * @private
         */
        async #buildSkills() {

            const skills = this.actor?.system.skills
            if (skills.length === 0) return;

            const actionType = 'skill'
            const categoriesSkillsList = this.actor.system.skilltypes
            const skillMap = new Map([
                ["General", new Map()],
                ["Social", new Map()],
                ["Knowledge", new Map()],
                ["Combat", new Map()],
                ["Other", new Map()]
            ]);

            for (const [skillId, skillData] of Object.entries(skills)) {
                if (skillMap.get(skillData.type)) {
                    skillMap.get(skillData.type).set(skillId, skillData);
                } else {
                    skillMap.get("Other").set(skillId, skillData);
                }

            }
            for (const [groupId, categoryData] of skillMap) {
                const actionData = skillMap.get(groupId);
                if (!actionData || actionData.size === 0) continue;

                // Create group data
                const groupData = {
                    id: groupId,
                    name: game.i18n.localize(GROUP[groupId]?.name) ? game.i18n.localize(GROUP[groupId].name) : categoryData.type
                };

                const data = { groupData, actionData, actionType };
                // Build actions and activations
                this.buildActions(data);
            }
        }

        /**
         * Build Crew skills
         * @private
         */
        async #buildCrewSkills() {
            const crew = await this.actor.getFlag("starwarsffg", "crew");
            if (!crew || crew.length === 0) {
                CONFIG.logger.warn(game.i18n.localize("tokenActionHud.error.CrewMiss"));
                return;
            }
            const actionType = 'crewSkill'
            // Create group data  SWFFG.SkillsCombat
            const groupData = {
                id: "crewskills",
                name: game.i18n.localize(GROUP["crewskills"].name),
                type: 'system'
            }
            for (const [actionId, values] of Object.entries(crew)) {
                try {
                    // Create actions list
                    const actions = new Array()
                    const name = values.role
                    const id = [values.actor_id, values.role].join(this.delimiter);
                    const listName = this.#getListName(actionType, name)
                    const img = coreModule.api.Utils.getImage(game.actors.get(values.actor_id).img)
                    const tooltip = values.actor_name
                    actions.push({
                        id: id,
                        name: name,
                        listName: listName,
                        img: img,
                        tooltip: tooltip,
                        cssClass: "tah-crew",
                        system: { actionType, actionId: id }
                    })

                    // Add actions to HUD
                    this.addActions(actions, groupData)
                } catch (error) {
                    coreModule.api.Logger.error(actionId)
                    return null
                }

            }
        }

        async buidlMacros() {

            for (const [id, macroData] of Object.entries(MACRO)) {
                try {

                    //If the macro is allowed from module settings
                    if (macroData?.conditionSetting) {
                        if (game.settings.get(MODULE.ID, macroData?.conditionSetting) == true) {
                            const actionType = "macro"
                            const groupData = {
                                id: macroData.groupId,
                                name: game.i18n.localize(GROUP[macroData.groupId].name),
                                type: 'system'
                            }
                            const actionData = new Array()
                            actionData.push({
                                id: id,
                                name: game.i18n.localize(MACRO[id].name),
                                img: MACRO[id].img,
                                listName: this.#getListName("macro", MACRO[id].name),
                                system: { actionType, actionId: id },
                                cssClass: MACRO[id].cssClass,
                                icon1: MACRO[id].icon1,
                                icon2: MACRO[id].icon2,
                                icon3: MACRO[id].icon3
                            })

                            this.addActions(actionData, groupData);
                        }
                    } else {
                        const actionType = "macro"
                        const groupData = {
                            id: macroData.groupId,
                            name: game.i18n.localize(GROUP[macroData.groupId].name),
                            type: 'system'
                        }
                        const actionData = new Array()
                        actionData.push({
                            id: id,
                            name: game.i18n.localize(MACRO[id].name),
                            img: MACRO[id].img,
                            listName: this.#getListName("macro", MACRO[id].name),
                            system: { actionType, actionId: id },
                            cssClass: MACRO[id].cssClass,
                            icon1: MACRO[id].icon1,
                            icon2: MACRO[id].icon2,
                            icon3: MACRO[id].icon3
                        })

                        this.addActions(actionData, groupData);
                    }

                } catch (error) {
                    coreModule.api.Logger.error(id)
                    coreModule.api.Logger.error(error.message)
                    return null
                }
            }
        }

        /**
         * Get valid actors
         * @private
         * @returns {object}
         */
        #getValidActors() {
            const allowedTypes = ["character", "npc"];
            return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.actors : [];
        }

        /**
         * Get valid tokens
         * @private
         * @returns {object}
         */
        #getValidTokens() {
            const allowedTypes = ["character", "npc"];
            return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.tokens : [];
        }

        /**
        * Get action
        * @private
        * @param {object} entity      The entity
        *  @param {string} actionType The action type
        * @returns {object}           The action
        */
        async #getAction(entity, actionType = "item") {
            var id = "", img = {}, info1 = {}, tooltip = "", cssClass = "";
            switch (actionType) {
                case "skill":
                    id = entity.value;
                    cssClass = "tah-skill"
                    break;
                case "weapon":
                    cssClass = "tah-weapon"
                case "shipweapon":
                    id = entity._id;
                    tooltip = await this.#getTooltip(await this.#getWeaponTooltipData(entity));
                    break;
            }

            let name = entity?.name ?? entity?.label;
            return {
                id,
                name,
                cssClass,
                img: coreModule.api.Utils.getImage(entity),
                // icon1: this.#getActivationTypeIcon(entity.system?.activities?.contents[0]?.activation.type),
                // icon2: this.#getPreparedIcon(entity),
                // icon3: this.#getConcentrationIcon(entity),
                //info1: info1,
                //info2: info?.info2,
                //info3: info?.info3,
                listName: this.#getListName(actionType, name),
                tooltip,
                system: { actionType, actionId: id }
            };
        }

        /**
     * Is equipped item
     * @private
     * @param {object} item The item
     * @returns {boolean}   Whether the item is equipped
     */
        #isEquippedItem(item) {
            const excludedTypes = ["gear"];
            return (this.displayUnequipped && !excludedTypes.includes(item.type))
                || (item.system?.equippable?.equipped && item.type !== "consumable");
        }
        /**
         * Build actions
         * @public
         * @param {object} data actionData, groupData, actionType
         * @param {object} options
         */
        async buildActions(data, options) {
            const { actionData, groupData, actionType } = data;
            // Exit if there is no action data
            if (actionData.size === 0) return;

            // Exit if there is no groupId
            const groupId = (typeof groupData === "string" ? groupData : groupData?.id);
            if (!groupId) return;

            // Get actions
            const actions = await Promise.all([...actionData].map(async item => await this.#getAction(item[1], actionType)));

            // Add actions to action list
            this.addActions(actions, groupData);
        }

        #getListName(actionType, actionName) {
            const prefix = `${game.i18n.localize(ACTION_TYPE[actionType])}: ` ?? "";
            return `${prefix}${actionName}` ?? "";
        }

        async #getWeaponTooltipData(entity) {
            if (this.tooltipsSetting === "none") return "";

            if (this.tooltipsSetting === "nameOnly") return entity?.name ?? entity?.label

            const name = entity?.name ?? entity?.label;
            const damage = entity?.system?.damage.adjusted
            const crit = entity?.system?.crit.adjusted
            const range = entity?.system?.range.label
            const skill = skillsList[entity?.system?.skill.value]?.label ? skillsList[entity?.system?.skill.value].label : actor.system.skills[entity?.system?.skill.value].label
            const firingArc = entity?.system?.firingarc
            let firingArcText = firingArc?.fore === true ? game.i18n.localize("SWFFG.VehicleFiringArcForward") + " " : ""
            firingArcText += firingArc?.aft === true ? game.i18n.localize("SWFFG.VehicleFiringArcAft") + " " : ""
            firingArcText += firingArc?.port === true ? game.i18n.localize("SWFFG.VehicleFiringArcPort") + " " : ""
            firingArcText += firingArc?.starboard === true ? game.i18n.localize("SWFFG.VehicleFiringArcStarboard") + " " : ""
            firingArcText += firingArc?.dorsal === true ? game.i18n.localize("SWFFG.VehicleFiringArcDorsal") + " " : ""
            firingArcText += firingArc?.ventral === true ? game.i18n.localize("SWFFG.VehicleFiringArcVentral") + " " : ""

            //const description = (typeof entity?.system?.description === "string") ? entity?.system?.description : (unidentified ? entity?.system?.unidentified?.description : entity?.system?.description?.value) ?? "";

            return { name, damage, crit, range, skill, firingArcText };
        }

        /**
         * Get tooltip
         * @param {object} tooltipData The tooltip data
         * @returns {string}           The tooltip
         */
        async #getTooltip(tooltipData) {
            if (this.tooltipsSetting === "none") return "";
            if (typeof tooltipData === "string") return tooltipData;

            const name = game.i18n.localize(tooltipData.name);

            if (this.tooltipsSetting === "nameOnly") return name;

            const nameHtml = `<h3>${name}</h3>`;

            const rangeHtml = tooltipData?.range
                ? `<div class="tah-properties">${game.i18n.localize("SWFFG.ItemsRange")} ${game.i18n.localize(tooltipData.range)}</div>`
                : "";

            const damageHtml = tooltipData?.damage
                ? `<div class="tah-properties">${game.i18n.localize("SWFFG.ItemsDamage")} ${tooltipData?.damage}</div>`
                : "";

            const critHtml = tooltipData?.damage
                ? `<div class="tah-properties">${game.i18n.localize("SWFFG.ItemsCrit")} ${tooltipData?.crit}</div>`
                : "";

            const skillHtml = tooltipData?.skill
                ? `<div class="tah-properties">${game.i18n.localize("SWFFG.ItemsSkill")} ${game.i18n.localize(tooltipData.skill)}</div>`
                : "";

            const firincArcHtml = tooltipData?.firingArcText
                ? `<div class="tah-properties">${game.i18n.localize("SWFFG.VehicleTabFiringArc")} ${tooltipData.firingArcText}</div>`
                : "";

            const tagsJoined = [rangeHtml, damageHtml, critHtml, skillHtml, firincArcHtml].join("");

            const tagsHtml = (tagsJoined) ? `<div class="tah-tags">${tagsJoined}</div>` : "";

            const headerTags = (tagsHtml) ? `<div class="tah-tags-wrapper">${tagsHtml}</div>` : "";

            if (!tagsHtml) return name;

            return `<div>${nameHtml}${headerTags}</div>`;
        }

        /**
         * Get item info
         * @private
         * @param {object} item
         * @returns {object}
         */
        #getItemInfo(item) {
            const damage = item?.system?.damage.adjusted
            const crit = item?.system?.crit.adjusted
            const info1 = { text: game.i18n.localize(item?.system?.range.label), title: "SWFFG.ItemsRange" };
            const info2 = { damage, title: "SWFFG.ItemsDamage" };
            const info3 = { crit, title: "SWFFG.ItemsCrit" };

            return { info1, info2, info3 };
        }


    }




})



