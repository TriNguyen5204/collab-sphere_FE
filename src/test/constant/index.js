import { Home, Users, BookOpen, Settings, LogOut } from "lucide-react";

export const sidebarLinks = [
  {
    label: "Home",
    route: "/",
    icon: Home,
  },
  {
    label: "Classes",
    route: "/classes",
    icon: BookOpen,
  },
  {
    label: "Students",
    route: "/students",
    icon: Users,
  },
  {
    label: "Settings",
    route: "/settings",
    icon: Settings,
  },
  {
    label: "Logout",
    route: "/logout",
    icon: LogOut,
  },
];
