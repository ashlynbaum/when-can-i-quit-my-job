"use client";

interface CurrencyInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
  placeholder?: string;
}

export function CurrencyInput({
  value,
  onChange,
  min = 0,
  max,
  className = "",
  label,
  placeholder,
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[$,]/g, "");
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    } else if (val === "" || val === "-") {
      onChange(0);
    }
  };

  const formatValue = (val: number | null) => {
    if (val === null) return "";
    return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatValue(value)}
          onChange={handleChange}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`${className} !pl-7`}
        />
      </div>
    </div>
  );
}
