/*
    Description: Macro for post encounter strain recovery.  Select token,
        execute, select Cool or Discipline, and click "Recover."
        It should roll the pool and apply successes and advantages
        to removing strain on the selected actor.  If there are
        leftover advantages, it reports that in chat.  MANY MANY
        THANKS to Blaze for helping me do the preview correctly.
    Author: AdmiralDave
    NOTE: I've house ruled that Advantage can be spent to recover
        strain during this post-encounter recovery, as nothing
        in the description of the rule states that you can't and
        every other roll in the game suggests using advantage
        that way.  If you disagree, set advantage_heals_strain
        below to false.
    Source: https://github.com/StarWarsFoundryVTT/StarWarsFFG/wiki/Helpful-macros#post-encounter-strain-recovery

    Release Notes
    v2 - 2023-02-01 - Updated for Foundry v10 compatability by Wrycu
    v1 - 2022-08-30 - Initial release

    Local Release notes
    
    v1.3 - 2024-11-24 - Use DialogV2 to choose the skill.
                        Refactoring the code
    v1.2 - 2024-09-15 - Check if actor has Balance talent and add force pool max to the skill check
                        Change speaker alias to speaker actor for chat message.
    v1.1 - 2024-06-14 - V12 Fix problem with promise chatmessage from the roll. Add emote to true to be sure added chat message is displayed after the roll message.
                        remove advantage infos into chat message - remove translated texts
    v1.0 - 2024-05-06 - Add translations for UI messages
*/
/**********************
 * Modify values here *
 **********************/

let MODULE = {
    ID: "token-action-hud-ffgsw",
    localizeID: "tokenActionHud"
}
/***********************************
 * DO NOT Modify values below here *
 ***********************************/
main()

async function main() {
    //Is token selected?
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.error(`${game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.select")}`);
        return;
    }

    let using_actor = canvas.tokens.controlled[0].actor;

    let current_strain = using_actor?.system?.stats?.strain?.value;
    if (current_strain == null || current_strain == undefined || current_strain == 0) {
        ui.notifications.error(`${using_actor.name} ${game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.noStrain.heal")}`);
        return;
    }

    show_strain_recovery_popup(using_actor, current_strain);
}

async function show_strain_recovery_popup(using_actor, current_strain) {
    let cool_skill = get_skill(using_actor, "Cool");
    let discipline_skill = get_skill(using_actor, "Discipline");
    let balance_talent = get_talent(using_actor, game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.balance"));
    let skillForce = 0;
    if (balance_talent.length != 0) {
        skillForce = get_force(using_actor);
    }
    if (cool_skill == null || cool_skill == undefined) {
        ui.notifications.error(`${using_actor.name} is missing ${game.i18n.localize("SWFFG.SkillsNameCool")} skill object`);
        return;
    }

    if (discipline_skill == null || discipline_skill == undefined) {
        ui.notifications.error(`${using_actor.name} is missing ${game.i18n.localize("SWFFG.SkillsNameDiscipline")} skill object`);
        return;
    }

    let cool_char = get_characteristic(using_actor, cool_skill);
    if (cool_char == null || cool_char == undefined) {
        let local_char = game.i18n.localize(`SWFFG.Characteristic${cool_skill.characteristic}`);
        ui.notifications.error(`${using_actor.name} is missing ${local_char} characteristic object`);
        return;
    }

    let discipline_char = get_characteristic(using_actor, discipline_skill);
    if (discipline_char == null || discipline_char == undefined) {
        let local_char = game.i18n.localize(`SWFFG.${discipline_skill.characteristic}`)
        ui.notifications.error(`${using_actor.name} is missing ${local_char} characteristic object`);
        return;
    }

    let cool_pool = build_pool(cool_skill, cool_char, skillForce);
    let discipline_pool = build_pool(discipline_skill, discipline_char, skillForce);

    let cool_checked = "";
    let discipline_checked = "";
    if (is_skill_better(cool_pool, discipline_pool))
        cool_checked = " checked";
    else
        discipline_checked = " checked";

    let data = {}
    data.cool_checked = cool_checked
    data.cool_pool = cool_pool.renderPreview().outerHTML.toString()
    data.cool_skill = cool_skill
    data.discipline_checked = discipline_checked
    data.discipline_pool = discipline_pool.renderPreview().outerHTML.toString()
    data.discipline_skill = discipline_skill

    const dialog = await foundry.applications.api.DialogV2.wait({
        window: {
            title: game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.dialog.title"),
            icon: "fa-solid fa-laptop-medical"
        },
        content: await renderTemplate("modules/" + MODULE.ID + "/templates/macros/strain-recovery.hbs", data),
        modal: true,
        rejectClose: false,
        buttons: [
            {
                action: "recover",
                label: game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.recover"),
                default: true,
                callback: async (event, button, dialog) => {
                    console.log(button.form.elements.selected_skill.value)
                    if (button.form.elements.selected_skill.value == "Cool") {
                        await recover(using_actor, cool_pool, current_strain)
                    } else {
                        await recover(using_actor, discipline_pool, current_strain)
                    }
                }

            }
        ]
    })
}

//helpers
//=================

function build_pool(skill, characteristic, skillForce) {
    let preview_dice_pool = new DicePoolFFG({
        ability: Math.max(characteristic?.value ? characteristic.value : 0, skill?.rank ? skill.rank : 0),
        boost: skill.boost,
        setback: skill.setback,
        remsetback: skill.remsetback,
        force: skill.force + skillForce,
        advantage: skill.advantage,
        dark: skill.dark,
        light: skill.light,
        failure: skill.failure,
        threat: skill.threat,
        success: skill.success,
        triumph: skill?.triumph ? skill.triumph : 0,
        despair: skill?.despair ? skill.despair : 0,
        // source: {
        //     skill: skill?.ranksource?.length ? skill.ranksource : [],
        //     boost: skill?.boostsource?.length ? skill.boostsource : [],
        //     remsetback: skill?.remsetbacksource?.length ? skill.remsetbacksource : [],
        //     setback: skill?.setbacksource?.length ? skill.setbacksource : [],
        //     advantage: skill?.advantagesource?.length ? skill.advantagesource : [],
        //     dark: skill?.darksource?.length ? skill.darksource : [],
        //     light: skill?.lightsource?.length ? skill.lightsource : [],
        //     failure: skill?.failuresource?.length ? skill.failuresource : [],
        //     threat: skill?.threatsource?.length ? skill.threatsource : [],
        //     success: skill?.successsource?.length ? skill.successsource : [],
        // },
    });
    preview_dice_pool.upgrade(Math.min(characteristic.value, skill.rank));
    return preview_dice_pool;
}

//get a given skill from the actor
function get_skill(using_actor, skill_name) {
    return using_actor?.system?.skills[skill_name];
}

//get the paired characterstic for a skill from the actor
function get_characteristic(using_actor, skill_obj) {
    return using_actor?.system?.characteristics[skill_obj.characteristic];
}

//get a given talent from the actor
function get_talent(using_actor, talent_name) {
    return using_actor?.talentList.filter(item => item.name.toLowerCase() === talent_name);
}

function get_force(using_actor) {
    return using_actor?.system?.stats.forcePool.max;
}

function is_skill_better(first_pool, second_pool) {
    let first_total = first_pool.ability + first_pool.proficiency + first_pool.boost;
    let second_total = second_pool.ability + second_pool.proficiency + second_pool.boost;
    if (first_total > second_total)
        return true;
    if (first_total < second_total)
        return false;
    if (first_pool.proficiency > second_pool.proficiency)
        return true;

    return false;
}

async function recover(using_actor, rolled_pool, current_strain) {

    let roll = await new game.ffg.RollFFG(rolled_pool.renderDiceExpression()).toMessage({
        speaker: {
            actor: using_actor
        },
        flavor: `${game.i18n.localize("SWFFG.Rolling")} ${game.i18n.localize(MODULE.localizeID + ".macros.strainRecovery.dialog.title")}...`,

    });

    let roll_result = roll.rolls[0]
    let min_heal = roll_result.ffg.success + roll_result.ffg.light;
    let max_heal = min_heal;
    let healed_strain = max_heal;

    if (current_strain < max_heal) {
        healed_strain = current_strain;
    }

    let message_content = `${game.i18n.format(MODULE.localizeID + ".macros.strainRecovery.healed", { quantity: healed_strain })}`;

    await ChatMessage.create({
        speaker: {
            actor: using_actor
        },
        content: message_content
    });

    using_actor.update({ "system.stats.strain.value": current_strain - healed_strain });


}