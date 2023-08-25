import { useQuery } from "@tanstack/react-query"
import { ClipLoader } from "react-spinners"

import { BackendResponse, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import NavbarItem from "@/components/navbar/NavbarItem"
import { useAuth } from "@/contexts/AuthContext"

export default function Navbar() {
  const { axios } = useAuth()

  const projectListQuery = useQuery<BackendResponse<Project[]>>({
    queryKey: ["projects"],
    queryFn: async () => (await axios!.get("/project")).data,
  })

  return (
    <aside
      id="separator-sidebar"
      className="flex-none top-0 left-0 w-20 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-black">
        <h1 className="text-center font-bold text-3xl mt-10 text-primary-600 -rotate-90">
          DMP
        </h1>

        <ul className="space-y-4 font-medium mt-10 flex flex-col items-center">
          {projectListQuery.isLoading ? (
            <ClipLoader color="white" />
          ) : projectListQuery.isError ? (
            <div>
              Error: <pre>{extractErrorMessage(projectListQuery.error)}</pre>
            </div>
          ) : (
            projectListQuery.data.data.map((project, key) => (
              <NavbarItem
                key={key}
                alt={project.name}
                href={`/project/${project.ID}`}
              />
            ))
          )}
        </ul>
      </div>
    </aside>
  )
}
