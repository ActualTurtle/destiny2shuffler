import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { API_KEY } from "../lib/api";

interface tokens {
  tokenType: string,
  accessToken: string | null,
  //accessTokenReadyDate: 0,
  accessTokenExpiryDate: number,
  refreshToken: string | null,
  //refreshTokenReadyDate: 0,
  refreshTokenExpiryDate: number,
  membershipId: number,
  //scope: 0
};

interface ItemBucket {
  bucketHash: number,
  bucketName: string,
  itemId: string,
  itemHash: number,
  name: string,
  icon: string
}


export const Inventory = () => {

  const [accessToken, setAuth_token] = useState("");
  const [membershipId, setMembershipId] = useState(0);
  const [profiles, setProfiles] = useState(""); // Json String
  const [profileIndex, setProfileIndex] = useState(0);
  const [characterIds, setCharacterIds] = useState("");  // Json String
  const [characterIndex, setCharacterIndex] = useState(0);
  const [equipedItems, setEquipedItems] = useState(""); // Json String
  const [otherItems, setOtherItems] = useState(""); // Json String
  const [waiting, setWaiting] = useState(true);

  const [itemBuckets, setItemBuckets] = useState<ItemBucket[]>([]);
  const [oKineticWeapons, setOKineticWeapons] = useState<ItemBucket[]>([]); // Json list String
  const [oEnergyWeapons, setOEnergyWeapons] = useState<ItemBucket[]>([]); // Json list String
  const [oPowerWeapons, setOPowerWeapons] = useState<ItemBucket[]>([]); // Json list String
  const [oHelmets, setOHelmets] = useState<ItemBucket[]>([]); // Json list String
  const [oGauntlets, setOGauntlets] = useState<ItemBucket[]>([]); // Json list String
  const [oChestArmor, setOChestArmor] = useState<ItemBucket[]>([]); // Json list String
  const [oLegArmor, setOLegArmor] = useState<ItemBucket[]>([]); // Json list String
  const [oClassArmor, setOClassArmor] = useState<ItemBucket[]>([]); // Json list String


  useEffect(() => {
    setWaiting(true);
    
    if (accessToken === ""){
      if (localStorage.getItem("tokens_v2")){
        console.log(localStorage.getItem("tokens_v2"));
        var tokens: tokens = JSON.parse(localStorage.getItem("tokens_v2")!) as tokens;
        console.log(tokens);
        setAuth_token(tokens.accessToken!);
        setMembershipId(tokens.membershipId!);
      }
    }
    if (accessToken !== "") {
      if (profiles === "") {
        GetUserProfiles();
      }
      if (profiles !== "") {
        if (characterIds === "" || equipedItems === "" || otherItems === "") {
          GetItems();
        }
        if (characterIds !== "" && equipedItems !== "" && otherItems !== "" &&
            itemBuckets.length === 0) {
          setupBuckets();
        }
      }
    }
    setProfileIndex(0); // Later UI should be used to select a profile
    setCharacterIndex(0); // later UI should be used to select a character from available character, and update index
    setWaiting(false);
  }, [accessToken, membershipId, profiles, equipedItems]);

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
        // console.log(result);
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
        // console.log(result);
        var charIds = result.Response.profile.data.characterIds as Array<string>;
        setCharacterIds(JSON.stringify(charIds));
        
        // console.log(result.Response.characterEquipment.data[charIds[characterIndex]])
        setEquipedItems(JSON.stringify(result.Response.characterEquipment.data[charIds[characterIndex]].items))
        setOtherItems(JSON.stringify(result.Response.characterInventories.data[charIds[characterIndex]].items))
      })
      .catch(error => console.log('error', error));
  }

  /**
   * Is responsible for organizing and initializing the data bucket with image paths ect, this should only be done once
   */
  async function setupBuckets() {

    // For currently equiped items
    var equipedBuckets: ItemBucket[] = [];
    for (let i = 0; JSON.parse(equipedItems)[i] !== undefined; i++){
      const bucket_info = await GetBucketInfo(JSON.parse(equipedItems)[i].bucketHash)
      const icon_name = await GetIconAndName(JSON.parse(equipedItems)[i].itemHash);
      const bucket: ItemBucket = {
        itemId: JSON.parse(equipedItems)[i].itemInstanceId,
        itemHash: JSON.parse(equipedItems)[i].itemHash,
        bucketHash: JSON.parse(equipedItems)[i].bucketHash,
        bucketName: bucket_info != null ? bucket_info.name : "",
        icon: icon_name != null ? `https://www.bungie.net${icon_name.icon}` : "",
        name: icon_name != null ? icon_name.name : "name_not_found",
      }
      equipedBuckets.push(bucket)
    }
    console.log(equipedBuckets);
    setItemBuckets(equipedBuckets);

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

      const bucket_info = await GetBucketInfo(bucketHash);

      var bucketName : string = bucket_info != null ? bucket_info.name : "";
      var targetArray: ItemBucket[] | undefined = undefined;

      if (bucketName === 'Kinetic Weapons') targetArray = kineticWeapons;
      else if (bucketName === 'Energy Weapons') targetArray = energyWeapons;
      else if (bucketName === 'Power Weapons') targetArray = powerWeapons;
      else if (bucketName === 'Helmet') targetArray = helmets;
      else if (bucketName === 'Gauntlets') targetArray = gauntlets;
      else if (bucketName === 'Chest Armor') targetArray = chestArmor;
      else if (bucketName === 'Leg Armor') targetArray = legArmor;
      else if (bucketName === 'Class Armor') targetArray = classArmor;
      
      if (targetArray === undefined) continue;

      const icon_name = await GetIconAndName(oItems[i].itemHash);

      const bucket: ItemBucket = {
        itemId: oItems[i].itemInstanceId,
        itemHash: oItems[i].itemHash,
        bucketHash: oItems[i].bucketHash,
        bucketName: bucket_info != null ? bucket_info.name : "",
        icon: icon_name != null ? `https://www.bungie.net${icon_name.icon}` : "",
        name: icon_name != null ? icon_name.name : "name_not_found",
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
    itemsToEquip.push( oKineticWeapons[Math.floor(Math.random()*oKineticWeapons.length)]);
    itemsToEquip.push( oEnergyWeapons[Math.floor(Math.random()*oEnergyWeapons.length)]);
    itemsToEquip.push( oPowerWeapons[Math.floor(Math.random()*oPowerWeapons.length)]);
    itemsToEquip.push( oHelmets[Math.floor(Math.random()*oHelmets.length)]);
    itemsToEquip.push( oGauntlets[Math.floor(Math.random()*oGauntlets.length)]);
    itemsToEquip.push( oChestArmor[Math.floor(Math.random()*oChestArmor.length)]);
    itemsToEquip.push( oLegArmor[Math.floor(Math.random()*oLegArmor.length)]);
    itemsToEquip.push( oClassArmor[Math.floor(Math.random()*oClassArmor.length)]);

    const items_ids = itemsToEquip.map((item) => item.itemId);
    console.log(items_ids);
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const body = JSON.stringify({
      "itemIds":  items_ids,
      "characterId": JSON.parse(characterIds)[characterIndex],
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

  return (
    <div>
        <span className="nav-link"><Link to={`../loadouts`} className="outline"> To Previous Loadouts</Link></span>

        {
          waiting ? (
            <div className="flex center inventory-full">Please Wait</div>
          ) : (
            <>
              <div className="flex center inventory-full">
                <div className="all-items center">
                  {
                    itemBuckets.map((item) => (
                      <div title={item.name} key={item.bucketHash} className="item">
                        <img src={ item.icon } alt={ item.icon } className="images" />
                        {item.name}
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="center">
                <button onClick={() => doShuffle()} className="center outline">
                  <h3 className="center randomize-button">Randomize Loadout</h3>
                </button>
              </div>
            </>
          )
        }
    </div>
  )
}