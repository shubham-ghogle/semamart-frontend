type HeaderParams = {
  headers: string[];
};

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
