import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = {
  label?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...inputProps }: InputProps) {
  return (
    <article className="">
      {label && (
        <label
          htmlFor={label}
          className="block text-darkGray font-medium text-sm mb-1"
        >
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={label}
        className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
    </article>
  );
}

export function InputChips({ label, ...inputProps }: InputProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={label}
        className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
    </article>
  );
}

type TextareaProps = {
  label: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ label, ...inputProps }: TextareaProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <textarea
        {...inputProps}
        className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
    </article>
  );
}

export function SelectInput({ label, ...inputProps }: InputProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={label}
        className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
    </article>
  );
}

export function InputCheckbox({ label, ...inputProps }: InputProps) {
  return (
    <article className="mb-2 flex items-center gap-1">
      <input
        {...inputProps}
        id={label}
        type="checkbox"
        className="focus:outline-none focus:ring-2 focus:ring-customBlue"
      />
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm"
      >
        {label}
      </label>
    </article>
  );
}

export function formatDate(date?: Date) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-IN")
}
