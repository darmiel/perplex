import { Button, Tooltip } from "@nextui-org/react"
import { add, format, intervalToDuration, sub } from "date-fns"
import { useState } from "react"
import { BsChevronRight } from "react-icons/bs"

import { DateTimePicker } from "@/components/ui/calendar/DateTimePicker"
import { formatDuration, mergeDates } from "@/util/date"

const quickDurations: Duration[] = [
  { minutes: 15 },
  { minutes: 30 },
  { hours: 1 },
]

export type StartEndDateTimePickerProps = {
  // the start date
  startDate: Date
  // the function to set the start date
  setStartDate: (date: Date) => void
  // the end date
  endDate: Date
  // the function to set the end date
  setEndDate: (date: Date) => void
}

export function StartEndDateTimePicker({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: StartEndDateTimePickerProps) {
  const [startTimeValue, setStartTimeValue] = useState<string>(() =>
    format(startDate, "HH:mm"),
  )

  const [endTimeValue, setEndTimeValue] = useState<string>(
    format(endDate, "HH:mm"),
  )

  const enableEndDate = startDate !== undefined

  const updateEndTime = (newEndTime: Date) => {
    setEndDate(newEndTime)
    if (newEndTime) {
      setEndTimeValue(format(newEndTime, "HH:mm"))
    } else {
      setEndTimeValue("00:00")
    }
  }

  const handleChangeStartTime = (newStartTime: Date) => {
    setStartDate(newStartTime)

    // if the end date is before the start date, update the end date
    if (endDate < newStartTime) {
      updateEndTime(mergeDates(newStartTime, endDate))
    }
  }

  // determine the color of the end date picker
  // default: no start date or end date
  // warning: start date is the same as the end date
  // danger: start date is after the end date
  const color =
    startDate && endDate
      ? startDate < endDate
        ? "default"
        : startDate.getTime() == endDate.getTime()
          ? "warning"
          : "danger"
      : "default"

  const dateDifference = intervalToDuration({ start: startDate, end: endDate })

  return (
    <div className="flex flex-col items-center space-x-2 space-y-2 md:flex-row md:space-y-0">
      <div className="flex flex-col items-center space-x-2 space-y-2 sm:flex-row sm:space-y-0">
        <DateTimePicker
          value={startDate}
          setValue={handleChangeStartTime}
          timeValue={startTimeValue}
          setTimeValue={setStartTimeValue}
        />
        <BsChevronRight />
        <DateTimePicker
          value={endDate}
          setValue={setEndDate}
          timeValue={endTimeValue}
          setTimeValue={setEndTimeValue}
          disabledMatcher={{
            before: startDate || new Date(),
          }}
          color={color}
          isDisabled={!enableEndDate}
        />
      </div>
      {/* Quick Pickers */}
      <div className="flex flex-row gap-1">
        <Button
          size="sm"
          radius="full"
          color="warning"
          className="min-w-0"
          onClick={() => updateEndTime(startDate)}
        >
          RST
        </Button>
        {quickDurations.map((duration, index) => {
          const formatted = formatDuration(duration)
          return (
            <Tooltip
              key={index}
              content={`[Shift]: +${formatted}, [Alt]: -${formatted}`}
            >
              <Button
                key={index}
                isDisabled={!endDate}
                size="sm"
                radius="full"
                className="min-w-0"
                onClick={(event) => {
                  const action = event.shiftKey
                    ? add
                    : event.altKey || event.ctrlKey
                      ? sub
                      : () => add(startDate, duration)
                  // if shift is pressed, subtract the duration
                  // otherwise add the duration
                  updateEndTime(action(endDate!, duration))
                }}
              >
                {formatDuration(duration)}
              </Button>
            </Tooltip>
          )
        })}
      </div>
      {/* Show Meeting Duration */}
      <span className="text-tiny text-neutral-300">
        {`(${formatDuration(dateDifference)})`}
      </span>
    </div>
  )
}
