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


export const Inventory = () => {

  const [accessToken, setAuth_token] = useState("");
  const [membershipId, setMembershipId] = useState(0);
  const [profiles, setProfiles] = useState(""); // Json String
  const [profileIndex, setProfileIndex] = useState(0);
  const [characterIds, setCharacterIds] = useState("");  // Json String
  const [characterIndex, setCharacterIndex] = useState(0);
  const [equipedItems, setEquipedItems] = useState(""); // Json String
  const [otherItems, setOtherItems] = useState(""); // Json String


  useEffect(() => {
    
    if (accessToken === "")
    {
      
      if (localStorage.getItem("tokens_v2"))
      {
        console.log(localStorage.getItem("tokens_v2"));
        var tokens: tokens = JSON.parse(localStorage.getItem("tokens_v2")!) as tokens;
        console.log(tokens);
        setAuth_token(tokens.accessToken!);
        setMembershipId(tokens.membershipId!);
      }
    }

    if (accessToken !== "") 
    {
      GetUserProfiles();
    }

    setProfileIndex(0);
    setCharacterIndex(0);
  }, [accessToken, membershipId]);

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
        console.log(result);
        setProfiles(JSON.stringify(result.Response.profiles))
      })
      .catch(error => console.log('error', error));
  }

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
        console.log(result);
        var charIds = result.Response.profile.data.characterIds as Array<string>;
        setCharacterIds(JSON.stringify(charIds));
        
        console.log(result.Response.characterEquipment.data[charIds[characterIndex]])
        setEquipedItems(JSON.stringify(result.Response.characterEquipment.data[charIds[characterIndex]].items))
        setOtherItems(JSON.stringify(result.Response.characterInventories.data[charIds[characterIndex]].items))
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
          <div className="inventory">
            <h3>Item 1</h3>
            <h3>Item 2</h3>
            <h3>Item 3</h3>
            <h3>Item 4</h3>
          </div>
        </div>

        <span><Link to={`../loadouts`}> To Previous LoadOuts</Link></span>
    </div>
  )
}