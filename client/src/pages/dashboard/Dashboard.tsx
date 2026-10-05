import {
  CalendarDays,
  ClipboardCheck,
  MapPin,
  Users,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      label: "Upcoming Events",
      value: "0",
      icon: CalendarDays,
    },
    {
      label: "My Registrations",
      value: "0",
      icon: ClipboardCheck,
    },
    {
      label: "Available Venues",
      value: "5",
      icon: MapPin,
    },
    {
      label: "Campus Clubs",
      value: "4",
      icon: Users,
    },
  ];

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          DASHBOARD
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          Welcome, {user?.name}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening across
          CampusSync.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>

                <Icon
                  size={20}
                  className="text-slate-400"
                />

              </div>

              <p className="mt-5 text-3xl font-semibold">
                {stat.value}
              </p>
            </div>
          );
        })}

      </div>

      {/* Main content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">

        <div className="border border-slate-200 bg-white p-6 lg:col-span-2">

          <h2 className="text-lg font-semibold">
            Upcoming activity
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your upcoming events and campus
            activities will appear here.
          </p>

        </div>

        <div className="border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold">
            Quick actions
          </h2>

          <div className="mt-5 space-y-3">

            {user?.role === "student" ? (
              <button
                onClick={() => navigate("/events")}
                className="w-full border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                Search events
              </button>
            ) : (
              <button
                onClick={() => navigate("/events/create")}
                className="w-full border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                Propose event
              </button>
            )}

            <button
              onClick={() => navigate("/venues")}
              className="w-full border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              View venues
            </button>

            <button
              onClick={() => navigate("/clubs")}
              className="w-full border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              Explore clubs
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
