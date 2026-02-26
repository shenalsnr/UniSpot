import React from 'react'
import{BrowserRouter, Routes, Route} from 'react-router-dom'
import SideBar from './components/Locker Mnagement/SideBar'
import LockerMap from './components/Locker Mnagement/LockerMap'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/" element={<SideBar />} /> */}
        <Route path="/" element={<LockerMap />} />
      
      </Routes>
    </BrowserRouter>
  )
}

export default App
