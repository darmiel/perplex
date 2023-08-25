export interface Project {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  name: string
  description: string
  ownerID: string
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
  name: string
  start_date: string
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
  closed_at: {
    Valid: boolean
  }
  assigned_users: User[]
}
