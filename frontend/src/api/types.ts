export interface Project {
  ID: number
  CreatedAt: string
  DeletedAt: string
  UpdatedAt: string
  name: string
  description: string
  ownerID: string
}

/*
	// Name if the meeting
	Name string `json:"name,omitempty"`
	// StartDate of the meeting
	StartDate time.Time `json:"startDate"`
	// Topics of the meeting
	Topics []Topic `json:"topics,omitempty"`
	// ProjectID is the project the meeting belongs to
	ProjectID uint `json:"projectID,omitempty"`
  */
export interface Meeting {
  name: string
  startDate: string
}

export interface BackendResponse<T = never> {
  success: boolean
  error: string
  message: string
  data: T
}
