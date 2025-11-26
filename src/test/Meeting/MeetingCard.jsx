import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const MeetingCard = ({ icon, title, description, color, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      {/* Gradient Background */}
      <div className={`${color} absolute inset-0`} />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      {/* Content */}
      <div className="relative px-6 py-8 flex flex-col justify-between min-h-[280px]">
        {/* Icon Container */}
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            {/* Icon background */}
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              {icon}
            </div>
          </div>
          
          {/* Arrow indicator */}
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* Text Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
            {description}
          </p>
        </div>
        
        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </div>
  );
};

export default MeetingCard;