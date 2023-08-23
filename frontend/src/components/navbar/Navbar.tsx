import NavbarItem from "@/components/navbar/NavbarItem"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { ClipLoader, MoonLoader } from "react-spinners"
import { extractErrorMessage } from "@/api/util"

type Project = {
  ID: number
  name: string
}

export default function Navbar() {
  const { axios } = useAuth()

  const projectListQuery = useQuery<{ data: Project[] }>({
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
        <h1 className="text-center font-bold text-3xl mt-10 text-red-500 -rotate-90">
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
