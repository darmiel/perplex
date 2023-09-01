import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { Axios, AxiosError } from "axios"

import {
  Action,
  BackendResponse,
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

export type projectLeaveVars = {
  projectID: number
}

export type projectUserAddVars = {
  userID: string
  add: boolean
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
      return async ({ userID, add }: projectUserAddVars) =>
        (
          await axios[add ? "post" : "delete"](
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
          await axios.put(`/project/${projectID}`, {
            name,
            description,
          })
        ).data
    },
    projectUpdateMutKey(projectID: number) {
      return [{ projectID }, "project-update-mut"]
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
    meetingListQueryFn(projectID: number) {
      return async () => (await axios.get(`/project/${projectID}/meeting`)).data
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
          await axios.post(`/project/${projectID}/meeting`, {
            name: title,
            description: description,
            start_date: date,
          })
        ).data
    },
    meetingCreateMutKey(projectID: number) {
      return [{ projectID }, "meeting-create-mut"]
    },

    meetingDeleteMutFn(projectID: number) {
      return async ({ meetingID }: meetingDeleteVars) =>
        (await axios.delete(`/project/${projectID}/meeting/${meetingID}`)).data
    },
    meetingDeleteMutKey(projectID: number) {
      return [{ projectID }, "meeting-delete-mut"]
    },

    meetingEditMutFn(projectID: number) {
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
    meetingEditMutKey(projectID: number) {
      return [{ projectID }, "meeting-edit-mut"]
    },

    meetingInfoQueryFn(projectID: number, meetingID: number) {
      return async () =>
        (await axios.get(`/project/${projectID}/meeting/${meetingID}`)).data
    },
    meetingInfoQueryKey(projectID: number, meetingID: number) {
      return [{ projectID }, { meetingID }]
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

    topicStatusMutFn(projectID: number, meetingID: number, topicID: number) {
      return async (check: boolean) =>
        (
          await axios[check ? "post" : "delete"](
            `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
          )
        ).data
    },
    topicStatusMutKey(projectID: number, meetingID: number, topicID: number) {
      return [{ projectID }, { meetingID }, { topicID }, "status-assign-mut"]
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
        ...this.topicFindQueryKey(projectID, meetingID, topicID),
        "topic-update-mut",
      ]
    },

    topicCreateMutFn(
      projectID: number,
      meetingID: number,
      title: any,
      description: any,
      discuss: boolean,
    ) {
      return async () =>
        (
          await axios.post(`/project/${projectID}/meeting/${meetingID}/topic`, {
            title: title,
            description: description,
            force_solution: discuss,
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
        ...this.meetingInfoQueryKey(projectID, meetingID),
        "topic-delete-mut",
      ]
    },

    topicAssignMutFn(projectID: number, meetingID: number) {
      return async ({
        userIDs,
        topicID,
      }: {
        userIDs: string[]
        topicID: any
      }) =>
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

    commentDeleteMutFn(projectID: number, commentID: number) {
      return async () =>
        (await axios.delete(`/project/${projectID}/comment/${commentID}`)).data
    },
    commentDeleteMutKey(commentID: number) {
      return [{ commentID }, "comment-delete-mut"]
    },

    commentEditMutFn(projectID: number, commentID: number) {
      return async (content: string) =>
        (await axios.put(`/project/${projectID}/comment/${commentID}`, content))
          .data
    },
    commentEditMutKey(commentID: number) {
      return [{ commentID }, "comment-edit-mut"]
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
      return async (newName: string) =>
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
        ...this.topicFindQueryKey(projectID, meetingID, topicID),
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
    useActionFindQuery(projectID: number, actionID: number) {
      return useQuery<BackendResponse<Action>>({
        queryKey: this.actionFindQueryKey(projectID, actionID),
        queryFn: this.actionFindQueryFn(projectID, actionID),
        enabled: !!projectID && !!actionID,
      })
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
  }
  const hooks = {
    useProjectCreateMut(callback: SuccessCallback<Project, projectCreateVars>) {
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
    useProjectUsersQuery(projectID: number) {
      return useQuery<BackendResponse<User[]>>({
        queryKey: functions.projectUsersQueryKey(projectID),
        queryFn: functions.projectUsersQueryFn(projectID),
        enabled: !!projectID,
      })
    },
    useProjectLeaveMut(callback: SuccessCallback<never, projectLeaveVars>) {
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
    useTagsListQuery(projectID: number) {
      return useQuery<BackendResponse<Tag[]>>({
        queryKey: functions.tagsListQueryKey(projectID),
        queryFn: functions.tagsListQueryFn(projectID),
        enabled: !!projectID,
      })
    },
    useTagDeleteMut(
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
    useTagEditMut(
      projectID: number,
      callback: SuccessCallback<Tag, tagEditVars>,
    ) {
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
    useTagCreateMut(
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
    usePriorityDeleteMut(
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
    usePriorityEditMut(
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
    usePriorityCreateMut(
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
    usePrioritiesQuery(projectID: number) {
      return useQuery<BackendResponse<Priority[]>>({
        queryKey: functions.prioritiesQueryKey(projectID),
        queryFn: functions.prioritiesQueryFn(projectID),
        enabled: !!projectID,
      })
    },
    useMeetingInfoQuery(projectID: number, meetingID: number) {
      return useQuery<BackendResponse<Meeting>>({
        queryKey: functions.meetingInfoQueryKey(projectID, meetingID),
        queryFn: functions.meetingInfoQueryFn(projectID, meetingID),
        enabled: !!projectID && !!meetingID,
      })
    },
    useMeetingEditMut(
      projectID: number,
      callback: SuccessCallback<never, meetingUpdateVars>,
    ) {
      return useMutation<BackendResponse, AxiosError, meetingUpdateVars>({
        mutationKey: functions.meetingEditMutKey(projectID),
        mutationFn: functions.meetingEditMutFn(projectID),
        onSuccess: invalidateAllCallback(
          callback,
          ({ meetingID }) =>
            functions.meetingInfoQueryKey(projectID, meetingID),
          functions.meetingListQueryKey(projectID),
        ),
        onError: toastError("Cannot edit Meeting:"),
      })
    },
    useMeetingDeleteMut(
      projectID: number,
      callback: SuccessCallback<never, meetingDeleteVars>,
    ) {
      return useMutation<BackendResponse, AxiosError, meetingDeleteVars>({
        mutationKey: functions.meetingDeleteMutKey(projectID),
        mutationFn: functions.meetingDeleteMutFn(projectID),
        onSuccess: invalidateAllCallback(
          callback,
          functions.meetingListQueryKey(projectID),
        ),
        onError: toastError("Cannot delete Meeting:"),
      })
    },
    useTopicDeleteMut(
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
    useTopicUpdateMut(
      projectID: number,
      meetingID: number,
      topicID: number,
      callback: SuccessCallback<never, topicUpdateVars>,
    ) {
      return useMutation<BackendResponse, AxiosError, topicUpdateVars>({
        mutationKey: functions.topicUpdateMutKey(projectID, meetingID, topicID),
        mutationFn: functions.topicUpdateMutFn(projectID, meetingID, topicID),
        onSuccess: invalidateAllCallback(
          callback,
          functions.topicFindQueryKey(projectID, meetingID, topicID),
          functions.topicListQueryKey(projectID, meetingID),
        ),
        onError: toastError("Cannot update Topic:"),
      })
    },
    useTopicFindQuery(projectID: number, meetingID: number, topicID: number) {
      return useQuery<BackendResponse<Topic>>({
        queryKey: functions.topicFindQueryKey(projectID, meetingID, topicID),
        queryFn: functions.topicFindQueryFn(projectID, meetingID, topicID),
        enabled: !!projectID && !!topicID,
      })
    },
    useTopicListQuery(projectID: number, meetingID: number) {
      return useQuery<BackendResponse<Topic[]>>({
        queryKey: functions.topicListQueryKey(projectID, meetingID),
        queryFn: functions.topicListQueryFn(projectID, meetingID),
        enabled: !!projectID && !!meetingID,
      })
    },
    useActionLinkUserMut(projectID: number) {
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
    useActionLinkTagMut(projectID: number) {
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
    useActionLinkTopicMut(projectID: number) {
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
    useActionListForTopicQuery(
      projectID: number,
      meetingID: number,
      topicID: number,
    ) {
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
    useActionListForProjectQuery(projectID: number) {
      return useQuery<BackendResponse<Action[]>>({
        queryKey: functions.actionListForProjectQueryKey(projectID),
        queryFn: functions.actionListForProjectQueryFn(projectID),
        enabled: !!projectID,
      })
    },
    useActionEditMut(
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
    useActionCreateMut(
      projectID: number,
      callback: SuccessCallback<Action, actionCreateVars>,
    ) {
      return useMutation<BackendResponse<Action>, AxiosError, actionCreateVars>(
        {
          mutationKey: functions.actionCreateMutKey(projectID),
          mutationFn: functions.actionCreateMutFn(projectID),
          onSuccess: invalidateAllCallback(
            callback,
            functions.actionListForProjectQueryKey(projectID),
          ),
          onError: toastError("Cannot create Action:"),
        },
      )
    },
    useCommentMarkSolutionMut(
      projectID: number,
      topicID: number,
      callback: SuccessCallback<never, commentMarkSolutionVars>,
    ) {
      return useMutation<BackendResponse, AxiosError, commentMarkSolutionVars>({
        mutationKey: functions.commentMarkSolutionMutKey(topicID),
        mutationFn: functions.commentMarkSolutionMutFn(projectID),
        onSuccess: invalidateAllCallback(
          callback,
          functions.commentListQueryKey(projectID, "topic", topicID),
          functions.topicFindQueryKey(projectID, topicID, topicID),
        ),
        onError: toastError("Cannot mark Solution:"),
      })
    },
  }
  return { ...functions, ...hooks }
}
