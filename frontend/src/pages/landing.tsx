import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BsChevronRight, BsGithub } from "react-icons/bs"
import { FcGoogle } from "react-icons/fc"

import ModalContainerNG from "@/components/ui/modal/ModalContainerNG"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { auth } from "@/firebase/firebase"

import HeroImage from "../../public/hero.png"
import LogoImage from "../../public/perplex.svg"

const links = {
  contribute: "https://github.com/darmiel/perplex",
  issues: "https://github.com/darmiel/perplex/issues",
  changelog: "https://github.com/darmiel/perplex/releases",
}

function LoginButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode
  text?: string
  onClick?: () => void
}) {
  const animationClass =
    "grayscale transition hover:text-neutral-400 hover:grayscale-0"
  return text ? (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 rounded-md bg-black  px-4 py-2 text-sm text-neutral-200 hover:scale-105 ${animationClass}`}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  ) : (
    <button
      onClick={onClick}
      className={`rounded-md border border-neutral-700 bg-black p-3 ${animationClass}`}
    >
      {icon}
    </button>
  )
}

const signinGitHub = () => {
  const provider = new GithubAuthProvider()
  return signInWithPopup(auth, provider)
}

const signinGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export default function LandingPage() {
  const [showImprint, setShowImprint] = useState(false)

  return (
    <div
      className="flex h-screen w-screen flex-col items-center"
      style={{
        background: `radial-gradient(
            39.72% 52.64% at 73.25% 53.13%, 
            rgba(50, 169, 255, 0.50) 0%, 
            rgba(0, 0, 0, 0.00) 
            100%
          ), radial-gradient(
            35.41% 43.21% at 57.28% 40.94%, 
            rgba(189, 50, 255, 0.50) 0%, 
            rgba(0, 0, 0, 0.00) 100%
          ), #121212`,
      }}
    >
      <nav className="flex h-20 w-full items-center justify-center bg-black bg-opacity-50">
        <div className="flex w-full max-w-5xl items-center justify-between px-10 lg:px-0">
          <Link href="/" className="hidden lg:block">
            <Image src={LogoImage} alt="Perplex Logo" width={40} height={40} />
          </Link>

          <div className="flex items-center space-x-12">
            <Link href={links.contribute} target="_blank">
              Contribute
            </Link>
            <Link href={links.issues} target="_blank">
              Issues
            </Link>
            <Link href={links.changelog} target="_blank">
              Changelog
            </Link>
          </div>

          <Link
            href={links.changelog}
            target="_blank"
            className="hidden rounded-full border-2 border-neutral-500 px-4 py-2 text-xs text-neutral-400 md:block"
          >
            v0.5.0-beta released
          </Link>

          <div className="hidden items-center space-x-2 md:flex">
            <span className="text-sm font-medium text-neutral-300">
              Login using
            </span>
            <LoginButton icon={<BsGithub />} onClick={signinGitHub} />
            <LoginButton icon={<FcGoogle />} onClick={signinGoogle} />
          </div>
        </div>
      </nav>

      <div className="flex h-full w-full max-w-5xl items-center justify-center">
        <section className="flex w-full flex-col items-center justify-between space-x-10 lg:flex-row">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold">Peerplex</h1>
              <p className="text-neutral-400">
                Your collaborative meeting notes,
                <br />
                meeting planner and task manager.
              </p>
            </div>
            <div className="flex space-x-2">
              <LoginButton
                icon={<BsGithub />}
                text="Sign In with GitHub"
                onClick={signinGitHub}
              />
              <LoginButton
                icon={<FcGoogle />}
                text="Sign In with Google"
                onClick={signinGoogle}
              />
            </div>
            <Link
              href={links.contribute}
              target="_blank"
              className="group flex w-fit items-center space-x-2"
            >
              <span className="text-neutral-400 transition-colors hover:text-neutral-100">
                Contribute on GitHub
              </span>
              <BsChevronRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative h-[50vh] w-full flex-1">
            <Image src={HeroImage} fill alt="Hero" className="object-contain" />
          </div>
        </section>
      </div>
      <footer className="flex h-20 w-full items-center justify-center bg-black bg-opacity-50">
        <div className="flex w-full max-w-5xl items-center justify-between px-10 text-xs text-neutral-500 lg:px-0">
          <span>&copy; 2023 peerplex.app</span>
          <button onClick={() => setShowImprint(true)}>Imprint</button>
        </div>
      </footer>
      <ModalPopup open={showImprint} setOpen={setShowImprint}>
        <ModalContainerNG title="Imprint" onClose={() => setShowImprint(false)}>
          <Imprint />
        </ModalContainerNG>
      </ModalPopup>
    </div>
  )
}

const imprint = {
  name: process.env.NEXT_PUBLIC_IMPRINT_NAME || "Not set",
  email: process.env.NEXT_PUBLIC_IMPRINT_EMAIL_BASE64 || "Not set",
}

export function Imprint() {
  return (
    <>
      <p>
        This
        <Link href={links.contribute}>Perplex</Link>
        instance is hosted by {imprint.name}.
      </p>
      <p className="space-x-1">
        <span>For more information, please contact</span>
        <span className="text-primary-400 underline">
          {Buffer.from(imprint.email, "base64").toString("utf-8")}
        </span>
      </p>
    </>
  )
}
