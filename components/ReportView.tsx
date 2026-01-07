
import React, { useState, useMemo } from 'react';
import { Employee, ValidationState } from '../types';
import { 
  Users, ShieldCheck, Printer, Building2, Search, Landmark, CreditCard, Hash, Globe
} from 'lucide-react';

interface Props {
  data: Employee[];
  validation: ValidationState;
}

const ReportView: React.FC<Props> = ({ data, validation }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(validation.validationTable[0]?.name || '');
  const [searchTerm, setSearchTerm] = useState('');

  const reportRef = useMemo(() => `REG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, []);
  const reportDate = useMemo(() => new Date().toLocaleString('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }), []);

  const regionalEmployees = useMemo(() => {
    return data.filter(emp => emp.SourceSheet === selectedRegion);
  }, [data, selectedRegion]);

  const stats = useMemo(() => {
    const locations = new Set(regionalEmployees.map(e => e.LOCATION)).size;
    const supervisors = regionalEmployees.filter(e => {
      const p = e.POSITION.toLowerCase();
      return p.includes('supervisor') || p.includes('lead') || p.includes('manager');
    }).length;
    return { total: regionalEmployees.length, locations, supervisors };
  }, [regionalEmployees]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return regionalEmployees;
    const s = searchTerm.toLowerCase();
    return regionalEmployees.filter(emp => 
      emp["NAME (ENG)"].toLowerCase().includes(s) || 
      emp["EMP#"].toString().includes(s) || 
      emp["ID#"]?.toString().includes(s) ||
      emp["NATIONALITY"]?.toLowerCase().includes(s)
    );
  }, [regionalEmployees, searchTerm]);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 4mm 5mm 4mm;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          
          #pdf-content {
            direction: ltr !important;
            text-align: left !important;
            font-family: 'Segoe UI', Tahoma, sans-serif !important;
            width: 100% !important;
          }

          /* Compact Printer Header */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 12px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 0.5pt solid #e2e8f0;
            padding-bottom: 1px;
            background: white;
            z-index: 1000;
          }

          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 10px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 0.5pt solid #e2e8f0;
            font-size: 4pt;
            color: #94a3b8;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
          }

          .content-wrapper {
            margin-top: 14px;
            margin-bottom: 12px;
          }

          /* Summary Bar - Micro Styling Matched to Image */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 12px !important;
            margin-bottom: 1px !important;
            background: #f8fafc !important;
            padding: 1px 6px !important;
            border-radius: 3px;
            border: 0.4pt solid #cbd5e1;
            align-items: center;
          }
          .kpi-item {
            display: flex !important;
            align-items: center !important;
            gap: 3px !important;
            font-size: 5.5pt !important;
            font-weight: 700;
            color: #475569;
          }
          .kpi-label { color: #64748b; text-transform: uppercase; font-size: 4.8pt; font-weight: 900; }
          .kpi-value { color: #0d9488; font-weight: 900; }

          /* Table Design */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 6.5pt !important;
            border: 0.4pt solid #e2e8f0;
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #14b8a6 !important;
            color: white !important;
            border: 0.4pt solid #0d9488 !important;
            padding: 1.5px 4px !important;
            text-align: left !important;
            font-weight: 800;
            height: 14px;
          }
          td {
            border: 0.4pt solid #e2e8f0 !important;
            padding: 1px 4px !important;
            word-wrap: break-word;
            line-height: 1.0;
            height: 13px;
            vertical-align: middle;
            color: #334155;
          }
          tr:nth-child(even) { background-color: #f9fafb !important; }
          tr { page-break-inside: avoid !important; }

          h2 { font-size: 7.5pt !important; margin-bottom: 0.5px !important; color: #0d9488 !important; font-weight: 900; }
        }

        .print-header, .print-footer { display: none; }
        #pdf-content { direction: ltr; }
      `}</style>

      {/* Screen controls */}
      <div className="no-print bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-600 text-white rounded-xl shadow-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Regulatory Report Ledger</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Micro Layout v5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search ID, Name or Nat..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-teal-700 hover:bg-teal-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl transition-all"
          >
            <Printer size={18} /> Export 30-Row PDF
          </button>
        </div>
      </div>

      {/* Region selector */}
      <div className="no-print flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {validation.validationTable.map(reg => (
          <button
            key={reg.name}
            onClick={() => setSelectedRegion(reg.name)}
            className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap border-2 transition-all ${
              selectedRegion === reg.name 
                ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      <div id="pdf-content" className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-100 shadow-sm print:p-0 print:border-none print:shadow-none">
        
        {/* PDF Header Section */}
        <div className="print-header">
          <h1 className="text-[5pt] font-black text-slate-400 m-0 uppercase tracking-tighter">Operational Distribution Ledger</h1>
          <p className="text-[5pt] font-black text-slate-300 m-0 uppercase tracking-widest">REF: {reportRef}</p>
        </div>

        <div className="print-footer">
          <p className="m-0 font-bold uppercase tracking-tight">System Verified Audit • Confidential Regional Record • {selectedRegion}</p>
          <p className="m-0 opacity-60 font-mono">TS: {reportDate}</p>
        </div>

        <div className="content-wrapper">
          
          {/* Summary Row - Micro Styled like user image */}
          <div className="kpi-row">
            <div className="kpi-item">
              <span className="kpi-label">Region:</span>
              <span className="kpi-value text-slate-900 bg-teal-50 px-1 rounded uppercase">{selectedRegion}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Workforce:</span>
              <span className="kpi-value">{stats.total} Staff</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Locations:</span>
              <span className="kpi-value">{stats.locations} Areas</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Management:</span>
              <span className="kpi-value">{stats.supervisors} Supv</span>
            </div>
          </div>

          <section className="space-y-0.5">
            <h2 className="text-[7.5pt] font-black uppercase tracking-tight flex items-center justify-between">
              <span>DISTRIBUTION LEDGER</span>
            </h2>
            
            <div className="overflow-hidden border border-slate-200 rounded-sm print:border-slate-300">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '7%' }}>Emp#</th>
                    <th style={{ width: '22%' }}>Full Name</th>
                    <th style={{ width: '12%' }}>Nationality</th>
                    <th style={{ width: '13%' }}>Civil ID</th>
                    <th style={{ width: '15%' }}>Position</th>
                    <th style={{ width: '21%' }}>Location</th>
                    <th style={{ width: '10%' }}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i}>
                      <td className="font-mono font-bold text-slate-400">{emp["EMP#"]}</td>
                      <td className="font-bold text-slate-900">
                        {emp["NAME (ENG)"]}
                        <div className="no-print text-[5pt] text-slate-400 font-medium">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-bold text-slate-600 text-[6pt] uppercase">{emp["NATIONALITY"]}</td>
                      <td className="font-mono text-teal-700 font-black tracking-tighter">
                        {emp["ID#"] || "N/A"}
                      </td>
                      <td>{emp["POSITION"]}</td>
                      <td className="font-medium text-slate-600">
                        {emp["LOCATION"] || "General Area"}
                      </td>
                      <td className="font-bold text-slate-400 text-[5.5pt] uppercase">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-slate-400 font-bold italic text-[6pt]">No data available for {selectedRegion}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="hidden print:block mt-1">
            <p className="text-[4pt] font-bold text-slate-300 uppercase text-center tracking-[0.3em] border-t pt-0.5">
              REGULATORY CLEARANCE VERIFIED • {selectedRegion} • LOG: {reportRef}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
