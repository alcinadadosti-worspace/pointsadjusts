import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/api';

interface WarningBannerProps {
  message: string;
  className?: string;
}

export default function WarningBanner({ message, className }: WarningBannerProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-200 px-4 py-3 rounded-xl text-sm mt-2 animate-in fade-in slide-in-from-top-1",
      className
    )}>
      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}