// System Module Imports
import { STATUSEFFECT, MODULE } from './constants.js'


export async function addStatusEffect(){

    var effectList
    //check if the module Condition Lab & triggler is loaded
    if(game.clt){
        effectList = game.settings.get("condition-lab-triggler", "activeConditionMap");
    }else{
        effectList = CONFIG.statusEffects
    }
    
    for (const [id, effectData] of Object.entries(STATUSEFFECT)) {
        try {
            effectList.push(effectData)
        } catch (error) {
            coreModule.api.Logger.error(actionId)
            return null
        }
    }
}