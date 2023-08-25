import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { BackendResponse } from "@/api/types"
import { useAuth } from "@/contexts/AuthContext"

import UserTag from "./UserTag"

export default function FetchUserTag({ userID }: { userID: string }) {
  const { userResolveQueryFn, userResolveQueryKey } = useAuth()
  const userResolveQuery = useQuery<BackendResponse<string>, AxiosError>({
    queryKey: userResolveQueryKey!(userID),
    queryFn: userResolveQueryFn!(userID),
  })
  if (userResolveQuery.isLoading) {
    return <UserTag userID={userID} displayName="Loading..." />
  }
  if (userResolveQuery.isError) {
    return <UserTag userID={userID} displayName="Unknown User" />
  }
  return <UserTag userID={userID} displayName={userResolveQuery.data.data} />
}
