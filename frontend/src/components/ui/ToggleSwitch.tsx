import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  size = "md",
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  const sizeClasses =
    size === "sm"
      ? {
          wrapper: "w-8 h-4",
          knob: "after:h-3 after:w-3 after:top-[2px] after:start-[2px]",
          translate: "peer-checked:after:translate-x-4",
          labelText: "ms-2 text-xs",
        }
      : {
          wrapper: "w-11 h-6",
          knob: "after:h-5 after:w-5 after:top-[2px] after:start-[2px]",
          translate: "peer-checked:after:translate-x-full",
          labelText: "ms-3 text-sm",
        };

  return (
    <label
      htmlFor={id}
      className="inline-flex items-center cursor-pointer select-none group"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />

      {/* Toggle body */}
      <div
        className={`
          relative ${sizeClasses.wrapper}
          bg-gray-300 dark:bg-gray-700 rounded-full transition-all duration-200
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[color:var(--primary-light)]
          after:content-[''] after:absolute ${sizeClasses.knob}
          after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all
          ${sizeClasses.translate}
          peer-checked:after:border-white
          peer-checked:bg-[color:var(--primary)]
        `}
      ></div>

      {/* Label text */}
      <span
        className={`
          ${sizeClasses.labelText} font-medium transition-colors duration-200
          ${checked ? "text-[color:var(--primary)]" : "text-gray-900 dark:text-gray-200"}
        `}
      >
        {label}
      </span>
    </label>
  );
};
