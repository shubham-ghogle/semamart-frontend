import { ReactNode } from "react";

type HeaderParams = {
  headers: string[];
};

type TableWrapperProps = {
  children: ReactNode;
};

export function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="p-6 bg-white max-w-6xl mx-auto rounded-xl drop-shadow-md">
      <table className="w-full table-auto rounded-table">{children}</table>
    </div>
  );
}

export function TableHeader({ headers }: HeaderParams) {
  return (
    <thead>
      <tr>
        {headers.map((el) => (
          <th key={el} align="left" className="p-2 text-dark-blue text-lg">
            {el}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ✅ Updated to accept string | number | undefined | null
export function TableBodyCell({ text }: { text: string | number | undefined | null }) {
  return <td className="p-2 text-slate-800">{text?.toString() ?? "-"}</td>;
}

type TableImageCellProps = {
  src: string;
};
export function TableImageCell({ src }: TableImageCellProps) {
  return (
    <td align="center">
      <img src={src} width={60} />
    </td>
  );
}

type ProductDetailsRowsProps = {
  value: string | number | undefined | null;
  label: string;
};
export function ProductDetailsRows({ label, value }: ProductDetailsRowsProps) {
  return (
    <tr>
      <td className="p-2 font-semibold border border-dark-blue text-gray-800">{label}: </td>
      <td className="p-2 border border-dark-blue text-dark-700">{value?.toString() ?? "-"}</td>
    </tr>
  );
}
