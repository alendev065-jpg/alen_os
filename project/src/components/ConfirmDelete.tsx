import { X } from 'lucide-react';

type Props = { label: string; onConfirm: () => void; onClose: () => void };

export default function ConfirmDelete({ label, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-red w-full max-w-sm">
        <div className="bg-alen-red text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">CONFIRM DELETE</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5">
          <p className="font-mono text-sm mb-4">Delete <strong>"{label}"</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onConfirm} className="flex-1 bg-alen-red text-white font-mono text-xs font-bold py-2 tracking-widest hover:bg-red-800 transition-colors">DELETE</button>
            <button onClick={onClose} className="flex-1 border-2 border-alen-black font-mono text-xs font-bold py-2 tracking-widest hover:bg-black/5 transition-colors">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}
