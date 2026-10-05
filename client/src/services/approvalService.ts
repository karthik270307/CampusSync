import api from "./api";

export const getMyApprovals = async () => {
  const response = await api.get("/approvals");
  return response.data;
};

export const getApprovalWorkflow = async (eventId: string) => {
  const response = await api.get(`/approvals/${eventId}`);
  return response.data;
};

export const approveApproval = async (approvalId: string) => {
  const response = await api.post(`/approvals/${approvalId}/approve`);
  return response.data;
};

export const requestRevision = async (approvalId: string, comments: string) => {
  const response = await api.post(`/approvals/${approvalId}/revision`, { comments });
  return response.data;
};

export const rejectApproval = async (approvalId: string, comments: string) => {
  const response = await api.post(`/approvals/${approvalId}/reject`, { comments });
  return response.data;
};
