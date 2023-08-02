import NavbarItem from "./NavbarItem"

type Project = {
  ID: number
  name: string
}

export default function Navbar() {
  const projects: Project[] = [
    {
      ID: 1,
      name: "Backstage",
    },
    {
      ID: 2,
      name: "Praxisphase",
    },
    {
      ID: 3,
      name: "Sonstige",
    },
  ]
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
          {projects.map((project, key) => (
            <NavbarItem
              key={key}
              alt={project.name}
              href={`/project/${project.ID}`}
            />
          ))}
        </ul>
      </div>
    </aside>
  )
}
