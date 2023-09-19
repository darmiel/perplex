import { Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import {
  BsArrowLeft,
  BsArrowRight,
  BsDoorOpen,
  BsSearch,
  BsTrash,
  BsTriangleFill,
} from "react-icons/bs"
import { toast } from "sonner"

import { Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

function ModalList({
  projects,
  showDeleteModal,
  onClose,
}: {
  projects: Project[]
  showDeleteModal: (project: Project) => void
  onClose: () => void
}) {
  const [projectNameSearch, setProjectNameSearch] = useState("")

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [confirmLeave, setConfirmLeave] = useState<number | null>(null)

  const { user, projects: project } = useAuth()

  const leaveProjectMutation = project!.useLeave((_, { projectID }) => {
    toast.success(`Left Project #${projectID}`)
  })

  const createProjectMutation = project!.useCreate(({ data }) => {
    toast.success(`Project #${data.ID} created`)
    setCreateName("")
    setCreateDescription("")
  })

  function leaveProject(project: Project) {
    if (confirmLeave !== project.ID) {
      setConfirmLeave(project.ID)
      return
    }
    setConfirmLeave(null)
    leaveProjectMutation.mutate({
      projectID: project.ID,
    })
  }

  function showDeleteConfirmation(project: Project) {
    if (confirmDelete !== project.ID) {
      setConfirmDelete(project.ID)
      return
    }
    setConfirmDelete(null)
    showDeleteModal(project)
  }

  const filteredProjects = projects.filter(
    (project) =>
      !projectNameSearch ||
      project.name.toLowerCase().includes(projectNameSearch.toLowerCase()),
  )

  return (
    <div
      className={clsx(
        "w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4",
        {
          "w-[60rem]": showCreate,
        },
      )}
    >
      <h1 className="text-xl font-semibold">Manage Projects</h1>

      <Input
        variant="bordered"
        label="Search Project"
        onValueChange={setProjectNameSearch}
        value={projectNameSearch}
        autoComplete="off"
        startContent={<BsSearch />}
      />

      <div className="flex w-full space-x-10">
        <ScrollShadow className="flex max-h-96 w-full flex-col space-y-2">
          {filteredProjects.length > 0 ? (
            filteredProjects
              // display projects
              .map((project) => (
                <div
                  key={project.ID}
                  className={clsx(
                    "flex items-center justify-between space-x-2 rounded-md p-2",
                    "transition-colors duration-150 ease-in-out hover:bg-neutral-900",
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <UserAvatar userID={String(project.ID)} />
                    <div className="flex flex-col">
                      <span>{project.name}</span>
                      {project.owner_id === user?.uid && (
                        <span className="w-fit rounded-sm bg-blue-600 p-1 text-xs font-semibold uppercase">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Actions */}
                  {project.owner_id !== user?.uid ? (
                    <Button
                      style="animated"
                      onClick={() => leaveProject(project)}
                      isLoading={leaveProjectMutation.isLoading}
                      icon={<BsDoorOpen />}
                      className={
                        confirmLeave === project.ID
                          ? "bg-red-600 hover:bg-red-700"
                          : ""
                      }
                    >
                      {confirmLeave === project.ID ? "Confirm" : "Leave"}
                    </Button>
                  ) : (
                    <Button
                      style="animated"
                      onClick={() => showDeleteConfirmation(project)}
                      icon={<BsTrash />}
                      className={
                        confirmDelete === project.ID
                          ? "bg-red-600 hover:bg-red-700"
                          : ""
                      }
                    >
                      {confirmDelete === project.ID ? "Confirm" : "Delete"}
                    </Button>
                  )}
                </div>
              ))
          ) : (
            <div className="flex flex-col space-y-2 rounded-md border border-primary-500 p-4">
              <div className="flex items-center space-x-2 text-lg">
                <BsSearch />
                <span>No Results</span>
              </div>
              <span className="text-neutral-400">
                Don&apos;t worry, you can still
              </span>
              <Button className="w-fit" onClick={() => setShowCreate(true)}>
                Create a Project
              </Button>
            </div>
          )}
        </ScrollShadow>
        {showCreate && (
          <div className="flex w-[40rem] flex-col space-y-4 rounded-md border border-neutral-700 p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-neutral-400" htmlFor="createProjectName">
                  Create Project Name
                </label>
                <input
                  id="createProjectName"
                  type="text"
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
                  placeholder="My awesome Project"
                  onChange={(event) => setCreateName(event.target.value)}
                  value={createName}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-neutral-400"
                  htmlFor="createProjectDescription"
                >
                  Create Project Description
                </label>
                <textarea
                  id="createProjectDescription"
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
                  placeholder="(Markdown supported)"
                  onChange={(event) => setCreateDescription(event.target.value)}
                  value={createDescription}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  style="primary"
                  disabled={!createName}
                  onClick={() =>
                    createProjectMutation.mutate({
                      name: createName,
                      description: createDescription,
                    })
                  }
                  isLoading={createProjectMutation.isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <span>Create</span>
                    {createName && (
                      <span className="rounded-md bg-neutral-700 px-2 py-1 text-sm">
                        {createName}
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Hr className="my-2" />

      <div className="space-x-4">
        <Button onClick={onClose}>Done</Button>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)} style="secondary">
            Create New Project
          </Button>
        )}
      </div>
    </div>
  )
}

function ModalDelete({
  project,
  onDelete,
  onBack,
}: {
  project: Project
  onDelete: () => void
  onBack: () => void
}) {
  const [confirmDeleteText, setConfirmDeleteText] = useState("")

  const { projects: projectDB } = useAuth()
  const deleteProjectMutation = projectDB!.useDelete((_, { projectID }) => {
    toast.success(`Project #${projectID} deleted`)
    onDelete()
  })

  const triggerReady = confirmDeleteText.trim() === project.name.trim()

  return (
    <div
      className={`w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">{`Delete Project #${project.ID}`}</h1>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 rounded-md border border-red-500 bg-red-500 bg-opacity-10 p-4 text-red-500">
          <div className="flex items-center space-x-2">
            <BsTriangleFill />
            <strong className="text-lg">Heads up!</strong>
          </div>
          <p>
            You are about to delete a project. This action{" "}
            <strong>cannot be undone</strong>.
            <br />
            Well it can, but I don&apos;t want to manually do that. That&apos;s
            annoying.
          </p>
          <Button
            className="w-fit text-white"
            onClick={onBack}
            icon={<BsArrowLeft />}
            style="primary"
          >
            Take me back!
          </Button>
        </div>
        <div>
          <Hr />
        </div>
        <div className="flex flex-col space-y-2">
          <span>Please deletion by entering the name of the project:</span>
          <div className="flex items-center space-x-2">
            <BsArrowRight />
            <span className="w-fit rounded-md bg-neutral-700 px-2 py-1 text-sm text-neutral-500">
              {project.name}
            </span>
          </div>
        </div>
        <div>
          <Hr />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="prioritySearch"
            type="text"
            className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
            placeholder={project.name}
            onChange={(event) => setConfirmDeleteText(event.target.value)}
            value={confirmDeleteText}
            autoComplete="off"
          />
          <Button
            style="neutral"
            disabled={!triggerReady}
            icon={<BsTrash />}
            className={triggerReady ? "w-fit bg-red-500" : "w-fit"}
            isLoading={deleteProjectMutation.isLoading}
            onClick={() =>
              deleteProjectMutation.mutate({
                projectID: project.ID,
              })
            }
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectModalManageProjects({
  onClose,
}: {
  onClose: () => void
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>()

  const { projects: project } = useAuth()
  const projectListQuery = project!.useList()

  if (projectListQuery.isLoading) {
    return <>Loading Projects...</>
  }
  if (projectListQuery.isError) {
    return (
      <>
        <strong>Error loading Projects:</strong>
        <pre>{extractErrorMessage(projectListQuery.error)}</pre>
      </>
    )
  }

  return deleteConfirm ? (
    <ModalDelete
      project={deleteConfirm}
      onDelete={() => setDeleteConfirm(null)}
      onBack={() => setDeleteConfirm(null)}
    />
  ) : (
    <ModalList
      projects={projectListQuery.data.data}
      showDeleteModal={(project) => setDeleteConfirm(project)}
      onClose={onClose}
    />
  )
}
