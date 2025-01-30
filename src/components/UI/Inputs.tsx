import { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...inputProps }: InputProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={inputProps.id}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
    </article>
  );
}


export function formatDate(date?: Date) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-IN")
}
