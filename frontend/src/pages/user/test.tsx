import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Progress,
} from "@nextui-org/react"
import { BsArchive, BsChat, BsPlayCircleFill } from "react-icons/bs"

import Flex from "@/components/ui/layout/Flex"

/*
      <CardBody className="px-3 py-0 text-small text-default-400">
        <p>
          Frontend developer and UI/UX enthusiast. Join me on this coding adventure!
        </p>
        <span className="pt-2">
          #FrontendWithZoey 
          <span className="py-2" aria-label="computer" role="img">
            💻
          </span>
        </span>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">4</p>
          <p className=" text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">97.1K</p>
          <p className="text-default-400 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
*/

export default function TestPage() {
  return (
    <Card className="h-fit max-w-[340px]">
      <CardHeader className="justify-between gap-2">
        <Flex className="gap-2">
          <Chip
            startContent={<BsPlayCircleFill size={18} />}
            variant="flat"
            color="success"
          >
            Ongoing
          </Chip>
          <div className="flex flex-col items-start justify-center gap-1">
            <h4 className="text-small text-default-600 font-semibold leading-none">
              My Meeting
            </h4>
            <h5 className="text-small text-default-400 tracking-tight">
              07. September 2023
            </h5>
          </div>
        </Flex>
        <Button color="primary" radius="full" size="sm" variant="solid">
          View
        </Button>
      </CardHeader>
      <CardBody className="text-small text-default-400 px-3 py-0">
        <div className="flex justify-between">
          <span>17:00</span>
          <span className="text-white">17:18</span>
          <span>17:30</span>
        </div>
        <Progress value={60} color="secondary" />
      </CardBody>
      <CardFooter className="justify-between">
        {/* Number of Comments */}
        <Chip
          startContent={<BsChat className="ml-1" size={10} />}
          variant="flat"
        >
          14
        </Chip>
        {/* Number of Topics */}
        <Chip
          startContent={<BsArchive className="ml-1" size={10} />}
          variant="flat"
        >
          14
        </Chip>
        {/* Assigned Users */}
        <AvatarGroup max={3} size="sm">
          <Avatar name="John" src="https://i.pravatar.cc/300?img=1" />
          <Avatar src="https://i.pravatar.cc/300?img=2" />
          <Avatar src="https://i.pravatar.cc/300?img=3" />
          <Avatar src="https://i.pravatar.cc/300?img=4" />
          <Avatar src="https://i.pravatar.cc/300?img=5" />
          <Avatar src="https://i.pravatar.cc/300?img=6" />
          <Avatar src="https://i.pravatar.cc/300?img=7" />
        </AvatarGroup>
      </CardFooter>
    </Card>
  )
}
