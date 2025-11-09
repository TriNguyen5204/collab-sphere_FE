import React from "react";

const MeetingCard = ({ icon, title, description, color, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className={`${color} px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer 
      hover:opacity-90 transition-all duration-200 shadow-lg`}
    >
      <div className="flex size-12 items-center justify-center rounded-[10px] bg-black/20">
        {icon}
      </div>
      <div className="flex flex-col gap-2 text-white">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-base opacity-90">{description}</p>
      </div>
    </div>
  );
};

export default MeetingCard;
