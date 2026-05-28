type OrderDetailsFieldProps = {
  label: string
  value?: string | number
}
export default function OrderDetailsField({ label, value }: OrderDetailsFieldProps) {
  return (
    <article className="flex min-w-0 flex-wrap items-start gap-1">
      <span className="font-medium break-words">{label}</span>
      <span className="text-dark-gray break-all">{value}</span>
    </article>

  )
}
