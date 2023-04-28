import { Link } from "react-router-dom"
/**
 * 
 */
export const Home = () => {
  return (
    <>
        <div>
            <p>
                HELLO HOME
            </p>

            <span><Link to={`/signin`} className="login-links">SignIn</Link></span>
        </div>
        
    </>
  )
}