import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './pages/Home'
import { Inventory } from './pages/Inventory'
import { LoadOuts } from './pages/LoadOuts'
import { Root } from './pages/Root'
import { SignIn } from './pages/SignIn'
import './App.css'

const router = createBrowserRouter([
  {
    path: 'destiny2shuffler/',
    element: <Root />,
    children: [
      {
        path: 'inventory',
        element: <Inventory />
      },
      {
        path: 'loadouts',
        element: <LoadOuts />
      },
      {
        path: 'signin',
        element: <SignIn />
      },
      {
        path: '',
        element: <Home />
      }
    ]
  },
])

export const App = () => {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
