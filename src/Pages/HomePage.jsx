import React from 'react'
import SideBar from '../components/SideBar'
import { ChatContainer } from '../components/ChatContainer'
import RightSideBar from '../components/RightSideBar'
import { useState } from 'react'

const HomePage = () => {

  const [selectedUser,setSelectedUser] = useState(false)
  
  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'} `}>
        <SideBar />
        <ChatContainer/>
        <RightSideBar />
      </div>
      <button onClick={()=>setSelectedUser(!selectedUser)} className='absolute top-5 left-5 z-10 bg-blue-500 text-white px-3 py-1 rounded-md'>{selectedUser ? 'Hide' : 'Show'} Users</button>
    </div>
  )
}
export default HomePage