## v1.6.1
- Fixed a few UI bugs

## v1.6.0
- Improved Pf2e integration (thanks to [cadowtin](https://github.com/cadowtin))
  - New setting Use Pf2e roll system to use the Pf2e system instead of the Lock & Key roll and crit settings
  - Should be fully compatible with the Pf2e rules system
- Added Multi-success during combat only to disablerequired multi success outside of combat
- Added quantity check for Lockpicks (in most systems, some systems are weird)

## v1.5.0
- Added passwords for locks
- Removed "Not a lock" message to reduce unnecessary popups

## v1.4.1
- Several small bug fixes and improvements

## v1.4.0
- Improved behaviour when a player tries to interact with a object that is not a lock or a lock that is out of reach
- Added Critical rolls world setting
  - No crits to disable crits
  - Nat crits to crit on a nat 1 or nat 20
  - Nat crit & +-10 to crit on a not 1, nat 20 or 10 below or above the dc
- Added Lock pick successes required setting to locks
  - Before a lock can be locked/unlocked this many successes have to be accumulated
  - Crits will count as two successes
  - Also shows the GM how many successes have already been accumulated and allows GMs to change this number
- Added World setting Remove Lockpick on critical fail
- Added Key setting Remove on use to remove the key on use (or reduce the stack by one)
- Fixed some Token sheet UI bugs

## v1.3.0
- Added Lockable setting to doors (doors are still lockable by GM, independent of this setting)
- Improved Lockpicking
  - World setting Lockpick item now allows for multiple item names/IDs
  - Added on token/item Lockpick formula setting which will be added to Lockpick rolls
  - Added Lockpick formula override setting to tokens, which will override the worlds Lockpick formula instead of appending it
  - Added Lockpick formula override setting to items, which will override the worlds and the tokens Lockpick formula instead of appending it
- Added Lockbreacking
  - Player can attempt to break locks by alt+rightclicking them
  - Added World setting to break locks on lock break action (lock can only be locked by gm)
  - Added World setting Lockbreak roll formula
  - Added on token/item Lockbreak formula setting which will be added to Lockpick rolls
  - Added Lockbreak formula override setting to tokens, which will override the worlds Lockpick formula instead of appending it
  - Added Lockbreak formula override setting to items, which will override the worlds and the tokens Lockpick formula instead of appending it
- Lock settings will only show up in lockable tokens
- Fixed bug in Item sheets, that caused tab to reset upon data update
- Fixed bug that caused popups not to show up for doors

## v1.2.2
- Improved Arms reach integration
- Included item support for Cyberpunk Red (thanks to [diwako](https://github.com/diwako))

## v1.2.1
- Improved compatibility (other developers should now be able to easily interface with the module)
- Added chatmessage for lock pick success/fail
- fixed bug where item setting did not show up correctly in some cases
- fixed buug where under some cases locked tokens did not behave correctly
- several small bug fixes

## v1.2.0
- Compatibility with Rideable
- Generell improvements

## v1.1.0
- Added lockpicking
  - Locks now have a lockpick dc setting
  - New World setting: Lockpick item
  - New World setting: Lockpick formula
  - Player can try to shift+right-click a start an attempt at picking it (starts Lockpick formula)
  - Popups, sounds, chat messages for lockpicking
- Fixed small bug where changes in an ItemPile sheet were not synched correctly

A wrongly named file prevented some users from installing v1.0.0. This bug was "stealth" fixed in v1.0.0.

## v1.0.0
First release on Foundry
