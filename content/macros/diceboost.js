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
    let iconPathPlus = MODULE.iconPath + "diceboost-plus.png"
    let iconPathMinus = MODULE.iconPath + "diceboost-minus.png"
    let statusIdPlus = "diceboost-plus-tah"
    let statusIdMinus = "diceboost-minus-tah"
    let effect = scope.tokens.actor.effects.find(e => e.img === iconPathPlus) || scope.tokens.actor.effects.find(e => e.img === iconPathMinus)

    if (effect) {
        //check if the call is to Add or reduce dices
        if ((actionSource.className.toLowerCase().search("plus") >= 0 && effect.img === iconPathPlus)
            || (actionSource.className.toLowerCase().search("minus") >= 0 && effect.img === iconPathMinus)) {
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
