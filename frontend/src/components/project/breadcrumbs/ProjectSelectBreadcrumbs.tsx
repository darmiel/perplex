import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react"
import clsx from "clsx"
import { BsChevronDown } from "react-icons/bs"

import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectSelectBreadcrumbs({
  projectID,
}: {
  projectID: number
}) {
  const { projects } = useAuth()
  const projectListQuery = projects!.useList()

  return (
    <>
      <ResolveProjectName projectID={projectID} />
      {!!projectListQuery.data?.data?.length && (
        <>
          <Dropdown maxHeight={8}>
            <DropdownTrigger>
              <Button
                isIconOnly
                endContent={<BsChevronDown />}
                size="sm"
                variant="light"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Routes-Projects"
              disabledKeys={[projectID]}
              className="max-h-64 overflow-y-scroll"
            >
              {projectListQuery.data.data.map((p) => (
                <DropdownItem
                  key={p.ID}
                  href={`/project/${p.ID}`}
                  onClick={(event) => event.preventDefault()}
                  className={clsx({
                    "text-neutral-400": projectID === p.ID,
                  })}
                >
                  {p.name}
                </DropdownItem>
              )) || <></>}
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </>
  )
}
