import { useEffect, useState } from "react"
import { BarLoader } from "react-spinners"

import useDebounce from "@/components/Debounce"
import SearchResultAction from "@/components/search/results/SearchResultAction"
import SearchResultMeeting from "@/components/search/results/SearchResultMeeting"
import SearchResultProject from "@/components/search/results/SearchResultProject"
import SearchResultTopic from "@/components/search/results/SearchResultTopic"
import Hr from "@/components/ui/Hr"
import { useAuth } from "@/contexts/AuthContext"

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { users } = useAuth()

  const [query, setQuery] = useState("")
  const [queryInput, setQueryInput] = useState("")

  const debounce = useDebounce(queryInput, 250)
  useEffect(() => {
    setQuery(debounce)
  }, [debounce])

  const searchResultQuery = users!.useSearch(query)
  const result = searchResultQuery.data?.data || {
    projects: [],
    meetings: [],
    actions: [],
    topics: [],
    topic_meeting_id: {},
  }

  return (
    <div
      className={`bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-4 flex flex-col w-[50rem]`}
    >
      <h2 className="text-xs text-neutral-500 uppercase font-semibold">
        Search across Perplex
      </h2>
      <input
        type="text"
        className="bg-neutral-800 border border-neutral-700 rounded-md p-2"
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
      />
      <Hr className="my-4" />
      {searchResultQuery.isFetching && (
        <div className="flex justify-center">
          <BarLoader color="white" />
        </div>
      )}
      <div className="w-full space-y-2">
        {result.projects && result.projects.length > 0 && (
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
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.meetings && result.meetings.length > 0 && (
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
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.topics && result.topics.length > 0 && (
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
                    />
                  ),
              )}
            </div>
            <Hr />
          </>
        )}
        {result.actions && result.actions.length > 0 && (
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
