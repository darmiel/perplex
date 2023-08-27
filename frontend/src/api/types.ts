export interface NullTime {
  Valid: boolean
  Time: string
}

export interface Project {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  name: string
  description: string
  owner_id: string
}

export interface BackendResponse<T = never> {
  success: boolean
  error: string
  message: string
  data: T
}

export type CommentType = {
  ID: number
  author_id: string
  content: string
  CreatedAt: string
  UpdatedAt: string
}

export type Meeting = {
  ID: number
  CreatedAt: string
  name: string
  description: string
  start_date: string
  creator?: User
  creator_id: string
}

export type User = {
  id: string
  name: string
}

export type Topic = {
  ID: number
  title: string
  description: string
  force_solution?: boolean
  comments: CommentType[]
  solution_id?: number
  closed_at: NullTime
  assigned_users: User[]
  creator: User
  creator_id: string
  CreatedAt: string
  UpdatedAt: string
}

export type Priority = {
  ID: number
  title: string
  weight: number
  color: string
  project_id: number
  project?: Project
}

export type Action = {
  ID: number
  title: string
  description: string
  due_date: NullTime
  project_id: number
  topics: Topic[]
  assigned_users: User[]
  priority_id: number
  priority?: Priority
  tags: Tag[]
  closed_at: NullTime
}

export type Tag = {
  ID: number
  title: string
  color: string
  project_id: number
}
