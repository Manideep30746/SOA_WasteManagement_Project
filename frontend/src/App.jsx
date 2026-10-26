
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8082/api/waste";

function App() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    location: "",
    category: "GENERAL",
    description: "",
  });

  async function loadReports() {
    try {
      setError("");
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load reports.");
      setReports(await response.json());
    } catch {
      setError("Unable to connect to the backend. Check that all services are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitReport(event) {
    event.preventDefault();
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Submission failed.");

      setForm({ location: "", category: "GENERAL", description: "" });
      await loadReports();
      setPage("reports");
      alert("Waste report submitted successfully!");
    } catch {
      alert("Could not submit the report. Please check the backend and try again.");
    }
  }

async function updateStatus(id, status) {
  try {
    const response = await fetch(`${API}/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Status update failed");
    }

    await loadReports();
  } catch (error) {
    console.error("Status update error:", error);
    alert("Status update failed. Please try again.");
  }
}


  const pending = reports.filter((r) => r.status === "REPORTED").length;
  const resolved = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">SC</div>
          <div><strong>SmartCity</strong><small>WASTE MANAGEMENT</small></div>
        </div>

        <p className="menu-label">WORKSPACE</p>
        <button className={page === "dashboard" ? "nav active" : "nav"}
          onClick={() => setPage("dashboard")}>▦ Dashboard</button>
        <button className={page === "reports" ? "nav active" : "nav"}
          onClick={() => setPage("reports")}>☷ Waste Reports</button>
        <button className={page === "new" ? "nav active" : "nav"}
          onClick={() => setPage("new")}>＋ Report Waste</button>

        <div className="sidebar-bottom">
          <span className="online-dot" /> Backend connection
          <small>Smart City · Hyderabad</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">SMART CITY / OPERATIONS</span>
            <h1>{page === "dashboard" ? "Dashboard" :
              page === "reports" ? "Waste Reports" : "Report Waste"}</h1>
          </div>
          <span className="live-badge">● LIVE DATA</span>
        </header>

        {error && <div className="error">{error}</div>}

        {page === "new" ? (
          <section className="panel form-panel">
            <h2>Submit a waste report</h2>
            <p className="muted">Provide the details of the waste issue.</p>
            <form onSubmit={submitReport}>
              <label>Location</label>
              <input required value={form.location} placeholder="e.g. Bachupally, Hyderabad"
                onChange={(e) => setForm({ ...form, location: e.target.value })} />

              <label>Waste category</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="GENERAL">General Waste</option>
                <option value="PLASTIC">Plastic</option>
                <option value="ORGANIC">Organic Waste</option>
                <option value="E_WASTE">Electronic Waste</option>
                <option value="OTHER">Other</option>
              </select>

              <label>Description</label>
              <textarea required rows="4" value={form.description}
                placeholder="Describe the waste issue..."
                onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <button className="primary" type="submit">Submit Report →</button>
            </form>
          </section>
        ) : (
          <>
            {page === "dashboard" && (
              <section className="stats">
                <div className="stat-card"><span>Total Reports</span>
                  <strong>{loading ? "—" : reports.length}</strong>
                  <small>All submitted reports</small></div>
                <div className="stat-card"><span>Awaiting Collection</span>
                  <strong>{loading ? "—" : pending}</strong>
                  <small>Reported issues</small></div>
                <div className="stat-card"><span>Resolved</span>
                  <strong>{loading ? "—" : resolved}</strong>
                  <small>Completed reports</small></div>
              </section>
            )}

            <section className="panel">
              <div className="panel-heading">
                <div><h2>{page === "dashboard" ? "Recent Reports" : "All Waste Reports"}</h2>
                  <p className="muted">Waste collection activity across the city</p></div>
                <button className="primary" onClick={() => setPage("new")}>+ New Report</button>
              </div>

              {loading ? <p className="muted">Loading reports...</p> :
                reports.length === 0 ? <p className="muted">No reports yet. Submit the first report.</p> : (
                  <div className="table-wrap"><table>
                    <thead><tr><th>REPORT</th><th>LOCATION</th><th>CATEGORY</th><th>STATUS</th></tr></thead>
                    <tbody>{(page === "dashboard" ? reports.slice(0, 5) : reports).map((r) => (
                      <tr key={r.id}>
                        <td><strong>WC-{r.id}</strong><small className="cell-sub">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</small></td>
                        <td>{r.location}</td><td>{r.category}</td>
                        
<td>
  <select
    className="status-select"
    value={r.status || "REPORTED"}
    onChange={(e) => {
      const newStatus = e.target.value;
      updateStatus(r.id, newStatus);
    }}
  >
    <option value="REPORTED">REPORTED</option>
    <option value="IN_PROGRESS">IN PROGRESS</option>
    <option value="RESOLVED">RESOLVED</option>
  </select>
</td>

                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
            </section>
          </>
        )}
        <footer>Smart City Waste Collection Management <span>• Microservices Platform</span></footer>
      </main>
    </div>
  );
}

export default App;
