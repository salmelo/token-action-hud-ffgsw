import { MODULE } from './constants.js'
import { addStatusEffect } from './statuseffect.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export async function register(coreUpdate) {
    game.settings.register(MODULE.ID, 'displayUnequipped', {
        name: game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.registerMenu(MODULE.ID, "statuseffect", {
        name: game.i18n.localize("tokenActionHud.template.settings.statuseffect.menu.name"),
        hint: game.i18n.localize("tokenActionHud.template.settings.statuseffect.menu.hint"),
        label: game.i18n.localize("tokenActionHud.template.settings.statuseffect.menu.label"),
        icon: "fa-thin fa-sparkles",
        type: StatusEffectForm,
        restricted: true,
    });

    game.settings.register(MODULE.ID, 'tahst-addstatuseffect', {
        name: game.i18n.localize('tokenActionHud.template.settings.statuseffect.addstatuseffect.name'),
        hint: game.i18n.localize('tokenActionHud.template.settings.statuseffect.addstatuseffect.hint'),
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        onChange: () => {
            location.reload();
        }
    })

    game.settings.register(MODULE.ID, 'tahst-dicesbonus', {
        name: game.i18n.localize('tokenActionHud.template.settings.statuseffect.dicesbonus.name'),
        hint: game.i18n.localize('tokenActionHud.template.settings.statuseffect.dicesbonus.hint'),
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        onChange: () => {
            location.reload();
        }
    })

    game.settings.register(MODULE.ID, 'tahst-dicesroll', {
        name: game.i18n.localize('tokenActionHud.template.settings.statuseffect.dicesroll.name'),
        hint: game.i18n.localize('tokenActionHud.template.settings.statuseffect.dicesroll.hint'),
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        onChange: () => {
            location.reload();
        }
    })

    if (game.settings.get(MODULE.ID, "tahst-addstatuseffect") == true) {
        await addStatusEffect()
    }

}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class StatusEffectForm extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(...args) {
        super(args);
    }

    /* -------------------------------------------- */

    static DEFAULT_OPTIONS = {
        actions: {
            reset: StatusEffectForm.reset
        },
        classes: [`${MODULE.ID}-app`, "sheet"],
        id: MODULE.ID + "-settings",
        form: {
            closeOnSubmit: true,
            handler: StatusEffectForm.submit
        },
        position: {
            width: 600,
            height: 420
        },
        tag: "form",
        window: {
            minimizable: true,
            resizable: true,
            title: "tokenActionHud.template.settings.statuseffect.name"
        }
    };

    static PARTS = {
        form: {
            template: "modules/" + MODULE.ID + "/templates/settings/statuseffect.hbs"
        }
    };

    /* -------------------------------------------- */

    async _prepareContext() {
        this.context = {};
        const canConfigure = game.user.can("SETTINGS_MODIFY");

        for (let setting of game.settings.settings.values()) {
            try {
                // Exclude settings the user cannot change
                if (!setting.key.includes("tahst-") || (!canConfigure && setting.scope !== "client")) continue;

                // Update setting context
                const s = foundry.utils.duplicate(setting);
                s.module = MODULE.ID;
                s.name = game.i18n.localize(s.name);
                s.hint = game.i18n.localize(s.hint);
                s.value = game.settings.get(MODULE.ID, s.key);
                s.type = setting.type instanceof Function ? setting.type.name : "String";
                s.isCheckbox = setting.type === Boolean;
                s.isSelect = s.choices !== undefined;
                s.isRange = setting.type === Number && s.range;
                s.isFilePicker = setting.valueType === "FilePicker";

                if (s.key.includes("tahst-")) this.context[s.key] = s;

            } catch (error) {
                return null
            }
        }

        return {
            data: this.context,
        };
    }

    /* -------------------------------------------- */

    _onRender(context, options) {
        super._onRender(context, options);
    }

    /* -------------------------------------------- */

    static async reset() {
        for (let setting of game.settings.settings.values()) {
            try {
                if (!setting.key.includes("tahst-")) continue;
                await game.settings.set(MODULE.ID, setting.key, setting.default);
            } catch (error) {
                CONFIG.logger.warn(error)
                return null
            }
        }
        this.render(true);
    }

    /* -------------------------------------------- */

    static async submit(event, form, formData) {
        for (const [key, value] of Object.entries(formData.object)) {
            if (value !== this.context[key]) {
                await game.settings.set(MODULE.ID, key, value);
            }
        }

    }
}

