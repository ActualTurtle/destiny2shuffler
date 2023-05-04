export interface Loadout {
  date: Date,
  items: Item[],
  characterId: String,
  membershipType: Number,
}

export interface Item {
  id: String,
  name: String,
  icon: String,
}