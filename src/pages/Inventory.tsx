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

  const [itemBuckets, setItemBuckets] = useState<ItemBucket[]>([]);
  const [oKineticWeapons, setOKineticWeapons] = useState(""); // Json list String
  const [oEnergyWeapons, setOEnergyWeapons] = useState(""); // Json list String
  const [oPowerWeapons, setOPowerWeapons] = useState(""); // Json list String
  const [oHelmet, setOHelmet] = useState(""); // Json list String
  const [oGauntlets, setOGauntlets] = useState(""); // Json list String
  const [oLegArmor, setOLegArmor] = useState(""); // Json list String


  useEffect(() => {
    
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
        if (characterIds !== "" && equipedItems !== "" && otherItems !== "") {

          // We may want to pull this out of the useeffect later, when needed
          async function setupBuckets() {
            var equipedBuckets: ItemBucket[] = [];
            for (let i = 0; JSON.parse(equipedItems)[i] !== undefined; i++){
              const bucket_info = await GetBucketInfo(JSON.parse(equipedItems)[i].bucketHash)
              const icon_name = await GetIconAndName(JSON.parse(equipedItems)[i].itemHash);
              const bucket: ItemBucket = {
                itemId: JSON.parse(equipedItems)[i].itemInstanceId,
                itemHash: JSON.parse(equipedItems)[i].itemHash,
                bucketHash: JSON.parse(equipedItems)[i].bucketHash,
                bucketName: bucket_info != null ? bucket_info.name : "",
                icon: icon_name != null ? icon_name.icon : "",
                name: icon_name != null ? icon_name.name : "name_not_found",
              }
              equipedBuckets.push(bucket)
            }
            console.log(equipedBuckets);
            setItemBuckets(equipedBuckets);
          }
          setupBuckets();
        }
      }
    }
    setProfileIndex(0); // Later UI should be used to select a profile
    setCharacterIndex(0); // later UI should be used to select a character from available character, and update index
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
   * 
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

  return (
    <div>
        <div>
            Stuff goes here, Inluding verification of authentication, eventually
        </div>

        <div className="flex center inventory-full">
          <div>
            <button onClick={() => GetItems()}>

              <h3 className="randomize-button">Randomize Loadout</h3>
            </button>
          </div>
          <div>
            {
              itemBuckets.map((item) => (
                <div title={item.name} key={item.bucketHash}>

                  <div className="itemBucket"  style={{backgroundImage: `url(${'https://www.bungie.net' + item.icon})`}}>
                    
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <span><Link to={`../loadouts`}> To Previous LoadOuts</Link></span>
    </div>
  )
}