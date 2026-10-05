import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Check, X, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "/api";

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  departmentId?: {
    name: string;
  };
  verificationDocumentUrl?: string;
  verificationSubmittedAt?: string;
  accountStatus: string;
}

const Verifications = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/verifications/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("campussync_token")}`,
        },
      });
      setRequests(data.data);
    } catch (error) {
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      fetchRequests();
    }
  }, [user]);

  const handleAction = async (userId: string, action: "approve" | "reject" | "resubmit") => {
    const reason = (action === "reject" || action === "resubmit") ? prompt(`Please enter a reason for ${action}:`) : "";
    
    if ((action === "reject" || action === "resubmit") && reason === null) {
      return; // cancelled
    }

    try {
      await axios.put(
        `${API_URL}/verifications/${userId}/${action}`,
        { comments: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campussync_token")}`,
          },
        }
      );
      toast.success(`User ${action}ed successfully`);
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div className="p-8 text-center text-slate-500">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Account Verifications</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review and approve pending faculty, HOD, and administrative accounts.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No pending verification requests.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium">Applicant</th>
                <th className="p-4 font-medium">Requested Role</th>
                <th className="p-4 font-medium">Employee ID</th>
                <th className="p-4 font-medium">Document</th>
                <th className="p-4 font-medium">Date Submitted</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{req.name}</p>
                    <p className="text-xs text-slate-500">{req.email}</p>
                  </td>
                  <td className="p-4 capitalize">{req.role.replace("_", " ")}</td>
                  <td className="p-4">{req.employeeId || "-"}</td>
                  <td className="p-4">
                    {req.verificationDocumentUrl ? (
                      <a
                        href={req.verificationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </td>
                  <td className="p-4">
                    {req.verificationSubmittedAt
                      ? new Date(req.verificationSubmittedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAction(req._id, "approve")}
                        className="rounded-md bg-green-50 p-2 text-green-600 hover:bg-green-100"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "resubmit")}
                        className="rounded-md bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100"
                        title="Request Resubmission"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Verifications;
