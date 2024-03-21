// generic
import genericSpawnItemData from "./schemes/genericSpawnItemData.js";
import genericSpawnItemDataWithCondition from "./schemes/genericSpawnItemDataWithCondition.js";

// other game data: 1.6
import incomingPhoneCallData from "./schemes/incomingPhoneCallData.js";
import jukeboxTrackData from "./schemes/jukeboxTrackData.js";
import mannequinData from "./schemes/mannequinData.js";
import monsterSlayerQuestData from "./schemes/monsterSlayerQuestData.js";
import passiveFestivalData from "./schemes/passiveFestivalData.js";
import triggerActionData from "./schemes/triggerActionData.js";
import trinketData from "./schemes/trinketData.js";

// part of other data : 1.6
import plantableRule from "./schemes/plantableRule.js";
import quantityModiier from "./schemes/quantityModifier.js";
import statIncrement from "./schemes/statIncrement.js";
import temporaryAnimatedSpriteDefinition from "./schemes/temporaryAnimatedSpriteDefinition.js";

// fence data:1.6
import fenceData from "./schemes/fenceData.js";

// wedding data:1.6
import weddingData from "./schemes/weddings/weddingData.js";
import weddingAttendeeData from "./schemes/weddings/weddingAttendeeData.js";

const schemes = {
	"StardewValley.GameData.GenericSpawnItemData": genericSpawnItemData,
	"StardewValley.GameData.GenericSpawnItemDataWithCondition": genericSpawnItemDataWithCondition,

	"StardewValley.GameData.IncomingPhoneCallData": incomingPhoneCallData,
	"StardewValley.GameData.JukeboxTrackData": jukeboxTrackData,
	"StardewValley.GameData.MannequinData": mannequinData,
	"StardewValley.GameData.MonsterSlayerQuestData": monsterSlayerQuestData,
	"StardewValley.GameData.PassiveFestivalData": passiveFestivalData,
	"StardewValley.GameData.TriggerActionData": triggerActionData,
	"StardewValley.GameData.TrinketData": trinketData,

	"StardewValley.GameData.PlantableRule": plantableRule,
	"StardewValley.GameData.QuantityModifier": quantityModiier,
	"StardewValley.GameData.StatIncrement": statIncrement,
	"StardewValley.GameData.TemporaryAnimatedSpriteDefinition": temporaryAnimatedSpriteDefinition,

	"StardewValley.GameData.Fences.FenceData": fenceData,

	"StardewValley.GameData.Weddings.WeddingData": weddingData,
	"StardewValley.GameData.Weddings.WeddingAttendeeData": weddingAttendeeData
};

export default schemes;