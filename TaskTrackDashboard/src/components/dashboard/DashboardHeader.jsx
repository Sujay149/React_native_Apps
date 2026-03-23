const DashboardHeader = ({ sourceUrl }) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">TaskTrack Analytics</p>
      <h1 className="mt-2 text-3xl font-black text-slate-50 sm:text-4xl">Task Command Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">Responsive charts and task intelligence from json-server task data.</p>
      <p className="mt-1 text-xs text-slate-500">Source: {sourceUrl}</p>
    </div>
  );
};

export default DashboardHeader;
