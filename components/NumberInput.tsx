"use client";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  label?: string;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  label,
  placeholder,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, "");
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    } else if (val === "" || val === "-") {
      onChange(0);
    }
  };

  const formatValue = (val: number) => {
    return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input
        type="text"
        inputMode="numeric"
        value={formatValue(value)}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}
