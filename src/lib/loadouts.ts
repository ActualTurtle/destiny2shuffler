import { collection, addDoc, getDocs, query, where, orderBy, and, deleteDoc } from "firebase/firestore";
import { Loadout } from "../dto/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "loadouts"

export async function saveLoadout(itemIds: String[], characterId: String, membershipType: String) {
  let data: Loadout = {
    date: new Date(),
    itemIds,
    characterId,
    membershipType,
  };

  // Add a new document in collection "loadouts"
  await addDoc(collection(db, COLLECTION_NAME), data);
}

export async function getLoadouts(characterId: String, membershipType: String) {
  
  const q = query(
    collection(db, COLLECTION_NAME), 
    and(
      where("characterId", "==", characterId), 
      where("membershipType", "==", membershipType)
    ), 
    orderBy("date"));

  const querySnapshot = (await getDocs(q));

  let loadouts: Loadout[] = [];

  querySnapshot.forEach((doc) => {
    let data = doc.data();
    
    loadouts.push({
      itemIds: data.itemIds,
      characterId: data.characterId,
      membershipType: data.membershipType,
      date: data.date,
    });
  })

  return loadouts;
}

export async function removeLoadout(loadout: Loadout) {
  const q = query(
    collection(db, COLLECTION_NAME), 
    and(
      where("characterId", "==", loadout.characterId),
      where("membershipType", "==", loadout.membershipType),
      where("date", "==", loadout.date),
      // ...loadout.itemIds.map((id) => where("itemIds", "array-contains", id)),
    ),
  )

  const querySnapshot = (await getDocs(q));

  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  })
}