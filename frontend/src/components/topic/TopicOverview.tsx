import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Textarea,
  Tooltip,
} from "@nextui-org/react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  BsArrowLeft,
  BsArrowRight,
  BsBack,
  BsCheck,
  BsEyeFill,
  BsEyeSlash,
  BsHouse,
  BsPen,
  BsTrash,
  BsTrashFill,
} from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { Comment } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import CommentSuite from "@/components/comment/CommentSuite"
import MeetingSelectBreadcrumbs from "@/components/meeting/breadcrumbs/MeetingSelectBreadcrumbs"
import {
  AckTopicTypeCard,
  DiscussTopicTypeCard,
} from "@/components/modals/TopicCreateModal"
import ProjectSelectBreadcrumbs from "@/components/project/breadcrumbs/ProjectSelectBreadcrumbs"
import PriorityPickerWithEdit from "@/components/project/priority/PriorityPickerWithEdit"
import ResolveMeetingName from "@/components/resolve/ResolveMeetingName"
import TopicSelectBreadcrumbs from "@/components/topic/breadcrumbs/TopicSelectBreadcrumbs"
import TopicSectionCreateAction from "@/components/topic/section/TopicSectionCreateAction"
import TopicTag from "@/components/topic/TopicTag"
import Hr from "@/components/ui/Hr"
import SectionAssignTags from "@/components/ui/overview/common/SectionAssignTags"
import SectionAssignUsers from "@/components/ui/overview/common/SectionAssignUsers"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import UserTagList from "@/components/ui/tag/UserTagList"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

function SectionParticipants({
  projectID,
  topicID,
}: {
  projectID: number
  topicID: number
}) {
  const { comments } = useAuth()
  const commentListQuery = comments!.useList(projectID, "topic", topicID)

  if (commentListQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (commentListQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(commentListQuery.error)}</pre>
      </div>
    )
  }
  const userIDs: { [key: string]: any } = {}
  for (const comment of commentListQuery.data.data) {
    userIDs[comment.author_id] = true
  }
  return <UserTagList users={Object.keys(userIDs)} />
}

export default function TopicOverview({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: number
  meetingID: number
  topicID: number
}) {
  const [isEdit, setIsEdit] = useState(false)

  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editForceSolution, setEditForceSolution] = useState(false)
  const [editPriorityID, setEditPriorityID] = useState<number>(0)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [wasDeleted, setWasDeleted] = useState(false)

  const router = useRouter()

  const { actions, topics, comments } = useAuth()

  const findTopicQuery = topics!.useFind(projectID, meetingID, topicID)

  const topicUpdateMutation = topics!.useEdit(
    projectID,
    meetingID,
    topicID,
    () => {
      toast.success(`Topic #${topicID} updated`)
      setIsEdit(false)
    },
  )

  const topicDeleteMutation = topics!.useDelete(
    projectID,
    meetingID,
    (_, { topicID }) => {
      toast.success(`Topic #${topicID} deleted`)
      setConfirmDelete(false)
      setWasDeleted(true)
    },
  )

  const topicListQuery = topics!.useList(projectID, meetingID)

  const markSolutionMutation = comments!.useMarkSolution(
    projectID,
    meetingID,
    topicID,
    (_, { mark, commentID }) => {
      toast.success(
        `Comment #${commentID} ${mark ? "marked" : "unmarked"} as solution!`,
      )
    },
  )

  const linkTagMut = topics!.useLinkTag(projectID, meetingID, () => {})
  const linkUserMut = topics!.useLinkUser(projectID, meetingID, () => {})

  const subscribedQuery = topics!.useIsSubscribed(projectID, meetingID, topicID)
  const subscribeMut = topics!.useSubscribe(
    projectID,
    meetingID,
    topicID,
    ({ data }) =>
      toast.success(
        `${data ? "Subscribed to" : "Unsubscribed from"} topic #${topicID}`,
      ),
  )
  const isSubscribed = subscribedQuery.data?.data

  if (findTopicQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (findTopicQuery.isError || wasDeleted) {
    const error = extractErrorMessage(findTopicQuery.error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col space-y-4 rounded-md border border-red-500 bg-red-500 bg-opacity-10 p-6">
          <h1 className="text-2xl font-semibold text-red-500">Error</h1>
          <p className="text-neutral-300">
            {error !== "null" ? error : "Topic not found"}
          </p>
          <div className="flex items-center">
            <Button
              variant="light"
              color="danger"
              startContent={<BsBack />}
              as={Link}
              href={`/project/${projectID}/meeting/${meetingID}`}
            >
              Back to Meeting Overview
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const topic = findTopicQuery.data.data

  const topicInfoProps = {
    projectID,
    meetingID,
    topicID,
  }

  const dateCreated = new Date(topic.CreatedAt)

  // event handlers

  function onEditClick() {
    setEditTitle(topic.title)
    setEditDescription(topic.description)
    setEditForceSolution(topic.force_solution || false)
    setEditPriorityID(topic.priority_id || 0)

    setIsEdit(true)
  }

  function onDeleteTopicClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setConfirmDelete(false)
    topicDeleteMutation.mutate({
      topicID: topicID,
    })
  }

  function onSolutionClick(mark: boolean, comment: Comment) {
    markSolutionMutation.mutate({
      mark,
      commentID: comment.ID,
    })
  }

  // next / previous topic buttons
  let nextTopicURL: string | undefined
  let prevTopicURL: string | undefined

  if (topicListQuery.isSuccess) {
    const topicList = topicListQuery.data.data
    const topicIndex = topicList.findIndex((t) => t.ID === topic.ID)
    if (topicIndex !== -1) {
      if (topicIndex < topicList.length - 1) {
        nextTopicURL = `/project/${projectID}/meeting/${meetingID}/topic/${
          topicList[topicIndex + 1].ID
        }`
      }
      if (topicIndex > 0) {
        prevTopicURL = `/project/${projectID}/meeting/${meetingID}/topic/${
          topicList[topicIndex - 1].ID
        }`
      }
    }
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Perplex - T# {topic.title ?? "Unknown Topic"}</title>
      </Head>

      <div className="mb-2">
        <Breadcrumbs>
          <BreadcrumbItem href="/" startContent={<BsHouse />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href={`/project/${projectID}`}>
            <ProjectSelectBreadcrumbs projectID={projectID} />
          </BreadcrumbItem>
          <BreadcrumbItem href={`/project/${projectID}/meeting/${meetingID}`}>
            <MeetingSelectBreadcrumbs
              meetingID={meetingID}
              meetingName={
                <ResolveMeetingName
                  projectID={projectID}
                  meetingID={meetingID}
                />
              }
              projectID={projectID}
            />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <TopicSelectBreadcrumbs
              projectID={projectID}
              meetingID={meetingID}
              topicID={topic.ID}
              topicName={topic.title}
            />
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>

      {isEdit ? (
        <div className="mb-4 flex space-x-2">
          <AckTopicTypeCard
            selected={!editForceSolution}
            onClick={() => setEditForceSolution(false)}
          />
          <DiscussTopicTypeCard
            selected={editForceSolution}
            onClick={() => setEditForceSolution(true)}
          />
        </div>
      ) : (
        <span className="text-xs uppercase text-primary-500">
          {topic.force_solution ? "Discuss" : "Acknowledge"}
        </span>
      )}

      <OverviewTitle
        creatorID={topic.creator_id}
        title={topic.title}
        titleID={topic.ID}
        tag={<TopicTag topic={topic} />}
        injectHeader={
          !isEdit && (
            <div className="ml-2 flex items-center space-x-2">
              <Button
                disabled={!prevTopicURL}
                variant="light"
                size="sm"
                as={Link}
                href={prevTopicURL ?? "#"}
                startContent={<BsArrowLeft />}
                isIconOnly
              />
              <Button
                disabled={!nextTopicURL}
                variant="light"
                size="sm"
                as={Link}
                href={nextTopicURL ?? "#"}
                startContent={<BsArrowRight />}
                isIconOnly
              />
            </div>
          )
        }
        createdAt={dateCreated}
        setEditTitle={setEditTitle}
        isEdit={isEdit}
      ></OverviewTitle>

      <OverviewContainer>
        <OverviewContent>
          {!!topic.solution_id && (
            <>
              <div className="flex w-full items-center justify-between rounded-md border border-primary-500 p-4">
                <div className="flex flex-row items-center space-x-2 text-primary-500">
                  <BsCheck />
                  <strong>Good News!</strong>
                  <span className="text-neutral-400">
                    This topic has a solution!
                  </span>
                </div>
                <Button
                  variant="shadow"
                  color="primary"
                  endContent={<BsArrowRight />}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    const element = document.getElementById(
                      `comment-topic-${topic.solution_id}`,
                    )
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  }}
                >
                  Jump to Comment
                </Button>
              </div>
              <Hr className="my-4" />
            </>
          )}

          <div className="rounded-md bg-neutral-900 p-2">
            {isEdit ? (
              <Textarea
                className="w-full"
                variant="underlined"
                label="Edit Description"
                defaultValue={topic.description}
                onValueChange={setEditDescription}
              />
            ) : (
              <Accordion
                isCompact
                variant="light"
                defaultExpandedKeys={["description"]}
              >
                <AccordionItem title="Description" key="description">
                  <RenderMarkdown
                    markdown={topic.description || "*(no description)*"}
                  />
                </AccordionItem>
              </Accordion>
            )}
          </div>

          <Hr className="my-4" />

          <CommentSuite
            projectID={projectID}
            commentType="topic"
            commentEntityID={topicID}
            commentSolutionID={topic.solution_id}
            onSolutionClick={onSolutionClick}
            isSolutionMutLoading={markSolutionMutation.isLoading}
            onShiftSend={(comment) => {
              markSolutionMutation.mutate({
                commentID: comment.ID,
                mark: true,
              })
            }}
          />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Edit">
            {!isEdit ? (
              <div className="flex items-center space-x-2">
                <Button
                  className="w-full text-sm"
                  startContent={<BsPen />}
                  onClick={() => onEditClick()}
                >
                  Edit
                </Button>
                <Tooltip content={isSubscribed ? "Unsubscribe" : "Subscribe"}>
                  <Button
                    isIconOnly
                    variant={isSubscribed ? "solid" : "bordered"}
                    startContent={isSubscribed ? <BsEyeSlash /> : <BsEyeFill />}
                    isLoading={subscribeMut.isLoading}
                    onClick={() =>
                      subscribeMut.mutate({
                        subscribe: !isSubscribed,
                      })
                    }
                  />
                </Tooltip>
                <Tooltip content="Delete Topic" color="danger">
                  <Button
                    isIconOnly
                    startContent={confirmDelete ? <BsTrashFill /> : <BsTrash />}
                    variant={confirmDelete ? "solid" : "bordered"}
                    color="danger"
                    onClick={onDeleteTopicClick}
                    isLoading={topicDeleteMutation.isLoading}
                  />
                </Tooltip>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  color="primary"
                  onClick={() =>
                    topicUpdateMutation.mutate({
                      title: editTitle,
                      description: editDescription,
                      force_solution: editForceSolution,
                      priority_id: editPriorityID,
                    })
                  }
                  isLoading={topicUpdateMutation.isLoading}
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 text-sm"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </OverviewSection>
          <OverviewSection name="Priority">
            <PriorityPickerWithEdit
              projectID={projectID}
              isEdit={isEdit}
              priorityID={topic.priority_id}
              setEditPriorityID={setEditPriorityID}
              priority={topic.priority}
            />
          </OverviewSection>
          <OverviewSection name="Tags">
            <SectionAssignTags
              projectID={projectID}
              onAssign={(tag) =>
                linkTagMut.mutate({
                  link: true,
                  topicID: topic.ID,
                  tagID: tag.ID,
                })
              }
              onUnassign={(tag) =>
                linkTagMut.mutate({
                  link: false,
                  topicID: topic.ID,
                  tagID: tag.ID,
                })
              }
              loadingTag={
                linkTagMut.isLoading ? linkTagMut.variables?.tagID : 0
              }
              tags={topic.tags}
            />
          </OverviewSection>
          <OverviewSection name="Assigned">
            <SectionAssignUsers
              projectID={projectID}
              onAssign={(user) =>
                linkUserMut.mutate({
                  link: true,
                  topicID: topic.ID,
                  userID: user.id,
                })
              }
              onUnassign={(user) =>
                linkUserMut.mutate({
                  link: false,
                  topicID: topic.ID,
                  userID: user.id,
                })
              }
              users={topic.assigned_users}
              loadingUser={
                linkUserMut.isLoading
                  ? linkUserMut.variables?.userID
                  : undefined
              }
            />
          </OverviewSection>
          <OverviewSection name="Participants">
            <SectionParticipants {...topicInfoProps} />
          </OverviewSection>
          <TopicSectionCreateAction
            projectID={projectID}
            meetingID={meetingID}
            topicID={topicID}
          />
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
