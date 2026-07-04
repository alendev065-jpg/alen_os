type Props = { title: string; subtitle: string };

export default function Placeholder({ title, subtitle }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream">
        <div className="px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-6 font-mono text-xs tracking-widest text-black/50">{subtitle}</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-8xl text-alen-black mb-4">{title}</div>
          <div className="font-mono text-xs text-black/40 tracking-widest">MODULE UNDER DEVELOPMENT // COMING ONLINE</div>
          <div className="w-48 h-1 bg-alen-red mx-auto mt-6" />
        </div>
      </div>
      <div className="border-t-2 border-alen-black bg-alen-black text-white px-6 py-2">
        <span className="font-mono text-xs tracking-widest">ALEN.STUDIO // OPERATIONAL_STATUS: OPTIMAL // VERSION_4.0.2</span>
      </div>
    </div>
  );
}
