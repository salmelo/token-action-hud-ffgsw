export let RollHandler = null
import { get_dice_pool } from "../../../systems/starwarsffg/modules/helpers/dice-helpers.js";

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Handle action click
         * Called by Token Action HUD Core when an action is left or right-clicked
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick(event, encodedValue) {
            const [actionTypeId, actionId, crewActorId, use_handling] = encodedValue.split('|')

            const renderable = ['item', 'weapons']

            if (renderable.includes(actionTypeId) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }

            const knownCharacters = ['character', 'rival']
            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId, crewActorId, use_handling)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, token, actionTypeId, actionId, crewActorId, use_handling)
            }
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover(event, encodedValue) { }

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick(event, group) { }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         * @param {string} crewActorId     The crewActorId
         */
        async #handleAction(event, actor, token, actionTypeId, actionId, crewActorId, use_handling) {
            switch (actionTypeId) {
                case 'item':
                    if (actor.type !== "vehicle") {
                        this.#handleItemAction(event, actor, actionId)
                    } else {
                        this.#handleItemVehicleAction(event, actor, actionId)
                    }
                    break
                case 'utility':
                    this.#handleUtilityAction(token, actionId)
                    break
                case 'skill':
                    if (actor.type !== "vehicle") {
                        this.#handleSkillAction(event, actor, actionId, token)
                    } else {
                        this.#handleSkillVehicleAction(event, actor, actionId, token, crewActorId, use_handling)
                    }
                    break
            }
        }

        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleItemAction(event, actor, actionId) {
            const item = actor.items.get(actionId)
            await game.ffg.DiceHelpers.rollItem(item.id, actor.id);
        }


        /**
         * Handle item vehicle action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleItemVehicleAction(event, actor, actionId) {
            event.preventDefault();
            event.stopPropagation();
            const ship = actor;
            //const weaponId = $(event.currentTarget).data("item-id");
            const weapon = ship.items.get(actionId);
            // validate the weapon still exists
            if (!weapon) {
                ui.notifications.warn(game.i18n.localize("SWFFG.Crew.Weapon.Removed"));
                return;
            }
            const weaponSkill = weapon.system.skill.value;
            const crew = await ship.getFlag("starwarsffg", "crew");
            const skillRoles = game.settings.get("starwarsffg", "arrayCrewRoles").filter(role => role.role_skill === weaponSkill);
            // validate the vehicle has a crew and there is a role that matches the weapon skill
            if (!crew || crew.length === 0) {
                CONFIG.logger.warn("Could not find crew for vehicle or could not find relevant skill; presenting default roller");
                return await game.ffg.DiceHelpers.rollSkill(this, event, null);
            }
            const crewGunners = crew.filter(member => skillRoles.some(role => role.role_name === member.role));
            if (crewGunners.length === 0) {
                CONFIG.logger.warn("Could not find crew for this skill type; presenting default roller");
                return await game.ffg.DiceHelpers.rollSkill(this, event, null);
            } else if (crewGunners.length > 1) {
                // create a dialog to ask the user which crew member should use the weapon
                // build the dialog to select which gunner to use
                const crewMembers = {};
                for (let i = 0; i < crewGunners.length; i++) {
                    const actor = game.actors.get(crewGunners[i].actor_id);
                    const img = actor?.img ? actor.img : "icons/svg/mystery-man.svg";
                    crewMembers['crew ' + i] = {
                        icon: `<img src="${img}" style="max-width: 24px; max-height: 24px">`,
                        label: crewGunners[i].actor_name,
                        callback: async (html) => {
                            await this.vehicleCrewGunneryRoll(weapon, weaponSkill, crewGunners[i]);
                        }
                    }
                }
                // actually show the dialog
                await new Dialog(
                    {
                        title: game.i18n.localize("SWFFG.Crew.Roles.Weapon.Title"),
                        content: `<p>${game.i18n.localize("SWFFG.Crew.Roles.Weapon.Description")}</p>`,
                        buttons: crewMembers,
                    },
                ).render(true);
            } else {
                await this.vehicleCrewGunneryRoll(weapon, weaponSkill, crewGunners[0]);
            }
        }

        /**
         * Handle utility action
         * @private
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #handleUtilityAction(token, actionId) {
            switch (actionId) {
                case 'endTurn':
                    if (game.combat?.current?.tokenId === token.id) {
                        await game.combat?.nextTurn()
                    }
                    break
            }
        }
        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSkillAction(event, actor, actionId, token) {
            const actorSheet = await actor.sheet.getData();
            let pool = new DicePoolFFG({ 'difficulty': 2 });
            pool = get_dice_pool(actor.id, actionId, pool)
            if (actor.type === "minion") {
                if (actor.system.skills[actionId].groupskill) {

                    let skillRank = actor.system.skills[actionId].rank;
                    let characteristicValue = actor.system.characteristics[actor.system.skills[actionId].characteristic].value
                    let ability = Math.max(characteristicValue, skillRank) - Math.min(characteristicValue, skillRank);
                    let proficiency = Math.min(characteristicValue, skillRank);
                    pool.proficiency = proficiency
                    pool.ability = ability
                }
            }
            await game.ffg.DiceHelpers.displayRollDialog(
                actorSheet,
                pool,
                `${game.i18n.localize("SWFFG.Rolling")} ${actionId}`,
                actionId
            );
        }

        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @param {string} crewActorId The crew Actor id
         */
        async #handleSkillVehicleAction(event, actor, actionId, token, crewActorId, use_handling) {

            const crewActor = game.actors.get(crewActorId);
            const crewActorSheet = await crewActor.sheet.getData();
            const skill = crewActor.system.skills[actionId]
            // create chat card data
            const card_data = {
                "crew": {
                    "name": actor.name,
                    "img": actor.img,
                    "crew_card": true,
                    "role": actionId,
                }
            };
            const starting_pool = { 'difficulty': 2 };
            if (use_handling == "true") {
                const handling = actor?.system?.stats?.handling?.value;
                // add modifiers from the vehicle handling
                if (handling > 0) {
                    starting_pool['boost'] = handling;
                } else if (handling < 0) {
                    starting_pool['setback'] = Math.abs(handling);
                }
            }
            let pool = new DicePoolFFG(starting_pool);
            pool = get_dice_pool(crewActor.id, actionId, pool)
            await game.ffg.DiceHelpers.displayRollDialog(
                crewActorSheet,
                pool,
                `${game.i18n.localize("SWFFG.Rolling")} ${actionId}`,
                actionId,
                card_data
            );
        }

        /**
         * Display the roll dialog for a crew member rolling a ship weapon
         * @param weapon - weapon item
         * @param weaponSkill - skill used by the weapon
         * @param selectedGunner - the crew member rolling the weapon (from the crew, not the actual actor)
         * @returns {Promise<void>}
         */
        async vehicleCrewGunneryRoll(weapon, weaponSkill, selectedGunner) {
            const starting_pool = { 'difficulty': 2 };
            const ship = this.actor;
            const crewSheet = game.actors.get(selectedGunner.actor_id)?.sheet;
            // create chat card data
            const card_data = {
                "crew": {
                    "name": ship.name,
                    "img": ship.img,
                    "crew_card": true,
                    "role": selectedGunner.role,
                }
            }
            // create the starting pool
            let pool = new DicePoolFFG(starting_pool);
            // update the pool with actor data
            pool = get_dice_pool(selectedGunner.actor_id, weaponSkill, pool);
            pool = await game.ffg.DiceHelpers.getModifiers(pool, weapon);
            // display the roll dialog
            await game.ffg.DiceHelpers.displayRollDialog(
                crewSheet,
                pool,
                `${game.i18n.localize("SWFFG.Rolling")} ${weaponSkill}`,
                weaponSkill,
                foundry.utils.mergeObject(weapon, card_data)
            );
        }


    }
})
