# Changelog

`12.2.1.1_903`

* Features:
  * Add tooltip for weapons (Range, damage and critical values)
  * Use the new dialog system (light or dark theme)
  * For crew skills using the Pilot role or handling, difficulty and challenge dice are automatically placed if the current speed is greater than 0
  * If the vehicle has more than 1 weapon open a dialog to choose the weapon after use a crew action with a use weapon role
* Fixes:
  * Refactoring code and remove deprecated functions for TAH version 2.x
  * Skill name is translated for the Dice pool dialog and the chat message

`12.2.0.1_903`

* Features:
  * Small update to be compatible with the last version of `Token Action HUD Core` 2.0.x

`12.1.1.1_903`

* Features:
  * Create the group `Crew skill`and move crew skill into
  * Display role name instead of the actor name for crew. Actor name displayed in the tooltip
  * Add image for combat and skill tabs
  * showtitle and grid settings by default for combat and skill tabs
* Fixes:
  * Fixe proficiency dices and ability dices when the actor is a minion

`12.1.0.1_903`

* Features:
  * Add vehicle actor sheet weapons
  * Add vehicle crew skills into skills
  * Add remsetback in dialog roll dices (waiting for the system use them now :D)
  * Handling from a vehicle add boost or setback dices for skill that use the pilot in the crew settings
