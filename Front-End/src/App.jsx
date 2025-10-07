import React from 'react'
import { Routes,Route } from 'react-router-dom'
import  HomePage  from './Pages/HomePage'
import  ProfilePage  from './Pages/ProfilePage'
import  LoginPAge  from './Pages/LoginPAge'
export const App = () => {
  return (
    <div className="bg-[url('./bgImg.jpg')] bg-cover">
      <Routes>
        <Route path='/' element={ <HomePage/> }/>
        <Route path='/Login' element={ <LoginPAge/> }/>
        <Route path='/Profile' element={ <ProfilePage/> }/>
      </Routes>
    </div>
  )
}
