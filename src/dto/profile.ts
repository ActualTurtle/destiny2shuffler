//Firestore will use same structures as the API, for convinience, but only if it actually is convenient.

import { Character, CharacterEquipment, CharacterInventories, CharacterLoadouts } from "./character"
import { Inventory } from "./inventory"

//https://bungie-net.github.io/multi/schema_SingleComponentResponseOfDestinyProfileComponent.html#schema_SingleComponentResponseOfDestinyProfileComponent
export interface ProfileDetails {
  data: {
    userInfo: UserInfoCard,
    characterIds: [Number],
  }
}

//https://bungie-net.github.io/multi/schema_User-UserInfoCard.html#schema_User-UserInfoCard
export interface UserInfoCard {
  supplementalDisplayName: String,
  iconPath: String,
  displayName: String,
  bungieGlobalDisplayName: String
}

//https://bungie-net.github.io/multi/schema_Destiny-Responses-DestinyProfileResponse.html#schema_Destiny-Responses-DestinyProfileResponse
export interface Profile {
  profileInventory: Inventory,
  profile: ProfileDetails,
  characters: [Character],
  characterInventories: CharacterInventories,
  characterLoadouts: CharacterLoadouts,
  characterEquipment: CharacterEquipment
}