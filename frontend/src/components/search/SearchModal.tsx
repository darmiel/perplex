import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { BarLoader, PuffLoader } from "react-spinners"

import { Action, Meeting, Project, Topic } from "@/api/types"
import useDebounce from "@/components/Debounce"
import SearchResultAction from "@/components/search/results/SearchResultAction"
import SearchResultMeeting from "@/components/search/results/SearchResultMeeting"
import SearchResultProject from "@/components/search/results/SearchResultProject"
import SearchResultTopic from "@/components/search/results/SearchResultTopic"
import Hr from "@/components/ui/Hr"
import { useAuth } from "@/contexts/AuthContext"

function projectLink(project: Project) {
  return `/project/${project.ID}`
}

function meetingLink(meeting: Meeting) {
  return `/project/${meeting.project_id}/meeting/${meeting.ID}`
}

function topicLink(topic: Topic, topicMap: { [key: number]: number }) {
  return `/project/${topicMap[topic.ID]}/meeting/${topic.meeting_id}/topic/${
    topic.ID
  }`
}

function actionLink(action: Action) {
  return `/project/${action.project_id}/action/${action.ID}`
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { users } = useAuth()

  const [query, setQuery] = useState("")
  const [queryInput, setQueryInput] = useState("")

  const router = useRouter()
  const [currentLink, setCurrentLink] = useState("")

  const debounce = useDebounce(queryInput, 250)
  useEffect(() => {
    setQuery(debounce)
  }, [debounce])

  const searchResultQuery = users!.useSearch(query)
  const searchResult = searchResultQuery.data?.data

  const result: {
    projects: Project[]
    meetings: Meeting[]
    actions: Action[]
    topics: Topic[]
    topic_meeting_id: { [key: number]: number }
  } = {
    projects: [],
    meetings: [],
    actions: [],
    topics: [],
    topic_meeting_id: searchResult?.topic_meeting_id || {},
  }

  // filter result by queryInput
  if (searchResult) {
    result.projects =
      searchResult.projects?.filter((project) =>
        project.name.toLowerCase().includes(queryInput.toLowerCase()),
      ) || []
    result.meetings =
      searchResult.meetings?.filter((meeting) =>
        meeting.name.toLowerCase().includes(queryInput.toLowerCase()),
      ) || []
    result.actions =
      searchResult.actions?.filter((action) =>
        action.title.toLowerCase().includes(queryInput.toLowerCase()),
      ) || []
    result.topics =
      searchResult.topics?.filter((topic) =>
        topic.title.toLowerCase().includes(queryInput.toLowerCase()),
      ) || []
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      let href = currentLink
      if (!href) {
        // find first result
        if (result.projects.length > 0) {
          href = projectLink(result.projects[0])
        } else if (result.meetings.length > 0) {
          href = meetingLink(result.meetings[0])
        } else if (result.topics.length > 0) {
          href = topicLink(result.topics[0], result.topic_meeting_id)
        } else if (result.actions.length > 0) {
          href = actionLink(result.actions[0])
        }
      }
      if (href) {
        router.push(href)
        onClose()
      }
    }
  }

  return (
    <div
      className={`bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-4 flex flex-col w-[50rem]`}
    >
      <h2 className="items-center text-xs text-neutral-500 uppercase font-semibold">
        Search across Perplex
      </h2>

      <div className="flex space-x-3 items-center">
        <input
          type="text"
          className="bg-neutral-800 border border-neutral-700 rounded-md p-2 w-full"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {searchResultQuery.isFetching && (
          <PuffLoader color="gray" size="1.3em" />
        )}
      </div>

      <Hr className="my-4" />

      {searchResultQuery.isFetching && (
        <div className="flex justify-center">
          <BarLoader color="white" />
        </div>
      )}

      <div className="w-full space-y-2">
        {result.projects.length > 0 && (
          <>
            <h3 className="text-xs text-neutral-500 uppercase font-semibold">
              Projects
            </h3>
            <div className="flex flex-col space-y-2">
              {result.projects.map(
                (project, index) =>
                  index < 3 && (
                    <SearchResultProject
                      key={project.ID}
                      project={project}
                      onClick={onClose}
                      onMouseOver={setCurrentLink}
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.meetings.length > 0 && (
          <>
            <h3 className="text-xs text-neutral-500 uppercase font-semibold">
              Meetings
            </h3>
            <div className="flex flex-col space-y-2">
              {result.meetings.map(
                (meeting, index) =>
                  index < 3 && (
                    <SearchResultMeeting
                      key={meeting.ID}
                      meeting={meeting}
                      onClick={onClose}
                      onMouseOver={setCurrentLink}
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.topics.length > 0 && (
          <>
            <h3 className="text-xs text-neutral-500 uppercase font-semibold">
              Topics
            </h3>
            <div className="flex flex-col space-y-2">
              {result.topics.map(
                (topic, index) =>
                  index < 3 && (
                    <SearchResultTopic
                      key={topic.ID}
                      topic={topic}
                      topicMap={result.topic_meeting_id}
                      onClick={onClose}
                      onMouseOver={setCurrentLink}
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.actions.length > 0 && (
          <>
            <h3 className="text-xs text-neutral-500 uppercase font-semibold">
              Actions
            </h3>
            <div className="flex flex-col space-y-2">
              {result.actions.map(
                (action, index) =>
                  index < 3 && (
                    <SearchResultAction
                      key={action.ID}
                      action={action}
                      onClick={onClose}
                      onMouseOver={setCurrentLink}
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
      </div>
    </div>
  )
}
