import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FileText, Download, Filter, Loader2, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";

/**
 * ReportsPage
 * - Attempts to use a backend if available:
 *    POST /api/reports        -> creates a report (returns { id, status })
 *    GET  /api/reports/:id    -> returns report metadata (status, fileKey, etc.)
 *    GET  /api/reports/:id/download -> streams the file
 * - Falls back to client-side generation when no backend is reachable.
 * - Keeps generated report blobs in memory (object URLs) so the Download button works.
 *
 * Props:
 *  - apiBase (string) optional, default: '/api'
 *  - authToken (string) optional, a token to attach as Authorization header
 */

export default function ReportsPage({ apiBase = "/api", authToken = null } = {}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [generatedReports, setGeneratedReports] = useState([]);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; cleanupBlobUrls(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup helper
  const cleanupBlobUrls = () => {
    for (const r of generatedReports) if (r.blobUrl) try { URL.revokeObjectURL(r.blobUrl); } catch (e) {}
  };

  // Pretty size helper
  const prettySize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Build CSV from rows
  const buildCSV = (rows) => {
    if (!rows || rows.length === 0) return "";
    const keys = Object.keys(rows[0]);
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}`;
    const lines = [keys.join(",")];
    for (const r of rows) lines.push(keys.map(k => escape(r[k])).join(","));
    return lines.join("\n");
  };

  // Build PDF blob using jsPDF (lightweight table-like output)
  const buildPDFBlob = (title, rows) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = margin;
    doc.setFontSize(14);
    doc.text(title, margin, y);
    doc.setFontSize(10);
    y += 8;

    const keys = rows.length ? Object.keys(rows[0]) : [];
    const colWidth = 180 / Math.max(keys.length, 1);

    // header
    doc.setFontSize(9);
    let x = margin;
    for (const k of keys) {
      doc.text(String(k).toUpperCase(), x, y);
      x += colWidth;
    }
    y += 6;

    doc.setFontSize(8);
    for (let i = 0; i < rows.length; i++) {
      x = margin;
      const r = rows[i];
      for (const k of keys) {
        const txt = String(r[k] ?? "");
        doc.text(txt.length > 30 ? txt.slice(0, 30) + "..." : txt, x, y);
        x += colWidth;
      }
      y += 5;
      if (y > 280) { doc.addPage(); y = margin; }
    }

    return doc.output("blob");
  };

  // fallback fake data generator (for client-only mode)
  const generateFakeRows = (reportType) => {
    const rows = [];
    const today = new Date();
    const n = reportType === "Client Billing" ? 18 : 30;
    for (let i = 0; i < n; i++) {
      const date = new Date(today.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (reportType === "Client Billing") {
        rows.push({ invoice: `INV-${1000 + i}`, client: `Client ${i + 1}`, amount: (Math.random() * 5000 + 100).toFixed(2), due: date, status: Math.random() > 0.25 ? "Paid" : "Unpaid" });
      } else if (reportType === "Case Status Summary") {
        rows.push({ caseId: `CASE-${2000 + i}`, title: `Matter ${i + 1}`, owner: `Owner ${i % 6 + 1}`, status: ["Open","Closed","Pending"][i % 3], updated: date });
      } else if (reportType === "Task Productivity") {
        rows.push({ user: `User ${i % 8 + 1}`, tasks: Math.floor(Math.random() * 50), hours: (Math.random() * 40).toFixed(1), periodEnd: date });
      } else {
        rows.push({ metric: `Metric ${i + 1}`, value: (Math.random() * 100).toFixed(2), baseline: (Math.random() * 100).toFixed(2), measuredOn: date });
      }
    }
    return rows;
  };

  // Primary handler to generate a report. Tries backend first; falls back to client generation.
  const onGenerateReport = async (data) => {
    setError("");

    const reportTitle = `${data.reportType} (${data.dateRange})`;
    // optimistic UI entry
    const tempId = `local-${Date.now()}`;
    const tempEntry = { id: tempId, name: reportTitle, date: new Date().toISOString().split('T')[0], type: data.format, size: '-', status: 'processing' };
    setGeneratedReports(prev => [tempEntry, ...prev]);

    try {
      // try create server-side report (enqueue)
      const serverResp = await fetch(`${apiBase}/reports`, {
        method: 'POST',
        headers: authToken ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: data.reportType, dateRange: data.dateRange, format: data.format }),
      });

      if (serverResp.ok) {
        const body = await serverResp.json();
        // body should contain { id, status }
        const serverId = body.id;
        // replace temp entry with server one
        setGeneratedReports(prev => prev.map(r => r.id === tempId ? ({ ...r, id: serverId, status: body.status || 'pending' }) : r));

        // poll until ready
        await pollReportStatus(serverId);
        return;
      }

      // if server returned non-ok, treat as fallback
      const txt = await serverResp.text().catch(() => 'server error');
      throw new Error(txt || 'Server generate failed');
    } catch (err) {
      // fallback to client-side generation
      console.warn('Server generation failed — falling back to client-side:', err.message);
      try {
        const rows = generateFakeRows(data.reportType);
        let blob, filename;
        if (data.format === 'CSV') {
          const csv = buildCSV(rows);
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = `${data.reportType.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
          blob = buildPDFBlob(reportTitle, rows);
          filename = `${data.reportType.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        }
        const blobUrl = URL.createObjectURL(blob);
        const newReport = { id: `local-${Date.now()}`, name: reportTitle, date: new Date().toISOString().split('T')[0], type: data.format, size: prettySize(blob.size), filename, blobUrl, status: 'ready' };
        // replace temp entry
        setGeneratedReports(prev => [newReport, ...prev.filter(r => r.id !== tempId)]);
      } catch (inner) {
        setGeneratedReports(prev => prev.filter(r => r.id !== tempId));
        setError('Report generation failed: ' + inner.message);
      }
    }
  };

  // Polls the report endpoint until status ready/failed; then fetches the file to provide a downloadable blob URL
  const pollReportStatus = async (reportId, timeoutMs = 120000, intervalMs = 1500) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs && mountedRef.current) {
      try {
        const resp = await fetch(`${apiBase}/reports/${reportId}` , { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const meta = await resp.json();
        // update list status
        setGeneratedReports(prev => prev.map(r => r.id === reportId ? ({ ...r, status: meta.status || r.status || 'pending' }) : r));

        if (meta.status === 'ready') {
          // fetch file blob
          try {
            const dlResp = await fetch(`${apiBase}/reports/${reportId}/download`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
            if (!dlResp.ok) throw new Error(`Download failed ${dlResp.status}`);
            const blob = await dlResp.blob();
            const filename = meta.filename || `${meta.title?.replace(/\s+/g,'_') || 'report'}.${(meta.format || 'pdf').toLowerCase()}`;
            const blobUrl = URL.createObjectURL(blob);
            const newReport = { id: reportId, name: meta.title || `Report ${reportId}`, date: (meta.generatedAt || new Date()).toISOString().split('T')[0], type: (meta.format || 'PDF'), size: prettySize(blob.size), filename, blobUrl, status: 'ready' };
            setGeneratedReports(prev => [newReport, ...prev.filter(r => r.id !== reportId)]);
            return newReport;
          } catch (dlErr) {
            setError('Failed to download generated report: ' + dlErr.message);
            setGeneratedReports(prev => prev.map(r => r.id === reportId ? ({ ...r, status: 'failed' }) : r));
            return null;
          }
        }

        if (meta.status === 'failed') {
          setGeneratedReports(prev => prev.map(r => r.id === reportId ? ({ ...r, status: 'failed', error: meta.error }) : r));
          return null;
        }

      } catch (pollErr) {
        // network error — keep polling until timeout; if consistently failing, we'll fallback after timeout
        console.warn('Poll error', pollErr.message);
      }
      await new Promise(res => setTimeout(res, intervalMs));
    }

    // if we get here, timeout reached
    setError('Report generation timed out. You can retry or check server logs.');
    setGeneratedReports(prev => prev.map(r => r.id === reportId ? ({ ...r, status: 'failed' }) : r));
    return null;
  };

  const handleDelete = (reportId) => {
    // local cleanup; also optionally call server to delete
    const toRemove = generatedReports.find(r => r.id === reportId);
    if (toRemove?.blobUrl) URL.revokeObjectURL(toRemove.blobUrl);
    setGeneratedReports(prev => prev.filter(r => r.id !== reportId));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mb-6">Generate system reports</p>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="text-sky-500" />
              <h2 className="font-semibold">Generate New Report</h2>
            </div>

            <form onSubmit={handleSubmit(onGenerateReport)} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Report Type</label>
              <select className="input" {...register("reportType")} defaultValue="Case Status Summary" required>
                <option>Case Status Summary</option>
                <option>Client Billing</option>
                <option>Task Productivity</option>
                <option>Performance Analytics</option>
              </select>

              <label className="text-sm font-medium">Date Range</label>
              <select className="input" {...register("dateRange")} defaultValue="Last 30 Days" required>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Quarter</option>
                <option>Last Quarter</option>
              </select>

              <label className="text-sm font-medium">Format</label>
              <select className="input" {...register("format")} defaultValue="PDF" required>
                <option>PDF</option>
                <option>CSV</option>
              </select>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded ${isSubmitting ? 'opacity-70 cursor-not-allowed bg-sky-500 text-white' : 'bg-sky-600 text-white'}`}>
                {isSubmitting ? (<><Loader2 className="animate-spin"/> Generating...</>) : 'Generate Report'}
              </button>

              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

              
            </form>
          </div>

          <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-3">Generated Reports</h3>

            <div className="flex flex-col gap-3">
              {generatedReports.length === 0 && (
                <div className="text-slate-500">No reports yet — generate one on the left.</div>
              )}

              {generatedReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="text-sky-500" />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-slate-500">Generated on {new Date(report.date).toLocaleDateString()} • {report.type} • {report.size} • {report.status}</div>
                      {report.error && <div className="text-xs text-red-600">Error: {report.error}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.blobUrl ? (
                      <a href={report.blobUrl} download={report.filename} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded text-sm">
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      report.status === 'ready' ? (
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded text-sm" onClick={() => pollReportStatus(report.id)}>
                          <Download size={14} /> Fetch
                        </button>
                      ) : (
                        <button disabled className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded text-sm opacity-60">{report.status}</button>
                      )
                    )}

                    <button title="Remove" onClick={() => handleDelete(report.id)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 rounded text-sm">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-500">download</div>
          </div>
        </div>

        <style jsx>{`
          .input { padding: .5rem; border-radius: .375rem; border: 1px solid #e2e8f0; }
        `}</style>
      </div>
    </div>
  );
}
