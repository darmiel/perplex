import { useRouter } from "next/router"
import { useState } from "react"
import { BiArchive, BiNote } from "react-icons/bi"
import { BsArrowDown } from "react-icons/bs"

import MeetingList from "@/components/meeting/MeetingList"
import MeetingNotePage from "@/components/meeting/MeetingNotePage"
import MeetingTopicPage from "@/components/meeting/MeetingTopicPage"
import TabContainer from "@/components/ui/tab/TabContainer"

export default function ProjectPage() {
  const [showMeetingList, setShowMeetingList] = useState(false)

  const tabPanes = [
    {
      name: "Topics",
      icon: <BiArchive />,
    },
    {
      name: "Notes",
      icon: <BiNote />,
    },
  ] as const
  type tabName = (typeof tabPanes)[number]["name"]

  const [tab, setTab] = useState<tabName>("Topics")

  const router = useRouter()
  const {
    project_id: projectID,
    meeting_id: meetingID,
    topic_id: topicID,
    tab: tabFromURL,
  } = router.query

  // check if tabFromURL is a valid tab name
  if (
    tabFromURL &&
    tabFromURL !== tab &&
    tabPanes.some((pane) => pane.name === tabFromURL)
  ) {
    setTab(tabFromURL as tabName)
  }

  if (
    !projectID ||
    !meetingID ||
    !topicID ||
    typeof topicID !== "string" ||
    typeof meetingID !== "string" ||
    typeof projectID !== "string"
  ) {
    return <div>Invalid URL</div>
  }

  return (
    <>
      {showMeetingList ? (
        <div className="flex-initial w-[21rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
          <MeetingList
            projectID={String(projectID)}
            selectedMeetingID={String(meetingID)}
            displayCollapse={true}
            onCollapse={() => setShowMeetingList(false)}
          />
        </div>
      ) : (
        <div className="flex-initial w-[4rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
          <h2 className="text-center mt-24 text-neutral-400 -rotate-90">
            <button
              onClick={() => setShowMeetingList(true)}
              className="bg-neutral-900 border border-neutral-600 rounded-md px-4 py-1 flex justify-center items-center space-x-2"
            >
              <div>Meetings</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <TabContainer
        tab={tab}
        setTab={(newTab) => {
          setTab(newTab as tabName)

          // update URL
          router.push(
            {
              query: {
                ...router.query,
                tab: newTab,
              },
            },
            undefined,
            { shallow: true },
          )
        }}
        panes={tabPanes}
      >
        {tab === "Topics" ? (
          <MeetingTopicPage
            projectID={projectID}
            meetingID={meetingID}
            topicID={topicID}
            router={router}
          />
        ) : tab === "Notes" ? (
          <MeetingNotePage />
        ) : (
          <>Unknown site.</>
        )}
      </TabContainer>
    </>
  )
}
