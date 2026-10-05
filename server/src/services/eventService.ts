import mongoose from "mongoose";
import { Event, EventStatus } from "../models/Event.js";
import { Venue } from "../models/Venue.js";
import { Resource } from "../models/Resource.js";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";

interface CreateEventInput {
  title: string;
  description: string;
  organizerId: string;
  clubId?: string;
  departmentId?: string;
  category: string;
  venueId?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  resources?: {
    resourceId: string;
    quantity: number;
  }[];
  objectives?: string[];
  dignitaries?: string[];
  budget?: number;
  status?: EventStatus;
  registrationOpen?: boolean;
}

export const createEvent = async (
  data: CreateEventInput
) => {
  // 1. Resolve organizerId
  if (!data.organizerId || !mongoose.Types.ObjectId.isValid(data.organizerId)) {
    throw new Error("Valid organizer ID is required");
  }
  const organizerId = new mongoose.Types.ObjectId(data.organizerId);

  // 2. Resolve clubId & its associated department
  let clubId: mongoose.Types.ObjectId | undefined;
  let fetchedClub: any = null;
  if (data.clubId && typeof data.clubId === "string" && data.clubId.trim() && data.clubId.trim() !== "Club ID") {
    const cleanClub = data.clubId.trim();
    if (mongoose.Types.ObjectId.isValid(cleanClub)) {
      fetchedClub = await Club.findById(cleanClub);
      if (fetchedClub) clubId = fetchedClub._id as mongoose.Types.ObjectId;
    } else {
      fetchedClub = await Club.findOne({
        $or: [
          { code: cleanClub.toUpperCase() },
          { name: new RegExp(cleanClub, "i") },
        ],
      });
      if (fetchedClub) {
        clubId = fetchedClub._id as mongoose.Types.ObjectId;
      }
    }
  }

  // 3. Resolve departmentId (from input, then club, then organizer)
  let departmentId: mongoose.Types.ObjectId | undefined;
  if (data.departmentId && mongoose.Types.ObjectId.isValid(data.departmentId)) {
    departmentId = new mongoose.Types.ObjectId(data.departmentId);
  } else if (fetchedClub && fetchedClub.departmentId) {
    departmentId = fetchedClub.departmentId as mongoose.Types.ObjectId;
  } else {
    const organizer = await User.findById(organizerId);
    if (organizer && organizer.departmentId) {
      departmentId = organizer.departmentId as mongoose.Types.ObjectId;
    }
  }

  // 4. Resolve venueId
  let venueId: mongoose.Types.ObjectId | undefined;
  if (data.venueId && typeof data.venueId === "string" && data.venueId.trim()) {
    const cleanVenue = data.venueId.trim();
    if (mongoose.Types.ObjectId.isValid(cleanVenue)) {
      venueId = new mongoose.Types.ObjectId(cleanVenue);
    } else {
      // Find venue by slug, location, or name
      const searchPattern = cleanVenue.replace(/[-_]/g, " ");
      const venue = await Venue.findOne({
        $or: [
          { name: new RegExp(searchPattern, "i") },
          { location: new RegExp(searchPattern, "i") },
        ],
      });
      if (venue) {
        venueId = venue._id as mongoose.Types.ObjectId;
      }
    }
  }

  // 5. Resolve resources
  const resolvedResources: {
    resourceId: mongoose.Types.ObjectId;
    quantity: number;
  }[] = [];

  if (data.resources && Array.isArray(data.resources)) {
    for (const item of data.resources) {
      if (!item.quantity || item.quantity <= 0) continue;

      let resId: mongoose.Types.ObjectId | undefined;
      const cleanRes = (item.resourceId || "").trim();

      if (mongoose.Types.ObjectId.isValid(cleanRes)) {
        resId = new mongoose.Types.ObjectId(cleanRes);
      } else if (cleanRes) {
        const searchPattern = cleanRes.replace(/[-_]/g, " ");
        const resDoc = await Resource.findOne({
          name: new RegExp(searchPattern, "i"),
        });
        if (resDoc) {
          resId = resDoc._id as mongoose.Types.ObjectId;
        }
      }

      if (resId) {
        resolvedResources.push({
          resourceId: resId,
          quantity: item.quantity,
        });
      }
    }
  }

  const event = await Event.create({
    title: data.title.trim(),
    description: data.description.trim(),
    organizerId,
    clubId,
    departmentId,
    category: data.category,
    venueId,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    capacity: Number(data.capacity),
    resources: resolvedResources,
    objectives: data.objectives || [],
    dignitaries: data.dignitaries || [],
    budget: data.budget !== undefined ? Number(data.budget) : undefined,
    status: data.status || "draft",
    registrationOpen: data.registrationOpen ?? false,
  });

  return event;
};

export const getEvents = async (filters: {
  search?: string;
  category?: string;
  departmentId?: string;
  status?: string;
  from?: string;
  to?: string;
}) => {
  const query: Record<string, any> = {};

  if (filters.search) {
    query.$or = [
      {
        title: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.departmentId) {
    query.departmentId = filters.departmentId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.startDate = {};

    if (filters.from) {
      query.startDate.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.startDate.$lte = new Date(filters.to);
    }
  }

  return Event.find(query)
    .populate("organizerId", "name email role")
    .populate("clubId", "name")
    .populate("departmentId", "name code")
    .populate("venueId", "name capacity")
    .sort({ startDate: 1 });
};

export const getEventById = async (
  eventId: string
) => {
  return Event.findById(eventId)
    .populate("organizerId", "name email role")
    .populate("clubId", "name")
    .populate("departmentId", "name code")
    .populate("venueId", "name capacity");
};

export const updateEvent = async (
  eventId: string,
  data: Partial<CreateEventInput>
) => {
  return Event.findByIdAndUpdate(
    eventId,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const cancelEvent = async (
  eventId: string
) => {
  return Event.findByIdAndUpdate(
    eventId,
    {
      status: "cancelled",
      registrationOpen: false,
    },
    {
      new: true,
    }
  );
};