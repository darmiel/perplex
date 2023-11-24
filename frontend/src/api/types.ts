export type CommentEntityType = "topic" | "meeting" | "action" | "project"

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
  max_project_file_size: number
  project_file_size_quota: number
}

export interface BackendResponse<T = never> {
  success: boolean
  error: string
  message: string
  data: T
}

export type Comment = {
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
  end_date: string
  creator?: User
  creator_id: string
  project_id: number
  assigned_users?: User[]
  tags: Tag[]
}

export type User = {
  id: string
  name: string
}

export type Topic = {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  title: string
  description: string
  force_solution?: boolean
  comments?: Comment[]
  solution_id?: number
  closed_at: NullTime
  assigned_users: User[]
  creator: User
  creator_id: string
  meeting_id: number
  Meeting: Meeting
  tags: Tag[]
  priority_id: number
  priority?: Priority
  lexo_rank?: string
}

export type Priority = {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  title: string
  weight: number
  color: string
  project_id: number
  project?: Project
}

export type Action = {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
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
  creator_id: string
}

export type Tag = {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  title: string
  color: string
  project_id: number
}

export type SearchResult = {
  projects: Project[]
  meetings: Meeting[]
  topics: Topic[]
  actions: Action[]
  topic_meeting_id: { [key: number]: number }
}

export type Notification = {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string
  title: string
  suffix: string
  description: string
  user_id: string
  read_at: NullTime
  link: string
  link_title: string
}

export interface Quota {
  // TotalSize is the total size of all files in the project
  total_size: number
  // Quota is the quota (max total size of all files) of the project
  quota: number
  // MaxFileSize is the maximum file size of a single file
  max_file_size: number
}

export interface ProjectFile {
  // ID of the GORM model (unique identifier for the file model)
  ID: number
  // Time when the model was created
  createdAt: Date
  // Time when the model was last updated
  updatedAt: Date
  // Time if the model is soft-deleted (optional)
  deletedAt?: Date
  // Name of the file
  name: string
  // ObjectKey is the key of the file in the bucket
  object_key: string
  // Size is the size of the file in bytes
  size: number
  // ProjectID is the ID of the project the file belongs to
  project_id: number
  // CreatorID is the ID of the creator of the file
  creator_id: string
  // Comments for the file (optional)
  comments?: Comment[]
  // LastAccessedAt is the time when the file was last accessed
  last_accessed_at: string
  // AccessCount is the number of times the file was accessed
  access_count: number
}
