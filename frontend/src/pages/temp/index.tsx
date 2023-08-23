export default function Temp() {
  return (
    <div className="p-10 flex flex-col h-20 w-8/12">
      <div>
        <textarea className="text-white w-full bg-gray-700 border border-gray-500">
          This is some text!
        </textarea>
      </div>
      <div>
        <button className="bg-purple-600 px-4 py-2 w-full">Click</button>
      </div>
    </div>
  )
}
