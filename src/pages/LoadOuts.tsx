import { useEffect, useState } from "react"
import { Loadout } from "../dto/firestore"
import { useNavigate, useParams } from "react-router-dom"
import { getLoadouts, removeLoadout } from "../lib/loadouts"
import { API_KEY } from "../lib/api"

interface tokens {
  tokenType: string,
  accessToken: string | null,
  accessTokenExpiryDate: number,
  refreshToken: string | null,
  refreshTokenExpiryDate: number,
  membershipId: number,
};

export const LoadOuts = () => {

  const navigate = useNavigate();

  const {characterId, membershipType } = useParams();

  const [accessToken, setAuthToken] = useState("");
  // const [membershipId, setMembershipId] = useState(0);

  const [waiting, setWaiting] = useState(true);

  const [loadouts, setLoadouts] = useState<Loadout[]>();

  useEffect(() => {
    loadLoadouts();

    if (accessToken === ""){
      if (localStorage.getItem("tokens_v2")){
        console.log(localStorage.getItem("tokens_v2"));
        var tokens: tokens = JSON.parse(localStorage.getItem("tokens_v2")!) as tokens;
        console.log(tokens);
        setAuthToken(tokens.accessToken!);
        // setMembershipId(tokens.membershipId!);
      }
      else {
        navigate("../");
      }
    }
  }, []);

  function loadLoadouts() {
    getLoadouts(
      characterId!,
      membershipType!,
    ).then((response => {
      setLoadouts(response);
      setWaiting(false);
    }))
  }

  function useLoadout(loadout: Loadout) {
    var myHeaders = new Headers();
    myHeaders.append("X-API-Key", API_KEY);
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const body = JSON.stringify({
      "itemIds": loadout.itemIds,
      "characterId": loadout.characterId,
      "membershipType": loadout.membershipType,
    });

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
      <h1>Previous Loadouts</h1>
      {
        waiting ? (
          <div className="flex center inventory-full">Please Wait</div>
        ) : (
          <>
            <li className="list loadouts">
              {
                loadouts?.map((loadout) => (
                  <ul>
                    <span onClick={() => useLoadout(loadout)}>{loadout.date.toLocaleString()}</span>
                    <button onClick={() => removeLoadout(loadout)}className="outline">Delete</button>
                  </ul>
                ))
              }
            </li>
          </>
        )
      }

    </div>
  )
}