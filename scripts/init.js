import { SystemManager } from './system-manager.js'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'
import { addStatusEffect } from './statuseffect.js'

Hooks.on('tokenActionHudCoreApiReady', async () => {
    /**
     * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
     */
    const module = game.modules.get(MODULE.ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
    
    Hooks.once('tokenActionHudSystemReady', async () => {
        console.log("tah", game.settings.get(MODULE.ID, "tahst-addstatuseffect"))
        if (game.settings.get(MODULE.ID, "tahst-addstatuseffect") === true) {
            await addStatusEffect()
        }
    })
    
})
