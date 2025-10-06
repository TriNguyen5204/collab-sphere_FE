import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Archive, User, School } from "lucide-react";

const StudentSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <aside className="w-64 p-8 flex flex-col justify-between">
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link
                            to="/student/home"
                            className={`flex items-center px-4 py-2 rounded-lg text-xl font-semibold ${
                                currentPath === "/student/home"
                                    ? "bg-blue-700 bg-opacity-25 text-blue-600"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <Home className="inline-block mr-3 h-7 w-7" />Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/student/projects"
                            className={`flex items-center px-4 py-2 rounded-lg text-xl font-semibold ${
                                currentPath === "/student/projects"
                                    ? "bg-blue-700 bg-opacity-25 text-blue-600"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <Archive className="inline-block mr-3 h-7 w-7" />Projects
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/student/classes"
                            className={`flex items-center px-4 py-2 rounded-lg text-xl font-semibold ${
                                currentPath === "/student/classes"
                                    ? "bg-blue-700 bg-opacity-25 text-blue-600"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <School className="inline-block mr-3 h-7 w-7" />Classes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/student/profile"
                            className={`flex items-center px-4 py-2 rounded-lg text-xl font-semibold ${
                                currentPath === "/student/profile"
                                    ? "bg-blue-700 bg-opacity-25 text-blue-600"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <User className="inline-block mr-3 h-7 w-7" />Profile
                        </Link>
                    </li>
                    
                </ul>
            </nav>
        </aside>
    );
};

export default StudentSidebar;