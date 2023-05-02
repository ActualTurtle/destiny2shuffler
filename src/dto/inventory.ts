//https://bungie-net.github.io/multi/schema_DictionaryComponentResponseOfint64AndDestinyInventoryComponent.html#schema_DictionaryComponentResponseOfint64AndDestinyInventoryComponent
export interface Inventory {
  data: {
    items: [InventoryItem]
  }
}

//https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemComponent.html#schema_Destiny-Entities-Items-DestinyItemComponent
export interface InventoryItem {
  itemHash: Number,
  itemInstanceId: Number,
  quantity: Number,
  bindStatus: Number,
  location: Number,
  bucketHash: Number,
  lockable: Boolean,
  state: Number,
  expirationDate: Date,
  isWrapper: Boolean,
}