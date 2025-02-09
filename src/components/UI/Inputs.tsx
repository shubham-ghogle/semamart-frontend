import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { RxCross2 } from "react-icons/rx";

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

type InputChipsProps = {
  label: string;
  values: string[];
  onAddChip: () => void;
  onDeleteChip: (i: number) => void;
  flexDir?: "flex-row" | "flex-col"
  disabled?: Boolean
} & InputHTMLAttributes<HTMLInputElement>;

export function InputChips({
  onDeleteChip,
  onAddChip,
  label,
  values,
  flexDir = "flex-row",
  disabled = false,
  ...inputProps
}: InputChipsProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <section className={"flex gap-2 " + flexDir + (flexDir === "flex-row" ? " items-center" : " justify-center")}>
        {values.length > 0 &&
          values.map((el, i) => (
            <span
              className="p-1 bg-bgGray rounded-sm flex items-center justify-between gap-1"
              key={i}
            >
              {el}
              <button onClick={() => onDeleteChip(i)} disabled={disabled}>
                <RxCross2 />
              </button>
            </span>
          ))}
        <input
          {...inputProps}
          id={label}
          className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
          disabled={disabled}
        />
        <button
          className="py-1 px-2 bg-accentBlue rounded-sm text-white text-sm"
          onClick={onAddChip}
          type="button"
          disabled={disabled}
        >
          Add
        </button>
      </section>
    </article>
  );
}

type TextareaProps = {
  label: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

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

type SelectInputProps = {
  label: string
  options: string[]
} & SelectHTMLAttributes<HTMLSelectElement>

export function SelectInput({ options, label, ...inputProps }: SelectInputProps) {
  return (
    <article className="mb-2">
      <label
        htmlFor={label}
        className="block text-darkGray font-medium text-sm mb-1"
      >
        {label}
      </label>
      <select
        {...inputProps}
        id={label}
        className="w-full bg-white px-2 py-1.5 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
      >
        {options && options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
}
