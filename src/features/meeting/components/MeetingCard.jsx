import React from "react";
import { ArrowRight } from "lucide-react";

const MeetingCard = ({ icon, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between p-8 h-[280px] bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(234,121,45,0.1)] hover:border-orangeFpt-100"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center justify-center w-16 h-16 bg-orangeFpt-50 text-orangeFpt-500 rounded-2xl transition-colors duration-300 group-hover:bg-orangeFpt-500 group-hover:text-white">
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-orangeFpt-50 group-hover:text-orangeFpt-500">
           <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-orangeFpt-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default MeetingCard;
