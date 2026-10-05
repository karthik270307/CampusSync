import { type FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, User, Phone, FileText, Building2, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = "/api";

type RoleType = "student" | "faculty_advisor" | "hod" | "admin" | "dean";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleType>("student");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState(""); // Simplified for mockup
  const [documentUrl, setDocumentUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !email || !password || !role) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        email,
        password,
        role,
        phone,
        registerNumber: role === "student" ? registerNumber : undefined,
        employeeId: role !== "student" ? employeeId : undefined,
        departmentId: role !== "student" ? departmentId : undefined,
        verificationDocumentUrl: role !== "student" ? documentUrl : undefined,
      };

      await axios.post(`${API_URL}/auth/register`, payload);

      toast.success("Registration successful!");
      
      if (role !== "student") {
        toast("Your account is pending verification by an administrator.", {
          icon: "🕒",
          duration: 5000
        });
      }

      navigate("/login");
    } catch (error: unknown) {
      let message = "Registration failed";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || "Registration failed";
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
          <div>
            <div className="text-2xl font-semibold">CampusSync</div>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              A unified platform for managing university events, approvals, facilities and student participation.
            </p>
          </div>
          <div>
            <p className="max-w-lg font-serif text-3xl leading-tight">
              Join CampusSync.
              <br />
              Coordinate everything in one place.
            </p>
            <p className="mt-6 text-sm text-slate-400">
              Campus event coordination made simpler for students, clubs and university administration.
            </p>
          </div>
          <div className="text-xs text-slate-500">CampusSync • University Event Management</div>
        </div>

        {/* Register Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md max-h-screen overflow-y-auto no-scrollbar pb-10">
            <div className="mb-8 lg:hidden">
              <div className="text-2xl font-semibold">CampusSync</div>
            </div>

            <div className="mb-8">
              <h1 className="mt-2 text-3xl font-semibold">Create an Account</h1>
              <p className="mt-2 text-sm text-slate-500">
                Join CampusSync to manage events, approvals, and campus resources.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["student", "faculty_advisor", "hod", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`border px-4 py-3 text-sm font-medium capitalize ${
                        role === r ? "border-slate-900 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {r.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Institutional Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campussync.edu"
                    className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Role Specific Fields */}
              {role === "student" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Register Number</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g. 19BCE0001"
                      className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              )}

              {role !== "student" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Employee/Faculty ID</label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP12345"
                        className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Department (Optional Mockup)</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        placeholder="Department code/ID"
                        className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">ID Card Document Link (Mockup)</label>
                    <div className="relative">
                      <UploadCloud size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={documentUrl}
                        required
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        placeholder="Link to ID card / Google Drive"
                        className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      As a non-student, your registration requires manual verification by an administrator. Please provide proof of identity.
                    </p>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <div className="relative">
                  <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Registering..." : "Create Account"}
                {!loading && <ArrowRight size={17} />}
              </button>

              <div className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-slate-900 underline underline-offset-2 hover:text-blue-600"
                >
                  Sign in instead
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
