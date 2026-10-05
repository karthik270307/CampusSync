export type UserRole =
  | "student"
  | "club_organizer"
  | "faculty_advisor"
  | "hod"
  | "dean"
  | "venue_admin"
  | "admin"
  | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  registerNumber?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
