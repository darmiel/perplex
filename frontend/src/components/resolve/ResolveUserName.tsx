import { useAuth } from "@/contexts/AuthContext"

export default function ResolveUserName({ userID }: { userID: string }) {
  const { users } = useAuth()
  const userResolveQuery = users!.useResolve(userID)
  if (userResolveQuery.isLoading) {
    return <>Loading User</>
  }
  if (userResolveQuery.isError) {
    return <>Unknown User</>
  }
  return <>{userResolveQuery.data.data}</>
}
