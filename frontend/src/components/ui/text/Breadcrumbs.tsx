import Link from "next/link"
import React, { ReactNode } from "react"

function BreadcrumbsItem({
  href,
  children,
}: {
  href?: string
  children: ReactNode
}) {
  if (!href) {
    return <span className="text-white">{children}</span>
  }
  return (
    <Link href={href} className="text-neutral-400 hover:text-primary-400">
      {children}
    </Link>
  )
}

function Breadcrumbs({ children }: { children: ReactNode }) {
  const childrenArray = React.Children.toArray(children)
  const withSeparatorChildren = childrenArray.map((item, index) => {
    if (!React.isValidElement(item)) {
      return item
    }
    if (item.type === BreadcrumbsItem) {
      return (
        <React.Fragment key={index}>
          {!!index && <span className="text-gray-400">/</span>}
          {item}
        </React.Fragment>
      )
    }
  })

  return (
    <span className="flex items-center gap-2">{withSeparatorChildren}</span>
  )
}

Breadcrumbs.Item = BreadcrumbsItem

export default Breadcrumbs
