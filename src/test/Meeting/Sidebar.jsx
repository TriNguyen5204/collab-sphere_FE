import React from "react";
import { sidebarLinks } from "../constant";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <section className="sticky left-0 top-0 bg-slate-800 flex h-screen w-fit flex-col justify-between p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-col gap-4">
        {sidebarLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(link.route)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 
                         text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Icon className="w-6 h-6" />
              <span className="text-base font-medium">{link.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
