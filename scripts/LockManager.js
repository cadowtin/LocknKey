import { cModuleName, Translate, LnKutils, cLUisGM, cLUuseKey, cLUusePasskey, cLUpickLock, cLUbreakLock } from "./utils/LnKutils.js";
import { cLockTypeDoor, cLockTypeLootPf2e } from "./utils/LnKutils.js";
import { LnKFlags } from "./helpers/LnKFlags.js";
import { LnKPopups } from "./helpers/LnKPopups.js";
import { LnKSound } from "./helpers/LnKSound.js";

//does everything Lock related
class LockManager {
	//DECLARATIONS
	//basics
	static async useLockKey(pLock, pCharacter, pKeyItemID) {} //handels pLock use of pCharacter with item of pItemID
	
	static async useLockPasskey(pLock, pCharacter, pPasskey) {} //handels pLock use of pCharacter with Passkey pPasskey
	
	static async circumventLock(pLock, pCharacter, pUsedItemID, pRollresult, pDiceresult, pMethodtype) {} //handels pLock use of pCharacter with a pMethodtype [cLUpickLock, cLUbreakLock] and result pRollresults
	
	static async oncircumventLockresult(pLock, pCharacter, pUsedItemID, pResultDegree, pMethodtype, pChatMessages = false) {} //called when pCharacter tries to circumvent pLock using pMethodtype with pResultDegree
	
	static LockuseRequest(puseData) {} //called when a player request to use a lock, handeld by gm
	
	//LockKeys
	static async newLockKey(pLock) {} //create a new item key for pLock
	
	//events
	static async onLock(pLock, pLockusetype) {} //calledif a lock is locked
	
	static async onunLock(pLock, pLockusetype) {} //calledif a lock is unlocked
	
	//lock type
	static async ToggleLock(pLock, pLockusetype) {} //locks or unlocks
	
	static async ToggleDoorLock(pDoor, pLockusetype) {} //locks or unlocks pDoor
	
	static async onBreakLock(pLock) {} //makes it, so that the Lock is no longer Lockable (if setting is active)
	
	static async isUnlocked(pObject, pPopup = false) {} //if pObject is currently unlocked
	
	static TokenisUnlocked(pToken, pPopup = false) {} //if pToken is currently unlocked
	
	static UserCanopenToken(pToken, pPopup = false) {} //if the current user can open pToken
	
	//copy paste
	static copyLock(pLock) {} //copy the Locks Key IDs
	
	static async pasteLock(pLockType, pLock) {} //paste the Key IDs to the Lock 
	
	//IMPLEMENTATIONS
	//basics
	static async useLockKey(pLock, pCharacter, pKeyItemID) {
		let vKey = (await LnKutils.TokenInventory(pCharacter)).get(pKeyItemID);
		
		if (vKey) {
			if (LnKFlags.matchingIDKeys(pLock, vKey)) {
				//key fits
				LockManager.ToggleLock(pLock, cLUuseKey);
				
				if (LnKFlags.RemoveKeyonUse(vKey)) {
					//remove one from stack, which will also delte if no key left
					LnKutils.removeoneItem(vKey, pCharacter);
				}
			}
		};
	}
	
	static async useLockPasskey(pLock, pCharacter, pPasskey) {
		if (LnKFlags.MatchingPasskey(pLock, pPasskey)) {
			//Passkey matches
			LockManager.ToggleLock(pLock, cLUuseKey);
		}	
		else {
			LnKPopups.TextPopUpID(pLock, "WrongPassword"); //MESSAGE POPUP
		}
	}
	
	static async circumventLock(pLock, pCharacter, pUsedItemID, pRollresult, pDiceresult, pMethodtype) {
		//only handles custom successDegree
		let vSuccessDegree;
		
		vSuccessDegree = LnKutils.successDegree(pRollresult, pDiceresult, LnKFlags.LockDCtype(pLock, pMethodtype));
		
		LockManager.oncircumventLockresult(pLock, pCharacter, pUsedItemID, vSuccessDegree, pMethodtype, true)
	}
	
	static async oncircumventLockresult(pLock, pCharacter, pUsedItemID, pResultDegree, pMethodtype, pChatMessages = false) {
		let vCritMessagesuffix = ".default";
		let vusedItem;	
		
		if (LnKFlags.isLockable(pLock)) {	
		
			if ((pResultDegree > 1) || (pResultDegree < 0)) {
				vCritMessagesuffix = ".crit";
			}
			
			if (pUsedItemID && pUsedItemID.length > 0) {
				vusedItem = (await LnKutils.TokenInventory(pCharacter)).get(pUsedItemID);
			}	
			
			if (pResultDegree > 0) {
				//success
				switch (pMethodtype) {
							case cLUpickLock:
								if (await LnKFlags.changeLockPicksuccesses(pLock, pResultDegree)) {
									//only toggle lock if enough seccesses have been achieved
									LockManager.ToggleLock(pLock, pMethodtype);
								}
								
								if (pChatMessages) {
									await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockPicksuccess"+vCritMessagesuffix, {pName : pCharacter.name})}); //CHAT MESSAGE
								}
								
								break;
							case cLUbreakLock:
								if (await LockManager.ToggleLock(pLock, pMethodtype)) {	
									//something could fail during Lock toggle								
									await LockManager.onBreakLock(pLock);
								}
								
								if (pChatMessages) {
									await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockBreaksuccess"+vCritMessagesuffix, {pName : pCharacter.name})}); //CHAT MESSAGE
								}
								
								break;
				}
			}
			else {
				//failure
				switch (pMethodtype) {
							case cLUpickLock:
								LnKPopups.TextPopUpID(pLock, "pickLockfailed"); //MESSAGE POPUP
								
								if (pChatMessages) {
									await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockPickfail"+vCritMessagesuffix, {pName : pCharacter.name})}); //CHAT MESSAGE
								}
								
								if (pResultDegree < 0 && game.settings.get(cModuleName, "RemoveLPoncritFail") && vusedItem) {
									//if crit fail and LP item was found and set to do so, remove Lockpick from inventory
									LnKutils.removeoneItem(vusedItem, pCharacter);
								}
								
								break;
							case cLUbreakLock:
								LnKPopups.TextPopUpID(pLock, "breakLockfailed"); //MESSAGE POPUP
								
								if (pChatMessages) {
									await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockBreakfail"+vCritMessagesuffix, {pName : pCharacter.name})}); //CHAT MESSAGE
								}
								break;
				}
			}
		}
		else {
			LnKPopups.TextPopUpID(pLock, "NotaLock"); //MESSAGE POPUP
		}		
	}
	
	static LockuseRequest(puseData) {
		if (game.user.isGM) {
			//only relevant for GMs
			
			let vScene = game.scenes.get(puseData.SceneID);
			let vLock;
			let vCharacter;
			
			if (vScene) {
				vLock = LnKutils.LockfromID(puseData.LockID, puseData.Locktype, vScene);
				
				if ((LnKutils.isLockCompatible(vLock) || puseData.useType == cLUisGM)) {
					vCharacter = LnKutils.TokenfromID(puseData.CharacterID, vScene);
					
					switch (puseData.useType) {
						case cLUuseKey:
							//a key was used on the lock
							LockManager.useLockKey(vLock, vCharacter, puseData.KeyItemID);
							break;
						case cLUusePasskey:
							LockManager.useLockPasskey(vLock, vCharacter, puseData.EnteredPasskey);
							break;
						case cLUpickLock:
						case cLUbreakLock:
							if (!puseData.usePf2eRoll) {
								LockManager.circumventLock(vLock, vCharacter, puseData.UsedItemID, puseData.Rollresult, puseData.Diceresult, puseData.useType);
							}
							else {
								//use Pf2e systems result
								LockManager.oncircumventLockresult(vLock, vCharacter, puseData.UsedItemID, puseData.Pf2eresult, puseData.useType);
							}
							break;
					}
				}
			}
		}
	}
	
	//LockKeys
	static async newLockKey(pLock) {
		if (pLock && LnKutils.isLockCompatible(pLock)) {
			//make sure pLock is actually a Lock
			
			if (LnKutils.isTokenLock(pLock)) {
				//tokens are not lockable by default
				await LnKFlags.makeLockable(pLock)
			}		
			
			let vItem = await LnKutils.createKeyItem();
			
			LnKFlags.linkKeyLock(vItem, pLock);
		}
	}
	
	//events
	static async onLock(pLock, pLockusetype) {
		let vLocktype = await LnKutils.Locktype(pLock);
		switch(vLocktype) {
			case cLockTypeDoor:
				LnKPopups.TextPopUpID(pLock, "lockedDoor"); //MESSAGE POPUP
				break;
			case cLockTypeLootPf2e:
			default:
				LnKPopups.TextPopUpID(pLock, "lockedToken", {pLockName : pLock.name}); //MESSAGE POPUP
		}
		
		LnKSound.PlayunLockSound(pLock);
		
		Hooks.callAll(cModuleName+".onLock", vLocktype, pLock);
	}
	
	static async onunLock(pLock, pLockusetype) {
		let vLocktype = await LnKutils.Locktype(pLock);
		switch(vLocktype) {
			case cLockTypeDoor:
				LnKPopups.TextPopUpID(pLock, "unlockedDoor"); //MESSAGE POPUP
				break;
			case cLockTypeLootPf2e:
			default:
				LnKPopups.TextPopUpID(pLock, "unlockedToken", {pLockName : pLock.name}); //MESSAGE POPUP
		}
		
		LnKSound.PlayLockSound(pLock);
		
		Hooks.callAll(cModuleName+".onunLock", vLocktype, pLock);
	}
	
	//lock type
	static async ToggleLock(pLock, pLockusetype) {
		let vValidToggle;
		
		switch (pLockusetype) {
			case cLUisGM:
				vValidToggle = true; //GMs can allways toggle
				break
			case cLUbreakLock:
				vValidToggle = !(await LockManager.isUnlocked(pLock)); //only locked doors can be toggled through break
				break;
			case cLUpickLock:
			case cLUuseKey:
			default:
				vValidToggle = game.settings.get(cModuleName, "allowLocking") || !(await LockManager.isUnlocked(pLock)); //locks can only be locked if allowd in settings
				break;
		}
		
		if (vValidToggle) {
			//if setting is set to false, only GM can lock locks
			let vLocktype = await LnKutils.Locktype(pLock);
			
			if (pLockusetype == cLUisGM) {
				await LnKFlags.makeLockable(pLock);
			}
			
			switch(vLocktype) {
				case cLockTypeDoor:
					await LockManager.ToggleDoorLock(pLock, pLockusetype);
					
					return true;
					break;
				case cLockTypeLootPf2e:
				default:
					await LnKFlags.invertLockedstate(pLock);
					
					if (LnKFlags.isLocked(pLock)) {
						LockManager.onLock(pLock, pLockusetype);
					}
					else {
						LockManager.onunLock(pLock, pLockusetype);
					}
					
					return true;
					break;
			}
		}
		else {
			//give reasons for Invalid
			if (await LockManager.isUnlocked(pLock)) {
				switch (pLockusetype) {
					case cLUbreakLock:
						LnKPopups.TextPopUpID(pLock, "cantLock.break"); //MESSAGE POPUP
						break;
					case cLUpickLock:
					case cLUuseKey:
						LnKPopups.TextPopUpID(pLock, "cantLock"); //MESSAGE POPUP
						break;
				}
			}
		}
		
		return false;
	} 
	
	static async ToggleDoorLock(pDoor, pLockusetype) {
		switch (pDoor.ds) {
			case 0:
			case 1:
				//lock
				await pDoor.update({ds : 2});
				
				LockManager.onLock(pDoor, pLockusetype);
				break;
			case 2:
				//unlock
				await pDoor.update({ds : 0});
				
				LockManager.onunLock(pDoor, pLockusetype);
				break;
		}
	} 
	
	static async onBreakLock(pLock) {
		if (game.settings.get(cModuleName, "LockBreakunlockable")) {
			await LnKFlags.disableLock(pLock);
		}
		
		//LnKPopups.TextPopUpID(pLock, "brokeLock"); //MESSAGE POPUP
	}
	
	static async isUnlocked(pObject, pPopup = false) {
		let vLocktype = await LnKutils.Locktype(pObject);
		
		switch (vLocktype) {
			case cLockTypeDoor:
				if (pObject.ds == 2) {
						if (pPopup) {
							LnKPopups.TextPopUpID(pToken, "DoorisLocked"); //MESSAGE POPUP
						}
					
					return false;
				}
				return true;
			case cLockTypeLootPf2e:
			default:
				return LockManager.TokenisUnlocked(pObject, pPopup)
		}
	}
	
	static TokenisUnlocked(pToken, pPopup = false) {
		let vUnlocked = !(LnKFlags.isLocked(pToken));
		
		if (pPopup && !vUnlocked) {
			LnKPopups.TextPopUpID(pToken, "TokenisLocked", {pLockName : pToken.name}); //MESSAGE POPUP
		}
		
		return !(LnKFlags.isLocked(pToken));
	}
	
	static UserCanopenToken(pToken, pPopup = false) {
		return LockManager.TokenisUnlocked(pToken, pPopup) || (pToken.isOwner && game.settings.get(cModuleName, "alwaysopenOwned"))
	}
	
	//copy paste
	static copyLock(pLock) {
		LnKFlags.copyIDKeys(pLock);
	}
	
	static async pasteLock(pLock) {
		if (pLock && LnKutils.isLockCompatible(pLock)) {
			//make sure pLock is actually a Lock
			
			if (LnKutils.isTokenLock(pLock)) {
				//tokens are not lockable by default
				await LnKFlags.makeLockable(pLock)
			}
			
			LnKFlags.pasteIDKeys(pLock);
		}
	}
}

//Hooks
Hooks.on(cModuleName + "." + "DoorRClick", (pDoorDocument, pInfos) => {
	if (game.user.isGM && pInfos.shiftKey) {//GM SHIFT: create new key
		LockManager.newLockKey(pDoorDocument);
	}
	
	if (game.user.isGM && pInfos.ctrlKey && game.settings.get(cModuleName, "useGMquickKeys")) {//GM CTRL: copy lock IDs
		LockManager.copyLock(pDoorDocument);
	}
});

Hooks.on(cModuleName + "." + "DoorLClick", (pDoorDocument, pInfos) => {	
	if (game.user.isGM && pInfos.ctrlKey && game.settings.get(cModuleName, "useGMquickKeys")) {//GM CTRL: paste lock IDs
		LockManager.pasteLock(pDoorDocument);
	}
});

Hooks.on(cModuleName + "." + "TokenRClick", (pTokenDocument, pInfos) => {
	if (game.user.isGM && pInfos.shiftKey) {//GM SHIFT: create new key
		LockManager.newLockKey(pTokenDocument);
	}
	
	if (game.user.isGM && pInfos.ctrlKey && game.settings.get(cModuleName, "useGMquickKeys")) {//GM CTRL: copy lock IDs
		LockManager.copyLock(pTokenDocument);
	}
	
	if (game.user.isGM && pInfos.altKey && game.settings.get(cModuleName, "useGMquickKeys")) {//GM ALT: toggle lock state
		LockManager.ToggleLock(pTokenDocument, cLUisGM);
	}
});

Hooks.on(cModuleName + "." + "TokenLClick", (pTokenDocument, pInfos) => {
	if (game.user.isGM && pInfos.ctrlKey && game.settings.get(cModuleName, "useGMquickKeys")) {//GM CTRL: paste lock IDs
		LockManager.pasteLock(pTokenDocument);
	}
});

Hooks.on(cModuleName + "." + "TokendblClick", (pTokenDocument, pInfos) => { //for sheet opening
	if (!game.user.isGM) {//CLIENT: check if token unlocked
		return LockManager.UserCanopenToken(pTokenDocument, true);
	}
	
	return true; //if anything fails
});

//wrap and export functions
function LockuseRequest(puseData = {}) {return LockManager.LockuseRequest(puseData); }
function isUnlocked(pObject, pPopup = false) {return LockManager.isUnlocked(pObject, pPopup)} //if pObject is currently unlocked

export { LockuseRequest, isUnlocked }
