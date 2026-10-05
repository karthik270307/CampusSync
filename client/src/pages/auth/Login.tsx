import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error(
        "Please enter your email and password"
      );
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      toast.success(
        "Welcome back to CampusSync"
      );

      navigate("/");
    } catch (error: unknown) {
      let message = "Unable to sign in";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || "Unable to sign in";
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
            <div className="text-2xl font-semibold">
              CampusSync
            </div>

            <p className="mt-2 max-w-md text-sm text-slate-400">
              A unified platform for managing
              university events, approvals,
              facilities and student participation.
            </p>
          </div>

          <div>
            <p className="max-w-lg font-serif text-3xl leading-tight">
              Plan better events.
              <br />
              Coordinate everything in one place.
            </p>

            <p className="mt-6 text-sm text-slate-400">
              Campus event coordination made
              simpler for students, clubs and
              university administration.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            CampusSync • University Event Management
          </div>
        </div>

        {/* Login */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="mb-8 lg:hidden">
              <div className="text-2xl font-semibold">
                CampusSync
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-slate-500">
                UNIVERSITY EVENT MANAGEMENT
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Sign in to CampusSync
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Access your events, approvals
                and campus resources.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@campussync.edu"
                    className="w-full border border-slate-300 bg-white px-10 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
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
                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowRight size={17} />
                )}
              </button>

              <div className="mt-4 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-medium text-slate-900 underline underline-offset-2 hover:text-blue-600"
                >
                  Register here
                </button>
              </div>

            </form>

            {/* Demo credentials */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-xs leading-5 text-slate-500">
                Demo account:
                <br />

                <strong>
                  alice@campussync.edu
                </strong>

                <br />

                Password:
                <strong> CampusSync@123</strong>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
