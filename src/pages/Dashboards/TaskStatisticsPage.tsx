import { useEffect, useMemo, useState, type JSX } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import DashboardReportServices from "../../services/DashboardReportServices";

// Tailwind-based responsive page. Default export a single React component.
// NOTE: install Recharts in your project: `npm install recharts` or `yarn add recharts`

type SeriesPoint = {
  period: string | null; // ISO string or null
  tasks_created: number;
  tasks_completed: number;
  avg_progress: number | null;
};

type StatsPayload = {
  meta: {
    start_date: string | null;
    end_date: string | null;
    granularity: string;
    role: string;
  };
  stats: {
    total_tasks: number;
    completed: number;
    overdue: number;
    avg_progress: number;
  };
  breakdowns: {
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
  };
  series: SeriesPoint[];
};

export default function TaskStatisticsPage(): JSX.Element {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [granularity, setGranularity] = useState<
    "day" | "week" | "month" | "hour"
  >("day");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<StatsPayload | null>(null);
  const [isNarrow, setIsNarrow] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth <= 640);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Short, friendly label depending on granularity
  function formatLabel(period?: string | null) {
    if (!period) return "";
    const d = new Date(period);
    try {
      if (granularity === "hour") {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // "08:00 PM"
      }
      // day / week / month: show day + short month
      return d.toLocaleDateString([], { day: "2-digit", month: "short" }); // "23 Mar"
    } catch {
      return d.toLocaleString();
    }
  }

  // Tooltip formatter for numbers
  function tooltipFormatter(value: any, name: string) {
    if (name === "avg_progress") {
      return [`${Number(value).toFixed(1)}%`, "Avg progress"];
    }
    return [value, name === "Created" ? "Created" : "Completed"];
  }

  // Fetch function
  const FetchTaskStats = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (granularity) params.set("granularity", granularity);
    const parm = params.toString();

    DashboardReportServices.FetchStatistics(parm)
      .then((r) => {
        console.log("analytics: ", r);
        setPayload(r);
      })
      .catch((e) => {
        console.log("error: ", e);
      });
  };

  useEffect(() => {
    FetchTaskStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, granularity]);

  const seriesData = useMemo(() => {
    if (!payload?.series) return [] as any;
    return payload.series.map((p) => {
      const label = p.period ? new Date(p.period).toLocaleString() : "Unknown";
      return {
        label,
        tasks_created: p.tasks_created || 0,
        tasks_completed: p.tasks_completed || 0,
        avg_progress: p.avg_progress ?? 0,
      };
    });
  }, [payload]);

  function downloadCSV() {
    if (!payload) return;
    const headers = [
      "period",
      "tasks_created",
      "tasks_completed",
      "avg_progress",
    ];
    const rows = payload.series.map((s) => [
      s.period ?? "",
      String(s.tasks_created),
      String(s.tasks_completed),
      String(s.avg_progress ?? ""),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const nameStart = (startDate || "").replace(/-/g, "") || "start";
    const nameEnd = (endDate || "").replace(/-/g, "") || "end";
    a.href = url;
    a.download = `task-stats_${nameStart}_${nameEnd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Tasks — Statistics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Time series, breakdowns and exports for Admins & Managers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setChartType(chartType === "line" ? "bar" : "line")
              }
              className="px-3 py-2 rounded-md bg-white border text-sm whitespace-nowrap"
            >
              Toggle: {chartType === "line" ? "Line" : "Bar"}
            </button>

            <button
              onClick={downloadCSV}
              className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 items-end">
          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Start date</span>
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="px-3 py-2 rounded-md border"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">End date</span>
            <input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              className="px-3 py-2 rounded-md border"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-xs text-slate-500 mb-1">Granularity</span>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as any)}
              className="px-3 py-2 rounded-md border"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts area (spans 2 cols on large) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-4">
            <div className="h-72 sm:h-96">
              {/* responsive height */}
              {loading && (
                <div className="text-sm text-slate-500">Loading…</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}

              {!loading && !error && payload && seriesData.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-slate-500">
                  No time-series data for selected range.
                </div>
              )}

              {!loading && !error && payload && seriesData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart
                      data={seriesData}
                      margin={{
                        top: 8,
                        right: 16,
                        left: 0,
                        bottom: isNarrow ? 56 : 16,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickFormatter={(v) =>
                          v ? formatLabel((v as string) || "") : ""
                        }
                        tick={{ fontSize: isNarrow ? 10 : 12, fill: "#475569" }}
                        angle={isNarrow ? -45 : 0}
                        textAnchor={isNarrow ? "end" : "middle"}
                        height={isNarrow ? 56 : 36}
                        interval={isNarrow ? "preserveStartEnd" : undefined}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontSize: isNarrow ? 12 : 13 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="tasks_created"
                        stroke="#0f172a"
                        name="Created"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="tasks_completed"
                        stroke="#06b6d4"
                        name="Completed"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avg_progress"
                        stroke="#7c3aed"
                        name="Avg progress"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <BarChart
                      data={seriesData}
                      margin={{
                        top: 8,
                        right: 16,
                        left: 0,
                        bottom: isNarrow ? 56 : 16,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickFormatter={(v) =>
                          v ? formatLabel((v as string) || "") : ""
                        }
                        tick={{ fontSize: isNarrow ? 10 : 12, fill: "#475569" }}
                        angle={isNarrow ? -45 : 0}
                        textAnchor={isNarrow ? "end" : "middle"}
                        height={isNarrow ? 56 : 36}
                        interval={isNarrow ? "preserveStartEnd" : undefined}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontSize: isNarrow ? 12 : 13 }}
                      />
                      {/* explicit fills so bars don't end up black */}
                      <Bar
                        dataKey="tasks_created"
                        name="Created"
                        fill="#0f172a"
                      />
                      <Bar
                        dataKey="tasks_completed"
                        name="Completed"
                        fill="#06b6d4"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* small summary */}
            {payload && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-xs text-slate-500">Total tasks</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {payload.stats.total_tasks}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-xs text-slate-500">Completed</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {payload.stats.completed}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-xs text-slate-500">Avg progress</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {payload.stats.avg_progress}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: breakdowns */}
          <aside className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Breakdowns
                </div>
                <div className="text-xs text-slate-500">Status & Priority</div>
              </div>
            </div>

            {payload ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">By status</div>
                  <div className="space-y-2">
                    {Object.entries(payload.breakdowns.by_status).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="capitalize text-slate-700">
                            {k.replace(/_/g, " ")}
                          </div>
                          <div className="text-slate-500">{v}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-2">By priority</div>
                  <div className="space-y-2">
                    {Object.entries(payload.breakdowns.by_priority).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="capitalize text-slate-700">
                            {k.toLowerCase()}
                          </div>
                          <div className="text-slate-500">{v}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => FetchTaskStats()}
                    className="w-full px-3 py-2 rounded-md bg-slate-900 text-white"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">No data</div>
            )}
          </aside>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-center">
          Data powered by your Task statistics API
        </div>
      </div>
    </div>
  );
}
