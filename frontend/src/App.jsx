
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./App.css";

const API = "http://localhost:8082/api/waste";

function App() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    location: "",
    category: "GENERAL",
    description: "",
  });

  // Search and filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  async function loadReports() {
    try {
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load reports.");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error("Loading reports error:", err);
      setError(
        "Unable to connect to the backend. Check that all services are running."
      );
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      setForm({
        location: "",
        category: "GENERAL",
        description: "",
      });

      await loadReports();
      setPage("reports");

      // Reset filters so the new report is easy to find.
      setSearch("");
      setStatusFilter("ALL");
      setCategoryFilter("ALL");

      alert("Waste report submitted successfully!");
    } catch (err) {
      console.error("Report submission error:", err);
      alert(
        "Could not submit the report. Please check the backend and try again."
      );
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
        throw new Error(message || "Status update failed.");
      }

      await loadReports();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Status update failed. Please try again.");
      await loadReports();
    }
  }

  // Dashboard statistics
  const pending = reports.filter(
    (report) => report.status === "REPORTED"
  ).length;

  const inProgress = reports.filter(
    (report) => report.status === "IN_PROGRESS"
  ).length;

  const resolved = reports.filter(
    (report) => report.status === "RESOLVED"
  ).length;


const totalReports = reports.length;

const unresolved = totalReports - resolved;

const resolutionRate =
  totalReports === 0
    ? 0
    : Math.round((resolved / totalReports) * 100);


  const categoryData = [
  {
    name: "General",
    reports: reports.filter((r) => r.category === "GENERAL").length,
  },
  {
    name: "Plastic",
    reports: reports.filter((r) => r.category === "PLASTIC").length,
  },
  {
    name: "Organic",
    reports: reports.filter((r) => r.category === "ORGANIC").length,
  },
  {
    name: "E-Waste",
    reports: reports.filter((r) => r.category === "E_WASTE").length,
  },
  {
    name: "Other",
    reports: reports.filter((r) => r.category === "OTHER").length,
  },
];

const statusData = [
  { name: "Reported", value: pending },
  { name: "In Progress", value: inProgress },
  { name: "Resolved", value: resolved },
];

const chartColors = ["#d8a342", "#56866b", "#9acb79"];

  // Filter reports by location, description, status and category.
  const filteredReports = reports.filter((report) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      (report.location || "").toLowerCase().includes(query) ||
      (report.description || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || report.status === statusFilter;

    const matchesCategory =
      categoryFilter === "ALL" ||
      report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Dashboard shows five recent reports; Reports shows all matching reports.
  const displayedReports =
    page === "dashboard"
      ? reports.slice(0, 5)
      : filteredReports;

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
  }

function exportReports() {
  const dataToExport =
    page === "reports" ? filteredReports : reports;

  if (dataToExport.length === 0) {
    alert("There are no reports to export.");
    return;
  }

  const headers = [
    "Report ID",
    "Location",
    "Category",
    "Description",
    "Status",
    "Created At",
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = dataToExport.map((report) => [
    `WC-${report.id}`,
    report.location,
    report.category,
    report.description,
    report.status || "REPORTED",
    report.createdAt
      ? new Date(report.createdAt).toLocaleString()
      : "",
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `waste-reports-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}


  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">SC</div>
          <div>
            <strong>SmartCity</strong>
            <small>WASTE MANAGEMENT</small>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <button
          className={page === "dashboard" ? "nav active" : "nav"}
          onClick={() => setPage("dashboard")}
        >
          ▦ Dashboard
        </button>

        <button
          className={page === "reports" ? "nav active" : "nav"}
          onClick={() => setPage("reports")}
        >
          ☷ Waste Reports
        </button>

        <button
          className={page === "new" ? "nav active" : "nav"}
          onClick={() => setPage("new")}
        >
          ＋ Report Waste
        </button>

        <div className="sidebar-bottom">
          <span className="online-dot" />
          Backend connection
          <small>Smart City · Hyderabad</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              SMART CITY / OPERATIONS
            </span>

            <h1>
              {page === "dashboard"
                ? "Dashboard"
                : page === "reports"
                  ? "Waste Reports"
                  : "Report Waste"}
            </h1>
          </div>

          <span className="live-badge">● LIVE DATA</span>
        </header>

        {error && <div className="error">{error}</div>}

        {page === "new" ? (
          <section className="panel form-panel">
            <h2>Submit a waste report</h2>
            <p className="muted">
              Provide the details of the waste issue.
            </p>

            <form onSubmit={submitReport}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                required
                value={form.location}
                placeholder="e.g. Bachupally, Hyderabad"
                onChange={(event) =>
                  setForm({
                    ...form,
                    location: event.target.value,
                  })
                }
              />

              <label htmlFor="category">Waste category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
              >
                <option value="GENERAL">General Waste</option>
                <option value="PLASTIC">Plastic</option>
                <option value="ORGANIC">Organic Waste</option>
                <option value="E_WASTE">Electronic Waste</option>
                <option value="OTHER">Other</option>
              </select>

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                required
                rows="4"
                value={form.description}
                placeholder="Describe the waste issue..."
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
              />

              <button className="primary" type="submit">
                Submit Report →
              </button>
            </form>
          </section>
        ) : (
          <>
            
{page === "dashboard" && (
  <section className="charts-grid">
    <div className="panel chart-panel">
      <h2>Waste by Category</h2>
      <p className="muted">
        Number of reports in each waste category
      </p>

      {loading ? (
        <p className="muted">Loading chart...</p>
      ) : (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e8eee9"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#68776e" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#68776e" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="reports"
                name="Reports"
                fill="#56866b"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>

    <div className="panel chart-panel">
      <h2>Report Status Distribution</h2>
      <p className="muted">
        Current progress of waste collection reports
      </p>

      {loading ? (
        <p className="muted">Loading chart...</p>
      ) : (
        <>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  innerRadius="48%"
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend">
            {statusData.map((item, index) => (
              <div className="legend-item" key={item.name}>
                <span
                  className="legend-dot"
                  style={{ backgroundColor: chartColors[index] }}
                />
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </section>
)}


{page === "dashboard" && (
  <section className="panel performance-panel">
    <div className="panel-heading">
      <div>
        <h2>Collection Performance</h2>
        <p className="muted">
          Overview of waste collection resolution
        </p>
      </div>
      <span className="performance-badge">
        {resolutionRate}% resolved
      </span>
    </div>

    <div className="performance-metrics">
      <div className="performance-metric">
        <span>Total Reports</span>
        <strong>{loading ? "—" : totalReports}</strong>
      </div>

      <div className="performance-metric">
        <span>Unresolved Reports</span>
        <strong>{loading ? "—" : unresolved}</strong>
      </div>

      <div className="performance-metric">
        <span>Resolved Reports</span>
        <strong>{loading ? "—" : resolved}</strong>
      </div>
    </div>

    <div className="progress-heading">
      <span>Resolution progress</span>
      <strong>{loading ? "—" : `${resolutionRate}%`}</strong>
    </div>

    <div
      className="progress-track"
      role="progressbar"
      aria-label="Report resolution progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={loading ? 0 : resolutionRate}
    >
      <div
        className="progress-fill"
        style={{
          width: loading ? "0%" : `${resolutionRate}%`,
        }}
      />
    </div>

    <p className="muted performance-note">
      {totalReports === 0
        ? "Submit a waste report to start tracking collection performance."
        : resolutionRate === 100
          ? "All reported waste issues have been resolved."
          : `${unresolved} report${unresolved === 1 ? "" : "s"} still require${unresolved === 1 ? "s" : ""} attention.`}
    </p>
  </section>
)}



            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {page === "dashboard"
                      ? "Recent Reports"
                      : "All Waste Reports"}
                  </h2>
                  <p className="muted">
                    Waste collection activity across the city
                  </p>
                </div>

                
<div className="panel-actions">
  {page === "reports" && (
    <button
      className="export-button"
      onClick={exportReports}
      disabled={loading || filteredReports.length === 0}
    >
      ↓ Export CSV
    </button>
  )}

  <button
    className="primary"
    onClick={() => setPage("new")}
  >
    + New Report
  </button>
</div>

              </div>

              {loading ? (
                <p className="muted">Loading reports...</p>
              ) : reports.length === 0 ? (
                <p className="muted">
                  No reports yet. Submit the first report.
                </p>
              ) : (
                <>
                  {page === "reports" && (
                    <div className="report-filters">
                      <input
                        type="search"
                        placeholder="Search location or description..."
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        aria-label="Search waste reports"
                      />

                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        aria-label="Filter by status"
                      >
                        <option value="ALL">All statuses</option>
                        <option value="REPORTED">Reported</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>

                      <select
                        value={categoryFilter}
                        onChange={(event) =>
                          setCategoryFilter(event.target.value)
                        }
                        aria-label="Filter by category"
                      >
                        <option value="ALL">All categories</option>
                        <option value="GENERAL">General Waste</option>
                        <option value="PLASTIC">Plastic</option>
                        <option value="ORGANIC">Organic Waste</option>
                        <option value="E_WASTE">Electronic Waste</option>
                        <option value="OTHER">Other</option>
                      </select>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}

                  {page === "reports" && (
                    <p className="muted result-count">
                      Showing {filteredReports.length} of{" "}
                      {reports.length} reports
                    </p>
                  )}

                  {displayedReports.length === 0 ? (
                    <p className="muted">
                      No reports match your filters.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>REPORT</th>
                            <th>LOCATION</th>
                            <th>CATEGORY</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                          </tr>
                        </thead>

                        <tbody>
                          {displayedReports.map((report) => (
                            <tr key={report.id}>
                              <td>
                                <strong>WC-{report.id}</strong>
                                <small className="cell-sub">
                                  {report.createdAt
                                    ? new Date(
                                        report.createdAt
                                      ).toLocaleString()
                                    : "—"}
                                </small>
                              </td>

                              <td>{report.location}</td>
                              <td>{report.category}</td>

                              <td>
                                <select
                                  className="status-select"
                                  value={
                                    report.status || "REPORTED"
                                  }
                                  onChange={(event) =>
                                    updateStatus(
                                      report.id,
                                      event.target.value
                                    )
                                  }
                                  aria-label={`Update status for report WC-${report.id}`}
                                >
                                  <option value="REPORTED">
                                    REPORTED
                                  </option>
                                  <option value="IN_PROGRESS">
                                    IN PROGRESS
                                  </option>
                                  <option value="RESOLVED">
                                    RESOLVED
                                  </option>
                                </select>
                              </td>
                              <td>
  <button
    type="button"
    className="details-button"
    onClick={() => setSelectedReport(report)}
  >
    View Details
  </button>
</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>

{selectedReport && (
  <div
    className="details-overlay"
    onClick={() => setSelectedReport(null)}
  >
    <section
      className="details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="details-heading">
        <div>
          <p className="eyebrow">WASTE REPORT DETAILS</p>
          <h2 id="details-title">
            Report WC-{selectedReport.id}
          </h2>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() => setSelectedReport(null)}
          aria-label="Close report details"
        >
          ×
        </button>
      </div>

      <div className="details-content">
        <div className="detail-field">
          <span>Location</span>
          <strong>{selectedReport.location || "—"}</strong>
        </div>

        <div className="detail-field">
          <span>Category</span>
          <strong>{selectedReport.category || "—"}</strong>
        </div>

        <div className="detail-field">
          <span>Status</span>
          <strong>
            {(selectedReport.status || "REPORTED").replace(
              "_",
              " "
            )}
          </strong>
        </div>

        <div className="detail-field">
          <span>Created At</span>
          <strong>
            {selectedReport.createdAt
              ? new Date(
                  selectedReport.createdAt
                ).toLocaleString()
              : "Not available"}
          </strong>
        </div>

        <div className="detail-field description-field">
          <span>Description</span>
          <p>
            {selectedReport.description ||
              "No description provided."}
          </p>
        </div>
      </div>

      <div className="details-footer">
        <button
          type="button"
          className="primary"
          onClick={() => setSelectedReport(null)}
        >
          Close Details
        </button>
      </div>
    </section>
  </div>
)}

          </>
        )}

        <footer>
          Smart City Waste Collection Management{" "}
          <span>• Microservices Platform</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
