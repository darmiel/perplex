import {
  Button,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { useQueryClient } from "@tanstack/react-query"
import clsx from "clsx"
import prettyBytes from "pretty-bytes"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import {
  BsBoxArrowUpRight,
  BsBoxes,
  BsCheck2,
  BsFilePlus,
  BsLink,
  BsTrash,
  BsTrashFill,
} from "react-icons/bs"
import { toast } from "sonner"

import { Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import { UserAvatarImage } from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

function FileQuota({ projectID }: { projectID: number }) {
  const { projects } = useAuth()

  const quotaQuery = projects!.useQuota(projectID)
  if (quotaQuery.isError) {
    return <>Cannot Load Quota: {extractErrorMessage(quotaQuery.error)}</>
  }
  if (quotaQuery.isLoading) {
    return <>Loading Quota...</>
  }

  const { quota, total_size } = quotaQuery.data.data

  return (
    <Flex
      x={4}
      className="w-full whitespace-nowrap rounded-md bg-neutral-900 p-4 text-neutral-400"
    >
      <BsBoxes />
      <span className="font-bold">Project Usage</span>
      {quota === -1 ? (
        <Progress isIndeterminate color="success" size="sm" />
      ) : (
        <Progress
          value={total_size}
          maxValue={quota}
          color="success"
          size="sm"
          showValueLabel
          label={prettyBytes(total_size)}
          valueLabel={prettyBytesOrUnlimited(quota)}
        />
      )}
    </Flex>
  )
}

function FileDropzone({ projectID }: { projectID: number }) {
  const [percentage, setPercentage] = useState<number>()
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { axios, _functions } = useAuth()
  const queryClient = useQueryClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true)
    setIsSuccess(false)

    const formData = new FormData()
    formData.append("file", acceptedFiles[0])

    axios!
      .post(`/project/${projectID}/files`, formData, {
        onUploadProgress(progressEvent) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          )
          setPercentage(percentage)
          console.log("uploaded", acceptedFiles[0].name, percentage + "%")
        },
      })
      .then((resp) => {
        setIsUploading(false)
        setIsSuccess(true)

        toast.success(`File ${acceptedFiles[0].name} uploaded`)
        queryClient.invalidateQueries(
          _functions!.projects.listFilesQueryKey(projectID),
        )
        queryClient.invalidateQueries(
          _functions!.projects.quotaQueryKey(projectID),
        )
      })
      .catch((e) => {
        toast.error(`File ${acceptedFiles[0].name} failed to upload: ${e}`)
      })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const isProcessing =
    percentage !== undefined && percentage >= 99.9 && isUploading

  return (
    <div
      className={clsx(
        "flex w-full cursor-pointer flex-col items-center justify-center rounded-md bg-neutral-900 p-8",
        {
          "border border-blue-500": isDragActive,
        },
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="flex animate-pulse items-center space-x-2 rounded-md bg-neutral-800 px-4 py-2 text-sm">
        {isDragActive ? (
          <>
            <BsCheck2 />
            <span>Release to upload 😎</span>
          </>
        ) : (
          <Flex col y={1}>
            <Flex x={2}>
              <BsFilePlus />
              <span>Drag files to upload here ...</span>
              {isSuccess && <BsCheck2 />}
            </Flex>
            {percentage !== undefined && !isSuccess && (
              <Progress
                value={percentage ?? 0}
                size="sm"
                isIndeterminate={isProcessing}
                valueLabel="Processing"
              />
            )}
          </Flex>
        )}
      </div>
      <span className="mt-2 text-center text-xs text-neutral-600">
        By uploading files, you agree not to submit illegal content. <br />
        We reserve the right to remove any material at our discretion without
        notice.
      </span>
    </div>
  )
}

function FileList({ projectID }: { projectID: number }) {
  const [confirmDelete, setConfirmDelete] = useState<number>()

  const { copy } = useClipboard()

  const { projects, axios } = useAuth()

  const fileDeleteMut = projects!.useDeleteFile(projectID, ({}, { fileID }) => {
    toast.success(`File #${fileID} Deleted`)
  })

  const fileListQuery = projects!.useListFiles(projectID)
  if (fileListQuery.isError) {
    return <>Cannot Load Files: {extractErrorMessage(fileListQuery.error)}</>
  }
  if (fileListQuery.isLoading) {
    return <>Loading File List...</>
  }

  const files = fileListQuery.data.data
  console.log("files:", files)

  return (
    <Table>
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Uploaded By</TableColumn>
        <TableColumn>Last Accessed</TableColumn>
        <TableColumn>Access Count</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.ID}>
            <TableCell>{file.name}</TableCell>
            <TableCell className="flex items-center space-x-1 text-neutral-400">
              <UserAvatarImage
                userID={file.creator_id}
                className="h-5 w-5 rounded-full"
              />
              <span>
                <ResolveUserName userID={file.creator_id} />
              </span>
            </TableCell>
            <TableCell>
              {new Date(file.last_accessed_at).toISOString()}
            </TableCell>
            <TableCell>{file.access_count}</TableCell>
            <TableCell className="flex items-center space-x-1">
              <Tooltip content="Copy URL">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  startContent={<BsLink />}
                  onClick={async () => {
                    const resp = await axios!.get(
                      `${process.env.NEXT_PUBLIC_API_BASE_PATH}/project/${projectID}/files/${file.ID}/download`,
                    )
                    // open link in new tab
                    if (resp.status === 200) {
                      copy(resp.data.data)
                      toast.success("File URL Copied")
                    }
                  }}
                />
              </Tooltip>
              <Tooltip content="View/Download File">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  startContent={<BsBoxArrowUpRight />}
                  onClick={async () => {
                    const resp = await axios!.get(
                      `${process.env.NEXT_PUBLIC_API_BASE_PATH}/project/${projectID}/files/${file.ID}/download`,
                    )
                    // open link in new tab
                    if (resp.status === 200) {
                      window.open(resp.data.data, "_blank")
                    }
                  }}
                />
              </Tooltip>
              <Tooltip content="Delete File">
                <Button
                  isIconOnly
                  size="sm"
                  variant={confirmDelete === file.ID ? "solid" : "light"}
                  startContent={
                    confirmDelete === file.ID ? <BsTrashFill /> : <BsTrash />
                  }
                  color="danger"
                  onClick={() => {
                    if (confirmDelete !== file.ID) {
                      setConfirmDelete(file.ID)
                      return
                    }
                    fileDeleteMut.mutate({
                      fileID: file.ID,
                    })
                  }}
                  isLoading={fileDeleteMut.isLoading}
                />
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FileDashboard({ projectID }: { projectID: number }) {
  return (
    <section className="space-y-4">
      <FileQuota projectID={projectID} />
      <BadgeHeader title="Uploaded Files" badge={3} />
      <FileDropzone projectID={projectID} />
      <FileList projectID={projectID} />
    </section>
  )
}

export default function ProjectPageFiles({ project }: { project: Project }) {
  const { axios, projects } = useAuth()

  return project.project_file_size_quota ? (
    <FileDashboard projectID={project.ID} />
  ) : (
    <Flex
      x={2}
      className="w-full rounded-md border border-red-500 bg-red-500 bg-opacity-25 px-4 py-2 text-red-500"
    >
      <BsBoxes />
      <p>
        Your project does not have any file quota. Please contact the instance
        administrator.
      </p>
    </Flex>
  )
}

function prettyBytesOrUnlimited(bytes: number) {
  return bytes >= 0 ? prettyBytes(bytes) : "Unlimited"
}
