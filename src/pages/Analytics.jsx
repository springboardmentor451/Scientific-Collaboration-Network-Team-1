import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  TrendingUp,
  Users,
  BookOpen,
  Quote,
  Globe2,
  CalendarDays,
  Activity,
  Award,
  Presentation,
} from "lucide-react";

const yearlyData = [
  { year: "2021", publications: 32, citations: 180 },
  { year: "2022", publications: 45, citations: 245 },
  { year: "2023", publications: 58, citations: 330 },
  { year: "2024", publications: 74, citations: 421 },
  { year: "2025", publications: 91, citations: 541 },
];

const publisherData = [
  { name: "IEEE", value: 86 },
  { name: "Springer", value: 72 },
  { name: "Elsevier", value: 64 },
  { name: "ACM", value: 51 },
  { name: "Wiley", value: 43 },
];

const collaborationData = [
  { name: "Computer Science", value: 82 },
  { name: "Bioinformatics", value: 68 },
  { name: "Quantum Computing", value: 54 },
  { name: "Data Science", value: 46 },
  { name: "Physics", value: 37 },
];

const conferenceData = [
  { name: "ICML", value: 68 },
  { name: "ICCV", value: 54 },
  { name: "NeurIPS", value: 49 },
  { name: "AAAI", value: 42 },
  { name: "ACM", value: 35 },
];

export default function Analytics() {
  const [period, setPeriod] = useState("5 Years");

  const maxCitations = Math.max(
    ...yearlyData.map((item) => item.citations)
  );

  const maxPublications = Math.max(
    ...yearlyData.map((item) => item.publications)
  );

  const maxPublisher = Math.max(
    ...publisherData.map((item) => item.value)
  );

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              Insights
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Research Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand research growth, impact and collaboration activity.
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-pink-300"
          >
            <option>5 Years</option>
            <option>3 Years</option>
            <option>1 Year</option>
          </select>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            icon={<Users />}
            title="Researchers"
            value="128"
            change="+12.5%"
          />

          <AnalyticsCard
            icon={<BookOpen />}
            title="Publications"
            value="342"
            change="+18.2%"
          />

          <AnalyticsCard
            icon={<Quote />}
            title="Citations"
            value="541"
            change="+24.6%"
          />

          <AnalyticsCard
            icon={<Globe2 />}
            title="Institutions"
            value="18"
            change="+8.4%"
          />
        </div>

        {/* Research Output vs Impact + Conference Participation */}
        <div className="grid gap-5 xl:grid-cols-2">

          {/* Research Output vs Impact */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-500">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Research Output vs Impact
                  </h2>

                  <p className="text-xs text-slate-500">
                    Publications compared with citations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-pink-500" />
                  Publications
                </span>

                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" />
                  Citations
                </span>
              </div>

            </div>

            <div className="mt-7">

              {/* Chart */}
              <div className="relative h-64">

                {/* Grid */}
                <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">

                  {[0, 1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="border-t border-dashed border-slate-200"
                    />
                  ))}

                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-between gap-3 pb-8">

                  {yearlyData.map((item) => {
                    const publicationHeight =
                      (item.publications / maxPublications) * 100;

                    const citationHeight =
                      (item.citations / maxCitations) * 100;

                    return (
                      <div
                        key={item.year}
                        className="flex h-full flex-1 items-end justify-center gap-1.5"
                      >

                        {/* Publication bar */}
                        <div className="group relative flex h-full w-5 items-end justify-center">
                          <div
                            style={{
                              height: `${publicationHeight}%`,
                            }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-pink-500 to-pink-300 transition-all duration-300 hover:opacity-80"
                          >
                            <div className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                              {item.publications}
                            </div>
                          </div>
                        </div>

                        {/* Citation bar */}
                        <div className="group relative flex h-full w-5 items-end justify-center">
                          <div
                            style={{
                              height: `${citationHeight}%`,
                            }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-purple-300 transition-all duration-300 hover:opacity-80"
                          >
                            <div className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                              {item.citations}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                </div>

                {/* Years */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between">

                  {yearlyData.map((item) => (
                    <span
                      key={item.year}
                      className="flex-1 text-center text-[10px] font-semibold text-slate-400"
                    >
                      {item.year}
                    </span>
                  ))}

                </div>
              </div>

              {/* Bottom insight */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-pink-50 px-4 py-3">

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-pink-500" />

                  <span className="text-xs font-semibold text-slate-600">
                    Research impact is increasing steadily
                  </span>
                </div>

                <span className="text-xs font-bold text-pink-600">
                  +24.6%
                </span>

              </div>
            </div>
          </div>

          {/* Conference Participation by Publisher */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-500">
                  <Presentation className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Conference Participation
                  </h2>

                  <p className="text-xs text-slate-500">
                    Participation by publisher
                  </p>
                </div>

              </div>

              <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-600">
                2025
              </span>

            </div>

            <div className="mt-7 space-y-5">

              {publisherData.map((item, index) => (
                <div key={item.name}>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-50 text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>

                      <span className="text-xs font-semibold text-slate-600">
                        {item.name}
                      </span>

                    </div>

                    <span className="text-xs font-bold text-purple-500">
                      {item.value}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      style={{
                        width: `${(item.value / maxPublisher) * 100}%`,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
                    />

                  </div>

                </div>
              ))}

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-purple-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Total Participation
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  245
                </p>
              </div>

              <div className="rounded-xl bg-pink-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Growth
                </p>

                <p className="mt-1 text-xl font-bold text-pink-500">
                  +16.8%
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Research Performance + Conference Trend */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Research Performance */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-500">
                <Award className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Research Performance
                </h2>

                <p className="text-xs text-slate-500">
                  Key research activity indicators
                </p>
              </div>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">

              <PerformanceCard
                label="Published Papers"
                value="342"
                change="+18.2%"
              />

              <PerformanceCard
                label="Total Citations"
                value="541"
                change="+24.6%"
              />

              <PerformanceCard
                label="Research Projects"
                value="28"
                change="+14.1%"
              />

              <PerformanceCard
                label="International Papers"
                value="76"
                change="+31.8%"
              />

            </div>
          </div>

          {/* Conference Trend */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-500">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Conference Trend
                </h2>

                <p className="text-xs text-slate-500">
                  Research conference participation
                </p>
              </div>

            </div>

            <div className="mt-7 flex h-40 items-end gap-4">

              {conferenceData.map((item) => {

                const height =
                  (item.value / 68) * 100;

                return (
                  <div
                    key={item.name}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >

                    <span className="mb-2 text-[10px] font-bold text-slate-500">
                      {item.value}
                    </span>

                    <div
                      style={{
                        height: `${height}%`,
                      }}
                      className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-pink-500 to-orange-300 transition-all duration-300 hover:opacity-80"
                    />

                    <span className="mt-2 text-[10px] font-semibold text-slate-400">
                      {item.name}
                    </span>

                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* Collaboration + Overview */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Collaboration */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-500">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Collaboration Activity
                </h2>

                <p className="text-xs text-slate-500">
                  Active collaborations by field
                </p>
              </div>

            </div>

            <div className="mt-7 space-y-5">

              {collaborationData.map((item) => (
                <div key={item.name}>

                  <div className="mb-2 flex justify-between text-xs">

                    <span className="font-semibold text-slate-600">
                      {item.name}
                    </span>

                    <span className="font-bold text-pink-500">
                      {item.value}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      style={{
                        width: `${item.value}%`,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
                    />

                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* Overview */}
          <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Research Overview
                </h2>

                <p className="text-xs text-slate-500">
                  Current network performance
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <Overview
                label="Publication Growth"
                value="+18.2%"
              />

              <Overview
                label="Citation Growth"
                value="+24.6%"
              />

              <Overview
                label="New Researchers"
                value="+12.5%"
              />

              <Overview
                label="International Collaboration"
                value="+31.8%"
              />

              <Overview
                label="Active Projects"
                value="+14.1%"
              />

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

/* Analytics Card */
function AnalyticsCard({
  icon,
  title,
  value,
  change,
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">

      <div className="grid h-11 w-11 place-items-center rounded-xl bg-pink-50 text-pink-500">
        {React.cloneElement(icon, {
          className: "h-5 w-5",
        })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-1 flex items-end justify-between">

        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

        <span className="text-xs font-bold text-pink-500">
          {change}
        </span>

      </div>
    </div>
  );
}

/* Performance Card */
function PerformanceCard({
  label,
  value,
  change,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between">

        <p className="text-xl font-bold text-slate-900">
          {value}
        </p>

        <span className="text-[10px] font-bold text-pink-500">
          {change}
        </span>

      </div>
    </div>
  );
}

/* Overview */
function Overview({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="text-sm font-bold text-pink-500">
        {value}
      </span>

    </div>
  );
}