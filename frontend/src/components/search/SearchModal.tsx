import { Input, Spinner } from "@nextui-org/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import { Action, Meeting, Project, Topic } from "@/api/types"
import SearchResultAction from "@/components/search/results/SearchResultAction"
import SearchResultMeeting from "@/components/search/results/SearchResultMeeting"
import SearchResultProject from "@/components/search/results/SearchResultProject"
import SearchResultTopic from "@/components/search/results/SearchResultTopic"
import Hr from "@/components/ui/Hr"
import { useAuth } from "@/contexts/AuthContext"
import useDebounce from "@/hooks/debounce"

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
      className={`flex w-[50rem] flex-col space-y-4 rounded-lg border border-neutral-800 bg-neutral-950 bg-opacity-50 p-4`}
    >
      <h2 className="w-full text-center text-xs font-semibold uppercase text-neutral-500">
        Search across Perplex
      </h2>

      <div className="flex items-center space-x-3">
        <Input
          type="text"
          fullWidth
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          variant="bordered"
          size="sm"
          placeholder="Start typing..."
        />
        {searchResultQuery.isFetching && <Spinner color="default" />}
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {result.projects.length > 0 && (
          <>
            <h3 className="text-xs font-semibold uppercase text-neutral-500">
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
            <h3 className="text-xs font-semibold uppercase text-neutral-500">
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
            <h3 className="text-xs font-semibold uppercase text-neutral-500">
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
            <h3 className="text-xs font-semibold uppercase text-neutral-500">
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
