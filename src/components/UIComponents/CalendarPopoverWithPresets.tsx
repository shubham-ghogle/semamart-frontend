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
  minDate,
}: Props) {
  const [open, setOpen] = React.useState(false)

  // Temporary state for selection inside the popover
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(startDate)
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(endDate)

  // left list selection (preset label)
  const [,setSelectedPreset] = React.useState<string | null>(null)

  // visible month controls for each calendar (jumpers)
  const [visibleMonthStart, setVisibleMonthStart] = React.useState<Date>(
    tempStartDate ? new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), 1) : startOfToday()
  )
  const [visibleMonthEnd, setVisibleMonthEnd] = React.useState<Date>(
    tempEndDate ? new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), 1) : startOfToday()
  )

  React.useEffect(() => {
    // sync temps when popover opens or outer props change
    setTempStartDate(startDate)
    setTempEndDate(endDate)
  }, [open, startDate, endDate])

  // keep visible months in sync when temps change
  React.useEffect(() => {
    if (tempStartDate) {
      setVisibleMonthStart(new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), 1))
    }
  }, [tempStartDate])

  React.useEffect(() => {
    if (tempEndDate) {
      setVisibleMonthEnd(new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), 1))
    }
  }, [tempEndDate])

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

  const timezone = Intl?.DateTimeFormat().resolvedOptions().timeZone ?? "Local Time"

  const onApply = () => {
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    setOpen(false)
  }

  const onCancel = () => {
    // revert temps to controlled values
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setOpen(false)
  }

  // helpers for month/year dropdowns
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const minYear = minDate.getFullYear()
  const maxYear = new Date().getFullYear()
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  const handlePresetClick = (p: { label: string; range: { start: Date; end: Date } }) => {
    setTempStartDate(p.range.start)
    setTempEndDate(p.range.end)
    setSelectedPreset(p.label)
    // update visible months too so calendars jump to the preset months
    setVisibleMonthStart(new Date(p.range.start.getFullYear(), p.range.start.getMonth(), 1))
    setVisibleMonthEnd(new Date(p.range.end.getFullYear(), p.range.end.getMonth(), 1))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-full max-w-[320px] justify-start font-normal flex items-center gap-2",
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

      {/* Responsive PopoverContent:
          - Stacks to column on small screens (flex-col)
          - Allows scrolling with a capped height on mobile
          - Presets become full width above calendars
      */}
      <PopoverContent className="w-full p-0 max-w-[920px] md:rounded-md md:shadow-lg" align="start" >
        <div className="flex flex-col md:flex-row gap-4 p-4 max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Left presets column (label changed) */}
          <aside className="w-full md:w-[220px] flex-shrink-0">
            <div className="text-sm font-semibold mb-3">Useful dates</div>

            <div className="rounded-md border bg-white shadow-sm overflow-y-auto max-h-[36vh] md:max-h-[420px]">
              <div className="p-2">
                {presets.map((p) => {
                  const isActive =
                    tempStartDate?.getTime() === p.range.start.getTime() &&
                    tempEndDate?.getTime() === p.range.end.getTime()
                  return (
                    <button
                      key={p.label}
                      onClick={() => handlePresetClick(p)}
                      className={cn(
                        "w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 focus:outline-none transition",
                        isActive ? "bg-primary/10 font-medium" : "bg-white"
                      )}
                    >
                      {/* custom radio */}
                      <span
                        className={cn(
                          "flex items-center justify-center h-4 w-4 rounded-full border",
                          isActive ? "border-primary bg-primary" : "border-gray-300 bg-white"
                        )}
                        aria-hidden
                      >
                        {isActive && <span className="h-2 w-2 rounded-full bg-white block" />}
                      </span>

                      <div className="flex-1">
                        <div className="text-sm">{p.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(p.range.start, "d MMM")} - {format(p.range.end, "d MMM")}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Main content: calendars (start + end) */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-md border p-3 shadow-sm">
              <div className="flex flex-col gap-4">
                {/* Calendars: stack on mobile, side-by-side on md+ */}
                <div className="flex flex-col md:flex-row gap-3">
                  {/* START calendar column */}
                  <div className="min-w-0 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Start</div>
                      {/* month/year controls for START */}
                      <div className="flex items-center gap-2">
                        <select
                          value={visibleMonthStart.getMonth()}
                          onChange={(e) =>
                            setVisibleMonthStart(
                              new Date(visibleMonthStart.getFullYear(), Number(e.target.value), 1)
                            )
                          }
                          className="p-1 rounded border text-xs"
                        >
                          {monthNames.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <select
                          value={visibleMonthStart.getFullYear()}
                          onChange={(e) =>
                            setVisibleMonthStart(
                              new Date(Number(e.target.value), visibleMonthStart.getMonth(), 1)
                            )
                          }
                          className="p-1 rounded border text-xs"
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Calendar
                      key={`start-${visibleMonthStart.toISOString()}`}
                      mode="single"
                      selected={tempStartDate}
                      onSelect={(d: any) => setTempStartDate(d)}
                      defaultMonth={visibleMonthStart}
                      className="rounded-md border w-full md:max-w-[320px]"
                    />
                  </div>

                  {/* END calendar column */}
                  <div className="min-w-0 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">End</div>
                      {/* month/year controls for END */}
                      <div className="flex items-center gap-2">
                        <select
                          value={visibleMonthEnd.getMonth()}
                          onChange={(e) =>
                            setVisibleMonthEnd(new Date(visibleMonthEnd.getFullYear(), Number(e.target.value), 1))
                          }
                          className="p-1 rounded border text-xs"
                        >
                          {monthNames.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <select
                          value={visibleMonthEnd.getFullYear()}
                          onChange={(e) =>
                            setVisibleMonthEnd(new Date(Number(e.target.value), visibleMonthEnd.getMonth(), 1))
                          }
                          className="p-1 rounded border text-xs"
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Calendar
                      key={`end-${visibleMonthEnd.toISOString()}`}
                      mode="single"
                      selected={tempEndDate}
                      onSelect={(d: any) => setTempEndDate(d)}
                      defaultMonth={visibleMonthEnd}
                      className="rounded-md border w-full md:max-w-[320px]"
                    />
                  </div>
                </div>

                {/* Show the selected dates below the calendars (stack on mobile) */}
                <div className="mt-2 flex flex-col md:flex-row gap-2">
                  <input
                    readOnly
                    value={tempStartDate ? format(tempStartDate, "dd MMM yyyy") : ""}
                    className="flex-1 p-2 rounded border text-sm"
                    placeholder="Start"
                  />
                  <input
                    readOnly
                    value={tempEndDate ? format(tempEndDate, "dd MMM yyyy") : ""}
                    className="flex-1 p-2 rounded border text-sm"
                    placeholder="End"
                  />
                </div>

                {/* Bottom row: timezone + actions */}
                {/* Bottom row: timezone + actions */}
<div className="mt-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 justify-between">
  <div className="text-sm text-muted-foreground">Dates are shown in {timezone}</div>

  {/* <-- changed here: stack buttons on mobile, row on md+ */}
  <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={onCancel}
      className="w-full md:w-auto"
    >
      Cancel
    </Button>
    <Button
      size="sm"
      onClick={onApply}
      disabled={!tempStartDate || !tempEndDate}
      className="w-full md:w-auto"
    >
      Update
    </Button>
  </div>
</div>

              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
