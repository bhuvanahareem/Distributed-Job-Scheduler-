interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: Props) {
  return (
    <label className={`inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      {label && <span className="ml-3 text-sm font-medium text-ink">{label}</span>}
    </label>
  );
}
