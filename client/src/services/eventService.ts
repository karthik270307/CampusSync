import api from "./api.ts";

export interface EventFilters {
  search?: string;
  category?: string;
  departmentId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const getEvents = async (
  filters: EventFilters = {}
) => {
  const response = await api.get("/events", {
    params: filters,
  });

  return response.data.data;
};

export const getEvent = async (
  eventId: string
) => {
  const response = await api.get(
    `/events/${eventId}`
  );

  return response.data.data;
};