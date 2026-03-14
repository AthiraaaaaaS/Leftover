import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, mainApi, type PendingUser, type DonationWithFeedback } from "@/lib/api";

export default function Dashboard() {
  const nav = useNavigate();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [donations, setDonations] = useState<DonationWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationsError, setDonationsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminApi.listPendingUsers();
      setPending(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    setDonationsLoading(true);
    setDonationsError(null);
    try {
      const list = await mainApi.listDonations();
      setDonations(Array.isArray(list) ? list : []);
    } catch (e) {
      setDonations([]);
      setDonationsError(e instanceof Error ? e.message : "Failed to load. Ensure main API (port 8000) is running and CORS allows this origin.");
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadDonations();
  }, []);

  // Auto-refresh donations so new feedback appears when users submit
  useEffect(() => {
    const interval = setInterval(loadDonations, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (user: PendingUser) => {
    setActioning(user.id);
    try {
      await adminApi.approveUser(user.id);
      setPending((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (user: PendingUser) => {
    setActioning(user.id);
    try {
      await adminApi.rejectUser(user.id);
      setPending((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActioning(null);
    }
  };

  const logout = () => {
    adminApi.logout();
    nav("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Admin – Pending user requests</h1>
        <button
          type="button"
          onClick={logout}
          style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <p style={{ color: "#666" }}>No pending user requests. New signups will appear here for approval.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {pending.map((user) => (
            <li
              key={user.id}
              style={{
                padding: 16,
                marginBottom: 12,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{user.fullName || user.username}</strong>
                <span style={{ marginLeft: 8, color: "#666", fontSize: 14 }}>
                  @{user.username} · {user.role}
                </span>
                {user.phone && (
                  <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{user.phone}</div>
                )}
                {user.email && (
                  <div style={{ fontSize: 14, color: "#666" }}>{user.email}</div>
                )}
                {user.organization && (
                  <div style={{ fontSize: 14, color: "#666" }}>Org: {user.organization}</div>
                )}
                {user.city && (
                  <div style={{ fontSize: 14, color: "#666" }}>City: {user.city}</div>
                )}
                {user.role === "DONOR" && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
                    <strong>Verification (verify before approve):</strong> Aadhaar last 4: {user.aadhaarLast4 ?? "—"}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      {user.idFrontImage && (
                        <a href={user.idFrontImage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>Aadhaar front</a>
                      )}
                      {user.idBackImage && (
                        <a href={user.idBackImage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>Aadhaar back</a>
                      )}
                      {user.foodSafetyCertImage && (
                        <a href={user.foodSafetyCertImage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>Food safety cert</a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {user.idFrontImage?.startsWith("data:") && (
                        <img src={user.idFrontImage} alt="Aadhaar front" style={{ maxWidth: 80, maxHeight: 60, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }} />
                      )}
                      {user.idBackImage?.startsWith("data:") && (
                        <img src={user.idBackImage} alt="Aadhaar back" style={{ maxWidth: 80, maxHeight: 60, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }} />
                      )}
                      {user.foodSafetyCertImage?.startsWith("data:") && (
                        <img src={user.foodSafetyCertImage} alt="Food safety cert" style={{ maxWidth: 80, maxHeight: 60, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }} />
                      )}
                    </div>
                  </div>
                )}
                {user.role === "VOLUNTEER" && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
                    <strong>Verification (verify before approve):</strong> Aadhaar last 4: {user.aadhaarLast4 ?? "—"} · ID type: {user.volunteerIdType ?? "—"}
                    <div style={{ marginTop: 4 }}>
                      {user.volunteerIdProofImage && (
                        user.volunteerIdProofImage.startsWith("data:") ? (
                          <img src={user.volunteerIdProofImage} alt="Volunteer ID proof" style={{ maxWidth: 120, maxHeight: 80, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }} />
                        ) : (
                          <a href={user.volunteerIdProofImage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>View ID proof</a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleApprove(user)}
                  disabled={actioning === user.id}
                  style={{
                    padding: "8px 16px",
                    background: "#0f766e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: actioning === user.id ? "not-allowed" : "pointer",
                  }}
                >
                  {actioning === user.id ? "..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(user)}
                  disabled={actioning === user.id}
                  style={{
                    padding: "8px 16px",
                    background: "#b91c1c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: actioning === user.id ? "not-allowed" : "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 24, fontSize: 12, color: "#888" }}>
        Approved users can sign in on the main app. They will be notified by email when approved (when configured).
      </p>

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4, fontSize: 20 }}>Donations & delivery details</h2>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            All donations; delivery/end-user details appear once the volunteer records them. Feedback appears when the recipient submits it (refreshes every 30s or click Refresh).
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDonations()}
          disabled={donationsLoading}
          style={{
            padding: "8px 16px",
            border: "1px solid #0f766e",
            borderRadius: 8,
            background: "#fff",
            color: "#0f766e",
            cursor: donationsLoading ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          {donationsLoading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {donationsError && (
        <div style={{ marginBottom: 16, padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          Donations: {donationsError}
        </div>
      )}
      {donationsLoading ? (
        <p>Loading donations...</p>
      ) : donations.length === 0 && !donationsError ? (
        <p style={{ color: "#666" }}>No donations yet.</p>
      ) : donations.length === 0 ? null : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 8 }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>Donor</th>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>Volunteer</th>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>Category</th>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>Status</th>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>End user</th>
                <th style={{ padding: "12px 10px", fontSize: 12, color: "#555" }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>{d.donorName}</td>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>
                    {d.assignedVolunteer?.name ?? "—"}
                  </td>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>{d.category}</td>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>{d.status}</td>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>
                    {d.deliveryRecipient ? (
                      <span>
                        {d.deliveryRecipient.name}
                        {d.deliveryRecipient.email && ` · ${d.deliveryRecipient.email}`}
                        {d.deliveryRecipient.phone && !d.deliveryRecipient.email && ` · ${d.deliveryRecipient.phone}`}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "12px 10px", fontSize: 14 }}>
                    {d.feedback ? (
                      <span>
                        {d.feedback.rating}/5
                        {d.feedback.comment && ` · "${d.feedback.comment.slice(0, 50)}${d.feedback.comment.length > 50 ? "…" : ""}"`}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
