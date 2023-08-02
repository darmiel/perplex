import NavbarItem from "./NavbarItem"

export default function Navbar() {
  return (
    <aside
      id="separator-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800">
        <ul className="space-y-2 font-medium">
          <NavbarItem title="Dashboard" href="/" badge="4 ABC" />
        </ul>

        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-700">
          <NavbarItem key={1} title="Backstage" href={`/project/1`} />
          <NavbarItem key={2} title="Praxisphase" href={`/project/2`} />
          <NavbarItem key={3} title="Other" href={`/project/3`} />
        </ul>
      </div>
    </aside>
  )
}
