import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Verifications from "../pages/admin/Verifications";
import Events from "../pages/events/Events";
import EventDetails from "../pages/events/EventDetails";
import CreateEvent from "../pages/events/CreateEvent";
import Approvals from "../pages/approvals/Approvals";

import AppShell from "../components/layout/AppShell";

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea]">
        <p className="text-sm text-slate-500">
          Loading CampusSync...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Checks whether the logged-in user is allowed
   * to create events.
   */
  const canCreateEvent =
    user.role === "club_organizer" ||
    user.role === "faculty_advisor" ||
    user.role === "hod" ||
    user.role === "admin";

  return (
    <AppShell>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Events Catalog */}
        <Route
          path="/events"
          element={<Events />}
        />

        {/* Event Details */}
        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        {/* Create Event - Role Protected */}
        <Route
          path="/events/create"
          element={
            canCreateEvent ? (
              <CreateEvent />
            ) : (
              <Navigate
                to="/events"
                replace
              />
            )
          }
        />

        {/* Admin Verifications */}
        <Route
          path="/admin/verifications"
          element={<Verifications />}
        />

        {/* Approvals */}
        <Route
          path="/approvals"
          element={
            canCreateEvent ? (
              <Approvals />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <div className="border border-slate-200 bg-white p-8">
              <h1 className="text-xl font-semibold">
                Coming soon
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                This CampusSync module will be
                implemented in a later phase.
              </p>
            </div>
          }
        />
      </Routes>
    </AppShell>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected application */}
      <Route
        path="/*"
        element={<ProtectedRoutes />}
      />
    </Routes>
  );
};

export default AppRoutes;

