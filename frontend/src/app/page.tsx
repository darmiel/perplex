"use client"
import Navbar from "@/components/navbar/Navbar"
import NavbarItem from "@/components/navbar/NavbarItem"
import { AuthProvider } from "@/contexts/AuthContext"
import Image from "next/image"

export default function Home() {
  return (
    <AuthProvider>
      <div className="flex">
        <aside
          id="separator-sidebar"
          className="flex-none top-0 left-0 w-20 h-screen transition-transform -translate-x-full sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-black">
            <h1 className="text-center font-bold text-3xl mt-10 text-red-500 -rotate-90">
              DMP
            </h1>

            <ul className="space-y-2 font-medium mt-10">
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 py-4 rounded-full text-white bg-gray-800 hover:bg-gray-700 group"
                >
                  <span className="flex-1 ml-3 whitespace-nowrap">D</span>
                </a>
              </li>
            </ul>

            <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-700"></ul>
          </div>
        </aside>
        <div className="flex-none w-2/12 bg-neutral-900 p-6 border-x border-neutral-700">
          <div className="bg-neutral-800 px-6 py-4 rounded-lg border border-neutral-600">
            <h1 className="font-semibold text-xl text-gray-200">
              My First Meeting 😊
            </h1>
            <span className="text-neutral-500">12.08.2023 17:05 Uhr</span>
          </div>
        </div>
        <div className="flex-none bg-neutral-950 p-6 pl-10 w-3/12">
          <ul className="space-y-4">
            <li>
              <div className="flex border border-neutral-700 p-4 rounded-lg bg-neutral-900 items-center">
                <div className="h-5">
                  <input
                    id="helper-checkbox"
                    aria-describedby="helper-checkbox-text"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="ml-4 text-l">
                  <label
                    htmlFor="helper-checkbox"
                    className="font-semibold text-gray-300"
                  >
                    Topic Title
                  </label>
                  <p
                    id="helper-checkbox-text"
                    className="text-xs font-normal text-neutral-400"
                  >
                    This is a description for my topic.
                  </p>
                </div>
              </div>
            </li>
            <li>
              <div className="flex border border-neutral-700 p-4 rounded-lg items-center">
                <div className="h-5">
                  <input
                    id="helper-checkbox"
                    aria-describedby="helper-checkbox-text"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
                    checked
                  />
                </div>
                <div className="ml-4 text-l">
                  <label
                    htmlFor="helper-checkbox"
                    className="font-semibold text-gray-600 line-through"
                  >
                    Other Topic
                  </label>
                  <p
                    id="helper-checkbox-text"
                    className="text-xs font-normal text-neutral-400"
                  >
                    This is another topic :)
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex-auto bg-neutral-950 p-6">
          <div className="flex flex-col">
            <span className="uppercase text-xs text-purple-500">Discuss</span>
            <h1 className="text-2xl font-bold">Topic Title</h1>
            <span className="text-neutral-500 my-3">
              This is a description for my topic.
            </span>
            <textarea
              className="px-3 py-2 bg-neutral-900 border border-neutral-700"
              placeholder="Write a comment..."
            ></textarea>

            <div className="my-8 border-t border-gray-700">
              <div className="flex mt-8">
                <div>
                  <img
                    src="https://picsum.photos/200"
                    alt="Avatar"
                    className="w-10 h-10 mt-1 rounded-full"
                  />
                </div>
                <div className="flex flex-col ml-3">
                  <div>
                    <span className="font-semibold">Daniel</span>
                    <span className="text-neutral-500"> - 17:05 Uhr</span>
                    <span className="ml-3 cursor-pointer px-2 py-1 bg-purple-700 rounded-sm">
                      Mark Solution
                    </span>
                  </div>
                  <div className="mt-1 text-neutral-200">This is a message</div>
                </div>
              </div>
              <div className="flex mt-8 border-l-4 border-purple-600 bg-purple-500 bg-opacity-20 pl-3 py-3">
                <div>
                  <img
                    src="https://picsum.photos/200"
                    alt="Avatar"
                    className="w-10 h-10 mt-1 rounded-full"
                  />
                </div>
                <div className="flex flex-col ml-3">
                  <div>
                    <span className="font-semibold">Daniel</span>
                    <span className="text-neutral-500"> - 17:05 Uhr</span>
                  </div>
                  <div className="mt-1 text-neutral-200">
                    This is a solution
                  </div>
                </div>
                <div className="ml-auto mr-4">
                  <span className="ml-3 cursor-pointer px-2 py-1 bg-purple-700 rounded-sm">
                    x
                  </span>
                </div>
              </div>
              <div className="flex mt-8">
                <div>
                  <img
                    src="https://picsum.photos/200"
                    alt="Avatar"
                    className="w-10 h-10 mt-1 rounded-full"
                  />
                </div>
                <div className="flex flex-col ml-3">
                  <div>
                    <span className="font-semibold">Daniel</span>
                    <span className="text-neutral-500"> - 17:06 Uhr</span>
                    <span className="ml-1 cursor-pointer px-2 py-1 text-purple-500 rounded-sm underline underline-offset-2">
                      Mark Solution
                    </span>
                  </div>
                  <div className="mt-1 text-neutral-200">
                    This is one more message
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
