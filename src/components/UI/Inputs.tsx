import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
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
  onAddTag: () => void;
  onDeleteTag: (i: number) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputChips({
  onDeleteTag,
  onAddTag,
  label,
  values,
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
      <section className="flex items-center gap-2">
        {values.length > 0 &&
          values.map((el, i) => (
            <span
              className="p-1 bg-bgGray rounded-sm flex items-center gap-1"
              key={i}
            >
              {el}
              <button onClick={() => onDeleteTag(i)}>
                <RxCross2 />
              </button>
            </span>
          ))}
        <input
          {...inputProps}
          id={label}
          className="w-full px-2 py-1 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
        />
        <button
          className="py-1 px-2 bg-accentBlue rounded-sm text-white text-sm"
          onClick={onAddTag}
          type="button"
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
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
}
