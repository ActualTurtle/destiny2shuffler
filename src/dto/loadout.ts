//https://bungie-net.github.io/multi/schema_Destiny-Components-Loadouts-DestinyLoadoutsComponent.html#schema_Destiny-Components-Loadouts-DestinyLoadoutsComponent
export interface Loadouts {
  data: {
    loadouts: [LoadoutComponent]
  }
}

//https://bungie-net.github.io/multi/schema_Destiny-Components-Loadouts-DestinyLoadoutComponent.html#schema_Destiny-Components-Loadouts-DestinyLoadoutComponent
export interface LoadoutComponent {
  colorHash: Number,
  iconHash: Number,
  nameHash: Number,
  items: [LoadoutItem]
}

//https://bungie-net.github.io/multi/schema_Destiny-Components-Loadouts-DestinyLoadoutItemComponent.html#schema_Destiny-Components-Loadouts-DestinyLoadoutItemComponent
export interface LoadoutItem {
  itemInstanceId: Number,
  plugItemHashes: [Number] //not sure how this works
}