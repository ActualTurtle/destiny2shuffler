import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { client_id } from "../lib/api";

interface tokens {
  tokenType: string,
  accessToken: string | null,
  accessTokenExpiryDate: number,
  refreshToken: string | null,
  refreshTokenExpiryDate: number,
  membershipId: number,
};
/**
 * TODO: Testing this is hard since after clicking on "SignIn" you will be redirected to the 
 * github page and not the localhost page meaning you need to copy the code at the end of the 
 * link and just paste it onto the end of the localhost url
 * e.g. http://localhost:5173/destiny2shuffler/?code=540a6fe5a7619aac3cecd331408170fa
 */
export const Home = () => {
  const navigate = useNavigate();

  const [locationLoaded, setLocationLoaded] = useState(false);
  const [wantLocation, setWantLocation] = useState(false);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  useEffect(() => {
    const url = window.location.href.split("/");
    let code = "";

    // Parse through url and check to see if the authorization code has been returned
    for (let i=0; i < url.length; i++) {
      if (url[i].includes("?code=")) {
        code = url[i].slice(6)
      }
    }

    if (code !== "") {
      sendAuthCode(code);
    }
  }, []);

  // Geolocation Code
  useEffect(() => {
    if (wantLocation) {
      navigator.geolocation.getCurrentPosition((location) => {
        setLocationLoaded(true);
        setLat(location.coords.latitude);
        setLong(location.coords.longitude);
      }, (err) => {
        console.log(err);
      }, {
        enableHighAccuracy: false
      });
    }
  }, [wantLocation]);

  function sendAuthCode(code: string) {
    // Send POST request to https://www.bungie.net/Platform/App/OAuth/Token/
    // Set the body Content-Type to application/x-www-form-urlencoded
    // Set these as key-value pairs in the body:
    //    client_id = {{CLIENT_ID}} ///////// Found in .env file
    //    grant_type = authorization_code
    //    code = {{code}}
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", client_id.toString());
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", code);


    fetch("https://www.bungie.net/Platform/App/OAuth/Token/", {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        
        var tokens : tokens = {
          tokenType: 'Bearer',
          accessToken: null,
          accessTokenExpiryDate: 0,
          refreshToken: null,
          refreshTokenExpiryDate: 0,
          membershipId: 0,
        };

        if (data.access_token) {
          var time = new Date().getTime();
          tokens.tokenType = data.token_type;
          tokens.accessToken = data.access_token;
          tokens.accessTokenExpiryDate = time+data.expires_in*1000;
          if (data.refresh_token) {
            tokens.refreshToken = data.refresh_token;
            tokens.refreshTokenExpiryDate = time + data.refresh_expires_in * 1000;
          } else {
            tokens.refreshToken = null;
            tokens.refreshTokenExpiryDate = 0;
          }
          tokens.membershipId = data.membership_id;
  
          localStorage.setItem('tokens_v2', JSON.stringify(tokens));
        
          console.log(JSON.stringify(tokens));

          navigate("/destiny2shuffler/inventory", {
            replace: true
          });
        }
      })
      .catch(error => console.log('error', error));

    // If the request returns a status 200
    // accessToken will be in the res body after sending the POST request
    // Not yet sure if the other values have any use
    // getCurrentUser(accessToken);
  }


  return (
    <>
        <div>
            <h1>Destiny 2 Inventory Shuffler</h1>
            <h2>Connect your Destiny 2 account to randomize your in-game loadout!</h2>

            {/* I don't actually think we need the signin page after all */}
            {/* <span><Link to={`./signin`} className="login-links">SignIn</Link></span> */}
            <span><Link to={`https://www.bungie.net/en/OAuth/Authorize?client_id=${client_id}&response_type=code`} className="login-links">Sign In With Bungie</Link></span>

            <div className="location">
              {
                wantLocation&&lat!==0&&long!==0 ? (
                  <p className="location-text">I am at: {lat}, {long}</p>
                ) : (
                  <button onClick={() => setWantLocation(true)}>Where am I?</button>
                )
              }
            </div>
        </div>
        
    </>
  )
}