// System Module Imports
import { STATUSEFFECT, MODULE } from './constants.js'
import { Utils } from './utils.js'


export async function addStatusEffect(){

    for (const [id, effectData] of Object.entries(STATUSEFFECT)) {
        try {
            CONFIG.statusEffects.push(effectData)
        } catch (error) {
            coreModule.api.Logger.error(actionId)
            return null
        }
    }
    
}