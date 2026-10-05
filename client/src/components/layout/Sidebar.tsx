import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  Settings,
  Users,
  UserRoundCheck,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },

    {
      label: "Search Events",
      path: "/events",
      icon: CalendarDays,
    },

    {
      label: "Propose Event",
      path: "/events/create",
      icon: PlusCircle,
      roles: [
        "club_organizer",
        "faculty_advisor",
        "hod",
        "admin",
      ],
    },

    {
      label: "My Registrations",
      path: "/my-registrations",
      icon: ClipboardList,
      roles: ["student"],
    },

    {
      label: "Clubs",
      path: "/clubs",
      icon: Users,
    },

    {
      label: "Proposals",
      path: "/proposals",
      icon: FileText,
      roles: [
        "club_organizer",
        "faculty_advisor",
        "hod",
        "admin",
      ],
    },

    {
      label: "Venues",
      path: "/venues",
      icon: MapPin,
    },

    {
      label: "Resources",
      path: "/resources",
      icon: Package,
    },

    {
      label: "Approvals",
      path: "/approvals",
      icon: CheckCircle2,
      roles: [
        "faculty_advisor",
        "hod",
        "admin",
      ],
    },

    {
      label: "Attendance",
      path: "/attendance",
      icon: UserRoundCheck,
    },

    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },

    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      roles: ["hod", "admin"],
    },

    {
      label: "Verifications",
      path: "/admin/verifications",
      icon: ShieldCheck,
      roles: ["admin", "super_admin"],
    },
  ];

  const visibleLinks = links.filter(
    (link) =>
      !link.roles ||
      (user &&
        link.roles.includes(user.role))
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">

      {/* Logo */}
      <div className="border-b border-slate-200 px-6 py-5">

        <div className="text-xl font-semibold">
          CampusSync
        </div>

        <p className="mt-1 text-xs text-slate-500">
          University Event Management
        </p>

      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">

        {visibleLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={17} />

              {link.label}
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-slate-200 p-4">

        <NavLink
          to="/settings"
          className="mb-1 flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          <Settings size={17} />
          Settings
        </NavLink>

        <NavLink
          to="/help"
          className="mb-2 flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          <HelpCircle size={17} />
          Help & Support
        </NavLink>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={17} />
          Sign out
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
