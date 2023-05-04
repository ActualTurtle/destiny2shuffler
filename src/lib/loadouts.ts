import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { Item, Loadout } from "../dto/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "loadouts";

export async function saveLoadout(items: Item[], characterId: String, membershipType: Number) {
  let data: Loadout = {
    date: new Date(),
    items,
    characterId,
    membershipType,
  };

  // Add a new document in collection "loadouts"
  await addDoc(collection(db, COLLECTION_NAME), data);
}

export async function getLoadouts(characterId: String, membershipType: Number) {
  console.log(characterId);
  console.log(membershipType);
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("characterId", "==", characterId), 
    where("membershipType", "==", membershipType),
   );

  const querySnapshot = (await getDocs(q));
  
  let loadouts: Loadout[] = [];

  querySnapshot.forEach((doc) => {
    console.log("here");
    let data = doc.data();
    
    loadouts.push({
      items: data.items,
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
    where("characterId", "==", loadout.characterId),
    where("membershipType", "==", loadout.membershipType),
    where("date", "==", loadout.date),
  )

  const querySnapshot = (await getDocs(q));

  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  })
}