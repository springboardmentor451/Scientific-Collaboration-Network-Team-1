import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  FileText,
  Download,
  BarChart3,
  Users,
  BookOpen,
  Building2,
  Quote,
  CheckCircle2,
} from "lucide-react";

const reports = [
  {
    title: "Publication Report",
    description: "Complete publication statistics and yearly trends.",
    icon: <BookOpen />,
    type: "Publication",
  },
  {
    title: "Researcher Report",
    description: "Researcher profiles, productivity and contribution data.",
    icon: <Users />,
    type: "Researcher",
  },
  {
    title: "Collaboration Report",
    description: "Institution and researcher collaboration activity.",
    icon: <BarChart3 />,
    type: "Collaboration",
  },
  {
    title: "Institution Report",
    description: "Institution-level research and publication statistics.",
    icon: <Building2 />,
    type: "Institution",
  },
  {
    title: "Citation Report",
    description: "Citation counts, impact and publication performance.",
    icon: <Quote />,
    type: "Citation",
  },
];

export default function Reports() {
  const [format, setFormat] = useState("CSV");
  const [generated, setGenerated] = useState("");

  const generateReport = (report) => {
    const data = [
      ["Report", report.title],
      ["Generated", new Date().toLocaleString()],
      ["Total Records", "342"],
      ["Status", "Generated"],
    ];

    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.type.toLowerCase()}-report.csv`;
    link.click();

    URL.revokeObjectURL(url);

    setGenerated(report.title);

    setTimeout(() => setGenerated(""), 2500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              Reporting
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Reports & Export
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Generate research, publication and collaboration reports.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm">
            {["CSV", "PDF"].map((item) => (
              <button
                key={item}
                onClick={() => setFormat(item)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  format === item
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ReportStat
            title="Reports Generated"
            value="128"
            icon={<FileText />}
          />
          <ReportStat
            title="Available Records"
            value="1,842"
            icon={<BarChart3 />}
          />
          <ReportStat
            title="Last Export"
            value="Today"
            icon={<Download />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {reports.map((report) => (
            <div
              key={report.title}
              className="group rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 text-pink-500">
                  {React.cloneElement(report.icon, {
                    className: "h-6 w-6",
                  })}
                </div>

                <div className="flex-1">
                  <h2 className="font-bold text-slate-900">
                    {report.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {report.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Format: {format}
                    </span>

                    <button
                      onClick={() => generateReport(report)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-100"
                    >
                      <Download className="h-4 w-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Recent Export
              </h2>
              <p className="text-xs text-slate-500">
                Your latest generated report
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            {generated ? (
              <p className="text-sm font-semibold text-pink-600">
                {generated} generated successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No report generated during this session.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ReportStat({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-pink-50 text-pink-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}