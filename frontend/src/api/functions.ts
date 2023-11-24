import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { Axios, AxiosError } from "axios"

import {
  Action,
  BackendResponse,
  Comment,
  CommentEntityType,
  Meeting,
  Notification,
  Priority,
  Project,
  ProjectFile,
  Quota,
  SearchResult,
  Tag,
  Topic,
  User,
} from "@/api/types"
import { toastError } from "@/api/util"

// ======================
// Project Types
// ======================
export type projectCreateVars = {
  name: string
  description: string
}

export type projectDeleteVars = {
  projectID: number
}

export type projectLeaveVars = {
  projectID: number
}

export type projectEditVars = {
  projectID: number
  name: string
  description: string
}

export type projectUserLinkVars = {
  userID: string
  link: boolean
}

export type projectFileDeleteVars = {
  fileID: number
}

// ======================
// Meeting Types
// ======================
export type meetingDeleteVars = {
  meetingID: number
}

export type meetingUpdateVars = {
  meetingID: number
  title: string
  description: string
  start_date: Date
  end_date: Date
}

export type meetingCreateVars = {
  title: string
  description: string
  start_date: Date
  end_date: Date
  __should_close: boolean
}

export type meetingLinkUserVars = {
  userID: string
  link: boolean
}

export type meetingLinkTagVars = {
  tagID: number
  link: boolean
}

// ======================
// Topic Types
// ======================
export type topicUpdateVars = {
  title: string
  description: string
  force_solution: boolean
  priority_id: number
}

export type topicDeleteVars = {
  topicID: number
}

export type topicAssignUsersVars = {
  link: boolean
  userID: string
  topicID: number
}

export type topicCreateVars = {
  title: string
  description: string
  force_solution: boolean
  priority_id: number
  __should_close: boolean
}

export type topicStatusVars = {
  topicID: number
  close: boolean
}

export type topicLinkTagVars = {
  topicID: number
  tagID: number
  link: boolean
}

export type topicSubscribeVars = {
  subscribe: boolean
}

export type topicUpdateOrderVars = {
  topicID: number
  before: number
  after: number
}

// ======================
// Project Tag Types
// ======================
export type tagCreateVars = {
  title: string
  color: string
}

export type tagEditVars = {
  tagID: number
  editTitle: string
  editColor: string
}

export type tagDeleteVars = {
  tagID: number
}

// ======================
// Project Priority Types
// ======================
export type priorityCreateVars = {
  title: string
  color: string
  weight: number
}

export type priorityEditVars = {
  priorityID: number
  editTitle: string
  editColor: string
  editWeight: number
}

export type priorityDeleteVars = {
  priorityID: number
}

// ======================
// Comment Types
// ======================
export type sendCommentVars = {
  __shift?: boolean
  comment: string
}

export type commentMarkSolutionVars = {
  mark: boolean
  commentID: number
}

export type commentDeleteVars = {
  commentID: number
}

export type commentEditVars = {
  commentID: number
  content: string
}

// ======================
// Action Types
// ======================
export type actionCreateVars = {
  title: string
  description: string
  due_date: string
  priority_id: number
}

export type actionEditVars = {
  actionID: number
  title: string
  description: string
  due_date: string
  priority_id: number
}

export type actionLinkVars = {
  link: boolean
  meetingID: number
  topicID: number
  actionID: number
}

export type actionLinkTagVars = {
  actionID: number
  tagID: number
  link: boolean
}

export type actionLinkUserVars = {
  actionID: number
  userID: string
  link: boolean
}

export type actionStatusVars = {
  actionID: number
  closed: boolean
}

// ======================
// User Types
// ======================

export type userChangeNameVars = {
  newName: string
}

export type userNotificationReadVars = {
  notificationID: number
}

export type SuccessCallback<Data, Variables> = (
  data: BackendResponse<Data>,
  vars: Variables,
) => void

export const functions = (axios: Axios, client: QueryClient) => {
  /**
   * Invalidates all queries with the given keys and calls the callback
   * @param callback the callback to call after invalidating
   * @param key the keys to invalidate
   * @returns a callback that can be used as onSuccess
   */
  function invalidateAllCallback<Data, Variables>(
    callback?: SuccessCallback<Data, Variables>,
    ...key: Array<Array<any> | ((variables: Variables) => Array<any>)>
  ) {
    return (data: BackendResponse<Data>, variables: Variables) => {
      for (const k of key) {
        const invalidateKey = Array.isArray(k) ? k : k(variables)
        client.invalidateQueries(invalidateKey)
      }
      callback?.(data, variables)
    }
  }

  const functions = {
    projects: {
      deleteMutFn() {
        return async ({ projectID }: projectDeleteVars) =>
          (await axios.delete(`/project/${projectID}/delete`)).data
      },
      deleteMutKey() {
        return ["project-delete-mut"]
      },
      listQueryFn() {
        return async () => (await axios.get("/project")).data
      },
      listQueryKey() {
        return ["projects"]
      },

      getQueryFn(projectID: number) {
        return async () => (await axios.get(`/project/${projectID}`)).data
      },
      getQueryKey(projectID: number) {
        return [{ projectID }]
      },

      usersQueryFn(projectID: number) {
        return async () => (await axios.get(`/project/${projectID}/users`)).data
      },
      usersQueryKey(projectID: number) {
        return [{ projectID }, "users"]
      },

      userAddMutFn(projectID: number) {
        return async ({ userID, link }: projectUserLinkVars) =>
          (
            await axios[link ? "post" : "delete"](
              `/project/${projectID}/user/${userID}`,
            )
          ).data
      },
      userAddMutKey(projectID: number) {
        return [{ projectID }, "user-add-mut"]
      },

      updateMutFn() {
        return async ({ projectID, name, description }: projectEditVars) =>
          (
            await axios.put(`/project/${projectID}`, {
              name,
              description,
            })
          ).data
      },
      updateMutKey() {
        return ["project-update-mut"]
      },

      createMutFn() {
        return async ({ name, description }: projectCreateVars) =>
          (
            await axios.post(`/project`, {
              name,
              description,
            })
          ).data
      },
      createMutKey() {
        return ["project-create-mut"]
      },

      leaveMutFn() {
        return async ({ projectID }: projectLeaveVars) =>
          (await axios.delete(`/project/${projectID}/leave`)).data
      },
      leaveMutKey() {
        return ["project-leave-mut"]
      },

      quotaQueryFn(projectID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/files/quota`)).data
      },
      quotaQueryKey(projectID: number) {
        return [{ projectID }, "quota"]
      },

      listFilesQueryFn(projectID: number) {
        return async () => (await axios.get(`/project/${projectID}/files`)).data
      },
      listFilesQueryKey(projectID: number) {
        return [{ projectID }, "files"]
      },

      deleteFileMutFn(projectID: number) {
        return async ({ fileID }: projectFileDeleteVars) =>
          (await axios.delete(`/project/${projectID}/files/${fileID}`)).data
      },
      deleteFileMutKey(projectID: number) {
        return [{ projectID }, "file-delete-mut"]
      },
    },
    tags: {
      listQueryFn(projectID: number) {
        return async () => (await axios.get(`/project/${projectID}/tag`)).data
      },
      listQueryKey(projectID: number) {
        return [{ projectID }, "tags"]
      },

      createMutFn(projectID: number) {
        return async ({ title, color }: tagCreateVars) =>
          (
            await axios.post(`/project/${projectID}/tag`, {
              title,
              color,
            })
          ).data
      },
      createMutKey(projectID: number) {
        return [{ projectID }, "tag-create-mut"]
      },

      editMutFn(projectID: number) {
        return async ({ tagID, editTitle, editColor }: tagEditVars) =>
          (
            await axios!.put(`/project/${projectID}/tag/${tagID}`, {
              title: editTitle,
              color: editColor,
            })
          ).data
      },
      editMutKey(projectID: number) {
        return [{ projectID }, "tag-edit-mut"]
      },

      deleteMutFn(projectID: number) {
        return async ({ tagID }: tagDeleteVars) =>
          (await axios.delete(`/project/${projectID}/tag/${tagID}`)).data
      },
      deleteMutKey(projectID: number) {
        return [{ projectID }, "tag-delete-mut"]
      },
    },
    priorities: {
      listQueryFn(projectID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/priority`)).data
      },
      listQueryKey(projectID: number) {
        return [{ projectID }, "priorities"]
      },

      createMutFn(projectID: number) {
        return async ({ title, color, weight }: priorityCreateVars) =>
          (
            await axios.post(`/project/${projectID}/priority`, {
              title,
              color,
              weight,
            })
          ).data
      },
      createMutKey(projectID: number) {
        return [{ projectID }, "priority-create-mut"]
      },

      editMutFn(projectID: number) {
        return async ({
          priorityID,
          editTitle,
          editColor,
          editWeight,
        }: priorityEditVars) =>
          (
            await axios.put(`/project/${projectID}/priority/${priorityID}`, {
              title: editTitle,
              color: editColor,
              weight: editWeight,
            })
          ).data
      },
      editMutKey(projectID: number) {
        return [{ projectID }, "priority-edit-mut"]
      },

      deleteMutFn(projectID: number) {
        return async ({ priorityID }: priorityDeleteVars) =>
          (await axios.delete(`/project/${projectID}/priority/${priorityID}`))
            .data
      },
      deleteMutKey(projectID: number) {
        return [{ projectID }, "priority-delete-mut"]
      },
    },
    meetings: {
      listQueryFn(projectID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/meeting`)).data
      },
      listQueryKey(projectID: number) {
        return [{ projectID }, "meetings"]
      },

      createMutFn(projectID: number) {
        return async ({
          title,
          description,
          start_date,
          end_date,
        }: meetingCreateVars) =>
          (
            await axios.post(`/project/${projectID}/meeting`, {
              name: title,
              description,
              start_date,
              end_date,
            })
          ).data
      },
      createMutKey(projectID: number) {
        return [{ projectID }, "meeting-create-mut"]
      },

      deleteMutFn(projectID: number) {
        return async ({ meetingID }: meetingDeleteVars) =>
          (await axios.delete(`/project/${projectID}/meeting/${meetingID}`))
            .data
      },
      deleteMutKey(projectID: number) {
        return [{ projectID }, "meeting-delete-mut"]
      },

      editMutFn(projectID: number) {
        return async ({
          meetingID,
          title,
          description,
          start_date,
          end_date,
        }: meetingUpdateVars) =>
          (
            await axios.put(`/project/${projectID}/meeting/${meetingID}`, {
              name: title,
              description: description,
              start_date,
              end_date,
            })
          ).data
      },
      editMutKey(projectID: number) {
        return [{ projectID }, "meeting-edit-mut"]
      },

      findQueryFn(projectID: number, meetingID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/meeting/${meetingID}`)).data
      },
      findQueryKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }]
      },

      listUpcomingQueryFn() {
        return async () => (await axios.get(`/user/me/upcoming-meetings`)).data
      },
      listUpcomingQueryKey() {
        return ["upcoming-meetings"]
      },

      linkUserMutFn(projectID: number, meetingID: number) {
        return async ({ userID, link }: meetingLinkUserVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/link/user/${userID}`,
            )
          ).data
      },
      linkUserMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "link-user-mut"]
      },

      linkTagMutFn(projectID: number, meetingID: number) {
        return async ({ tagID, link }: meetingLinkTagVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/link/tag/${tagID}`,
            )
          ).data
      },
      linkTagMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "link-tag-mut"]
      },
    },
    topics: {
      listQueryFn(projectID: number, meetingID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/meeting/${meetingID}/topic`))
            .data
      },
      listQueryKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "topics"]
      },

      findQueryFn(projectID: number, meetingID: number, topicID: number) {
        return async () =>
          (
            await axios.get(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
            )
          ).data
      },
      findQueryKey(projectID: number, meetingID: number, topicID: number) {
        return [{ projectID }, { meetingID }, { topicID }]
      },

      statusMutFn(projectID: number, meetingID: number) {
        return async ({ topicID, close }: topicStatusVars) =>
          (
            await axios[close ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
            )
          ).data
      },
      statusMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "status-assign-mut"]
      },

      updateMutFn(projectID: number, meetingID: number, topicID: number) {
        return async ({
          title,
          description,
          force_solution,
          priority_id,
        }: topicUpdateVars) =>
          (
            await axios.put(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
              {
                title,
                description,
                force_solution,
                priority_id,
              },
            )
          ).data
      },
      updateMutKey(projectID: number, meetingID: number, topicID: number) {
        return [
          ...functions.topics.findQueryKey(projectID, meetingID, topicID),
          "topic-update-mut",
        ]
      },

      createMutFn(projectID: number, meetingID: number) {
        return async ({
          title,
          description,
          force_solution,
          priority_id,
        }: topicCreateVars) =>
          (
            await axios.post(
              `/project/${projectID}/meeting/${meetingID}/topic`,
              {
                title,
                description,
                force_solution,
                priority_id,
              },
            )
          ).data
      },
      createMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "topic-create-mut"]
      },

      deleteMutFn(projectID: number, meetingID: number) {
        return async ({ topicID }: topicDeleteVars) =>
          (
            await axios!.delete(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
            )
          ).data
      },
      deleteMutKey(projectID: number, meetingID: number) {
        return [
          ...functions.meetings.findQueryKey(projectID, meetingID),
          "topic-delete-mut",
        ]
      },

      assignMutFn(projectID: number, meetingID: number) {
        return async ({ link, userID, topicID }: topicAssignUsersVars) =>
          (
            await axios[link ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/user/${userID}`,
            )
          ).data
      },
      assignMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "topic-assign-mut"]
      },

      linkTagMutFn(projectID: number, meetingID: number) {
        return async ({ topicID, tagID, link }: topicLinkTagVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/tag/${tagID}`,
            )
          ).data
      },
      linkTagMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "topic-link-tag-mut"]
      },

      isSubscribedQueryFn(
        projectID: number,
        meetingID: number,
        topicID: number,
      ) {
        return async () =>
          (
            await axios.get(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/subscribe`,
            )
          ).data
      },
      isSubscribedQueryKey(
        projectID: number,
        meetingID: number,
        topicID: number,
      ) {
        return [
          { projectID },
          { meetingID },
          { topicID },
          "topic-subscribe-query",
        ]
      },

      subscribeMutFn(projectID: number, meetingID: number, topicID: number) {
        return async ({ subscribe }: topicSubscribeVars) =>
          (
            await axios[subscribe ? "post" : "delete"](
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/subscribe`,
            )
          ).data
      },
      subscribeMutKey(projectID: number, meetingID: number, topicID: number) {
        return [
          { projectID },
          { meetingID },
          { topicID },
          "topic-subscribe-mut",
        ]
      },

      updateOrderMutFn(projectID: number, meetingID: number) {
        return async ({ topicID, before, after }: topicUpdateOrderVars) =>
          (
            await axios.post(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/order`,
              {
                before,
                after,
              },
            )
          ).data
      },
      updateOrderMutKey(projectID: number, meetingID: number) {
        return [{ projectID }, { meetingID }, "topic-update-order-mut"]
      },
    },
    comments: {
      listQueryFn(
        projectID: number,
        entityType: CommentEntityType,
        entityID: number,
      ) {
        return async () =>
          (
            await axios.get(
              `/project/${projectID}/comment/${entityType}/${entityID}`,
            )
          ).data
      },
      listQueryKey(
        projectID: number,
        entityType: CommentEntityType,
        entityID: number,
      ) {
        return [{ projectID }, "comments", entityType, entityID]
      },

      sendMutFn(
        projectID: number,
        entityType: CommentEntityType,
        entityID: number,
      ) {
        return async ({ comment }: sendCommentVars) =>
          (
            await axios.post(
              `/project/${projectID}/comment/${entityType}/${entityID}`,
              comment,
            )
          ).data
      },
      sendMutKey(
        projectID: number,
        entityType: CommentEntityType,
        entityID: number,
      ) {
        return [
          { projectID },
          "comments",
          entityType,
          entityID,
          "comment-send-mut",
        ]
      },

      deleteMutFn(projectID: number) {
        return async ({ commentID }: commentDeleteVars) =>
          (await axios.delete(`/project/${projectID}/comment/${commentID}`))
            .data
      },
      deleteMutKey() {
        return ["comment-delete-mut"]
      },

      editMutFn(projectID: number) {
        return async ({ commentID, content }: commentEditVars) =>
          (
            await axios.put(
              `/project/${projectID}/comment/${commentID}`,
              content,
            )
          ).data
      },
      editMutKey() {
        return ["comment-edit-mut"]
      },

      markSolutionMutFn(projectID: number) {
        return async ({
          mark,
          commentID,
        }: {
          mark: boolean
          commentID: number
        }) =>
          (
            await axios[mark ? "post" : "delete"](
              `/project/${projectID}/comment/solution/${commentID}`,
            )
          ).data
      },
      markSolutionMutKey(topicID: number) {
        return [{ topicID }, "solution-mut"]
      },
    },
    users: {
      resolveQueryFn(userID: string) {
        return async () => (await axios.get(`/user/resolve/${userID}`)).data
      },
      resolveQueryKey(userID: string) {
        return [{ userID }]
      },

      changeNameMutFn() {
        return async ({ newName }: userChangeNameVars) =>
          (await axios.put(`/user/me`, { new_name: newName })).data
      },
      changeNameMutKey() {
        return ["user-change-name-mut"]
      },

      listQueryFn(query: string, page: number) {
        return async () =>
          (
            await axios.get(
              `/user?query=${encodeURIComponent(query)}&page=${page}`,
            )
          ).data
      },
      listQueryKey(query: string, page: number) {
        return ["users", page, { query }]
      },

      searchQueryFn(query: string) {
        return async () =>
          (
            await axios.get(
              `/user/me/search?query=${encodeURIComponent(query)}`,
            )
          ).data
      },
      searchQueryKey(query: string) {
        return ["users-search", { query }]
      },

      notificationAllQueryFn() {
        return async () => (await axios.get(`/user/me/notification/all`)).data
      },
      notificationAllQueryKey() {
        return ["notifications", "all"]
      },

      notificationUnreadQueryFn() {
        return async () =>
          (await axios.get(`/user/me/notification/unread`)).data
      },
      notificationUnreadQueryKey() {
        return ["notifications", "unread"]
      },

      notificationReadMutFn() {
        return async ({ notificationID }: userNotificationReadVars) =>
          (await axios.delete(`/user/me/notification/${notificationID}`)).data
      },
      notificationReadMutKey() {
        return ["notification-read-mut"]
      },

      notificationReadAllMutFn() {
        return async () => (await axios.delete(`/user/me/notification`)).data
      },
      notificationReadAllMutKey() {
        return ["notification-read-all-mut"]
      },
    },
    actions: {
      createMutFn(projectID: number) {
        return async ({
          title,
          description,
          due_date,
          priority_id,
        }: actionCreateVars) =>
          (
            await axios.post(`/project/${projectID}/action`, {
              title,
              description,
              due_date: due_date ? new Date(due_date) : null,
              priority_id,
            })
          ).data
      },
      createMutKey(projectID: number) {
        return [{ projectID }, "action-create-mut"]
      },

      editMutFn(projectID: number) {
        return async ({
          actionID,
          title,
          description,
          due_date,
          priority_id,
        }: actionEditVars) =>
          (
            await axios.put(`/project/${projectID}/action/${actionID}`, {
              title,
              description,
              due_date: due_date ? new Date(due_date) : null,
              priority_id,
            })
          ).data
      },
      editMutKey(projectID: number) {
        return [{ projectID }, "action-edit-mut"]
      },

      listForProjectQueryFn(projectID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/action`)).data
      },
      listForProjectQueryKey(projectID: number) {
        return [{ projectID }, "actions"]
      },

      listMyForProjectQueryFn(projectID: number, openOnly: boolean = false) {
        return async () =>
          (
            await axios.get(
              `/project/${projectID}/action/me${openOnly ? "?open=yes" : ""}`,
            )
          ).data
      },
      listMyForProjectQueryKey(projectID: number, openOnly: boolean = false) {
        return [{ projectID }, "actions", openOnly ? "my-open" : "my-all"]
      },

      listForTopicQueryFn(projectID: number, topicID: number) {
        return async () =>
          (await axios!.get(`/project/${projectID}/action/topic/${topicID}`))
            .data
      },
      listForTopicQueryKey(
        projectID: number,
        meetingID: number,
        topicID: number,
      ) {
        return [
          ...functions.topics.findQueryKey(projectID, meetingID, topicID),
          "actions",
        ]
      },

      listForMeetingQueryFn(projectID: number, meetingID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/action/meeting/${meetingID}`))
            .data
      },
      listForMeetingQueryKey(projectID: number, meetingID: number) {
        return [
          ...functions.meetings.findQueryKey(projectID, meetingID),
          "actions",
        ]
      },

      findQueryFn(projectID: number, actionID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/action/${actionID}`)).data
      },
      findQueryKey(projectID: number, actionID: number) {
        return [{ projectID }, { actionID }]
      },

      linkTopicMutFn(projectID: number) {
        return async ({ link, topicID, actionID }: actionLinkVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/action/${actionID}/topic/${topicID}`,
            )
          ).data
      },
      linkTopicMutKey(projectID: number) {
        return [{ projectID }, "action-link-topic-mut"]
      },

      linkTagMutFn(projectID: number) {
        return async ({ actionID, tagID, link }: actionLinkTagVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/action/${actionID}/tag/${tagID}`,
            )
          ).data
      },
      linkTagMutKey(projectID: number) {
        return [{ projectID }, "action-link-tag-mut"]
      },

      linkUserMutFn(projectID: number) {
        return async ({ actionID, userID, link }: actionLinkUserVars) =>
          (
            await axios![link ? "post" : "delete"](
              `/project/${projectID}/action/${actionID}/user/${userID}`,
            )
          ).data
      },
      linkUserMutKey(projectID: number) {
        return [{ projectID }, "action-link-user-mut"]
      },

      statusMutFn(projectID: number) {
        return async ({ actionID, closed }: actionStatusVars) =>
          (
            await axios.post(
              `/project/${projectID}/action/${actionID}/${
                closed ? "close" : "open"
              }`,
            )
          ).data.data
      },
      statusMutKey(projectID: number) {
        return [{ projectID }, "action-status-mut"]
      },
    },
  } as const

  const hooks = {
    _functions: functions,
    projects: {
      useCreate(callback: SuccessCallback<Project, projectCreateVars>) {
        return useMutation<
          BackendResponse<Project>,
          AxiosError,
          projectCreateVars
        >({
          mutationKey: functions.projects.createMutKey(),
          mutationFn: functions.projects.createMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.listQueryKey(),
          ),
          onError: toastError("Cannot create Project:"),
        })
      },
      useUserList(projectID: number) {
        return useQuery<BackendResponse<User[]>>({
          queryKey: functions.projects.usersQueryKey(projectID),
          queryFn: functions.projects.usersQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useUserLink(
        projectID: number,
        callback: SuccessCallback<never, projectUserLinkVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, projectUserLinkVars>({
          mutationKey: functions.projects.userAddMutKey(projectID),
          mutationFn: functions.projects.userAddMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.usersQueryKey(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "add" : "remove"} User:`,
          ),
        })
      },
      useLeave(callback: SuccessCallback<never, projectLeaveVars>) {
        return useMutation<BackendResponse, AxiosError, projectLeaveVars>({
          mutationKey: functions.projects.leaveMutKey(),
          mutationFn: functions.projects.leaveMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.listQueryKey(),
          ),
          onError: toastError("Cannot leave Project:"),
        })
      },
      useList() {
        return useQuery<BackendResponse<Project[]>>({
          queryKey: functions.projects.listQueryKey(),
          queryFn: functions.projects.listQueryFn(),
        })
      },
      useFind(projectID: number) {
        return useQuery<BackendResponse<Project>>({
          queryKey: functions.projects.getQueryKey(projectID),
          queryFn: functions.projects.getQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useEdit(callback: SuccessCallback<never, projectEditVars>) {
        return useMutation<BackendResponse, AxiosError, projectEditVars>({
          mutationKey: functions.projects.updateMutKey(),
          mutationFn: functions.projects.updateMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.listQueryKey(),
            ({ projectID }) => functions.projects.getQueryKey(projectID),
          ),
          onError: toastError("Cannot update Project:"),
        })
      },
      useDelete(callback: SuccessCallback<never, projectDeleteVars>) {
        return useMutation<BackendResponse, AxiosError, projectDeleteVars>({
          mutationKey: functions.projects.deleteMutKey(),
          mutationFn: functions.projects.deleteMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.listQueryKey(),
          ),
          onError: toastError("Cannot delete Project:"),
        })
      },
      useQuota(projectID: number) {
        return useQuery<BackendResponse<Quota>>({
          queryKey: functions.projects.quotaQueryKey(projectID),
          queryFn: functions.projects.quotaQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useListFiles(projectID: number) {
        return useQuery<BackendResponse<ProjectFile[]>>(
          functions.projects.listFilesQueryKey(projectID),
          functions.projects.listFilesQueryFn(projectID),
          {
            enabled: !!projectID,
          },
        )
      },
      useDeleteFile(
        projectID: number,
        callback: SuccessCallback<never, projectFileDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, projectFileDeleteVars>({
          mutationKey: functions.projects.deleteFileMutKey(projectID),
          mutationFn: functions.projects.deleteFileMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projects.listFilesQueryKey(projectID),
            functions.projects.quotaQueryKey(projectID),
          ),
          onError: toastError("Cannot delete File:"),
        })
      },
    },
    tags: {
      useList(projectID: number) {
        return useQuery<BackendResponse<Tag[]>>({
          queryKey: functions.tags.listQueryKey(projectID),
          queryFn: functions.tags.listQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useDelete(
        projectID: number,
        callback: SuccessCallback<never, tagDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, tagDeleteVars>({
          mutationKey: functions.tags.deleteMutKey(projectID),
          mutationFn: functions.tags.deleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tags.listQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Tag:"),
        })
      },
      useEdit(projectID: number, callback: SuccessCallback<Tag, tagEditVars>) {
        return useMutation<BackendResponse<Tag>, AxiosError, tagEditVars>({
          mutationKey: functions.tags.editMutKey(projectID),
          mutationFn: functions.tags.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tags.listQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Tag:"),
        })
      },
      useCreate(
        projectID: number,
        callback: SuccessCallback<Tag, tagCreateVars>,
      ) {
        return useMutation<BackendResponse<Tag>, AxiosError, tagCreateVars>({
          mutationKey: functions.tags.createMutKey(projectID),
          mutationFn: functions.tags.createMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tags.listQueryKey(projectID),
          ),
          onError: toastError("Cannot create Tag:"),
        })
      },
    },
    priorities: {
      useDelete(
        projectID: number,
        callback: SuccessCallback<never, priorityDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, priorityDeleteVars>({
          mutationKey: functions.priorities.deleteMutKey(projectID),
          mutationFn: functions.priorities.deleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.priorities.listQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Priority:"),
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, priorityEditVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, priorityEditVars>({
          mutationKey: functions.priorities.editMutKey(projectID),
          mutationFn: functions.priorities.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.priorities.listQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Priority:"),
        })
      },
      useCreate(
        projectID: number,
        callback: SuccessCallback<Priority, priorityCreateVars>,
      ) {
        return useMutation<
          BackendResponse<Priority>,
          AxiosError,
          priorityCreateVars
        >({
          mutationKey: functions.priorities.createMutKey(projectID),
          mutationFn: functions.priorities.createMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.priorities.listQueryKey(projectID),
          ),
          onError: toastError("Cannot create Priority:"),
        })
      },
      useList(projectID: number) {
        return useQuery<BackendResponse<Priority[]>>({
          queryKey: functions.priorities.listQueryKey(projectID),
          queryFn: functions.priorities.listQueryFn(projectID),
          enabled: !!projectID,
        })
      },
    },
    meetings: {
      useFind(projectID: number, meetingID: number) {
        return useQuery<BackendResponse<Meeting>>({
          queryKey: functions.meetings.findQueryKey(projectID, meetingID),
          queryFn: functions.meetings.findQueryFn(projectID, meetingID),
          enabled: !!projectID && !!meetingID,
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, meetingUpdateVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingUpdateVars>({
          mutationKey: functions.meetings.editMutKey(projectID),
          mutationFn: functions.meetings.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ meetingID }) =>
              functions.meetings.findQueryKey(projectID, meetingID),
            functions.meetings.listQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Meeting:"),
        })
      },
      useDelete(
        projectID: number,
        callback: SuccessCallback<never, meetingDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingDeleteVars>({
          mutationKey: functions.meetings.deleteMutKey(projectID),
          mutationFn: functions.meetings.deleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meetings.listQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Meeting:"),
        })
      },
      useList(projectID: number) {
        return useQuery<BackendResponse<Meeting[]>>({
          queryKey: functions.meetings.listQueryKey(projectID),
          queryFn: functions.meetings.listQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useCreate(
        projectID: number,
        callback: SuccessCallback<Meeting, meetingCreateVars>,
      ) {
        return useMutation<
          BackendResponse<Meeting>,
          AxiosError,
          meetingCreateVars
        >({
          mutationKey: functions.meetings.createMutKey(projectID),
          mutationFn: functions.meetings.createMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meetings.listQueryKey(projectID),
          ),
          onError: toastError("Cannot create Meeting:"),
        })
      },
      useListUpcoming() {
        return useQuery<BackendResponse<Meeting[]>>({
          queryKey: functions.meetings.listUpcomingQueryKey(),
          queryFn: functions.meetings.listUpcomingQueryFn(),
          staleTime: 1000 * 60 * 5,
        })
      },
      useLinkUser(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, meetingLinkUserVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingLinkUserVars>({
          mutationKey: functions.meetings.linkUserMutKey(projectID, meetingID),
          mutationFn: functions.meetings.linkUserMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meetings.listQueryKey(projectID),
            functions.meetings.findQueryKey(projectID, meetingID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} User:`,
          ),
        })
      },
      useLinkTag(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, meetingLinkTagVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingLinkTagVars>({
          mutationKey: functions.meetings.linkTagMutKey(projectID, meetingID),
          mutationFn: functions.meetings.linkTagMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meetings.listQueryKey(projectID),
            functions.meetings.findQueryKey(projectID, meetingID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Tag:`,
          ),
        })
      },
    },
    topics: {
      useDelete(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicDeleteVars>({
          mutationKey: functions.topics.deleteMutKey(projectID, meetingID),
          mutationFn: functions.topics.deleteMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ topicID }) =>
              functions.topics.findQueryKey(projectID, meetingID, topicID),
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot delete Topic:"),
        })
      },
      useEdit(
        projectID: number,
        meetingID: number,
        topicID: number,
        callback: SuccessCallback<never, topicUpdateVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicUpdateVars>({
          mutationKey: functions.topics.updateMutKey(
            projectID,
            meetingID,
            topicID,
          ),
          mutationFn: functions.topics.updateMutFn(
            projectID,
            meetingID,
            topicID,
          ),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topics.findQueryKey(projectID, meetingID, topicID),
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot update Topic:"),
        })
      },
      useFind(projectID: number, meetingID: number, topicID: number) {
        return useQuery<BackendResponse<Topic>>({
          queryKey: functions.topics.findQueryKey(
            projectID,
            meetingID,
            topicID,
          ),
          queryFn: functions.topics.findQueryFn(projectID, meetingID, topicID),
          enabled: !!projectID && !!topicID,
        })
      },
      useList(projectID: number, meetingID: number) {
        return useQuery<BackendResponse<Topic[]>>({
          queryKey: functions.topics.listQueryKey(projectID, meetingID),
          queryFn: functions.topics.listQueryFn(projectID, meetingID),
          enabled: !!projectID && !!meetingID,
        })
      },
      useLinkUser(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicAssignUsersVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicAssignUsersVars>({
          mutationKey: functions.topics.assignMutKey(projectID, meetingID),
          mutationFn: functions.topics.assignMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topics.listQueryKey(projectID, meetingID),
            ({ topicID }) =>
              functions.topics.findQueryKey(projectID, meetingID, topicID),
          ),
          onError: toastError("Cannot assign Users:"),
        })
      },
      useCreate(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<Topic, topicCreateVars>,
      ) {
        return useMutation<BackendResponse<Topic>, AxiosError, topicCreateVars>(
          {
            mutationKey: functions.topics.createMutKey(projectID, meetingID),
            mutationFn: functions.topics.createMutFn(projectID, meetingID),
            onSuccess: invalidateAllCallback(
              callback,
              functions.topics.listQueryKey(projectID, meetingID),
            ),
            onError: toastError("Cannot create Topic:"),
          },
        )
      },
      useStatus(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicStatusVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicStatusVars>({
          mutationKey: functions.topics.statusMutKey(projectID, meetingID),
          mutationFn: functions.topics.statusMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ topicID }) =>
              functions.topics.findQueryKey(projectID, meetingID, topicID),
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot change Topic status:"),
        })
      },
      useLinkTag(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicLinkTagVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicLinkTagVars>({
          mutationKey: functions.topics.linkTagMutKey(projectID, meetingID),
          mutationFn: functions.topics.linkTagMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ topicID }) =>
              functions.topics.findQueryKey(projectID, meetingID, topicID),
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Tag:`,
          ),
        })
      },
      useIsSubscribed(projectID: number, meetingID: number, topicID: number) {
        return useQuery<BackendResponse<boolean>>({
          queryKey: functions.topics.isSubscribedQueryKey(
            projectID,
            meetingID,
            topicID,
          ),
          queryFn: functions.topics.isSubscribedQueryFn(
            projectID,
            meetingID,
            topicID,
          ),
          enabled: !!projectID && !!topicID,
        })
      },
      useSubscribe(
        projectID: number,
        meetingID: number,
        topicID: number,
        callback: SuccessCallback<boolean, topicSubscribeVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicSubscribeVars>({
          mutationKey: functions.topics.subscribeMutKey(
            projectID,
            meetingID,
            topicID,
          ),
          mutationFn: functions.topics.subscribeMutFn(
            projectID,
            meetingID,
            topicID,
          ),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topics.findQueryKey(projectID, meetingID, topicID),
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot subscribe to Topic:"),
        })
      },
      useUpdateOrder(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicUpdateOrderVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicUpdateOrderVars>({
          mutationKey: functions.topics.updateOrderMutKey(projectID, meetingID),
          mutationFn: functions.topics.updateOrderMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topics.listQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot update Topic order:"),
        })
      },
    },
    actions: {
      useLinkUser(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkUserVars>({
          mutationKey: functions.actions.linkUserMutKey(projectID),
          mutationFn: functions.actions.linkUserMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) =>
              functions.actions.findQueryKey(projectID, actionID),
            functions.actions.listForProjectQueryKey!(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} User:`,
          ),
        })
      },
      useLinkTag(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkTagVars>({
          mutationKey: functions.actions.linkTagMutKey(projectID),
          mutationFn: functions.actions.linkTagMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) =>
              functions.actions.findQueryKey(projectID, actionID),
            functions.actions.listForProjectQueryKey!(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Tag:`,
          ),
        })
      },
      useLinkTopic(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkVars>({
          mutationKey: functions.actions.linkTopicMutKey(projectID),
          mutationFn: functions.actions.linkTopicMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) =>
              functions.actions.findQueryKey(projectID, actionID),
            ({ meetingID, topicID }) =>
              functions.topics.findQueryKey(projectID, meetingID, topicID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Action:`,
          ),
        })
      },
      useListForTopic(projectID: number, meetingID: number, topicID: number) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actions.listForTopicQueryKey(
            projectID,
            meetingID,
            topicID,
          ),
          queryFn: functions.actions.listForTopicQueryFn(projectID, topicID),
          enabled: !!projectID && !!topicID,
        })
      },
      useListForMe(projectID: number, openOnly: boolean) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actions.listMyForProjectQueryKey(
            projectID,
            openOnly,
          ),
          queryFn: functions.actions.listMyForProjectQueryFn(
            projectID,
            openOnly,
          ),
          enabled: !!projectID,
        })
      },
      useListForProject(projectID: number) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actions.listForProjectQueryKey(projectID),
          queryFn: functions.actions.listForProjectQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useListForMeeting(projectID: number, meetingID: number) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actions.listForMeetingQueryKey(
            projectID,
            meetingID,
          ),
          queryFn: functions.actions.listForMeetingQueryFn(
            projectID,
            meetingID,
          ),
          enabled: !!projectID && !!meetingID,
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, actionEditVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, actionEditVars>({
          mutationKey: functions.actions.editMutKey(projectID),
          mutationFn: functions.actions.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ actionID }) =>
              functions.actions.findQueryKey(projectID, actionID),
            functions.actions.listForProjectQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Action:"),
        })
      },
      useCreate(
        projectID: number,
        callback: SuccessCallback<Action, actionCreateVars>,
      ) {
        return useMutation<
          BackendResponse<Action>,
          AxiosError,
          actionCreateVars
        >({
          mutationKey: functions.actions.createMutKey(projectID),
          mutationFn: functions.actions.createMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.actions.listForProjectQueryKey(projectID),
          ),
          onError: toastError("Cannot create Action:"),
        })
      },
      useFind(projectID: number, actionID: number) {
        return useQuery<BackendResponse<Action>>({
          queryKey: functions.actions.findQueryKey(projectID, actionID),
          queryFn: functions.actions.findQueryFn(projectID, actionID),
          enabled: !!projectID && !!actionID,
        })
      },
      useStatus(
        projectID: number,
        callback: SuccessCallback<never, actionStatusVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, actionStatusVars>({
          mutationKey: functions.actions.statusMutKey(projectID),
          mutationFn: functions.actions.statusMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ actionID }) =>
              functions.actions.findQueryKey(projectID, actionID),
            functions.actions.listForProjectQueryKey(projectID),
          ),
          onError: toastError("Cannot change Action status:"),
        })
      },
    },
    comments: {
      useList(
        projectID: number,
        commentType: CommentEntityType,
        commentEntityID: number,
      ) {
        return useQuery<BackendResponse<Comment[]>>({
          queryKey: functions.comments.listQueryKey(
            projectID,
            commentType,
            commentEntityID,
          ),
          queryFn: functions.comments.listQueryFn(
            projectID,
            commentType,
            commentEntityID,
          ),
        })
      },
      useMarkSolution(
        projectID: number,
        meetingID: number,
        topicID: number,
        callback: SuccessCallback<never, commentMarkSolutionVars>,
      ) {
        return useMutation<
          BackendResponse,
          AxiosError,
          commentMarkSolutionVars
        >({
          mutationKey: functions.comments.markSolutionMutKey(topicID),
          mutationFn: functions.comments.markSolutionMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.comments.listQueryKey(projectID, "topic", topicID),
            functions.topics.findQueryKey(projectID, meetingID, topicID),
          ),
          onError: toastError("Cannot mark Solution:"),
        })
      },
      useSend(
        projectID: number,
        commentType: CommentEntityType,
        commentEntityID: number,
        callback: SuccessCallback<Comment, sendCommentVars>,
      ) {
        return useMutation<
          BackendResponse<Comment>,
          AxiosError,
          sendCommentVars
        >({
          mutationKey: functions.comments.sendMutKey(
            projectID,
            commentType,
            commentEntityID,
          ),
          mutationFn: functions.comments.sendMutFn(
            projectID,
            commentType,
            commentEntityID,
          ),
          onSuccess: invalidateAllCallback(
            callback,
            functions.comments.listQueryKey(
              projectID,
              commentType,
              commentEntityID,
            ),
          ),
          onError: toastError("Cannot send Comment:"),
        })
      },
      useDelete(
        projectID: number,
        commentType: CommentEntityType,
        commentEntityID: number,
        callback: SuccessCallback<never, commentDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, commentDeleteVars>({
          mutationKey: functions.comments.deleteMutKey(),
          mutationFn: functions.comments.deleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.comments.listQueryKey(
              projectID,
              commentType,
              commentEntityID,
            ),
          ),
          onError: toastError("Cannot delete Comment:"),
        })
      },
      useEdit(
        projectID: number,
        commentType: CommentEntityType,
        commentEntityID: number,
        callback: SuccessCallback<never, commentEditVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, commentEditVars>({
          mutationKey: functions.comments.editMutKey(),
          mutationFn: functions.comments.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.comments.listQueryKey(
              projectID,
              commentType,
              commentEntityID,
            ),
          ),
          onError: toastError("Cannot edit Comment:"),
        })
      },
    },
    users: {
      useList(query: string, page: number, keepPreviousData: boolean = false) {
        return useQuery<BackendResponse<User[]>, AxiosError>({
          queryKey: functions.users.listQueryKey(query, page),
          queryFn: functions.users.listQueryFn(query, page),
          keepPreviousData,
        })
      },
      useResolve(userID: string, callback?: (name: string) => void) {
        return useQuery<BackendResponse<string>, AxiosError>({
          enabled: !!userID,
          queryKey: functions.users.resolveQueryKey(userID),
          queryFn: functions.users.resolveQueryFn(userID),
          onSuccess(data) {
            callback?.(data.data)
          },
        })
      },
      useChangeName(
        userID: string,
        callback: SuccessCallback<never, userChangeNameVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, userChangeNameVars>({
          mutationKey: functions.users.changeNameMutKey(),
          mutationFn: functions.users.changeNameMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.users.resolveQueryKey(userID),
          ),
          onError: toastError("Cannot change User name:"),
        })
      },
      useSearch(query: string) {
        return useQuery<BackendResponse<SearchResult>, AxiosError>({
          enabled: !!query && query.length > 2,
          queryKey: functions.users.searchQueryKey(query),
          queryFn: functions.users.searchQueryFn(query),
          keepPreviousData: true,
        })
      },
      useNotificationAll() {
        return useQuery<BackendResponse<Notification[]>>({
          queryKey: functions.users.notificationAllQueryKey(),
          queryFn: functions.users.notificationAllQueryFn(),
        })
      },
      useNotificationUnread() {
        return useQuery<BackendResponse<Notification[]>>({
          queryKey: functions.users.notificationUnreadQueryKey(),
          queryFn: functions.users.notificationUnreadQueryFn(),
        })
      },
      useNotificationRead(
        callback: SuccessCallback<never, userNotificationReadVars>,
      ) {
        return useMutation<
          BackendResponse,
          AxiosError,
          userNotificationReadVars
        >({
          mutationKey: functions.users.notificationReadMutKey(),
          mutationFn: functions.users.notificationReadMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.users.notificationUnreadQueryKey(),
            functions.users.notificationAllQueryKey(),
          ),
          onError: toastError("Cannot mark Notification as read:"),
        })
      },
      useNotificationReadAll(callback: SuccessCallback<never, void>) {
        return useMutation<BackendResponse, AxiosError>({
          mutationKey: functions.users.notificationReadAllMutKey(),
          mutationFn: functions.users.notificationReadAllMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.users.notificationUnreadQueryKey(),
            functions.users.notificationAllQueryKey(),
          ),
          onError: toastError("Cannot mark all Notifications as read:"),
        })
      },
    },
  } as const

  return { ...hooks }
}
