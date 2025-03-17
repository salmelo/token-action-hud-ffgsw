const MODULE = {
    ID: "token-action-hud-ffgsw",
    localizeID: "tokenActionHud",
    iconPath: "modules/token-action-hud-ffgsw/artwork/icons/"
}

main()

async function main() {
    // scope come from the call of the macro in roll-handler.js

    if (!scope.tokens) {
        ui.notifications.warn(`${game.i18n.localize(MODULE.localizeID + ".error.selectMiss")}`);
        return;
    }

    const actionSource = scope.event.srcElement
    if (!(actionSource.className.toLowerCase().search("plus") >= 0 || actionSource.className.toLowerCase().search("minus") >= 0)) {
        ui.notifications.warn(`${game.i18n.localize(MODULE.localizeID + ".error.dicesMiss")}`);
        return
    }

    if (!game.modules.get("statuscounter").active) {
        ui.notifications.warn(`${game.i18n.localize(MODULE.localizeID + ".error.statuscounter")}`);
        return
    }

    let statusIdPlus = "dicesetback-plus-tah"
    let statusIdMinus = "dicesetback-minus-tah"
    let effect = scope.tokens.actor.effects.find(e => e.statuses.first() === statusIdPlus) || scope.tokens.actor.effects.find(e => e.statuses.first() === statusIdMinus)

    if (effect) {
        //check if the call is to Add or reduce dices
        if ((actionSource.className.toLowerCase().search("plus") >= 0 && effect.statuses.first() === statusIdPlus)
            || (actionSource.className.toLowerCase().search("minus") >= 0 && effect.statuses.first() === statusIdMinus)) {
            effect.statusCounter.setValue(effect.statusCounter.displayValue + 1)
        } else {
            effect.statusCounter.setValue(effect.statusCounter.displayValue - 1)
        }
    } else {
        let AE
        if (actionSource.className.toLowerCase().search("plus") >= 0) {
            AE = await ActiveEffect.fromStatusEffect(statusIdPlus)
        } else {
            AE = await ActiveEffect.fromStatusEffect(statusIdMinus)
        }
        await scope.tokens.actor.createEmbeddedDocuments("ActiveEffect", [AE]);
    }

}
