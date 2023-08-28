"use client"

import { useState } from "react"

import ProjectModalManageProjects from "@/components/project/modals/ProjectModalManageProjects"
import Button from "@/components/ui/Button"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function Home() {
  const [showManageProjects, setShowManageProjects] = useState(false)

  return (
    <div className="h-screen w-screen bg-slate-700 flex justify-center items-center">
      <ModalPopup open={showManageProjects} setOpen={setShowManageProjects}>
        <ProjectModalManageProjects
          onClose={() => setShowManageProjects(false)}
        />
      </ModalPopup>
      <span className="text-white">Hello World!</span>
      <Button onClick={() => setShowManageProjects(true)}>Open Modal</Button>
    </div>
  )
}
