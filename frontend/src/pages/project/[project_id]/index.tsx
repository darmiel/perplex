import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsPen, BsPerson } from "react-icons/bs"
import { toast } from "react-toastify"

import { BackendResponse, Project, User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import MeetingList from "@/components/meeting/MeetingList"
import InviteUserToProjectModalContent from "@/components/modals/ProjectUsersModal"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import UserTagList from "@/components/ui/tag/UserTagList"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import FetchUserTag from "@/components/user/FetchUserTag"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectPage() {
  const [isEdit, setIsEdit] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [showUserControl, setShowUserControl] = useState(false)

  const router = useRouter()
  const { project_id: projectID } = router.query

  const {
    projectGetQueryFn,
    projectGetQueryKey,
    projectUsersQueryFn,
    projectUsersQueryKey,
    axios,
  } = useAuth()
  const queryClient = useQueryClient()

  const projectInfoQuery = useQuery<BackendResponse<Project>>({
    queryKey: projectGetQueryKey!(String(projectID)),
    queryFn: projectGetQueryFn!(String(projectID)),
  })

  const projectUsersQuery = useQuery<BackendResponse<User[]>>({
    queryKey: projectUsersQueryKey!(String(projectID)),
    queryFn: projectUsersQueryFn!(projectID),
  })

  const updateProjectMut = useMutation<BackendResponse<never>>({
    mutationKey: [{ projectID }, "update-mut"],
    mutationFn: async () =>
      (
        await axios!.put(`/project/${projectID}`, {
          name: editName,
          description: editDescription,
        })
      ).data,
    onError: (err) => {
      toast(
        <>
          <strong>Failed to update project</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
    onSuccess() {
      toast(`Project #${projectID} updated`, { type: "success" })
      queryClient.invalidateQueries(projectGetQueryKey!(String(projectID)))
      setIsEdit(false)
    },
  })

  if (!projectID || Array.isArray(projectID)) {
    return <div>Invalid URL</div>
  }

  if (projectInfoQuery.isLoading) {
    return <div>Loading Project Information...</div>
  }
  if (projectInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(projectInfoQuery.error)}</pre>
      </div>
    )
  }

  const project = projectInfoQuery.data.data
  const dateCreated = project.CreatedAt
    ? new Date(project.CreatedAt)
    : undefined

  function enterEdit() {
    setEditName(project.name)
    setEditDescription(project.description)
    setIsEdit(true)
  }

  return (
    <div className="w-full bg-neutral-950 p-6 pl-10">
      <div className="flex flex-col">
        <OverviewTitle
          creatorID={project.owner_id}
          title={project.name}
          titleID={project.ID}
          createdAt={dateCreated}
          setEditTitle={setEditName}
          isEdit={isEdit}
        />

        <OverviewContainer>
          <OverviewContent>
            <div className="text-neutral-500 p-2 bg-neutral-900">
              <RenderMarkdown markdown={project.description} />
            </div>

            <Hr className="mt-4 mb-6" />

            <MeetingList projectID={String(projectID)} />
          </OverviewContent>
          <OverviewSide>
            <OverviewSection name="Actions">
              {!isEdit ? (
                <Button
                  className="w-full text-sm"
                  icon={<BsPen />}
                  onClick={() => enterEdit()}
                >
                  Edit Project
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    className="w-1/2 text-sm"
                    style="primary"
                    isLoading={updateProjectMut.isLoading}
                    onClick={() => updateProjectMut.mutate()}
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
            <OverviewSection name="Owner">
              <div className="w-fit">
                <FetchUserTag userID={project.owner_id} />
              </div>
            </OverviewSection>
            <OverviewSection name="Members">
              <ModalPopup open={showUserControl} setOpen={setShowUserControl}>
                <InviteUserToProjectModalContent
                  projectID={project.ID}
                  onClose={() => setShowUserControl(false)}
                />
              </ModalPopup>

              <UserTagList users={projectUsersQuery.data?.data} />

              <Button
                className="w-full mt-4"
                onClick={() => setShowUserControl(true)}
                icon={<BsPerson />}
              >
                Manage Users
              </Button>
            </OverviewSection>
          </OverviewSide>
        </OverviewContainer>
      </div>
    </div>
    // <div className="flex-none w-full bg-neutral-900 p-6 border-x border-neutral-700 space-y-4">
    //   <MeetingList projectID={String(projectID)} />
    // </div>
  )
}
