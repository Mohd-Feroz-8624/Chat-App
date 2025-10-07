  import React from 'react'
import { useNavigate } from 'react-router-dom'

  const SideBar = ({selectedUser,setSelectedUser}) => {
    const navigate = useNavigate()
    return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl  overflow-y-scroll text-white ${selectedUser ? "max-md:hidden":""}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center '>
          <img src="./message-solid-full.svg" alt="logo" className='max-w-4' />
          <div className='relative py-2 group'>
          <img src="" alt="menuIcon" className='max-h-5 cursor-pointer' />
          <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
          <p onClick={()=>navigate('./profile')} className='cursor-pointer text-sm'>Edit Profile</p>
          <hr className='my-2 brder-t border-gray-500'/>
          <p className='cursor-pointer text-sm'>Logout </p>
          </div>
        </div>
      </div>

      <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-3 mt-3'>
        <img src="./search-icon.svg" alt="search" className='w-3 fa-solid fa-magnifying-glass' />
        <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...'/>
      </div>
      </div>
      <div className='flex flex-col'>
      {}
      </div>
    </div>
    )
  }

  export default SideBar