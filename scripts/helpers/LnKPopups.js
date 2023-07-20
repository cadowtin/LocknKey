import { LnKutils, cModuleName, cPopUpID, Translate } from "../utils/LnKutils.js";
import { Geometricutils } from "../utils/Geometricutils.js";

class LnKPopups {
	//DECLARATIONS
	static TextPopUp(pObject, pText, pWords = {}) {} //show pText over pObject and replaces {pWord} with matching vWord in pWords
	
	static TextPopUpID(pObject, pID, pWords = {}) {} //show pText over pObject and replaces {pWord} with matching vWord in pWords
	
	static PopUpRequest(pObjectID, pLockType, pText) {} //handels socket calls for pop up texts
	
	//IMPLEMENTATIONS
	static TextPopUp(pObject, pText, pWords = {}) {
		let vText = pText;
		
		for (let vWord of Object.keys(pWords)) {
			vText = vText.replace("{" + vWord + "}", pWords[vWord]);
		}
		
		//other clients pop up
		game.socket.emit("module."+cModuleName, {pFunction : "PopUpRequest", pData : {pObjectID: pObject.id, pLockType : LnKutils.Locktype(pObject), pText : vText}});
		
		//own pop up
		LnKPopups.PopUpRequest(pObject.id, LnKutils.Locktype(pObject), vText);
	}
	
	static TextPopUpID(pObject, pID, pWords = {}) {
		LnKPopups.TextPopUp(pObject, Translate(cPopUpID+"."+pID), pWords)
	} 
	
	static PopUpRequest(pObjectID, pLockType, pText) {
		if (game.settings.get(cModuleName, "MessagePopUps")) {
			//only relevant if token is on current canves, no scene necessary
			let vObject = LnKutils.LockfromID(pObjectID, pLockType); 
			let vPosition = Geometricutils.ObjectPosition(vObject);
			
			if (vObject) {
				canvas.interface.createScrollingText({x: vPosition[0], y: vPosition[1]}, pText, {anchor: CONST.TEXT_ANCHOR_POINTS.TOP, fill: "#FFFFFF", stroke: "#000000"});
			}
		}
	}
}

//export Popups
function PopUpRequest({ pObjectID, pLockType, pText } = {}) { return LnKPopups.PopUpRequest(pObjectID, pLockType, pText); }

export { LnKPopups, PopUpRequest }