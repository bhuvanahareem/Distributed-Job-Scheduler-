import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  content: string;
  title?: string;
}

export function TerminalBlock({ content, title }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#0A1124] border-b border-[#1E293B]">
          <span className="text-xs font-mono text-muted-light">{title}</span>
          <button 
            onClick={handleCopy}
            className="text-muted-light hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
      <div className="terminal-block">
        {content || <span className="opacity-50 italic">No output</span>}
      </div>
    </div>
  );
}
