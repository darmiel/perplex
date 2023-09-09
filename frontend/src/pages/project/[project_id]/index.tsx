import { Checkbox, Chip, Tab, Tabs } from "@nextui-org/react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsPen, BsPlusCircleFill } from "react-icons/bs"
import { toast } from "sonner"

import { extractErrorMessage } from "@/api/util"
import ActionGrid from "@/components/action/sections/ActionGrid"
import CommentSuite from "@/components/comment/CommentSuite"
import MeetingDragDrop from "@/components/meeting/MeetingDragDrop"
import { MeetingGrid } from "@/components/meeting/sections/MeetingGrid"
import CreateMeeting from "@/components/modals/MeetingCreateModal"
import ProjectSectionManagePriorities from "@/components/project/sections/ProjectSectionManagePriorities"
import ProjectSectionManageTags from "@/components/project/sections/ProjectSectionManageTags"
import ProjectSectionManageUsers from "@/components/project/sections/ProjectSectionManageUsers"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import FetchUserTag from "@/components/user/FetchUserTag"
import { useAuth } from "@/contexts/AuthContext"
import { useLocalBoolState, useLocalStrState } from "@/hooks/localStorage"

export default function ProjectPage() {
  const [tab, setTab] = useLocalStrState("project-tab/selected-tab", "meetings")

  const [upcomingOnly, setUpcomingOnly] = useLocalBoolState(
    "project-tab/meeting-upcoming-only",
    false,
  )
  const [openOnly, setOpenOnly] = useLocalBoolState(
    "project-tab/action-open-only",
    false,
  )

  const [isEdit, setIsEdit] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)

  const router = useRouter()
  const { project_id: projectIDStr } = router.query
  const projectID = Number(projectIDStr)

  const { projects: projectDB, user } = useAuth()

  const projectInfoQuery = projectDB!.useFind(projectID)

  const projectEditMut = projectDB!.useEdit((_, { projectID }) => {
    toast.success(`Project #${projectID} updated`)
    setIsEdit(false)
  })

  if (!projectID || Array.isArray(projectID)) {
    return <div>Invalid URL</div>
  }

  if (projectInfoQuery.isLoading) {
    return <div>Loading Project Information...</div>
  }
  if (projectInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(projectInfoQuery.error)}</pre>
      </div>
    )
  }

  const isOwner = projectInfoQuery.data.data.owner_id === user?.uid

  const project = projectInfoQuery.data.data
  const dateCreated = project.CreatedAt
    ? new Date(project.CreatedAt)
    : undefined

  function enterEdit() {
    setEditName(project.name)
    setEditDescription(project.description)
    setIsEdit(true)
  }

  return (
    <div className="w-full bg-neutral-950 p-6 pl-10">
      <Head>
        <title>Perplex - P# {project.name ?? "Unknown Project"}</title>
      </Head>
      <div className="flex flex-col">
        <OverviewTitle
          creatorID={project.owner_id}
          title={project.name}
          titleID={project.ID}
          createdAt={dateCreated}
          setEditTitle={setEditName}
          isEdit={isEdit}
        />

        <OverviewContainer>
          <OverviewContent>
            <div className="bg-neutral-900 p-2 text-neutral-500">
              <RenderMarkdown markdown={project.description} />
            </div>

            <Hr className="my-6" />

            <Tabs
              variant="light"
              className="w-full"
              selectedKey={tab}
              onSelectionChange={(key) => setTab(key.toString())}
            >
              <Tab key="conversation" title="Conversation">
                <CommentSuite
                  projectID={projectID}
                  commentType="project"
                  commentEntityID={projectID}
                />
              </Tab>
              <Tab key="meetings" title="Meetings">
                <Flex
                  gap={4}
                  className="mb-6 transform flex-col rounded-md border border-neutral-700 bg-neutral-900 p-4 duration-300 hover:bg-neutral-950 md:flex-row"
                >
                  <MeetingDragDrop
                    className="h-36 w-full bg-neutral-950 md:w-5/12"
                    projectID={projectID}
                  />
                  <div className="w-full">
                    <h2 className="mb-2 text-xl font-semibold">
                      Import Meeting{" "}
                      <Chip variant="flat" color="warning">
                        BETA
                      </Chip>
                    </h2>
                    <ul className="text-neutral-400">
                      <li>
                        Drag and drop a{" "}
                        <code className="rounded-md bg-neutral-700 px-1 text-white">
                          .ics
                        </code>{" "}
                        file to import a meeting.
                      </li>
                      <li>
                        You can also drag and drop{" "}
                        <span className="text-white">a Mail</span>. Perplex will
                        try to parse the E-Mail and extract the meeting
                        information.
                      </li>
                    </ul>
                  </div>
                </Flex>
                <MeetingGrid
                  upcomingOnly={upcomingOnly}
                  projectID={projectID}
                  slots={
                    <Checkbox
                      isSelected={upcomingOnly}
                      onValueChange={setUpcomingOnly}
                    >
                      Upcoming Only
                    </Checkbox>
                  }
                />
              </Tab>
              <Tab key="actions" title="Actions">
                <ActionGrid
                  projectID={projectID}
                  openOnly={openOnly}
                  slots={
                    <Checkbox isSelected={openOnly} onValueChange={setOpenOnly}>
                      Open Only
                    </Checkbox>
                  }
                />
              </Tab>
            </Tabs>
          </OverviewContent>

          <OverviewSide>
            <OverviewSection name="Actions">
              {!isEdit ? (
                <div className="flex space-x-2">
                  <Button
                    className="w-full text-sm"
                    icon={<BsPen />}
                    onClick={() => enterEdit()}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowCreateMeeting(true)}
                    icon={<BsPlusCircleFill />}
                    className="w-fit"
                  >
                    Create Meeting
                  </Button>
                  {/* Create Topic Popup */}
                  <ModalPopup
                    open={showCreateMeeting}
                    setOpen={setShowCreateMeeting}
                  >
                    <CreateMeeting
                      projectID={projectID}
                      onClose={() => setShowCreateMeeting(false)}
                    />
                  </ModalPopup>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    className="w-1/2 text-sm"
                    style="primary"
                    isLoading={projectEditMut.isLoading}
                    onClick={() =>
                      projectEditMut.mutate({
                        projectID: project.ID,
                        name: editName,
                        description: editDescription,
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button
                    className="w-1/2 text-sm"
                    style="neutral"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </OverviewSection>
            <OverviewSection name="Owner">
              <div className="w-fit">
                <FetchUserTag userID={project.owner_id} />
              </div>
            </OverviewSection>
            <OverviewSection name="Members">
              <ProjectSectionManageUsers
                projectID={project.ID}
                isOwner={isOwner}
              />
            </OverviewSection>
            <OverviewSection name="Project Tags">
              <ProjectSectionManageTags
                projectID={project.ID}
                isOwner={isOwner}
              />
            </OverviewSection>
            <OverviewSection name="Project Priorities">
              <ProjectSectionManagePriorities
                projectID={project.ID}
                isOwner={isOwner}
              />
            </OverviewSection>
          </OverviewSide>
        </OverviewContainer>
      </div>
    </div>
    // <div className="flex-none w-full bg-neutral-900 p-6 border-x border-neutral-700 space-y-4">
    //   <MeetingList projectID={String(projectID)} />
    // </div>
  )
}
