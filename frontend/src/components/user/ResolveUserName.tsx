import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { BackendResponse } from "@/api/types"
import { useAuth } from "@/contexts/AuthContext"

export default function ResolveUserName({ userID }: { userID: string }) {
  const { userResolveQueryFn, userResolveQueryKey } = useAuth()
  const userResolveQuery = useQuery<BackendResponse<string>, AxiosError>({
    queryKey: userResolveQueryKey!(userID),
    queryFn: userResolveQueryFn!(userID),
  })
  if (userResolveQuery.isLoading) {
    return <>Loading User</>
  }
  if (userResolveQuery.isError) {
    return <>Unknown User</>
  }
  return <>{userResolveQuery.data.data}</>
}
