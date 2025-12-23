type OrderDetailsFieldProps = {
  label: string
  value?: string | number
}
export default function OrderDetailsField({ label, value }: OrderDetailsFieldProps) {
  return (
    <article className="flex  items-center gap-1">
      <span className="font-medium whitespace-nowrap">{label}</span>
      <span className="text-dark-gray">{value}</span>
    </article>

  )
}
