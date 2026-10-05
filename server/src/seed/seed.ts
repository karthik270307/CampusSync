import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDatabase } from "../config/database.js";

import { Department } from "../models/Department.js";
import { User } from "../models/User.js";
import { Club } from "../models/Club.js";
import { Venue } from "../models/Venue.js";
import { Resource } from "../models/Resource.js";
import { AcademicCalendar } from "../models/AcademicCalendar.js";

dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDatabase();

    console.log("Connected to MongoDB");
    console.log("Clearing existing seed data...");

    await Promise.all([
      Department.deleteMany({}),
      User.deleteMany({}),
      Club.deleteMany({}),
      Venue.deleteMany({}),
      Resource.deleteMany({}),
      AcademicCalendar.deleteMany({}),
    ]);

    // --------------------------------------------------
    // 1. DEPARTMENTS
    // --------------------------------------------------

    const departments = await Department.insertMany([
      { name: "Computer Science and Engineering", code: "CSE" },
      { name: "Information Technology", code: "IT" },
      { name: "Electronics and Communication Engineering", code: "ECE" },
      { name: "Mechanical Engineering", code: "MECH" },
      { name: "Electrical and Electronics Engineering", code: "EEE" },
      { name: "Artificial Intelligence and Data Science", code: "AIDS" },
      { name: "Civil Engineering", code: "CIVIL" },
      { name: "Aerospace Engineering", code: "AERO" },
      { name: "Agriculture Engineering", code: "AGRI" },
      { name: "Biomedical Engineering", code: "BME" },
      { name: "Mechatronics Engineering", code: "MCT" },
      { name: "Food Technology", code: "FT" },
      { name: "Automobile Engineering", code: "AUTO" },
      { name: "Master of Business Administration", code: "MBA" },
    ]);

    const cse = departments.find((department) => department.code === "CSE");
    const it = departments.find((department) => department.code === "IT");
    const ece = departments.find((department) => department.code === "ECE");
    const mech = departments.find((department) => department.code === "MECH");
    const eee = departments.find((department) => department.code === "EEE");
    const aids = departments.find((department) => department.code === "AIDS");

    if (!cse || !it || !ece || !mech || !eee || !aids) {
      throw new Error("Required departments were not created");
    }

    // --------------------------------------------------
    // 2. USERS
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash("CampusSync@123", 10);

    const users = await User.insertMany([
      {
        name: "Alice Walker",
        email: "alice@campussync.edu",
        password: hashedPassword,
        role: "student",
        departmentId: cse._id,
        registerNumber: "CS2026001",
        phone: "9000000001",
        isActive: true,
      },
      {
        name: "Karthik Raja",
        email: "karthik@campussync.edu",
        password: hashedPassword,
        role: "club_organizer",
        departmentId: cse._id,
        registerNumber: "CS2026042",
        phone: "9000000002",
        isActive: true,
      },
      {
        name: "Prof. Rajesh Sharma",
        email: "admin@campussync.edu",
        password: hashedPassword,
        role: "admin",
        phone: "9000000005",
        isActive: true,
      },
      {
        name: "System Super Admin",
        email: "superadmin@campussync.edu",
        password: hashedPassword,
        role: "super_admin",
        phone: "9000000008",
        isActive: true,
      },
      {
        name: "Dr. Priya Raman (CSE Faculty)",
        email: "priya.raman@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: cse._id,
        phone: "9000000003",
        isActive: true,
      },
      {
        name: "Dr. V. Sundaram (CSE HOD)",
        email: "sundaram@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: cse._id,
        phone: "9000000004",
        isActive: true,
      },
      {
        name: "IT Faculty",
        email: "it.faculty@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: it._id,
        isActive: true,
      },
      {
        name: "IT HOD",
        email: "it.hod@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: it._id,
        isActive: true,
      },
      {
        name: "ECE Faculty",
        email: "ece.faculty@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: ece._id,
        isActive: true,
      },
      {
        name: "ECE HOD",
        email: "ece.hod@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: ece._id,
        isActive: true,
      },
      {
        name: "MECH Faculty",
        email: "mech.faculty@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: mech._id,
        isActive: true,
      },
      {
        name: "MECH HOD",
        email: "mech.hod@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: mech._id,
        isActive: true,
      },
      {
        name: "EEE Faculty",
        email: "eee.faculty@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: eee._id,
        isActive: true,
      },
      {
        name: "EEE HOD",
        email: "eee.hod@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: eee._id,
        isActive: true,
      },
      {
        name: "AIDS Faculty",
        email: "aids.faculty@campussync.edu",
        password: hashedPassword,
        role: "faculty_advisor",
        departmentId: aids._id,
        isActive: true,
      },
      {
        name: "AIDS HOD",
        email: "aids.hod@campussync.edu",
        password: hashedPassword,
        role: "hod",
        departmentId: aids._id,
        isActive: true,
      },
    ]);

    const student = users.find(
      (user) => user.email === "alice@campussync.edu"
    );

    const organizer = users.find(
      (user) => user.email === "karthik@campussync.edu"
    );

    const facultyAdvisor = users.find(
      (user) => user.email === "priya.raman@campussync.edu"
    );

    if (!student || !organizer || !facultyAdvisor) {
      throw new Error("Required users were not created");
    }

    // --------------------------------------------------
    // 3. CLUBS
    // --------------------------------------------------

    await Club.insertMany([
      {
        name: "Coding Club",
        code: "CODE",
        description:
          "Student community focused on programming, software development and competitive coding.",
        departmentId: cse._id,
        facultyAdvisorId: facultyAdvisor._id,
        organizerIds: [organizer._id],
        memberIds: [student._id],
        isActive: true,
      },

      {
        name: "Robotics Club",
        code: "ROBOT",
        description:
          "Technical club focused on robotics, automation and embedded systems.",
        departmentId: ece._id,
        facultyAdvisorId: facultyAdvisor._id,
        organizerIds: [],
        memberIds: [],
        isActive: true,
      },

      {
        name: "Mechanical Innovation Club",
        code: "MIC",
        description:
          "Club focused on mechanical design, innovation and engineering projects.",
        departmentId: mech._id,
        organizerIds: [],
        memberIds: [],
        isActive: true,
      },

      {
        name: "Tech Community",
        code: "TECH",
        description:
          "Cross-disciplinary student community for technology events and workshops.",
        departmentId: it._id,
        facultyAdvisorId: facultyAdvisor._id,
        organizerIds: [],
        memberIds: [],
        isActive: true,
      },
    ]);

    // --------------------------------------------------
    // 4. VENUES
    // --------------------------------------------------

    await Venue.insertMany([
      {
        name: "University Auditorium",
        location: "Main Academic Block",
        capacity: 500,
        amenities: [
          "Air Conditioning",
          "Projector",
          "Smart Screen",
          "Microphones",
          "Stage",
        ],
        isActive: true,
      },

      {
        name: "Seminar Hall A",
        location: "Computer Science Block",
        capacity: 150,
        amenities: [
          "Air Conditioning",
          "Projector",
          "Smart Board",
          "Microphones",
        ],
        isActive: true,
      },

      {
        name: "Seminar Hall B",
        location: "Technology Block",
        capacity: 100,
        amenities: [
          "Air Conditioning",
          "Projector",
          "Smart Board",
        ],
        isActive: true,
      },

      {
        name: "Conference Room",
        location: "Administrative Block",
        capacity: 40,
        amenities: [
          "Air Conditioning",
          "Projector",
          "Display",
        ],
        isActive: true,
      },

      {
        name: "Open Air Theatre",
        location: "Central Campus",
        capacity: 800,
        amenities: [
          "Stage",
          "Sound System",
          "Open Seating",
        ],
        isActive: true,
      },
    ]);

    // --------------------------------------------------
    // 5. RESOURCES
    // --------------------------------------------------

    await Resource.insertMany([
      {
        name: "Projector",
        category: "audio_visual",
        totalQuantity: 10,
        availableQuantity: 10,
        description: "Portable multimedia projectors.",
        isActive: true,
      },

      {
        name: "Wireless Microphone",
        category: "audio_visual",
        totalQuantity: 20,
        availableQuantity: 20,
        description: "Wireless microphones for seminars and events.",
        isActive: true,
      },

      {
        name: "Speaker System",
        category: "audio_visual",
        totalQuantity: 8,
        availableQuantity: 8,
        description: "Portable speaker systems.",
        isActive: true,
      },

      {
        name: "Plastic Chair",
        category: "furniture",
        totalQuantity: 1000,
        availableQuantity: 1000,
        description: "Standard event seating.",
        isActive: true,
      },

      {
        name: "Folding Table",
        category: "furniture",
        totalQuantity: 100,
        availableQuantity: 100,
        description: "Portable folding tables.",
        isActive: true,
      },
    ]);

    // --------------------------------------------------
    // 6. ACADEMIC CALENDAR
    // --------------------------------------------------

    await AcademicCalendar.insertMany([
      {
        title: "Mid-Semester Examinations",
        type: "exam",
        startDate: new Date("2026-11-02T00:00:00.000Z"),
        endDate: new Date("2026-11-07T23:59:59.999Z"),
        description:
          "No student club events should be scheduled during semester examinations.",
        isBlocking: true,
        isRestricted: true,
      },

      {
        title: "University Foundation Day",
        type: "mandatory_event",
        startDate: new Date("2026-10-15T00:00:00.000Z"),
        endDate: new Date("2026-10-15T23:59:59.999Z"),
        description:
          "University-wide mandatory event.",
        isBlocking: true,
        isRestricted: true,
      },

      {
        title: "Institutional Holiday",
        type: "holiday",
        startDate: new Date("2026-10-24T00:00:00.000Z"),
        endDate: new Date("2026-10-24T23:59:59.999Z"),
        description:
          "University holiday.",
        isBlocking: true,
        isRestricted: true,
      },
    ]);

    console.log("=================================");
    console.log("CampusSync database seeded!");
    console.log("=================================");
    console.log(`Departments: ${departments.length}`);
    console.log(`Users: ${users.length}`);
    console.log("Clubs: 4");
    console.log("Venues: 5");
    console.log("Resources: 5");
    console.log("Academic calendar entries: 3");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

seedDatabase();