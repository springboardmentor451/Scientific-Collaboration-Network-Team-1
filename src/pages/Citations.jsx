import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Quote,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  BookOpen,
  BarChart3,
} from "lucide-react";

const citationData = [
  {
    id: 1,
    title: "Cross-Institutional Proteomic Data Mapping using Transformer Architectures",
    journal: "Nature Biotechnology",
    year: 2024,
    citations: 310,
    doi: "10.1038/example.2024.001",
    category: "Bioinformatics",
  },
  {
    id: 2,
    title: "Scalable Graph Neural Networks for Large-Scale Scientific Network Analysis",
    journal: "IEEE TPAMI",
    year: 2025,
    citations: 142,
    doi: "10.1109/example.2025.002",
    category: "Computer Science",
  },
  {
    id: 3,
    title: "Fault-Tolerant Quantum Circuit Mapping on Scalable Processing Units",
    journal: "Nature Physics",
    year: 2024,
    citations: 89,
    doi: "10.1038/example.2024.003",
    category: "Quantum Computing",
  },
  {
    id: 4,
    title: "Collaborative Machine Learning for Scientific Research",
    journal: "ACM Computing Surveys",
    year: 2023,
    citations: 76,
    doi: "10.1145/example.2023.004",
    category: "Machine Learning",
  },
];

export default function Citations() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState(null);

  const categories = ["All", ...new Set(citationData.map((x) => x.category))];

  const filtered = useMemo(() => {
    return citationData.filter((item) => {
      const matchesSearch =
        `${item.title} ${item.journal} ${item.doi}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const copyDOI = async (doi, id) => {
    await navigator.clipboard?.writeText(doi);
    setCopied(id);

    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
            Research Impact
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Citations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track publication impact, citation growth and DOI information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Stat
            icon={<Quote />}
            title="Total Citations"
            value="617"
            detail="+18.4% this year"
          />
          <Stat
            icon={<BookOpen />}
            title="Tracked Publications"
            value="42"
            detail="Across 12 journals"
          />
          <Stat
            icon={<TrendingUp />}
            title="Citation Growth"
            value="+24%"
            detail="Compared with last year"
          />
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, journal or DOI..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition hover:shadow-lg hover:shadow-pink-100"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div className="flex gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-50 text-pink-500">
                    <Quote className="h-6 w-6" />
                  </div>

                  <div>
                    <span className="rounded-md bg-pink-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-600">
                      {item.category}
                    </span>

                    <h2 className="mt-2 max-w-3xl font-bold text-slate-900">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.journal} · {item.year}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-500">
                        DOI: {item.doi}
                      </span>

                      <button
                        onClick={() => copyDOI(item.doi, item.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"
                      >
                        {copied === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy DOI
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">
                  <div className="rounded-xl bg-orange-50 px-4 py-3 text-center">
                    <p className="text-xl font-bold text-orange-500">
                      {item.citations}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                      Citations
                    </p>
                  </div>

                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                    View DOI
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center">
            <Quote className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-600">
              No citation records found
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function Stat({ icon, title, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 text-pink-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-pink-500">{detail}</p>
    </div>
  );
}