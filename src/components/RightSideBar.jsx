import React from "react";
import assets, { imagesDummyData } from "../assets/chat-app-assets/assets";

const RightSideBar = ({ selectedUser }) => {
  return (
    selectedUser && (
      <div className="border-gray-700 border-s h-full max-md:hidden">
        <div className="pt-10 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 aspect-[1/1] rounded-full "
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            <p className="w-2 h-2 rounded-full bg-green-500"></p>
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>
        <hr className="border-[#ffffff50] my-4" />
        <div className="px-5 text-xs">
          <p>Media</p>
          <div
            className="mt-2 max-h-[200px] overflow-y-scroll
          grid grid-cols-2 gap-3 opacity-80"
          >
            {imagesDummyData.map((url, index) => (
              <div
                key={index}
                className="cursor-pointer rounded "
                onClick={() => window.open(url)}
              >
                <img src={url} alt="" className="h-24 w-full object-cover rounded-md" />
              </div>
            ))}
          </div>
        </div>
        
          <button className=" mt-6 bottom-5  mx-auto block bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm py-2.5 px-20 font-light cursor-pointer rounded-full">
            Logout
          </button>
        
      </div>
    )
    
  );
};

export default RightSideBar;
