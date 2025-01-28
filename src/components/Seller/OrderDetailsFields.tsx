type OrderDetailsFieldProps = {
  label: string
  value?: string | number
}
export default function OrderDetailsField({ label, value }: OrderDetailsFieldProps) {
  return (
    <article className="flex items-center gap-1">
      <h5 className="">{label}</h5>
      <p className="text-darkGray">{value}</p>
    </article>
  )
}
