import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import {
  BsArrowLeft,
  BsArrowRight,
  BsBookmarkStar,
  BsBookmarkStarFill,
  BsCheck,
  BsPen,
  BsPeople,
  BsTrash,
} from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { Comment, Topic } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import CommentSuite from "@/components/comment/CommentSuite"
import {
  AckTopicTypeCard,
  DiscussTopicTypeCard,
} from "@/components/modals/TopicCreateModal"
import TopicSectionActions from "@/components/topic/section/TopicSectionActions"
import TopicSectionCreateAction from "@/components/topic/section/TopicSectionCreateAction"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import Tag from "@/components/ui/tag/Tag"
import UserTagList from "@/components/ui/tag/UserTagList"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import MultiUserSelect from "@/components/user/MultiUserSelect"
import UserTag from "@/components/user/UserTag"
import { useAuth } from "@/contexts/AuthContext"

const tags = {
  open: {
    icon: <BsBookmarkStar />,
    text: "Open",
    className: "bg-green-600 text-white",
  },
  close: {
    icon: <BsBookmarkStarFill />,
    text: "Closed",
    className: "bg-red-600 text-white",
  },
}

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

function SectionAuthor({ topic }: { topic: Topic }) {
  return (
    <div className="w-fit">
      <UserTag
        userID={topic.creator?.id ?? ""}
        displayName={topic.creator?.name ?? "Unknown User"}
      />
    </div>
  )
}

function SectionAssigned({
  topic,
  projectID,
  meetingID,
  topicID,
}: {
  topic: Topic
  projectID: number
  meetingID: number
  topicID: number
}) {
  return (
    <div className="flex flex-col space-y-4">
      <UserTagList users={topic.assigned_users} />
      <div>
        <MultiUserSelect
          key={topic.ID}
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
          initialSelection={topic.assigned_users?.map((user) => user.id) ?? []}
        >
          <button className="w-full px-4 py-2 text-center border border-neutral-700 bg-neutral-900 hover:bg-neutral-950 rounded-md cursor-pointer">
            <div className="flex flex-row items-center justify-center space-x-2">
              <BsPeople />
              <div>Assign Users</div>
            </div>
          </button>
        </MultiUserSelect>
      </div>
    </div>
  )
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
      toast(`Topic #${topicID} updated`, { type: "success" })
      setIsEdit(false)
    },
  )

  const topicDeleteMutation = topics!.useDelete(
    projectID,
    meetingID,
    (_, { topicID }) => {
      toast(`Topic #${topicID} deleted`, { type: "success" })
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
      toast(
        `Comment #${commentID} ${mark ? "marked" : "unmarked"} as solution!`,
        { type: "success" },
      )
    },
  )

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

  const tag = topic.closed_at.Valid ? tags.close : tags.open
  const dateCreated = new Date(topic.CreatedAt)

  // event handlers

  function onEditClick() {
    setEditTitle(topic.title)
    setEditDescription(topic.description)
    setEditForceSolution(topic.force_solution || false)

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
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col space-y-4 p-6 border border-red-500 bg-red-500 bg-opacity-10 rounded-md">
          <h1 className="text-red-500 text-2xl font-semibold">
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
      {isEdit ? (
        <div className="flex space-x-2 mb-4">
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
        <span className="text-xs text-primary-500 uppercase">
          {topic.force_solution ? "Discuss" : "Acknowledge"}
        </span>
      )}

      <OverviewTitle
        creatorID={topic.creator_id}
        title={topic.title}
        titleID={topic.ID}
        tag={
          <Tag className={tag.className}>
            <div>{tag.icon}</div>
            <div>{tag.text}</div>
          </Tag>
        }
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
      />

      <OverviewContainer>
        <OverviewContent>
          {!!topic.solution_id && (
            <>
              <div className="w-full border border-primary-500 rounded-md p-4 space-y-2">
                <div className="flex flex-row items-center space-x-2 text-primary-500">
                  <BsCheck />
                  <strong>Good News!</strong>
                </div>
                <div className="text-neutral-400">
                  This topic already has a solution!
                </div>
                <div className="w-fit">
                  <Link href={`#comment-${topic.solution_id}`}>
                    <Button raw>Go to solution</Button>
                  </Link>
                </div>
              </div>
              <Hr className="my-4" />
            </>
          )}

          <div className="text-neutral-500 p-4 bg-neutral-900">
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
              <div className="flex space-x-2 items-center">
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
                      ? "w-full bg-red-500 hover:bg-red-600 text-white"
                      : "w-full text-red-500"
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
          <OverviewSection name="Author">
            <SectionAuthor topic={topic} />
          </OverviewSection>
          <OverviewSection name="Assigned">
            <SectionAssigned {...topicInfoProps} topic={topic} />
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
