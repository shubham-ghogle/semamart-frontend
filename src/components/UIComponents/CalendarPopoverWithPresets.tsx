import * as React from "react"
import {
  format,
  startOfToday,
  subDays,
  startOfWeek,
  startOfMonth,
} from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Props = {
  startDate: Date | undefined
  endDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  minDate: Date
}

export function CalendarPopoverWithPresets({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  minDate
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [customMode, setCustomMode] = React.useState(false)

  // Temporary state for custom range selection
  const [tempStartDate, setTempStartDate] = React.useState(startDate)
  const [tempEndDate, setTempEndDate] = React.useState(endDate)

  React.useEffect(() => {
    if (!open) {
      setCustomMode(false)
    }
  }, [open])

  const today = startOfToday()
  const yesterday = subDays(today, 1)
  const last7Days = subDays(today, 6)
  const last30Days = subDays(today, 29)
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const monthStart = startOfMonth(today)

  const presets = [
    { label: "Maximum", range: { start: minDate, end: new Date() } },
    { label: "Today", range: { start: today, end: today } },
    { label: "Yesterday", range: { start: yesterday, end: yesterday } },
    { label: "Last 7 days", range: { start: last7Days, end: today } },
    { label: "Last 30 days", range: { start: last30Days, end: today } },
    { label: "This week", range: { start: weekStart, end: today } },
    { label: "This month", range: { start: monthStart, end: today } },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-full max-w-[280px] justify-start font-normal flex items-center gap-2",
            !startDate && "text-muted-foreground"
          )}
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            minWidth: "160px",
          }}
        >
          <CalendarIcon className="h-4 w-4 flex-shrink-0" />
          {startDate && endDate ? (
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
            </span>
          ) : (
            <span>Select a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 max-w-[700px]" align="start">
        {!customMode ? (
          <div className="flex flex-col gap-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                className={cn(
                  "flex items-center justify-between w-full px-2 py-2 rounded hover:bg-accent text-left",
                  startDate?.getTime() === preset.range.start.getTime() &&
                  endDate?.getTime() === preset.range.end.getTime() &&
                  "bg-primary/10 font-medium"
                )}
                onClick={() => {
                  setStartDate(preset.range.start)
                  setEndDate(preset.range.end)
                  setOpen(false)
                }}
              >
                <span>{preset.label}</span>
                <span className="text-sm ml-5 text-muted-foreground">
                  {format(preset.range.start, "d MMM")} - {format(preset.range.end, "d MMM")}
                </span>
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-blue-600 hover:underline justify-start px-2"
              onClick={() => {
                setCustomMode(true)
                setTempStartDate(startDate)
                setTempEndDate(endDate)
              }}
            >
              Custom date range →
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-full flex flex-col gap-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">Select date range:</div>
            <div
              className="flex flex-col md:flex-row gap-3 max-h-[60vh] overflow-y-auto scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <Calendar
                mode="single"
                selected={tempStartDate}
                onSelect={setTempStartDate}
                className="rounded-md border max-w-full md:max-w-[300px]"
              />
              <Calendar
                mode="single"
                selected={tempEndDate}
                onSelect={setTempEndDate}
                className="rounded-md border max-w-full md:max-w-[300px]"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <Button variant="ghost" size="sm" onClick={() => setCustomMode(false)}>
                ← Back
              </Button>
              <Button
                onClick={() => {
                  if (tempStartDate && tempEndDate) {
                    setStartDate(tempStartDate)
                    setEndDate(tempEndDate)
                    setOpen(false)
                  }
                }}
                disabled={!tempStartDate || !tempEndDate}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

