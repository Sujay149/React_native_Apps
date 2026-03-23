const StatsCards = ({ stats }) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((card) => (
        <article
          key={card.title}
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20"
        >
          <div
            className={`absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br opacity-30 blur-2xl ${card.accent}`}
          />
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
          <p className="mt-2 text-sm text-slate-400">{card.subtext}</p>
        </article>
      ))}
    </section>
  );
};

export default StatsCards;
