import { Axios } from "axios"

import { CommentEntityType } from "@/api/types"

export type sendCommentMutVars = {
  comment: string
}

export type projectUserAddVars = {
  userID: string
  add: boolean
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

  projectGetQueryFn(projectID: number) {
    return async () => (await axios!.get(`/project/${projectID}`)).data
  },
  projectGetQueryKey(projectID: number) {
    return [{ projectID }]
  },

  projectUsersQueryFn(projectID: number) {
    return async () => (await axios!.get(`/project/${projectID}/users`)).data
  },
  projectUsersQueryKey(projectID: number) {
    return [{ projectID }, "users"]
  },

  projectUserAddMutFn(projectID: number) {
    return async ({ userID, add }: projectUserAddVars) =>
      (
        await axios![add ? "post" : "delete"](
          `/project/${projectID}/user/${userID}`,
        )
      ).data
  },
  projectUserAddMutKey(projectID: number) {
    return [{ projectID }, "user-add-mut"]
  },

  projectUpdateMutFn(projectID: number, name: string, description: string) {
    return async () =>
      (
        await axios!.put(`/project/${projectID}`, {
          name,
          description,
        })
      ).data
  },
  projectUpdateMutKey(projectID: number) {
    return [{ projectID }, "project-update-mut"]
  },

  // ======================
  // Meeting
  // ======================
  meetingListQueryFn(projectID: number) {
    return async () => (await axios!.get(`/project/${projectID}/meeting`)).data
  },
  meetingListQueryKey(projectID: number) {
    return [{ projectID }, "meetings"]
  },

  meetingCreateMutFn(
    projectID: number,
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
  meetingCreateMutKey(projectID: number) {
    return [{ projectID }, "meeting-create-mut"]
  },

  meetingInfoQueryFn(projectID: number, meetingID: number) {
    return async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}`)).data
  },
  meetingInfoQueryKey(projectID: number, meetingID: number) {
    return [{ projectID }, { meetingID }]
  },

  meetingUpdateMutFn(
    projectID: number,
    meetingID: number,
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
  meetingUpdateMutKey(projectID: number, meetingID: number) {
    return [{ projectID }, { meetingID }, "meeting-update-mut"]
  },

  // ======================
  // Topic
  // ======================
  topicListQueryFn(projectID: number, meetingID: number) {
    return async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}/topic`))
        .data
  },
  topicListQueryKey(projectID: number, meetingID: number) {
    return [{ projectID }, { meetingID }, "topics"]
  },

  topicInfoQueryFn(projectID: number, meetingID: number, topicID: number) {
    return async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
        )
      ).data
  },
  topicInfoQueryKey(projectID: number, meetingID: number, topicID: number) {
    return [{ projectID }, { meetingID }, { topicID }]
  },

  topicStatusMutFn(projectID: number, meetingID: number, topicID: number) {
    return async (check: boolean) =>
      (
        await axios![check ? "post" : "delete"](
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
        )
      ).data
  },
  topicStatusMutKey(projectID: number, meetingID: number, topicID: number) {
    return [{ projectID }, { meetingID }, { topicID }, "status-assign-mut"]
  },

  topicUpdateMutFn(
    projectID: number,
    meetingID: number,
    topicID: number,
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
  topicUpdateMutKey(projectID: number, meetingID: number, topicID: number) {
    return [{ projectID }, { meetingID }, { topicID }, "topic-update-mut"]
  },

  createTopicMutFn(
    projectID: number,
    meetingID: number,
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
  createTopicMutKey(projectID: number, meetingID: number) {
    return [{ projectID }, { meetingID }, "topic-create-mut"]
  },

  assignTopicMutFn(projectID: number, meetingID: number) {
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
  assignTopicMutKey(projectID: number, meetingID: number) {
    return [{ projectID }, { meetingID }, "topic-assign-mut"]
  },

  // ======================
  // Comment
  // ======================
  commentListQueryFn(
    projectID: number,
    entityType: CommentEntityType,
    entityID: number,
  ) {
    return async () =>
      (
        await axios!.get(
          `/project/${projectID}/comment/${entityType}/${entityID}`,
        )
      ).data
  },
  commentListQueryKey(
    projectID: number,
    entityType: CommentEntityType,
    entityID: number,
  ) {
    return [{ projectID }, "comments", entityType, entityID]
  },

  commentSendMutFn(
    projectID: number,
    entityType: CommentEntityType,
    entityID: number,
  ) {
    return async ({ comment }: sendCommentMutVars) =>
      (
        await axios!.post(
          `/project/${projectID}/comment/${entityType}/${entityID}`,
          comment,
        )
      ).data
  },
  commentSendMutKey(
    projectID: number,
    entityType: CommentEntityType,
    entityID: number,
  ) {
    return [{ projectID }, "comments", entityType, entityID, "comment-send-mut"]
  },

  commentDeleteMutFn(projectID: number, commentID: number) {
    return async () =>
      (await axios!.delete(`/project/${projectID}/comment/${commentID}`)).data
  },
  commentDeleteMutKey(commentID: number) {
    return [{ commentID }, "comment-delete-mut"]
  },

  commentEditMutFn(projectID: number, commentID: number) {
    return async (content: string) =>
      (await axios!.put(`/project/${projectID}/comment/${commentID}`, content))
        .data
  },
  commentEditMutKey(commentID: number) {
    return [{ commentID }, "comment-edit-mut"]
  },

  commentMarkSolutionMutFn(projectID: number) {
    return async ({ mark, commentID }: { mark: boolean; commentID: number }) =>
      (
        await axios![mark ? "post" : "delete"](
          `/project/${projectID}/comment/solution/${commentID}`,
        )
      ).data
  },
  commentMarkSolutionMutKey(topicID: number) {
    return [{ topicID }, "solution-mut"]
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

  userChangeNameMutFn() {
    return async (newName: string) =>
      (await axios!.put(`/user/me`, { new_name: newName })).data
  },
  userChangeNameMutKey() {
    return ["user-change-name-mut"]
  },

  userListQueryFn(query: string, page: number) {
    return async () =>
      (
        await axios!.get(
          `/user?query=${encodeURIComponent(query)}&page=${page}`,
        )
      ).data
  },
  userListQueryKey(query: string, page: number) {
    return ["users", page, { query }]
  },
})
