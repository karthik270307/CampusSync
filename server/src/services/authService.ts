import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User, UserRole, AccountStatus } from "../models/User.js";

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    departmentId?: string;
    registerNumber?: string;
    accountStatus: string;
  };
}

interface RegisterInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  registerNumber?: string;
  employeeId?: string;
  departmentId?: string;
  verificationDocumentUrl?: string;
  googleId?: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("This account is inactive");
  }

  // Allow seeded users to bypass status check if they are old (no accountStatus), but generally enforce:
  if (user.accountStatus && user.accountStatus !== "active") {
    throw new Error(`Account verification is pending or failed. Status: ${user.accountStatus}`);
  }

  if (!user.password) {
    throw new Error("Password authentication is not configured");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,

    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
      registerNumber: user.registerNumber,
      accountStatus: user.accountStatus || "active",
    },
  };
};

export const registerUser = async (data: RegisterInput) => {
  const { name, email, password, role, phone, registerNumber, employeeId, departmentId, verificationDocumentUrl, googleId } = data;

  const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    throw new Error("Email already registered");
  }

  if (registerNumber) {
    const existing = await User.findOne({ registerNumber });
    if (existing) throw new Error("Register number already registered");
  }

  if (employeeId) {
    const existing = await User.findOne({ employeeId });
    if (existing) throw new Error("Employee ID already registered");
  }

  let accountStatus = "active";
  if (["faculty_advisor", "hod", "admin", "dean"].includes(role)) {
    accountStatus = "pending_verification";
  }

  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  } else if (!googleId) {
    throw new Error("Password or Google sign-in required");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role as UserRole,
    phone,
    registerNumber,
    employeeId,
    departmentId,
    verificationDocumentUrl,
    googleId,
    accountStatus: accountStatus as AccountStatus,
    verificationSubmittedAt: accountStatus === "pending_verification" ? new Date() : undefined,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
  };
};
