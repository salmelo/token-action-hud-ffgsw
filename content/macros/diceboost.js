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

    var increment = 0
    let tokenDoc = scope.tokens.document;
    let iconPathPlus = MODULE.iconPath + "diceboost-plus.png"
    let iconPathMinus = MODULE.iconPath + "diceboost-minus.png"
    let effectCounter = EffectCounter.findCounter(tokenDoc, iconPathPlus) || EffectCounter.findCounter(tokenDoc, iconPathMinus)
    var creationState = new Set();

    if (effectCounter) {
        //check if the call is to Add or reduce dices
        if ((actionSource.className.toLowerCase().search("plus") >= 0 && effectCounter.path === iconPathPlus)
            || (actionSource.className.toLowerCase().search("minus") >= 0 && effectCounter.path === iconPathMinus)) {
            increment = 1
        } else {
            increment = -1
        }
        const newValue = increment + effectCounter.getValue(tokenDoc)
        effectCounter.setValue(newValue, tokenDoc);
    } else {
        effectCounter = new ActiveEffectCounter(1, MODULE.iconPath + scope.event.srcElement.id + ".png", tokenDoc);
        creationState.add(tokenDoc.id);
        effectCounter.update(tokenDoc).finally(() => creationState.delete(tokenDoc.id));
    }

}
