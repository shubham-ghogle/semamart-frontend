import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from "../ui/command"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import React from "react"
import { Button } from "../ui/button"

type AutocompleteProps = {
  listItems: { value: string; label: string }[];
  placeholder: string;
  setValue: (value: string) => void;
  value: string
}

export function Autocomplete({ listItems, placeholder, value, setValue }: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? listItems.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="w-full">
            <CommandEmpty>No Items</CommandEmpty>
            <CommandGroup>
              {listItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
