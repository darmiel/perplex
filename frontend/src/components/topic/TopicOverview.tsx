import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import {
  BsArrowLeft,
  BsArrowRight,
  BsCheck,
  BsHouse,
  BsPen,
  BsTrash,
} from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { Comment } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import CommentSuite from "@/components/comment/CommentSuite"
import {
  AckTopicTypeCard,
  DiscussTopicTypeCard,
} from "@/components/modals/TopicCreateModal"
import PriorityPickerWithEdit from "@/components/project/priority/PriorityPickerWithEdit"
import ResolveMeetingName from "@/components/resolve/ResolveMeetingName"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import TopicSectionActions from "@/components/topic/section/TopicSectionActions"
import TopicSectionCreateAction from "@/components/topic/section/TopicSectionCreateAction"
import TopicTag from "@/components/topic/TopicTag"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import SectionAssignTags from "@/components/ui/overview/common/SectionAssignTags"
import SectionAssignUsers from "@/components/ui/overview/common/SectionAssignUsers"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import UserTagList from "@/components/ui/tag/UserTagList"
import Breadcrumbs from "@/components/ui/text/Breadcrumbs"
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

  const { actions, topics, comments } = useAuth()

  const findTopicQuery = topics!.useFind(projectID, meetingID, topicID)

  const listTopicsForActionsQuery = actions!.useListForTopic(
    projectID,
    meetingID,
    topicID,
  )

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

  if (findTopicQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (findTopicQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(findTopicQuery.error)}</pre>
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

  if (wasDeleted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col space-y-4 rounded-md border border-red-500 bg-red-500 bg-opacity-10 p-6">
          <h1 className="text-2xl font-semibold text-red-500">
            Topic not found
          </h1>
          <p className="text-neutral-300">
            The topic cannot be found, because you just deleted it.
            <br />
            That&apos;s what you wanted, right?{" "}
            <span className="text-neutral-500">right?</span>
          </p>
          <div className="flex items-center">
            <Link href={`/project/${projectID}/meeting/${meetingID}`}>
              <Button raw>Go to Topic Overview</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Perplex - T# {topic.title ?? "Unknown Topic"}</title>
      </Head>

      <div className="mb-2">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">
            <BsHouse />
          </Breadcrumbs.Item>
          <Breadcrumbs.Item href={`/project/${projectID}`}>
            <ResolveProjectName projectID={projectID} />
          </Breadcrumbs.Item>
          <Breadcrumbs.Item href={`/project/${projectID}/meeting/${meetingID}`}>
            <ResolveMeetingName projectID={projectID} meetingID={meetingID} />
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>{topic.title}</Breadcrumbs.Item>
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
              <Link href={prevTopicURL ?? "#"}>
                <Button disabled={!prevTopicURL} raw>
                  <BsArrowLeft />
                </Button>
              </Link>
              <Link href={nextTopicURL ?? "#"}>
                <Button disabled={!nextTopicURL} raw>
                  <BsArrowRight />
                </Button>
              </Link>
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
                  href={`#comment-${topic.solution_id}`}
                  style={["neutral", "animated"]}
                >
                  Go to solution
                  <Button.Arrow />
                </Button>
              </div>
              <Hr className="my-4" />
            </>
          )}

          <div className="bg-neutral-900 p-4 text-neutral-500">
            {isEdit ? (
              <textarea
                className="w-full bg-transparent focus:outline-none"
                defaultValue={topic.description}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown
                markdown={topic.description || "*(no description)*"}
              />
            )}
          </div>

          {!!listTopicsForActionsQuery.data?.data.length && (
            <>
              <Hr className="my-4" />

              <div className="mb-2">
                <BadgeHeader
                  title="Linked Actions"
                  badge={listTopicsForActionsQuery.data?.data.length || 0}
                />
              </div>

              <TopicSectionActions
                key={topic.ID}
                actions={listTopicsForActionsQuery.data?.data ?? []}
                projectID={projectID}
                topic={topic}
              />
            </>
          )}

          <Hr className="my-4" />

          <CommentSuite
            projectID={projectID}
            commentType="topic"
            commentEntityID={topicID}
            commentSolutionID={topic.solution_id}
            onSolutionClick={onSolutionClick}
            isSolutionMutLoading={markSolutionMutation.isLoading}
          />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Edit">
            {!isEdit ? (
              <div className="flex items-center space-x-2">
                <Button
                  className="w-full text-sm"
                  icon={<BsPen />}
                  onClick={() => onEditClick()}
                >
                  Edit
                </Button>
                <Button
                  className={
                    confirmDelete
                      ? "w-full bg-red-500 text-sm text-white hover:bg-red-600"
                      : "w-full text-sm text-red-500"
                  }
                  icon={<BsTrash />}
                  onClick={onDeleteTopicClick}
                  isLoading={topicDeleteMutation.isLoading}
                >
                  {confirmDelete ? "Confirm" : "Delete"}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  style="primary"
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
                  style="neutral"
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
          <OverviewSection
            name="Actions"
            badge={listTopicsForActionsQuery.data?.data.length}
          >
            <TopicSectionCreateAction
              projectID={projectID}
              meetingID={meetingID}
              topicID={topicID}
            />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
