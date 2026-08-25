import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", children, ...props }: LabelProps) {
  return (
    <label 
      className={`block text-sm font-semibold text-slate-800 ${className}`} 
      {...props}
    >
      {children}
    </label>
  );
}
