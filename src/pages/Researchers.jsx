import React, { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useData } from '../context/DataContext';
import {
  Search,
  Filter,
  Mail,
  Phone,
  ChevronRight,
  X,
  Building2,
  Award,
  BookOpen,
  Quote,
  BriefcaseBusiness,
} from 'lucide-react';

export default function Researchers() {
  const { researchers = [] } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedResearcher, setSelectedResearcher] = useState(null);

  const departments = useMemo(() => {
    const list = researchers
      .map((researcher) => researcher.department)
      .filter(Boolean);

    return ['All', ...Array.from(new Set(list))];
  }, [researchers]);

  const filteredResearchers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return researchers.filter((person) => {
      const name = (person.name || '').toLowerCase();
      const role = (person.role || '').toLowerCase();
      const department = (person.department || '').toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        role.includes(query) ||
        department.includes(query);

      const matchesDepartment =
        selectedDepartment === 'All' ||
        person.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [researchers, searchQuery, selectedDepartment]);

  return (
    <MainLayout title="Researchers">
      <div className="space-y-5">

        {/* Search & Filter */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-pink-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">

            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search researchers, roles, or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-pink-50/30 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-purple-400 shrink-0" />

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full md:w-auto min-w-[180px] px-3 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 text-slate-700 font-medium cursor-pointer"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department === 'All'
                      ? 'All Departments'
                      : department}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {filteredResearchers.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-800">
              {researchers.length}
            </span>{' '}
            researchers
          </p>
        </div>

        {/* Researchers */}
        {filteredResearchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredResearchers.map((person) => (
              <div
                key={person.id}
                className="bg-white/90 backdrop-blur-xl rounded-xl border border-pink-100 shadow-sm p-5 hover:border-pink-300 hover:shadow-md transition-all group"
              >

                {/* Profile */}
                <div className="flex items-start gap-4">

                  <img
                    src={
                      person.avatar ||
                      'https://ui-avatars.com/api/?name=Researcher'
                    }
                    alt={person.name || 'Researcher'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-pink-100 shrink-0"
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                      {person.name || 'Researcher'}
                    </h3>

                    <p className="text-xs text-purple-600 font-medium truncate mt-0.5">
                      {person.role || 'Researcher'}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {person.department || 'Research Department'}
                    </p>

                  </div>

                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-4 min-h-[34px]">
                  {person.bio ||
                    'Researcher profile and academic information.'}
                </p>

                {/* Research Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-gradient-to-r from-pink-50/60 via-purple-50/50 to-blue-50/50 rounded-lg border border-pink-100">

                  <div className="text-center">
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      H-INDEX
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {person.hIndex || 0}
                    </span>
                  </div>

                  <div className="text-center border-x border-purple-100">
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      CITATIONS
                    </span>

                    <span className="text-sm font-bold text-purple-600">
                      {person.citations
                        ? person.citations.toLocaleString()
                        : 0}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      PAPERS
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {person.publicationsCount || 0}
                    </span>
                  </div>

                </div>

                {/* Expertise */}
                {person.expertise && (
                  <div className="mt-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Research Expertise
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(person.expertise)
                        ? person.expertise
                        : [person.expertise]
                      )
                        .slice(0, 3)
                        .map((item, index) => (
                          <span
                            key={index}
                            className="text-[9px] font-medium text-pink-600 bg-pink-50 border border-pink-100 px-2 py-1 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 mt-4 border-t border-pink-100 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />

                    <span className="text-[10px] text-slate-500 truncate">
                      {person.email || 'Email not available'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedResearcher(person)}
                    className="text-[10px] text-pink-600 font-semibold flex items-center shrink-0 hover:text-purple-700 transition-colors"
                  >
                    View Profile
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-pink-100 p-12 text-center">
            <Search className="w-8 h-8 text-pink-200 mx-auto" />

            <p className="text-sm font-semibold text-slate-700 mt-3">
              No researchers found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search or department filter.
            </p>
          </div>
        )}

      </div>

      {/* Researcher Profile Modal */}
      {selectedResearcher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedResearcher(null)}
        >
          <div
            className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 px-6 py-6">

              <button
                type="button"
                onClick={() => setSelectedResearcher(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">

                <img
                  src={
                    selectedResearcher.avatar ||
                    'https://ui-avatars.com/api/?name=Researcher'
                  }
                  alt={selectedResearcher.name || 'Researcher'}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/40 shadow-lg"
                />

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {selectedResearcher.name || 'Researcher'}
                  </h2>

                  <p className="text-sm text-pink-100 mt-1">
                    {selectedResearcher.role || 'Researcher'}
                  </p>

                  <p className="text-xs text-white/80 mt-1">
                    {selectedResearcher.department ||
                      'Research Department'}
                  </p>
                </div>

              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">

              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                    <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Email
                      </p>

                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {selectedResearcher.email ||
                          'Email not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Phone
                      </p>

                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {selectedResearcher.phone ||
                          selectedResearcher.phoneNumber ||
                          'Phone number not available'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  About Researcher
                </h3>

                <p className="text-xs text-slate-600 leading-5">
                  {selectedResearcher.bio ||
                    'Researcher profile and academic information is not available.'}
                </p>
              </div>

              {/* Research Information */}
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Research Information
                </h3>

                <div className="grid grid-cols-3 gap-2">

                  <div className="p-3 rounded-xl bg-pink-50/60 border border-pink-100 text-center">
                    <Award className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      H-Index
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {selectedResearcher.hIndex || 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                    <Quote className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Citations
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {selectedResearcher.citations
                        ? selectedResearcher.citations.toLocaleString()
                        : 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                    <BookOpen className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Papers
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {selectedResearcher.publicationsCount || 0}
                    </p>
                  </div>

                </div>
              </div>

              {/* Expertise */}
              {selectedResearcher.expertise && (
                <div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                    Research Expertise
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedResearcher.expertise)
                      ? selectedResearcher.expertise
                      : [selectedResearcher.expertise]
                    ).map((item, index) => (
                      <span
                        key={index}
                        className="text-[10px] font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1.5 rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {(selectedResearcher.specialization ||
                selectedResearcher.organization ||
                selectedResearcher.institution) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {(selectedResearcher.organization ||
                    selectedResearcher.institution) && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">
                          Institution
                        </p>
                        <p className="text-xs font-semibold text-slate-700">
                          {selectedResearcher.organization ||
                            selectedResearcher.institution}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedResearcher.specialization && (
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">
                          Specialization
                        </p>
                        <p className="text-xs font-semibold text-slate-700">
                          {selectedResearcher.specialization}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedResearcher(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 hover:from-pink-600 hover:via-purple-700 hover:to-blue-600 text-white text-xs font-semibold transition-all shadow-md shadow-pink-100"
              >
                Close Profile
              </button>

            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}