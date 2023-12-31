import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react"
import { format } from "date-fns"
import { Matcher } from "react-day-picker"
import { BsCalendar } from "react-icons/bs"

import { Calendar } from "@/components/ui/calendar/Calendar"

export type DateTimePickerProps = {
  // the date value (the value in the date calendar picker)
  value: Date
  // the function to set the date value
  setValue: (date: Date) => void
  // the time value (the value in the time input)
  timeValue: string
  // the function to set the time value
  setTimeValue: (time: string) => void
  // the matcher to disable certain dates
  disabledMatcher?: Matcher
  // the color of the date picker
  color?: "danger" | "warning" | "default"
  // whether the date picker is disabled
  isDisabled?: boolean
}

/**
 * DateTimePicker is a component that allows the user to select a date and time.
 * It contains two inputs: a date picker (Calendar) and a time picker (Input[type=time]).
 * @param param0 The props for the DateTimePicker component.
 * @returns
 */
export function DateTimePicker({
  value,
  setValue,
  timeValue,
  setTimeValue,
  disabledMatcher,
  color = "default",
  isDisabled,
}: DateTimePickerProps) {
  // make sure the end date is after the start date
  const handleSelectStartDate = (date?: Date) => {
    if (!timeValue || !date) {
      setValue(new Date())
      return
    }
    const [hours, minutes] = timeValue.split(":").map((n) => parseInt(n))
    const newValue = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
    )
    setValue(newValue)
  }

  const handleSelectStartTime = (time: string) => {
    // if no start date is selected, store the unparsed time string
    if (!value) {
      setTimeValue(time)
      return
    }
    const [hours, minutes] = time.split(":").map((n) => parseInt(n))
    const newDate = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      hours,
      minutes,
    )
    setValue(newDate)
    setTimeValue(time)
  }

  return (
    <>
      <Popover placement="bottom">
        <PopoverTrigger>
          <Button
            startContent={<BsCalendar />}
            color={color}
            isDisabled={isDisabled}
          >
            {value ? format(value, "dd.MM.yyyy") : "Select Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            initialFocus
            selected={value}
            onSelect={handleSelectStartDate}
            disabled={disabledMatcher}
            required
          />
        </PopoverContent>
      </Popover>
      <Input
        color={color}
        isDisabled={isDisabled}
        type="time"
        value={timeValue}
        onValueChange={handleSelectStartTime}
        labelPlacement="outside"
        placeholder="00:00"
        className="w-fit"
      />
    </>
  )
}
