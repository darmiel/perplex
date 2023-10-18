import { createContext, PropsWithChildren, useContext } from "react"

import { useLocalStrState } from "@/hooks/localStorage"

export const FollowUpContext = createContext<{
  followUp: string
  setFollowUp: (newFollowUp: string) => void
}>({
  followUp: "",
  setFollowUp: () => {},
})

export function useFollowUp() {
  return useContext(FollowUpContext)
}

export function FollowUpProvider({ children }: PropsWithChildren) {
  const [followUp, setFollowUp] = useLocalStrState("followUp", "")

  return (
    <FollowUpContext.Provider value={{ followUp, setFollowUp }}>
      {children}
    </FollowUpContext.Provider>
  )
}
