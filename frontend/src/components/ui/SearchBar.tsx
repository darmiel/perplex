import { Input } from "@nextui-org/react"
import { useState } from "react"
import { BsSearch } from "react-icons/bs"

import { includesFold } from "@/api/util"

export default function useSearch<T>(transformer?: (item: T) => string) {
  const [filter, setFilter] = useState("")

  return {
    component: (
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search...`}
        width="100%"
        size="sm"
      />
    ),
    filter: (item: T) => {
      if (!filter) {
        return true
      }
      if (transformer) {
        return includesFold(transformer(item), filter)
      }
      if (typeof item === "string") {
        return includesFold(item, filter)
      }
      throw new Error("No transformer or string")
    },
  }
}
