import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { BarLoader } from "react-spinners"

import { BackendResponse } from "@/api/types"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function UserComment({
  authorID,
  time,
  message,
  solution,
  onSolutionClick,
}: {
  authorID: string
  time: string
  message: string
  solution?: boolean
  onSolutionClick?: () => void
}) {
  const {
    userResolveQueryFn: resolveUserQueryFn,
    userResolveQueryKey: resolveUserQueryKey,
  } = useAuth()
  const userNameQuery = useQuery<BackendResponse<string>, AxiosError>({
    queryKey: resolveUserQueryKey!(authorID),
    queryFn: resolveUserQueryFn!(authorID),
  })

  const d = new Date(Date.parse(time))
  return (
    <div
      className={`flex mt-8 ${
        solution
          ? "border-l-4 border-primary-600 bg-primary-500 bg-opacity-20 pl-3 py-3"
          : ""
      }`}
    >
      <div>
        <UserAvatar userID={authorID} />
      </div>
      <div className="flex flex-col ml-3">
        <div>
          <span className="font-semibold">
            {userNameQuery.isLoading ? (
              <BarLoader color="white" />
            ) : (
              userNameQuery.data?.data ?? "Unknown User"
            )}
          </span>
          <span className="text-neutral-500"> - {d.toLocaleTimeString()}</span>
        </div>
        <div className="mt-4 text-neutral-200">
          <RenderMarkdown markdown={message} />
        </div>
      </div>
      <div
        className="ml-auto mr-4 text-primary-500 underline cursor-pointer"
        onClick={() => onSolutionClick?.()}
      >
        {solution ? "Remove Solution" : "Mark Solution"}
      </div>
    </div>
  )
}
