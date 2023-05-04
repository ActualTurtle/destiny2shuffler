import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { API_KEY } from "../lib/api";
import { saveLoadout } from "../lib/loadouts";
import { Item } from "../dto/firestore";

interface tokens {
  tokenType: string,
  accessToken: string | null,
  accessTokenExpiryDate: number,
  refreshToken: string | null,
  refreshTokenExpiryDate: number,
  membershipId: number,
};

interface ItemBucket {
  bucketHash: number,
  bucketName: string,
  itemId: string,
  itemHash: number,
  name: string,
  icon: string,
  isWeapon: boolean
}

export const Inventory = () => {

  // Mainly json data store
  const [accessToken, setAuthToken] = useState("");
  const [membershipId, setMembershipId] = useState(0);
  const [profiles, setProfiles] = useState(""); // Json String
  const [profileIndex, setProfileIndex] = useState(0);
  const [characterIds, setCharacterIds] = useState<string[]>([]);  // Json String
  const [characterIndex, setCharacterIndex] = useState(0);
  const [equipedItems, setEquipedItems] = useState(""); // Json String
  const [otherItems, setOtherItems] = useState(""); // Json String
  const [waiting, setWaiting] = useState(true);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Equiped ITEMS, as ItemBucket
  const [eKineticWeapon, setEKineticWeapon] = useState<ItemBucket>();
  const [eEnergyWeapon, setEEnergyWeapon] = useState<ItemBucket>();
  const [ePowerWeapon, setEPowerWeapon] = useState<ItemBucket>();
  const [eHelmet, setEHelmet] = useState<ItemBucket>();
  const [eGauntlets, setEGauntlets] = useState<ItemBucket>();
  const [eChestArmor, setEChestArmor] = useState<ItemBucket>();
  const [eLegArmor, setELegArmor] = useState<ItemBucket>();
  const [eClassArmor, setEClassArmor] = useState<ItemBucket>();

  // List of all equiped items
  const [e_All, setE_All] = useState<ItemBucket[]>([]); 

  // Lists of all other equipable items
  const [oKineticWeapons, setOKineticWeapons] = useState<ItemBucket[]>([]); 
  const [oEnergyWeapons, setOEnergyWeapons] = useState<ItemBucket[]>([]); 
  const [oPowerWeapons, setOPowerWeapons] = useState<ItemBucket[]>([]); 
  const [oHelmets, setOHelmets] = useState<ItemBucket[]>([]); 
  const [oGauntlets, setOGauntlets] = useState<ItemBucket[]>([]); 
  const [oChestArmor, setOChestArmor] = useState<ItemBucket[]>([]); 
  const [oLegArmor, setOLegArmor] = useState<ItemBucket[]>([]); 
  const [oClassArmor, setOClassArmor] = useState<ItemBucket[]>([]);

  const weaponNames = ['Kinetic Weapons', 'Energy Weapons', 'Power Weapons']; // To check if an item is a weapon

  useEffect(() => {    
    if (accessToken === ""){
      if (localStorage.getItem("tokens_v2")){
        console.log(localStorage.getItem("tokens_v2"));
        var tokens: tokens = JSON.parse(localStorage.getItem("tokens_v2")!) as tokens;
        console.log(tokens);
        setAuthToken(tokens.accessToken!);
        setMembershipId(tokens.membershipId!);
      }
    }
    if (accessToken !== "") {
      if (profiles === "") {
        GetUserProfiles();
      }
      if (profiles !== "") {
        if (equipedItems === "" || otherItems === "") {
          GetItems();
        }
        if (equipedItems !== "" && otherItems !== "" &&
            eKineticWeapon === undefined) {
          setupBuckets();
        }
      }
    }
    if (needsRefresh)
    {
      GetItems();
      setupBuckets();
      setNeedsRefresh(false);
    }

    setProfileIndex(0); // Later UI should be used to select a profile
    setCharacterIndex(0); // later UI should be used to select a character from available character, and update index
  }, [accessToken, membershipId, profiles, equipedItems, needsRefresh]);

  /**
   * Sets the profiles of the user
   */
  function GetUserProfiles()
  {
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    fetch(`https://www.bungie.net/Platform/Destiny2/-1/Profile/${membershipId}/LinkedProfiles/`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(result => {
        console.log("PROFILES")
        console.log(result);
        setProfiles(JSON.stringify(result.Response.profiles))
      })
      .catch(error => console.log('error', error));
  }

  /**
   * Gets the characterids, equipment, and inventory items of all characters of user
   */
  function GetItems()
  {
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    var membershipType = JSON.parse(profiles)[profileIndex].membershipType;
    var destinyMembershipId = JSON.parse(profiles)[profileIndex].membershipId;

    fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=Profiles,CharacterInventories,CharacterEquipment`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(result => {
        console.log("GET ITEMS")
        console.log(result);
        var charIds = result.Response.profile.data.characterIds as Array<string>;
        setCharacterIds(charIds);
        
        let characterEquipment = result.Response.characterEquipment.data;
        let characterInventories = result.Response.characterInventories.data;
        // console.log(result.Response.characterEquipment.data[charIds[characterIndex]])
        setEquipedItems(JSON.stringify(characterEquipment[charIds[characterIndex]].items))
        setOtherItems(JSON.stringify(characterInventories[charIds[characterIndex]].items))
      })
      .catch(error => console.log('error', error));
  }

  /**
   * Is responsible for organizing and initializing the data bucket with image paths ect, this should only be done once
   */
  async function setupBuckets() {
    setWaiting(true);
    // For currently equiped items
    var equippedBuckets: ItemBucket[] = []
    for (let i = 0; JSON.parse(equipedItems)[i] !== undefined; i++){
      const bucket_info = await GetBucketInfo(JSON.parse(equipedItems)[i].bucketHash)
      var bucketName = bucket_info != null ? bucket_info.name : "";
      const icon_name = await GetIconAndName(JSON.parse(equipedItems)[i].itemHash);
      const bucket: ItemBucket = {
        itemId: JSON.parse(equipedItems)[i].itemInstanceId,
        itemHash: JSON.parse(equipedItems)[i].itemHash,
        bucketHash: JSON.parse(equipedItems)[i].bucketHash,
        bucketName: bucketName,
        icon: icon_name != null ? `https://www.bungie.net${icon_name.icon}` : "",
        name: icon_name != null ? icon_name.name : "name_not_found",
        isWeapon: weaponNames.includes(bucketName)
      }
      if (bucketName === 'Kinetic Weapons') setEKineticWeapon(bucket);
      else if (bucketName === 'Energy Weapons') setEEnergyWeapon(bucket);
      else if (bucketName === 'Power Weapons') setEPowerWeapon(bucket);
      else if (bucketName === 'Helmet') setEHelmet(bucket);
      else if (bucketName === 'Gauntlets') setEGauntlets(bucket);
      else if (bucketName === 'Chest Armor') setEChestArmor(bucket);
      else if (bucketName === 'Leg Armor') setELegArmor(bucket);
      else if (bucketName === 'Class Armor') setEClassArmor(bucket);
      else continue;

      equippedBuckets.push(bucket);
    }
    setE_All(equippedBuckets);

    // For other equipable items
    var kineticWeapons: ItemBucket[] = [];
    var energyWeapons: ItemBucket[] = [];
    var powerWeapons: ItemBucket[] = [];
    var helmets: ItemBucket[] = [];
    var gauntlets: ItemBucket[] = [];
    var chestArmor: ItemBucket[] = [];
    var legArmor: ItemBucket[] = [];
    var classArmor: ItemBucket[] = [];

    const oItems = JSON.parse(otherItems);
    for (let i = 0; oItems[i] !== undefined; i++){

      var bucketHash = oItems[i].bucketHash;
      if (bucketHash === undefined) continue;

      var targetArray: ItemBucket[] | undefined = undefined;
      if (bucketHash === 1498876634) targetArray = kineticWeapons;
      else if (bucketHash === 2465295065) targetArray = energyWeapons;
      else if (bucketHash === 953998645) targetArray = powerWeapons;
      else if (bucketHash === 3448274439) targetArray = helmets;
      else if (bucketHash === 3551918588) targetArray = gauntlets;
      else if (bucketHash === 14239492) targetArray = chestArmor;
      else if (bucketHash === 20886954) targetArray = legArmor;
      else if (bucketHash === 1585787867) targetArray = classArmor;
      if (targetArray === undefined) continue;

      const bucket_info = await GetBucketInfo(bucketHash);
      const icon_name = await GetIconAndName(oItems[i].itemHash);
      const bucketName = bucket_info != null ? bucket_info.name : ""

      const bucket: ItemBucket = {
        itemId: oItems[i].itemInstanceId,
        itemHash: oItems[i].itemHash,
        bucketHash: oItems[i].bucketHash,
        bucketName: bucketName,
        icon: icon_name != null ? `https://www.bungie.net${icon_name.icon}` : "",
        name: icon_name != null ? icon_name.name : "name_not_found",
        isWeapon: weaponNames.includes(bucketName)
      }
      targetArray.push(bucket)
    }
    setOKineticWeapons(kineticWeapons);
    setOEnergyWeapons(energyWeapons);
    setOPowerWeapons(powerWeapons);
    setOHelmets(helmets);
    setOGauntlets(gauntlets);
    setOChestArmor(chestArmor);
    setOLegArmor(legArmor);
    setOClassArmor(classArmor);
    console.log(kineticWeapons);
    console.log(energyWeapons);
    console.log(powerWeapons);
    console.log(helmets);
    console.log(gauntlets);
    console.log(chestArmor);
    console.log(legArmor);
    console.log(classArmor);
    setWaiting(false);
  }

  /**
   * Responsible for getting key item display data
   * @param itemHash 
   * @returns a tuple with icon path and item name
   */
  async function GetIconAndName(itemHash: number): Promise<void | { icon: string, name: string }>
  {
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    return fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(result => {
        // console.log(result.Response.displayProperties.name);
        // console.log(result.Response)

        return {
          icon: result.Response.displayProperties.icon as string,
          name: result.Response.displayProperties.name as string
        }
      })
      .catch(error => console.log('error', error));
  }

  async function GetBucketInfo(itemHash: number): Promise<void | {name: string}>
  {
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    return fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryBucketDefinition/${itemHash}/`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(result => {
        // console.log(result.Response.displayProperties.name);
        // console.log(result.Response)

        return {
          name: result.Response.displayProperties.name
        }
      })
      .catch(error => console.log('error', error));
  }

  /**
   * EQUIPS RANDOM ITEMS FROM OTHER ITEMS
   */
  function doShuffle()
  {
    const itemsToEquip: ItemBucket[]  = [];

    if (eKineticWeapon !== undefined){

      oKineticWeapons.push(eKineticWeapon!);
      itemsToEquip.push( shuffle(oKineticWeapons).pop()!);
      setEKineticWeapon(itemsToEquip[itemsToEquip.length-1]);
      setOKineticWeapons(oKineticWeapons);
    }
    if (eEnergyWeapon !== undefined){

      oEnergyWeapons.push(eEnergyWeapon!);
      itemsToEquip.push( shuffle(oEnergyWeapons).pop()!);
      setEEnergyWeapon(itemsToEquip[itemsToEquip.length-1]);
      setOEnergyWeapons(oEnergyWeapons);
    }
    if (ePowerWeapon !== undefined){

      oPowerWeapons.push(ePowerWeapon!);
      itemsToEquip.push( shuffle(oPowerWeapons).pop()!);
      setEPowerWeapon(itemsToEquip[itemsToEquip.length-1]);
      setOPowerWeapons(oPowerWeapons);
    }

    if (eHelmet !== undefined){

      oHelmets.push(eHelmet!);
      itemsToEquip.push( shuffle(oHelmets).pop()!);
      setEHelmet(itemsToEquip[itemsToEquip.length-1]);
      setOHelmets(oHelmets);
    }
    if (eGauntlets !== undefined){

      oGauntlets.push(eGauntlets!);
      itemsToEquip.push( shuffle(oGauntlets).pop()!);
      setEGauntlets(itemsToEquip[itemsToEquip.length-1]);
      setOGauntlets(oGauntlets);      
    }
    if (eChestArmor !== undefined){

      oChestArmor.push(eChestArmor!);
      itemsToEquip.push( shuffle(oChestArmor).pop()!);
      setEChestArmor(itemsToEquip[itemsToEquip.length-1]);
      setOChestArmor(oChestArmor);      
    }
    if (eLegArmor !== undefined){

      oLegArmor.push(eLegArmor!);
      itemsToEquip.push( shuffle(oLegArmor).pop()!);
      setELegArmor(itemsToEquip[itemsToEquip.length-1]);
      setOLegArmor(oLegArmor);      
    }
    if (eClassArmor !== undefined){

      oClassArmor.push(eClassArmor!);
      itemsToEquip.push( shuffle(oClassArmor).pop()!);
      setEClassArmor(itemsToEquip[itemsToEquip.length-1]);
      setOClassArmor(oClassArmor);      
    }
    
    setE_All(itemsToEquip);

    

    const items_ids = itemsToEquip.map((item) => item.itemId);
    console.log(items_ids);

    //save items in firebase
    const items: Item[] = itemsToEquip.map((item) => {
      return {
        id: item.itemId,
        name: item.name,
        icon: item.icon
      }
    })

    saveLoadout(
      items, 
      characterIds[characterIndex],
      JSON.parse(profiles)[profileIndex].membershipType
    );

    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const body = JSON.stringify({
      "itemIds":  items_ids,
      "characterId": characterIds[characterIndex],
      "membershipType": JSON.parse(profiles)[profileIndex].membershipType
    })
    console.log(JSON.parse(body));

    fetch("https://www.bungie.net/Platform/Destiny2/Actions/Items/EquipItems/", {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.log('error', error));
  }

  //JUST SHUFFLES AN ARRAY src: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle(array: ItemBucket[]): ItemBucket[] {
    if (array === undefined) return [];
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  return (
    <div>
      <span className="nav-link"><Link to={`../loadouts/character/${!!characterIds ? characterIds[characterIndex] : 0}/membershipType/${!!profiles ? JSON.parse(profiles)[profileIndex].membershipType : "unknown"}`} className="outline"> To Previous Loadouts</Link></span>
      <div className="character">
        Character:&nbsp;&nbsp;
        <select className="outline" name="character" onChange={(e) => {
          setCharacterIndex(characterIds.indexOf(e.target.value));
          setNeedsRefresh(true);
        }}>
          {
            characterIds.map((id) => (
              <option value={id} key={characterIds.indexOf(id)}>{id}</option>
            ))
          }
        </select>
      </div>

        {
          waiting ? (
            <h1 className="flex center inventory-full">Please Wait...</h1>
          ) : (
            <>
              <div className="flex center inventory-full">
                <div className="all-items center">
                  {
                    e_All.map((item) => (
                      item.isWeapon ? (
                        <div title={item.name} key={item.bucketHash} className="weapons">
                          <img src={ item.icon } alt={ item.icon } className="images" />
                          {item.name}
                        </div>
                      ) : (
                        <div title={item.name} key={item.bucketHash} className="item">
                          <img src={ item.icon } alt={ item.icon } className="images" />
                          {item.name}
                        </div>
                      )
                    ))
                  }
                </div>
              </div>

              <div className="center">
                <button onClick={() => doShuffle()} className="center outline">
                  <h3 className="center">Randomize Loadout</h3>
                </button>
              </div>
            </>
          )
        }
    </div>
  )
}