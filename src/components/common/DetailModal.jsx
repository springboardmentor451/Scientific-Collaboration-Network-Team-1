import React from 'react';
import { useData } from '../../context/DataContext';
import { X, ExternalLink } from 'lucide-react';

export default function DetailModal() {
  const { selectedEntity, closeDetailModal } = useData();

  if (!selectedEntity) return null;

  const { type, data } = selectedEntity;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 relative">
        <button
          onClick={closeDetailModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'paper' && (
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider mb-2 inline-block">
              {data.field}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{data.title}</h2>
            <p className="text-xs text-slate-500 mb-4">
              Authors: <strong className="text-slate-800">{data.authors?.join(', ')}</strong>
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Abstract:</span>
              <p className="text-slate-600 leading-relaxed">{data.abstract || 'No abstract provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-semibold">JOURNAL / VENUE</span>
                <span className="font-bold text-slate-800">{data.journal} ({data.year})</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-semibold">CITATIONS</span>
                <span className="font-bold text-indigo-600">{data.citations} Total</span>
              </div>
            </div>

            {data.doi && (
              <div className="flex justify-end">
                <a
                  href={`https://doi.org/${data.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <span>View Publisher DOI</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {type === 'researcher' && (
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <img src={data.avatar} alt={data.name} className="w-16 h-16 rounded-full object-cover border" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">{data.name}</h2>
                <p className="text-xs text-indigo-600 font-semibold">{data.role}</p>
                <p className="text-xs text-slate-400">{data.department}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">{data.bio}</p>

            <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4 bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">H-INDEX</span>
                <span className="font-bold text-slate-800">{data.hIndex}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">CITATIONS</span>
                <span className="font-bold text-indigo-600">{data.citations}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">PUBLICATIONS</span>
                <span className="font-bold text-slate-800">{data.publicationsCount}</span>
              </div>
            </div>
          </div>
        )}

        {type === 'conference' && (
          <div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded mb-2 inline-block">
              {data.status}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{data.name}</h2>
            <p className="text-xs text-slate-500 mb-4">{data.location} • {data.date}</p>
            <p className="text-xs text-slate-600 mb-4">
              Role: <strong className="text-slate-800">{data.role}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}