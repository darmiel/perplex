import { Chip, ChipProps } from "@nextui-org/react"
import {
  BsFastForwardCircleFill,
  BsPlayCircleFill,
  BsRewindCircleFill,
} from "react-icons/bs"

import { Meeting } from "@/api/types"
import {
  getMeetingTenseByMeeting,
  MeetingTense,
} from "@/components/meeting/MeetingTag"

type ChipMeta = ChipProps & { display: string }

const chips: Record<MeetingTense, ChipMeta> = {
  ongoing: {
    variant: "flat",
    color: "success",
    startContent: <BsPlayCircleFill size={18} />,
    display: "Ongoing",
  },
  future: {
    variant: "flat",
    color: "warning",
    startContent: <BsFastForwardCircleFill size={18} />,
    display: "Upcoming",
  },
  past: {
    variant: "flat",
    color: "secondary",
    startContent: <BsRewindCircleFill size={18} />,
    display: "Past",
  },
} as const

export default function MeetingChip({
  tense,
  meeting,
}: {
  tense?: MeetingTense
  meeting?: Meeting
}) {
  let props: ChipMeta
  if (tense) {
    props = chips[tense]
  } else if (meeting) {
    props = chips[getMeetingTenseByMeeting(meeting)]
  } else {
    throw new Error("MeetingChip: tense or meeting must be provided")
  }
  return <Chip {...props}>{props.display}</Chip>
}
