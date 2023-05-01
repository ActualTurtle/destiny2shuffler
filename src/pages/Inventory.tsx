import { Link } from "react-router-dom"


export const Inventory = () => {
  return (
    <div>
        <div>
            Stuff goes here, Inluding verification of authentication, eventually
        </div>

        <div className="flex center inventory-full">
          <div>
            <h3 className="randomize-button">Randomize Loadout</h3>
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