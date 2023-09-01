import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { Axios, AxiosError } from "axios"

import {
  Action,
  BackendResponse,
  Comment,
  CommentEntityType,
  Meeting,
  Priority,
  Project,
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
  date: Date
}

export type meetingCreateVars = {
  title: string
  description: string
  date: Date
  __should_close: boolean
}

// ======================
// Topic Types
// ======================
export type topicUpdateVars = {
  title: string
  description: string
  force_solution: boolean
}

export type topicDeleteVars = {
  topicID: number
}

export type topicAssignUsersVars = {
  userIDs: string[]
  topicID: number
}

export type topicCreateVars = {
  title: string
  description: string
  force_solution: boolean
  __should_close: boolean
}

export type topicStatusVars = {
  topicID: number
  close: boolean
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

// ======================
// User Types
// ======================

export type userChangeNameVars = {
  newName: string
}

export type SuccessCallback<Data, Variables> = (
  data: BackendResponse<Data>,
  vars: Variables,
) => void

export const functions = (axios: Axios, client: QueryClient) => {
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
    // ======================
    // Project
    // ======================
    project: {
      deleteMutFn() {
        return async ({ projectID }: projectDeleteVars) =>
          (await axios.delete(`/project/${projectID}/delete`)).data
      },
      deleteMutKey() {
        return ["project-delete-mut"]
      },
    },
    projectListQueryFn() {
      return async () => (await axios.get("/project")).data
    },
    projectListQueryKey() {
      return ["projects"]
    },

    projectGetQueryFn(projectID: number) {
      return async () => (await axios.get(`/project/${projectID}`)).data
    },
    projectGetQueryKey(projectID: number) {
      return [{ projectID }]
    },

    projectUsersQueryFn(projectID: number) {
      return async () => (await axios.get(`/project/${projectID}/users`)).data
    },
    projectUsersQueryKey(projectID: number) {
      return [{ projectID }, "users"]
    },

    projectUserAddMutFn(projectID: number) {
      return async ({ userID, link }: projectUserLinkVars) =>
        (
          await axios[link ? "post" : "delete"](
            `/project/${projectID}/user/${userID}`,
          )
        ).data
    },
    projectUserAddMutKey(projectID: number) {
      return [{ projectID }, "user-add-mut"]
    },

    projectUpdateMutFn() {
      return async ({ projectID, name, description }: projectEditVars) =>
        (
          await axios.put(`/project/${projectID}`, {
            name,
            description,
          })
        ).data
    },
    projectUpdateMutKey() {
      return ["project-update-mut"]
    },

    projectCreateMutFn() {
      return async ({ name, description }: projectCreateVars) =>
        (
          await axios.post(`/project`, {
            name,
            description,
          })
        ).data
    },
    projectCreateMutKey() {
      return ["project-create-mut"]
    },

    projectLeaveMutFn() {
      return async ({ projectID }: projectLeaveVars) =>
        (await axios.delete(`/project/${projectID}/leave`)).data
    },
    projectLeaveMutKey() {
      return ["project-leave-mut"]
    },

    // ======================
    // Project Tags
    // ======================

    tagsListQueryFn(projectID: number) {
      return async () => (await axios.get(`/project/${projectID}/tag`)).data
    },
    tagsListQueryKey(projectID: number) {
      return [{ projectID }, "tags"]
    },

    tagCreateMutFn(projectID: number) {
      return async ({ title, color }: tagCreateVars) =>
        (
          await axios.post(`/project/${projectID}/tag`, {
            title,
            color,
          })
        ).data
    },
    tagCreateMutKey(projectID: number) {
      return [{ projectID }, "tag-create-mut"]
    },

    tagEditMutFn(projectID: number) {
      return async ({ tagID, editTitle, editColor }: tagEditVars) =>
        (
          await axios!.put(`/project/${projectID}/tag/${tagID}`, {
            title: editTitle,
            color: editColor,
          })
        ).data
    },
    tagEditMutKey(projectID: number) {
      return [{ projectID }, "tag-edit-mut"]
    },

    tagDeleteMutFn(projectID: number) {
      return async ({ tagID }: tagDeleteVars) =>
        (await axios.delete(`/project/${projectID}/tag/${tagID}`)).data
    },
    tagDeleteMutKey(projectID: number) {
      return [{ projectID }, "tag-delete-mut"]
    },

    // ======================
    // Project Priorities
    // ======================
    prioritiesQueryFn(projectID: number) {
      return async () =>
        (await axios.get(`/project/${projectID}/priority`)).data
    },
    prioritiesQueryKey(projectID: number) {
      return [{ projectID }, "priorities"]
    },

    priorityCreateMutFn(projectID: number) {
      return async ({ title, color, weight }: priorityCreateVars) =>
        (
          await axios.post(`/project/${projectID}/priority`, {
            title,
            color,
            weight,
          })
        ).data
    },
    priorityCreateMutKey(projectID: number) {
      return [{ projectID }, "priority-create-mut"]
    },

    priorityEditMutFn(projectID: number) {
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
    priorityEditMutKey(projectID: number) {
      return [{ projectID }, "priority-edit-mut"]
    },

    priorityDeleteMutFn(projectID: number) {
      return async ({ priorityID }: priorityDeleteVars) =>
        (await axios.delete(`/project/${projectID}/priority/${priorityID}`))
          .data
    },
    priorityDeleteMutKey(projectID: number) {
      return [{ projectID }, "priority-delete-mut"]
    },

    // ======================
    // Meeting
    // ======================
    meeting: {
      listQueryFn(projectID: number) {
        return async () =>
          (await axios.get(`/project/${projectID}/meeting`)).data
      },
      listQueryKey(projectID: number) {
        return [{ projectID }, "meetings"]
      },

      createMutFn(projectID: number) {
        return async ({ title, description, date }: meetingCreateVars) =>
          (
            await axios.post(`/project/${projectID}/meeting`, {
              name: title,
              description: description,
              start_date: date,
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
          date,
        }: meetingUpdateVars) =>
          (
            await axios.put(`/project/${projectID}/meeting/${meetingID}`, {
              name: title,
              description: description,
              start_date: date,
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
    },
    // ======================
    // Topic
    // ======================
    topicListQueryFn(projectID: number, meetingID: number) {
      return async () =>
        (await axios.get(`/project/${projectID}/meeting/${meetingID}/topic`))
          .data
    },
    topicListQueryKey(projectID: number, meetingID: number) {
      return [{ projectID }, { meetingID }, "topics"]
    },

    topicFindQueryFn(projectID: number, meetingID: number, topicID: number) {
      return async () =>
        (
          await axios.get(
            `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
          )
        ).data
    },
    topicFindQueryKey(projectID: number, meetingID: number, topicID: number) {
      return [{ projectID }, { meetingID }, { topicID }]
    },

    topicStatusMutFn(projectID: number, meetingID: number) {
      return async ({ topicID, close }: topicStatusVars) =>
        (
          await axios[close ? "post" : "delete"](
            `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
          )
        ).data
    },
    topicStatusMutKey(projectID: number, meetingID: number) {
      return [{ projectID }, { meetingID }, "status-assign-mut"]
    },

    topicUpdateMutFn(projectID: number, meetingID: number, topicID: number) {
      return async ({ title, description, force_solution }: topicUpdateVars) =>
        (
          await axios.put(
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
      return [
        ...functions.topicFindQueryKey(projectID, meetingID, topicID),
        "topic-update-mut",
      ]
    },

    topicCreateMutFn(projectID: number, meetingID: number) {
      return async ({ title, description, force_solution }: topicCreateVars) =>
        (
          await axios.post(`/project/${projectID}/meeting/${meetingID}/topic`, {
            title,
            description,
            force_solution,
          })
        ).data
    },
    topicCreateMutKey(projectID: number, meetingID: number) {
      return [{ projectID }, { meetingID }, "topic-create-mut"]
    },

    topicDeleteMutFn(projectID: number, meetingID: number) {
      return async ({ topicID }: topicDeleteVars) =>
        (
          await axios!.delete(
            `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
          )
        ).data
    },
    topicDeleteMutKey(projectID: number, meetingID: number) {
      return [
        ...functions.meeting.findQueryKey(projectID, meetingID),
        "topic-delete-mut",
      ]
    },

    topicAssignMutFn(projectID: number, meetingID: number) {
      return async ({ userIDs, topicID }: topicAssignUsersVars) =>
        (
          await axios.post(
            `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/assign`,
            {
              assigned_users: userIDs,
            },
          )
        ).data
    },
    topicAssignMutKey(projectID: number, meetingID: number) {
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
          await axios.get(
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
      return async ({ comment }: sendCommentVars) =>
        (
          await axios.post(
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
      return [
        { projectID },
        "comments",
        entityType,
        entityID,
        "comment-send-mut",
      ]
    },

    commentDeleteMutFn(projectID: number) {
      return async ({ commentID }: commentDeleteVars) =>
        (await axios.delete(`/project/${projectID}/comment/${commentID}`)).data
    },
    commentDeleteMutKey() {
      return ["comment-delete-mut"]
    },

    commentEditMutFn(projectID: number) {
      return async ({ commentID, content }: commentEditVars) =>
        (await axios.put(`/project/${projectID}/comment/${commentID}`, content))
          .data
    },
    commentEditMutKey() {
      return ["comment-edit-mut"]
    },

    commentMarkSolutionMutFn(projectID: number) {
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
    commentMarkSolutionMutKey(topicID: number) {
      return [{ topicID }, "solution-mut"]
    },

    // ======================
    // User
    // ======================
    userResolveQueryFn(userID: string) {
      return async () => (await axios.get(`/user/resolve/${userID}`)).data
    },
    userResolveQueryKey(userID: string) {
      return [{ userID }]
    },

    userChangeNameMutFn() {
      return async ({ newName }: userChangeNameVars) =>
        (await axios.put(`/user/me`, { new_name: newName })).data
    },
    userChangeNameMutKey() {
      return ["user-change-name-mut"]
    },

    userListQueryFn(query: string, page: number) {
      return async () =>
        (
          await axios.get(
            `/user?query=${encodeURIComponent(query)}&page=${page}`,
          )
        ).data
    },
    userListQueryKey(query: string, page: number) {
      return ["users", page, { query }]
    },

    // ======================
    // Action
    // ======================
    actionCreateMutFn(projectID: number) {
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
    actionCreateMutKey(projectID: number) {
      return [{ projectID }, "action-create-mut"]
    },

    actionEditMutFn(projectID: number) {
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
    actionEditMutKey(projectID: number) {
      return [{ projectID }, "action-edit-mut"]
    },

    actionListForProjectQueryFn(projectID: number) {
      return async () => (await axios.get(`/project/${projectID}/action`)).data
    },
    actionListForProjectQueryKey(projectID: number) {
      return [{ projectID }, "actions"]
    },

    actionListForTopicQueryFn(projectID: number, topicID: number) {
      return async () =>
        (await axios!.get(`/project/${projectID}/action/topic/${topicID}`)).data
    },
    actionListForTopicQueryKey(
      projectID: number,
      meetingID: number,
      topicID: number,
    ) {
      return [
        ...functions.topicFindQueryKey(projectID, meetingID, topicID),
        "actions",
      ]
    },

    actionFindQueryFn(projectID: number, actionID: number) {
      return async () =>
        (await axios.get(`/project/${projectID}/action/${actionID}`)).data
    },
    actionFindQueryKey(projectID: number, actionID: number) {
      return [{ projectID }, { actionID }]
    },
    actionLinkTopicMutFn(projectID: number) {
      return async ({ link, topicID, actionID }: actionLinkVars) =>
        (
          await axios![link ? "post" : "delete"](
            `/project/${projectID}/action/${actionID}/topic/${topicID}`,
          )
        ).data
    },
    actionLinkTopicMutKey(projectID: number) {
      return [{ projectID }, "action-link-topic-mut"]
    },

    actionLinkTagMutFn(projectID: number) {
      return async ({ actionID, tagID, link }: actionLinkTagVars) =>
        (
          await axios![link ? "post" : "delete"](
            `/project/${projectID}/action/${actionID}/tag/${tagID}`,
          )
        ).data
    },
    actionLinkTagMutKey(projectID: number) {
      return [{ projectID }, "action-link-tag-mut"]
    },

    actionLinkUserMutFn(projectID: number) {
      return async ({ actionID, userID, link }: actionLinkUserVars) =>
        (
          await axios![link ? "post" : "delete"](
            `/project/${projectID}/action/${actionID}/user/${userID}`,
          )
        ).data
    },
    actionLinkUserMutKey(projectID: number) {
      return [{ projectID }, "action-link-user-mut"]
    },
  } as const

  const hooks = {
    projects: {
      useCreate(callback: SuccessCallback<Project, projectCreateVars>) {
        return useMutation<
          BackendResponse<Project>,
          AxiosError,
          projectCreateVars
        >({
          mutationKey: functions.projectCreateMutKey(),
          mutationFn: functions.projectCreateMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projectListQueryKey(),
          ),
          onError: toastError("Cannot create Project:"),
        })
      },
      useUserList(projectID: number) {
        return useQuery<BackendResponse<User[]>>({
          queryKey: functions.projectUsersQueryKey(projectID),
          queryFn: functions.projectUsersQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useUserLink(
        projectID: number,
        callback: SuccessCallback<never, projectUserLinkVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, projectUserLinkVars>({
          mutationKey: functions.projectUserAddMutKey(projectID),
          mutationFn: functions.projectUserAddMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projectUsersQueryKey(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "add" : "remove"} User:`,
          ),
        })
      },
      useLeave(callback: SuccessCallback<never, projectLeaveVars>) {
        return useMutation<BackendResponse, AxiosError, projectLeaveVars>({
          mutationKey: functions.projectLeaveMutKey(),
          mutationFn: functions.projectLeaveMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projectListQueryKey(),
          ),
          onError: toastError("Cannot leave Project:"),
        })
      },
      useList() {
        return useQuery<BackendResponse<Project[]>>({
          queryKey: functions.projectListQueryKey(),
          queryFn: functions.projectListQueryFn(),
        })
      },
      useFind(projectID: number) {
        return useQuery<BackendResponse<Project>>({
          queryKey: functions.projectGetQueryKey(projectID),
          queryFn: functions.projectGetQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useEdit(callback: SuccessCallback<never, projectEditVars>) {
        return useMutation<BackendResponse, AxiosError, projectEditVars>({
          mutationKey: functions.projectUpdateMutKey(),
          mutationFn: functions.projectUpdateMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projectListQueryKey(),
            ({ projectID }) => functions.projectGetQueryKey(projectID),
          ),
          onError: toastError("Cannot update Project:"),
        })
      },
      useDelete(callback: SuccessCallback<never, projectDeleteVars>) {
        return useMutation<BackendResponse, AxiosError, projectDeleteVars>({
          mutationKey: functions.project.deleteMutKey(),
          mutationFn: functions.project.deleteMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.projectListQueryKey(),
          ),
          onError: toastError("Cannot delete Project:"),
        })
      },
    },
    tags: {
      useList(projectID: number) {
        return useQuery<BackendResponse<Tag[]>>({
          queryKey: functions.tagsListQueryKey(projectID),
          queryFn: functions.tagsListQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useDelete(
        projectID: number,
        callback: SuccessCallback<never, tagDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, tagDeleteVars>({
          mutationKey: functions.tagDeleteMutKey(projectID),
          mutationFn: functions.tagDeleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tagsListQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Tag:"),
        })
      },
      useEdit(projectID: number, callback: SuccessCallback<Tag, tagEditVars>) {
        return useMutation<BackendResponse<Tag>, AxiosError, tagEditVars>({
          mutationKey: functions.tagEditMutKey(projectID),
          mutationFn: functions.tagEditMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tagsListQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Tag:"),
        })
      },
      useCreate(
        projectID: number,
        callback: SuccessCallback<Tag, tagCreateVars>,
      ) {
        return useMutation<BackendResponse<Tag>, AxiosError, tagCreateVars>({
          mutationKey: functions.tagCreateMutKey(projectID),
          mutationFn: functions.tagCreateMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.tagsListQueryKey(projectID),
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
          mutationKey: functions.priorityDeleteMutKey(projectID),
          mutationFn: functions.priorityDeleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.prioritiesQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Priority:"),
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, priorityEditVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, priorityEditVars>({
          mutationKey: functions.priorityEditMutKey(projectID),
          mutationFn: functions.priorityEditMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.prioritiesQueryKey(projectID),
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
          mutationKey: functions.priorityCreateMutKey(projectID),
          mutationFn: functions.priorityCreateMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.prioritiesQueryKey(projectID),
          ),
          onError: toastError("Cannot create Priority:"),
        })
      },
      useList(projectID: number) {
        return useQuery<BackendResponse<Priority[]>>({
          queryKey: functions.prioritiesQueryKey(projectID),
          queryFn: functions.prioritiesQueryFn(projectID),
          enabled: !!projectID,
        })
      },
    },
    meetings: {
      useFind(projectID: number, meetingID: number) {
        return useQuery<BackendResponse<Meeting>>({
          queryKey: functions.meeting.findQueryKey(projectID, meetingID),
          queryFn: functions.meeting.findQueryFn(projectID, meetingID),
          enabled: !!projectID && !!meetingID,
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, meetingUpdateVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingUpdateVars>({
          mutationKey: functions.meeting.editMutKey(projectID),
          mutationFn: functions.meeting.editMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ meetingID }) =>
              functions.meeting.findQueryKey(projectID, meetingID),
            functions.meeting.listQueryKey(projectID),
          ),
          onError: toastError("Cannot edit Meeting:"),
        })
      },
      useDelete(
        projectID: number,
        callback: SuccessCallback<never, meetingDeleteVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, meetingDeleteVars>({
          mutationKey: functions.meeting.deleteMutKey(projectID),
          mutationFn: functions.meeting.deleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meeting.listQueryKey(projectID),
          ),
          onError: toastError("Cannot delete Meeting:"),
        })
      },
      useList(projectID: number) {
        return useQuery<BackendResponse<Meeting[]>>({
          queryKey: functions.meeting.listQueryKey(projectID),
          queryFn: functions.meeting.listQueryFn(projectID),
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
          mutationKey: functions.meeting.createMutKey(projectID),
          mutationFn: functions.meeting.createMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.meeting.listQueryKey(projectID),
          ),
          onError: toastError("Cannot create Meeting:"),
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
          mutationKey: functions.topicDeleteMutKey(projectID, meetingID),
          mutationFn: functions.topicDeleteMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ topicID }) =>
              functions.topicFindQueryKey(projectID, meetingID, topicID),
            functions.topicListQueryKey(projectID, meetingID),
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
          mutationKey: functions.topicUpdateMutKey(
            projectID,
            meetingID,
            topicID,
          ),
          mutationFn: functions.topicUpdateMutFn(projectID, meetingID, topicID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topicFindQueryKey(projectID, meetingID, topicID),
            functions.topicListQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot update Topic:"),
        })
      },
      useFind(projectID: number, meetingID: number, topicID: number) {
        return useQuery<BackendResponse<Topic>>({
          queryKey: functions.topicFindQueryKey(projectID, meetingID, topicID),
          queryFn: functions.topicFindQueryFn(projectID, meetingID, topicID),
          enabled: !!projectID && !!topicID,
        })
      },
      useList(projectID: number, meetingID: number) {
        return useQuery<BackendResponse<Topic[]>>({
          queryKey: functions.topicListQueryKey(projectID, meetingID),
          queryFn: functions.topicListQueryFn(projectID, meetingID),
          enabled: !!projectID && !!meetingID,
        })
      },
      useAssignUsers(
        projectID: number,
        meetingID: number,
        callback: SuccessCallback<never, topicAssignUsersVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, topicAssignUsersVars>({
          mutationKey: functions.topicAssignMutKey(projectID, meetingID),
          mutationFn: functions.topicAssignMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.topicListQueryKey(projectID, meetingID),
            ({ topicID }) =>
              functions.topicFindQueryKey(projectID, meetingID, topicID),
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
            mutationKey: functions.topicCreateMutKey(projectID, meetingID),
            mutationFn: functions.topicCreateMutFn(projectID, meetingID),
            onSuccess: invalidateAllCallback(
              callback,
              functions.topicListQueryKey(projectID, meetingID),
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
          mutationKey: functions.topicStatusMutKey(projectID, meetingID),
          mutationFn: functions.topicStatusMutFn(projectID, meetingID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ topicID }) =>
              functions.topicFindQueryKey(projectID, meetingID, topicID),
            functions.topicListQueryKey(projectID, meetingID),
          ),
          onError: toastError("Cannot change Topic status:"),
        })
      },
    },
    actions: {
      useLinkUser(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkUserVars>({
          mutationKey: functions.actionLinkUserMutKey(projectID),
          mutationFn: functions.actionLinkUserMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) => functions.actionFindQueryKey(projectID, actionID),
            functions.actionListForProjectQueryKey!(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} User:`,
          ),
        })
      },
      useLinkTag(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkTagVars>({
          mutationKey: functions.actionLinkTagMutKey(projectID),
          mutationFn: functions.actionLinkTagMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) => functions.actionFindQueryKey(projectID, actionID),
            functions.actionListForProjectQueryKey!(projectID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Tag:`,
          ),
        })
      },
      useLinkTopic(projectID: number) {
        return useMutation<BackendResponse, AxiosError, actionLinkVars>({
          mutationKey: functions.actionLinkTopicMutKey(projectID),
          mutationFn: functions.actionLinkTopicMutFn(projectID),
          onSuccess: invalidateAllCallback(
            undefined,
            ({ actionID }) => functions.actionFindQueryKey(projectID, actionID),
            ({ meetingID, topicID }) =>
              functions.topicFindQueryKey(projectID, meetingID, topicID),
          ),
          onError: toastError(
            ({ link }) => `Cannot ${link ? "link" : "unlink"} Action:`,
          ),
        })
      },
      useListForTopic(projectID: number, meetingID: number, topicID: number) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actionListForTopicQueryKey(
            projectID,
            meetingID,
            topicID,
          ),
          queryFn: functions.actionListForTopicQueryFn(projectID, topicID),
          enabled: !!projectID && !!topicID,
        })
      },
      useListForProject(projectID: number) {
        return useQuery<BackendResponse<Action[]>>({
          queryKey: functions.actionListForProjectQueryKey(projectID),
          queryFn: functions.actionListForProjectQueryFn(projectID),
          enabled: !!projectID,
        })
      },
      useEdit(
        projectID: number,
        callback: SuccessCallback<never, actionEditVars>,
      ) {
        return useMutation<BackendResponse, AxiosError, actionEditVars>({
          mutationKey: functions.actionEditMutKey(projectID),
          mutationFn: functions.actionEditMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            ({ actionID }) => functions.actionFindQueryKey(projectID, actionID),
            functions.actionListForProjectQueryKey(projectID),
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
          mutationKey: functions.actionCreateMutKey(projectID),
          mutationFn: functions.actionCreateMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.actionListForProjectQueryKey(projectID),
          ),
          onError: toastError("Cannot create Action:"),
        })
      },
      useFind(projectID: number, actionID: number) {
        return useQuery<BackendResponse<Action>>({
          queryKey: functions.actionFindQueryKey(projectID, actionID),
          queryFn: functions.actionFindQueryFn(projectID, actionID),
          enabled: !!projectID && !!actionID,
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
          queryKey: functions.commentListQueryKey(
            projectID,
            commentType,
            commentEntityID,
          ),
          queryFn: functions.commentListQueryFn(
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
          mutationKey: functions.commentMarkSolutionMutKey(topicID),
          mutationFn: functions.commentMarkSolutionMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.commentListQueryKey(projectID, "topic", topicID),
            functions.topicFindQueryKey(projectID, meetingID, topicID),
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
          mutationKey: functions.commentSendMutKey(
            projectID,
            commentType,
            commentEntityID,
          ),
          mutationFn: functions.commentSendMutFn(
            projectID,
            commentType,
            commentEntityID,
          ),
          onSuccess: invalidateAllCallback(
            callback,
            functions.commentListQueryKey(
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
          mutationKey: functions.commentDeleteMutKey(),
          mutationFn: functions.commentDeleteMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.commentListQueryKey(
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
          mutationKey: functions.commentEditMutKey(),
          mutationFn: functions.commentEditMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.commentListQueryKey(
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
          queryKey: functions.userListQueryKey(query, page),
          queryFn: functions.userListQueryFn(query, page),
          keepPreviousData,
        })
      },
      useResolve(userID: string, callback?: (name: string) => void) {
        return useQuery<BackendResponse<string>, AxiosError>({
          enabled: !!userID,
          queryKey: functions.userResolveQueryKey(userID),
          queryFn: functions.userResolveQueryFn(userID),
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
          mutationKey: functions.userChangeNameMutKey(),
          mutationFn: functions.userChangeNameMutFn(),
          onSuccess: invalidateAllCallback(
            callback,
            functions.userResolveQueryKey(userID),
          ),
          onError: toastError("Cannot change User name:"),
        })
      },
    },
  } as const

  return { ...hooks }
}
