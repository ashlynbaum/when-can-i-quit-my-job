"use client";

import { useId } from "react";

type PercentInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function PercentInput({
  label,
  value,
  onChange,
  min = 0,
  max = 0.2,
  step = 0.001
}: PercentInputProps) {
  const id = useId();
  const percentValue = Number((value * 100).toFixed(3));

  const update = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    onChange(clamped);
  };

  return (
    <div className="space-y-2">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => update(Number(event.target.value))}
          className="w-full"
        />
        <div className="flex w-24 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs">
          <input
            type="number"
            min={min * 100}
            max={max * 100}
            step={step * 100}
            value={percentValue}
            onChange={(event) => update(Number(event.target.value) / 100)}
            className="w-full bg-transparent text-right focus:outline-none"
          />
          <span>%</span>
        </div>
      </div>
    </div>
  );
}
