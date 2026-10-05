import api from "./api";

export interface ConflictCheckInput {
  venueId?: string;
  startDate: string;
  endDate: string;
  excludeEventId?: string;
}

export interface ConflictItem {
  type: "academic" | "venue";
  message: string;
  eventId?: string;
  title?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  academicConflict: boolean;
  venueConflict: boolean;
  conflicts: ConflictItem[];
}

export const checkConflicts = async (
  data: ConflictCheckInput
): Promise<ConflictResult> => {
  const response = await api.post("/conflicts/check", data);

  return response.data.data;
};