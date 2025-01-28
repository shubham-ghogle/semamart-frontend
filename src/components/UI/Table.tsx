import { ReactNode } from "react";

type HeaderParams = {
  headers: string[];
};

type TableWrapperProps = {
  children: ReactNode
}
export function TableWrapper({ children }: TableWrapperProps) {
  return <div className="p-6 bg-white max-w-6xl mx-auto rounded-xl drop-shadow-md">
    <table className="w-full table-auto rounded-table">
      {children}
    </table>
  </div>
}

export function TableHeader({ headers }: HeaderParams) {
  return (
    <thead>
      <tr>
        {headers.map((el) => (
          <th key={el} className="p-4 text-darkBlue text-lg">
            {el}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableBodyCell({ text }: { text: string }) {
  return <td className="p-4 text-slate-800">{text}</td>;
}


type ProductDetailsRowsProps = {
  value: string
  label: string
}
export function ProductDetailsRows({ label, value }: ProductDetailsRowsProps) {
  return (
    <tr>
      <td className="p-2 font-semibold border border-darkBlue text-gray-800">{label}: </td>
      <td className="p-2 border border-darkBlue text-dark-700">{value}</td>
    </tr>
  );
}

