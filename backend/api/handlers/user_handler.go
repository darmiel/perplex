package handlers

import (
	"errors"
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"sort"
	"strings"
)

type UserHandler struct {
	srv       services.UserService
	projSrv   services.ProjectService
	meetSrv   services.MeetingService
	topicSrv  services.TopicService
	actionSrv services.ActionService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

var ErrQueryTooShort = errors.New("query too short")

func NewUserHandler(
	srv services.UserService,
	projSrv services.ProjectService,
	meetSrv services.MeetingService,
	topicSrv services.TopicService,
	actionSrv services.ActionService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *UserHandler {
	return &UserHandler{srv, projSrv, meetSrv, topicSrv, actionSrv, logger, validator}
}

type changeNameDto struct {
	NewName string `json:"new_name" validate:"min=3,max=32,required,username"`
}

func (h UserHandler) UpdateName(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	var payload changeNameDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.srv.ChangeName(u.UserID, payload.NewName); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("changed username", payload.NewName))
}

func (h UserHandler) Resolve(ctx *fiber.Ctx) error {
	target := ctx.Params("user_id")
	name, err := h.srv.GetName(target)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("user found", name))
}

func (h UserHandler) List(ctx *fiber.Ctx) error {
	query := ctx.Query("query", "")
	page := ctx.QueryInt("page", 1)
	users, err := h.srv.ListUsers(query, page)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("users found", users))
}

func (h UserHandler) UpcomingMeetings(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("upcoming meetings",
		h.srv.ListUpcomingMeetings(u.UserID)))
}

func containsFold(haystack, needle string) bool {
	return strings.Contains(strings.ToLower(haystack), strings.ToLower(needle))
}

type searchResult struct {
	Projects       []model.Project `json:"projects"`
	Meetings       []model.Meeting `json:"meetings"`
	Topics         []model.Topic   `json:"topics"`
	Actions        []model.Action  `json:"actions"`
	TopicProjectID map[uint]uint   `json:"topic_meeting_id"`
}

func (h UserHandler) Search(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)

	query := ctx.Query("query", "")
	if len(query) < 2 {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrQueryTooShort))
	}

	// look for projects matching query
	projectsMap := make(map[uint]model.Project)
	ownedProjects, err := h.projSrv.FindProjectsByOwner(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	for _, op := range ownedProjects {
		projectsMap[op.ID] = op
	}
	accessProjects, err := h.projSrv.FindProjectsByUserAccess(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	for _, ap := range accessProjects {
		projectsMap[ap.ID] = ap
	}

	// look for meetings matching query
	var result searchResult
	result.TopicProjectID = make(map[uint]uint)

	for _, p := range projectsMap {
		if containsFold(p.Name, query) {
			result.Projects = append(result.Projects, p)
		}
		allMeetings, err := h.meetSrv.FindMeetingsForProject(p.ID)
		if err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		for _, m := range allMeetings {
			if containsFold(m.Name, query) {
				result.Meetings = append(result.Meetings, *m)
			}
			allTopics, err := h.topicSrv.ListTopicsForMeeting(m.ID)
			if err != nil {
				return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
			}
			for _, t := range allTopics {
				if containsFold(t.Title, query) {
					t.Meeting = *m
					result.Topics = append(result.Topics, *t)
					result.TopicProjectID[t.ID] = p.ID
				}
			}
		}
		allActions, err := h.actionSrv.FindActionsByProject(p.ID)
		if err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		for _, a := range allActions {
			if containsFold(a.Title, query) {
				result.Actions = append(result.Actions, a)
			}
		}
	}

	// sort projects
	sort.Slice(result.Projects, func(i, j int) bool {
		return result.Projects[i].Name < result.Projects[j].Name
	})

	// sort meetings
	sort.Slice(result.Meetings, func(i, j int) bool {
		return result.Meetings[i].StartDate.Before(result.Meetings[j].StartDate)
	})

	// sort topics
	sort.Slice(result.Topics, func(i, j int) bool {
		return result.Topics[i].Title < result.Topics[j].Title
	})

	// sort actions
	sort.Slice(result.Actions, func(i, j int) bool {
		return result.Actions[i].Title < result.Actions[j].Title
	})

	return ctx.Status(200).JSON(presenter.SuccessResponse("search results", result))
}
