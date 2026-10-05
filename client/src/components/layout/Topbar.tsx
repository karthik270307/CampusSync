import {
  Bell,
  Search,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-3 border border-slate-200 px-3 py-2">

        <Search
          size={17}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search CampusSync..."
          className="w-full bg-transparent text-sm outline-none"
        />

      </div>

      {/* User */}
      <div className="ml-6 flex items-center gap-5">

        <button className="relative text-slate-500 hover:text-slate-900">
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden text-right sm:block">

          <p className="text-sm font-medium">
            {user?.name}
          </p>

          <p className="text-xs capitalize text-slate-500">
            {user?.role.replace("_", " ")}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center bg-slate-950 text-sm font-medium text-white">
          {user?.name
            ?.charAt(0)
            .toUpperCase()}
        </div>

      </div>
    </header>
  );
};

export default Topbar;
