import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
/**
 * TODO: Testing this is hard since after clicking on "SignIn" you will be redirected to the 
 * github page and not the localhost page meaning you need to copy the code at the end of the 
 * link and just paste it onto the end of the localhost url
 * e.g. http://localhost:5173/destiny2shuffler/?code=540a6fe5a7619aac3cecd331408170fa
 */
export const Home = () => {
  const navigate = useNavigate();

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

  function sendAuthCode(code: string) {
    // Send POST request to https://www.bungie.net/Platform/App/OAuth/Token/
    // Set the body Content-Type to application/x-www-form-urlencoded
    // Set these as key-value pairs in the body:
    //    client_id = {{CLIENT_ID}} ///////// Found in .env file
    //    grant_type = authorization_code
    //    code = {{code}}

    // If the request returns a status 200
    // accessToken will be in the res body after sending the POST request
    // Not yet sure if the other values have any use
    // getCurrentUser(accessToken);
  }

  function getCurrentUser(accessToken: string) {
    // Send GET request to https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/
    // Add these key-value pairs to the headers:
    //    X-API-Key = {{API_KEY}} ///////// Found in .env file
    //    Authorization = Bearer {{accessToken}} ///////// The space between Bearer and the access token is required

    // If the request returns a status 200
    // The res field will have a ton of information that may or may not be useful
    // The user will be signed in for an hour (can't change that without paying money I think)
    navigate("/Inventory", {
      replace: true
    });
  }

  return (
    <>
        <div>
            <p>
                HELLO HOME
            </p>

            {/* I don't actually think we need the signin page after all */}
            {/* <span><Link to={`./signin`} className="login-links">SignIn</Link></span> */}
            <span><Link to={`https://www.bungie.net/en/OAuth/Authorize?client_id=40400&response_type=code`} className="login-links">SignIn</Link></span>
        </div>
        
    </>
  )
}