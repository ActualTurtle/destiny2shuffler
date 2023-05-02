import { Inventory } from "./inventory";
import { Loadouts } from "./loadout";

//https://bungie-net.github.io/multi/schema_Destiny-Entities-Characters-DestinyCharacterComponent.html#schema_Destiny-Entities-Characters-DestinyCharacterComponent
export interface Character {
  data: {
    membershipId: Number,
    membershipType: Number,
    characterId: Number,
  }
}

//https://bungie-net.github.io/multi/schema_Destiny-Entities-Inventory-DestinyInventoryComponent.html#schema_Destiny-Entities-Inventory-DestinyInventoryComponent
export interface CharacterInventories {
  characterId: Number, //not totally sure about this, may need to be renamed, though the key does exist.
  inventory: Inventory,
}

//https://bungie-net.github.io/multi/schema_DictionaryComponentResponseOfint64AndDestinyLoadoutsComponent.html#schema_DictionaryComponentResponseOfint64AndDestinyLoadoutsComponent
export interface CharacterLoadouts {
  characterId: Number, //not totally sure about this, may need to be renamed, though the key does exist.
  loadouts: Loadouts,
}

//https://bungie-net.github.io/multi/schema_DictionaryComponentResponseOfint64AndDestinyInventoryComponent.html#schema_DictionaryComponentResponseOfint64AndDestinyInventoryComponent
export interface CharacterEquipment {
  characterId: Number, //not totally sure about this, may need to be renamed, though the key does exist.
  equipment: Inventory, 
}