import { Axios } from "axios"

export type sendCommentMutVars = {
  comment: string
}

export const functions = (axios: Axios) => ({
  // ======================
  // Project
  // ======================
  projectListQueryFn() {
    return async () => (await axios!.get("/project")).data
  },
  projectListQueryKey() {
    return ["projects"]
  },

  projectGetQueryFn(projectID: any) {
    return async () => (await axios!.get(`/project/${projectID}`)).data
  },
  projectGetQueryKey(projectID: string) {
    return [{ projectID }]
  },

  projectUsersQueryFn(projectID: any) {
    return async () => (await axios!.get(`/project/${projectID}/users`)).data
  },
  projectUsersQueryKey(projectID: string) {
    return [{ projectID }, "users"]
  },

  // ======================
  // Meeting
  // ======================
  meetingListQueryFn(projectID: any) {
    return async () => (await axios!.get(`/project/${projectID}/meeting`)).data
  },
  meetingListQueryKey(projectID: string) {
    return [{ projectID }, "meetings"]
  },

  meetingCreateMutFn(
    projectID: any,
    title: string,
    description: string,
    date: Date,
  ) {
    return async () =>
      (
        await axios!.post(`/project/${projectID}/meeting`, {
          name: title,
          description: description,
          start_date: date,
        })
      ).data
  },
  meetingCreateMutKey(projectID: string) {
    return [{ projectID }, "meeting-create-mut"]
  },

  meetingInfoQueryFn(projectID: any, meetingID: any) {
    return async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}`)).data
  },
  meetingInfoQueryKey(projectID: string, meetingID: string) {
    return [{ projectID }, { meetingID }]
  },

  meetingUpdateMutFn(
    projectID: string,
    meetingID: string,
    title: string,
    description: string,
    date: Date,
  ) {
    return async () =>
      (
        await axios!.put(`/project/${projectID}/meeting/${meetingID}`, {
          name: title,
          description: description,
          start_date: date,
        })
      ).data
  },
  meetingUpdateMutKey(projectID: string, meetingID: string) {
    return [{ projectID }, { meetingID }, "meeting-update-mut"]
  },

  // ======================
  // Topic
  // ======================
  topicListQueryFn(projectID: any, meetingID: any) {
    return async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}/topic`))
        .data
  },
  topicListQueryKey(projectID: string, meetingID: string) {
    return [{ projectID }, { meetingID }, "topics"]
  },

  topicInfoQueryFn(projectID: any, meetingID: any, topicID: any) {
    return async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
        )
      ).data
  },
  topicInfoQueryKey(
    projectID: string,
    meetingID: string,
    topicID: string | number,
  ) {
    return [{ projectID }, { meetingID }, { topicID: String(topicID) }]
  },

  topicStatusMutFn(projectID: any, meetingID: any, topicID: any) {
    return async (check: boolean) =>
      (
        await axios![check ? "post" : "delete"](
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
        )
      ).data
  },
  topicStatusMutKey(projectID: string, meetingID: string, topicID: any) {
    return [
      { projectID },
      { meetingID },
      { topicID: String(topicID) },
      "status-assign-mut",
    ]
  },

  topicUpdateMutFn(
    projectID: string,
    meetingID: string,
    topicID: string,
    title: string,
    description: string,
    force_solution: boolean,
  ) {
    return async () =>
      (
        await axios!.put(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
          {
            title: title,
            description: description,
            force_solution: force_solution,
          },
        )
      ).data
  },
  topicUpdateMutKey(projectID: string, meetingID: string, topicID: string) {
    return [{ projectID }, { meetingID }, { topicID }, "topic-update-mut"]
  },

  createTopicMutFn(
    projectID: any,
    meetingID: any,
    title: any,
    description: any,
    discuss: boolean,
  ) {
    return async () =>
      (
        await axios!.post(`/project/${projectID}/meeting/${meetingID}/topic`, {
          title: title,
          description: description,
          force_solution: discuss,
        })
      ).data
  },
  createTopicMutKey(projectID: string, meetingID: string) {
    return [{ projectID }, { meetingID }, "topic-create-mut"]
  },

  assignTopicMutFn(projectID: any, meetingID: any) {
    return async ({ userIDs, topicID }: { userIDs: string[]; topicID: any }) =>
      (
        await axios.post(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/assign`,
          {
            assigned_users: userIDs,
          },
        )
      ).data
  },
  assignTopicMutKey(projectID: string, meetingID: string) {
    return [{ projectID }, { meetingID }, "topic-assign-mut"]
  },

  // ======================
  // Comment
  // ======================
  commentListQueryFn(projectID: any, meetingID: any, topicID: any) {
    return async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`,
        )
      ).data
  },
  commentListQueryKey(projectID: string, meetingID: string, topicID: string) {
    return [{ projectID }, { meetingID }, { topicID }, "comments"]
  },

  commentSendMutFn(projectID: string, meetingID: string, topicID: string) {
    return async ({ comment }: sendCommentMutVars) =>
      (
        await axios!.post(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`,
          comment,
        )
      ).data
  },
  commentSendMutKey(projectID: string, meetingID: string, topicID: string) {
    return [{ projectID }, { meetingID }, { topicID }, "comment-send-mut"]
  },

  // ======================
  // User
  // ======================
  userResolveQueryFn(userID: string) {
    return async () => (await axios!.get(`/user/resolve/${userID}`)).data
  },
  userResolveQueryKey(userID: string) {
    return [{ userID }]
  },
})