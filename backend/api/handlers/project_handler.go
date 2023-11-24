package handlers

import (
	"errors"
	"fmt"
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"sort"
	"time"
)

var ErrNoAccess = errors.New("no access")
var ErrNotFound = errors.New("not found")
var ErrAlreadyInProject = errors.New("user already in project")
var ErrNotInProject = errors.New("user not in project")
var ErrOnlyOwner = errors.New("only owners can perform this action")
var ErrOnlyUser = errors.New("only users can perform this action")

type ProjectHandler struct {
	srv       services.ProjectService
	userSrv   services.UserService
	s3Srv     services.S3Service
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewProjectHandler(
	srv services.ProjectService,
	userSrv services.UserService,
	s3Srv services.S3Service,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *ProjectHandler {
	return &ProjectHandler{srv, userSrv, s3Srv, logger, validator}
}

type projectDto struct {
	Name        string `validate:"required,min=1,max=128,startsnotwith= ,endsnotwith= " json:"name,omitempty"`
	Description string `json:"description"`
}

func (h *ProjectHandler) ValidateProjectDto(dto *projectDto) error {
	if err := h.validator.Struct(dto); err != nil {
		return err
	}
	if len(dto.Description) > MaxDescriptionLength {
		return ErrDescriptionTooLong
	}
	return nil
}

// ProjectAccessMiddleware checks if the requesting user has access to the project
// and preloads the project data to the "project" local
func (h *ProjectHandler) ProjectAccessMiddleware(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	// find project to check if the requester is the owner
	project, err := h.srv.FindProject(uint(projectID), "Users")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	// owner always has access
	if project.OwnerID == u.UserID || util.HasAccess(project, u.UserID) {
		ctx.Locals("project", *project)
		return ctx.Next()
	}

	return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
}

// AddProject creates a new project
func (h *ProjectHandler) AddProject(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	h.logger.Infof("user %s is requesting to create a new project", u.UserID)

	var payload projectDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.ValidateProjectDto(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	project, err := h.srv.CreateProject(payload.Name, payload.Description, u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}

	h.logger.Infof("created project %d for user %s (%s)", project.ID, u.UserID, project.Name)
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("project created", project))
}

// GetProjects returns a list of all projects the user has access to
func (h *ProjectHandler) GetProjects(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	h.logger.Infof("user %s is requesting a list of projects", u.UserID)

	projects := make(map[uint]model.Project)

	ownerProjects, err := h.srv.FindProjectsByOwner(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	for _, p := range ownerProjects {
		projects[p.ID] = p
	}

	userProjects, err := h.srv.FindProjectsByUserAccess(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	for _, p := range userProjects {
		projects[p.ID] = p
	}

	result := make([]model.Project, 0, len(projects))
	for _, v := range projects {
		result = append(result, v)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", result))
}

// LeaveProject is a self-service for users
func (h *ProjectHandler) LeaveProject(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	if u.UserID == p.OwnerID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyUser))
	}
	if err := h.srv.RemoveUser(p.ID, u.UserID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project left", nil))
}

// DeleteProject deletes a project
func (h *ProjectHandler) DeleteProject(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	if u.UserID != p.OwnerID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	if err := h.srv.DeleteProject(p.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project deleted", nil))
}

// EditProject edits the name and description of a project
func (h *ProjectHandler) EditProject(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	if u.UserID != p.OwnerID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	var payload projectDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.ValidateProjectDto(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.srv.EditProject(p.ID, payload.Name, payload.Description); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project updated", nil))
}

func (h *ProjectHandler) ListUsersForProject(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	users := make([]model.User, len(p.Users)+1)
	if err := h.srv.Extend(&p, "Owner"); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	users[0] = p.Owner
	for i, u := range p.Users {
		users[i+1] = u
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project users", users))
}

func (h *ProjectHandler) GetProject(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project", p))
}

func (h *ProjectHandler) AddUser(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	if u.UserID != p.OwnerID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	userID := ctx.Params("user_id")
	// find user
	targetUser, err := h.userSrv.FindUser(userID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	// check if user already in project
	if util.HasAccess(&p, userID) {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrAlreadyInProject))
	}
	if err := h.srv.AddUser(p.ID, userID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}

	// create notification for receiver
	if err := h.userSrv.CreateNotification(
		targetUser.ID,
		p.Name,
		"project",
		fmt.Sprintf("%s added you to the project", util.GetFriendlyName(ctx)),
		fmt.Sprintf("/project/%d", p.ID),
		"Go to Project"); err != nil {
		h.logger.Warnf("cannot create notification for user %s: %v", targetUser.ID, err)
	}

	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("user added", nil))
}

func (h *ProjectHandler) RemoveUser(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	if u.UserID != p.OwnerID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	userID := ctx.Params("user_id")
	// check if user is in project
	if !util.HasAccess(&p, userID) {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotInProject))
	}
	if err := h.srv.RemoveUser(p.ID, userID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}

	// create notification for receiver
	if targetUser, err := h.userSrv.FindUser(userID); err != nil {
		h.logger.Warnf("cannot find user to create notification for %s: %v", userID, err)
	} else {
		if err = h.userSrv.CreateNotification(
			targetUser.ID,
			p.Name,
			"project",
			"You were removed from the project",
			"",
			"",
		); err != nil {
			h.logger.Warnf("cannot create notification for user %s: %v", targetUser.ID, err)
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("user added", nil))
}

// Files

var (
	ErrNoFileUploaded  = errors.New("no files")
	ErrFileTooBig      = errors.New("file too big")
	ErrNoFileQuotaLeft = errors.New("no file quota left")
)

func (h *ProjectHandler) UploadFile(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)

	form, err := ctx.MultipartForm()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	files := form.File["file"]
	if len(files) == 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrNoFileUploaded))
	}

	// if the project has a file size quota, check if the user is allowed to upload
	var totalSize *uint64
	if p.ProjectFileSizeQuota >= 0 {
		ts, err := h.srv.GetTotalProjectFileSize(p.ID)
		if err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		totalSize = ts
	}

	var uploaded uint
	for _, file := range files {
		if p.MaxProjectFileSize >= 0 && file.Size > p.MaxProjectFileSize {
			return ctx.Status(fiber.StatusForbidden).JSON(presenter.ErrorResponse(ErrFileTooBig))
		}
		if totalSize != nil {
			*totalSize += uint64(file.Size)
			if *totalSize > uint64(p.ProjectFileSizeQuota) {
				return ctx.Status(fiber.StatusForbidden).JSON(presenter.ErrorResponse(ErrNoFileQuotaLeft))
			}
		}
		key, err := h.s3Srv.UploadFile(u.UserID, p.ID, file)
		if err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		// save file to database
		if err := h.srv.CreateFile(p.ID, model.ProjectFile{
			Name:           file.Filename,
			ObjectKey:      key,
			Size:           file.Size,
			ProjectID:      p.ID,
			CreatorID:      u.UserID,
			LastAccessedAt: time.Now(),
			AccessCount:    0,
		}); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		uploaded++
	}

	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse(
		fmt.Sprintf("%d files uploaded", uploaded),
		nil,
	))
}

func (h *ProjectHandler) ListFiles(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	files, err := h.srv.FindFiles(p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project files", files))
}

func (h *ProjectHandler) GetFile(ctx *fiber.Ctx) error {
	f := ctx.Locals("file").(model.ProjectFile)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("project file", f))
}

func (h *ProjectHandler) DeleteFile(ctx *fiber.Ctx) error {
	f := ctx.Locals("file").(model.ProjectFile)
	// try to delete file from s3
	if err := h.s3Srv.DeleteFile(f.ObjectKey); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	// delete file from database
	if err := h.srv.DeleteFile(f.ProjectID, f.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("file deleted", nil))
}

func (h *ProjectHandler) DownloadFile(ctx *fiber.Ctx) error {
	// get file from s3
	f := ctx.Locals("file").(model.ProjectFile)
	req, _ := h.s3Srv.GetObjectRequest(f.ObjectKey)
	if req.Error != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(req.Error))
	}
	// create presigned url
	url, err := req.Presign(60 * time.Minute)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	// update access
	if err := h.srv.UpdateFileAccess(f.ID); err != nil {
		h.logger.Warnf("cannot update file access: %v", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("file download url", url))
}

type quotaInfoResponse struct {
	// TotalSize is the total size of all files in the project
	TotalSize uint64 `json:"total_size"`
	// Quota is the quota (max total size of all files) of the project
	Quota int64 `json:"quota"`
	// MaxFileSize is the maximum file size of a single file
	MaxFileSize int64 `json:"max_file_size"`
}

func (h *ProjectHandler) FileQuotaInfo(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	totalSize, err := h.srv.GetTotalProjectFileSize(p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	var totalSizeUint64 uint64
	if totalSize != nil {
		totalSizeUint64 = *totalSize
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", quotaInfoResponse{
		TotalSize:   totalSizeUint64,
		Quota:       p.ProjectFileSizeQuota,
		MaxFileSize: p.MaxProjectFileSize,
	}))
}
