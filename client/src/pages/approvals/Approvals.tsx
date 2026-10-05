import { useEffect, useState } from "react"; // Forcing TS re-evaluation
import { CheckCircle2, Clock, FileText, MapPin, Users, Calendar, AlertCircle } from "lucide-react";
import { getMyApprovals, approveApproval, requestRevision, rejectApproval } from "../../services/approvalService";
import { useNavigate } from "react-router-dom";

export default function Approvals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // For comment modals
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"revision" | "reject" | null>(null);
  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await getMyApprovals();
      setApprovals(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      setActionLoading(approvalId);
      await approveApproval(approvalId);
      await fetchApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActionClick = (approvalId: string, action: "revision" | "reject") => {
    setActiveApprovalId(approvalId);
    setModalAction(action);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const submitCommentAction = async () => {
    if (!activeApprovalId || !modalAction || !commentText.trim()) return;
    
    try {
      setActionLoading(activeApprovalId);
      setCommentModalOpen(false);
      
      if (modalAction === "revision") {
        await requestRevision(activeApprovalId, commentText);
      } else if (modalAction === "reject") {
        await rejectApproval(activeApprovalId, commentText);
      }
      
      await fetchApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${modalAction}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading pending approvals...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Approvals Queue
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review and manage event proposals assigned to your role.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {approvals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">You're all caught up!</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no pending event proposals waiting for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals.map((approval) => {
            const event = approval.eventId;
            if (!event) return null;
            
            return (
              <div key={approval._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="border-b border-slate-100 bg-slate-50/50 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                          {event.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={15} className="text-slate-400" />
                          Capacity: {event.capacity}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock size={12} />
                        Awaiting your review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-slate-600 mb-6">{event.description}</p>
                  
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Schedule</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Venue</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {event.venueId?.name || "TBD"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Organizer</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {event.organizerId?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-5">
                  <button 
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    View full details &rarr;
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleActionClick(approval._id, "reject")}
                      disabled={actionLoading === approval._id}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleActionClick(approval._id, "revision")}
                      disabled={actionLoading === approval._id}
                      className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-600 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Request Revision
                    </button>
                    
                    <button
                      onClick={() => handleApprove(approval._id)}
                      disabled={actionLoading === approval._id}
                      className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {actionLoading === approval._id ? "Approving..." : "Approve Proposal"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Modal */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`p-6 text-white ${modalAction === "reject" ? "bg-red-600" : "bg-amber-500"}`}>
              <h3 className="text-xl font-bold">
                {modalAction === "reject" ? "Reject Proposal" : "Request Revision"}
              </h3>
              <p className="mt-1 text-white/80 text-sm">
                Please provide a reason for this decision.
              </p>
            </div>
            
            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Comments (Required)
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Explain what needs to be changed or why it was rejected..."
                autoFocus
              />
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setCommentModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCommentAction}
                  disabled={!commentText.trim()}
                  className={`rounded-lg px-6 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50 ${
                    modalAction === "reject" 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  Submit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
