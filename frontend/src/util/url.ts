function buildURL(paths: any | any[], params?: any): string {
  const path = Array.isArray(paths) ? paths.join("/") : paths
  const url = new URL(path, window.location.origin)

  if (params) {
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key])
    })
  }

  return url.toString()
}

export function getProjectURL(projectID: number): string {
  return buildURL(["project", projectID])
}

export function getMeetingURL(projectID: number, meetingID: number): string {
  return buildURL(["project", projectID, "meeting", meetingID])
}

export function getActionURL(projectID: number, actionID: number): string {
  return buildURL(["project", projectID, "action", actionID])
}
