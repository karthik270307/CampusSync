import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Building2,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { getEvent } from "../../services/eventService";

interface EventData {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registeredCount: number;
  status: string;
  registrationOpen: boolean;
  objectives?: string[];
  dignitaries?: string[];
  organizerId?: {
    name: string;
    email: string;
    role: string;
  };
  clubId?: {
    name: string;
  };
  departmentId?: {
    name: string;
    code: string;
  };
  venueId?: {
    name: string;
    capacity: number;
  };
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      try {
        const data = await getEvent(id);
        setEvent(data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Event not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested event could not be found.
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime = startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = endDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* Header */}
      <section className="border border-slate-200 bg-white p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {event.category}
              </span>

              <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                {event.status.includes("_review") 
                  ? event.status.replace("_review", " review").replace("hod", "HOD")
                  : event.status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {event.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {event.description}
            </p>
          </div>

          {event.registrationOpen && (
            <button
              onClick={() =>
                toast.success("Registration module will be connected next")
              }
              className="shrink-0 bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Register
            </button>
          )}
        </div>
      </section>

      {/* Event information */}
      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={<CalendarDays size={19} />}
          label="Date"
          value={formattedDate}
        />

        <InfoCard
          icon={<Clock size={19} />}
          label="Time"
          value={`${formattedStartTime} – ${formattedEndTime}`}
        />

        <InfoCard
          icon={<MapPin size={19} />}
          label="Venue"
          value={event.venueId?.name || "Venue not assigned"}
        />

        <InfoCard
          icon={<Users size={19} />}
          label="Capacity"
          value={`${event.registeredCount} / ${event.capacity} registered`}
        />

        <InfoCard
          icon={<Building2 size={19} />}
          label="Department"
          value={
            event.departmentId
              ? `${event.departmentId.name} (${event.departmentId.code})`
              : "Not specified"
          }
        />

        <InfoCard
          icon={<UserRound size={19} />}
          label="Organizer"
          value={
            event.organizerId?.name || "Organizer not specified"
          }
        />
      </section>

      {/* Objectives */}
      {event.objectives && event.objectives.length > 0 && (
        <section className="border border-slate-200 bg-white p-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Event Objectives
          </h2>

          <ul className="mt-4 space-y-3">
            {event.objectives.map((objective, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                {objective}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dignitaries */}
      {event.dignitaries && event.dignitaries.length > 0 && (
        <section className="border border-slate-200 bg-white p-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Dignitaries / Guests
          </h2>

          <div className="mt-4 space-y-2">
            {event.dignitaries.map((person, index) => (
              <p
                key={index}
                className="text-sm text-slate-600"
              >
                {person}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Club */}
      {event.clubId && (
        <section className="border border-slate-200 bg-white p-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Organizing Club
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {event.clubId.name}
          </p>
        </section>
      )}
    </div>
  );
};

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

const InfoCard = ({
  icon,
  label,
  value,
}: InfoCardProps) => {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3 text-slate-500">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
};

export default EventDetails;