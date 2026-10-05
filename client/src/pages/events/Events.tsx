import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  PlusCircle,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getEvents } from "../../services/eventService";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registeredCount?: number;
  status: string;
  registrationOpen?: boolean;
  venueId?: {
    _id?: string;
    name?: string;
    capacity?: number;
  } | string;
  clubId?: {
    _id?: string;
    name?: string;
  } | string;
  departmentId?: {
    _id?: string;
    name?: string;
    code?: string;
  } | string;
}

const categories = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Conference",
  "Club Activity",
  "Other",
];

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  const canPropose =
    user?.role &&
    ["club_organizer", "faculty_advisor", "hod", "admin"].includes(
      user.role
    );

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search.trim() ||
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && event.registrationOpen) ||
      event.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDateTime = (startStr: string, endStr?: string) => {
    if (!startStr) return "Date TBD";
    const start = new Date(startStr);
    const dateFormatted = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const startTimeFormatted = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (endStr) {
      const end = new Date(endStr);
      const endTimeFormatted = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateFormatted} • ${startTimeFormatted} - ${endTimeFormatted}`;
    }

    return `${dateFormatted} • ${startTimeFormatted}`;
  };

  const getVenueName = (event: EventItem) => {
    if (!event.venueId) return "Venue to be announced";
    if (typeof event.venueId === "object" && event.venueId.name) {
      return event.venueId.name;
    }
    return String(event.venueId);
  };

  const getClubName = (event: EventItem) => {
    if (!event.clubId) return null;
    if (typeof event.clubId === "object" && event.clubId.name) {
      return event.clubId.name;
    }
    return String(event.clubId);
  };

  const getStatusBadge = (event: EventItem) => {
    if (event.registrationOpen) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Registration Open
        </span>
      );
    }

    switch (event.status) {
      case "approved":
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
            Approved
          </span>
        );
      case "ongoing":
        return (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
            Ongoing
          </span>
        );
      case "submitted":
      case "faculty_review":
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            Faculty Review
          </span>
        );
      case "hod_review":
        return (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 border border-orange-200">
            HOD Review
          </span>
        );
      case "admin_review":
        return (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200">
            Admin Review
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {event.status || "Upcoming"}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Campus Events
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Search Events
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover upcoming workshops, seminars, symposiums and club activities.
          </p>
        </div>

        {/* Propose Event Button: ONLY accessible to Organizers and Staff (NEVER Students) */}
        {canPropose && (
          <button
            onClick={() => navigate("/events/create")}
            className="inline-flex items-center gap-2 self-start rounded-none bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 shadow-sm"
          >
            <PlusCircle size={16} />
            Propose Event
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4 rounded-none border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, keyword, or topic..."
              className="w-full border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="open">Registration Open</option>
              <option value="approved">Approved</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="mr-2 text-xs font-medium text-slate-400">
            Category:
          </span>
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 border border-slate-200 bg-white p-12 text-center">
          <Loader2 size={24} className="animate-spin text-slate-600" />
          <p className="text-sm text-slate-500">Loading campus events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 border border-slate-200 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Calendar size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No events found
          </h3>
          <p className="max-w-md text-sm text-slate-500">
            We couldn't find any events matching your current search and filter criteria. Try clearing your filters or checking back later.
          </p>
          {(search || selectedCategory !== "All" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setStatusFilter("all");
              }}
              className="mt-2 border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const venueName = getVenueName(event);
            const clubName = getClubName(event);

            return (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="group flex cursor-pointer flex-col justify-between border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {event.category || "General"}
                    </span>
                    {getStatusBadge(event)}
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {event.description}
                  </p>

                  {/* Details metadata */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0 text-slate-400" />
                      <span>{formatDateTime(event.startDate, event.endDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{venueName}</span>
                    </div>

                    {clubName && (
                      <div className="flex items-center gap-2">
                        <Users size={14} className="shrink-0 text-slate-400" />
                        <span className="truncate">{clubName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    {event.capacity
                      ? `Capacity: ${event.capacity}`
                      : "Open to all"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
                    View Details
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;