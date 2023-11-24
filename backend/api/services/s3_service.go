package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"mime/multipart"
	"net/http"
	"os"
)

type S3Service interface {
	UploadFile(userID string, projectID uint, file *multipart.FileHeader) (string, error)
	DeleteFile(fileKey string) error
	GetObjectRequest(fileKey string) (*request.Request, *s3.GetObjectOutput)
}

type s3Service struct {
	bucketID        string
	svc             *s3.S3
	uploader        *s3manager.Uploader
	taggingDisabled bool
}

var (
	ErrRegionNotSpecified   = errors.New("no region specified")
	ErrBucketNotSpecified   = errors.New("no bucket specified")
	ErrNoAccessKeySpecified = errors.New("no access key specified")
	ErrNoSecretKeySpecified = errors.New("no secret key specified")
)

func NewS3Service() (S3Service, error) {
	region, ok := os.LookupEnv("AWS_REGION")
	if !ok {
		return nil, ErrRegionNotSpecified
	}
	bucket, ok := os.LookupEnv("AWS_BUCKET")
	if !ok {
		return nil, ErrBucketNotSpecified
	}
	accessKey, ok := os.LookupEnv("AWS_ACCESS_KEY")
	if !ok {
		return nil, ErrNoAccessKeySpecified
	}
	secretKey, ok := os.LookupEnv("AWS_SECRET_KEY")
	if !ok {
		return nil, ErrNoSecretKeySpecified
	}

	_, taggingDisabled := os.LookupEnv("AWS_TAGGING_DISABLED")

	fmt.Println("region:", region, "bucket:", bucket, "accessKey:", accessKey, "secretKey:", secretKey)

	config := aws.Config{
		Region:      &region,
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
		LogLevel:    aws.LogLevel(aws.LogDebug),
	}
	if endpoint, ok := os.LookupEnv("AWS_ENDPOINT"); ok {
		config.Endpoint = &endpoint
	}

	sess, err := session.NewSession(&config)
	if err != nil {
		return nil, err
	}

	svc := s3.New(sess)

	return &s3Service{
		bucketID:        bucket,
		svc:             svc,
		uploader:        s3manager.NewUploader(sess),
		taggingDisabled: taggingDisabled,
	}, nil
}

// function that returns a hex string of a given length with random values
func randomHexString(length int) (string, error) {
	randomBytes := make([]byte, 64)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}
	// convert to hex string
	return hex.EncodeToString(randomBytes)[:length], nil
}

func (s *s3Service) UploadFile(userID string, projectID uint, file *multipart.FileHeader) (string, error) {
	fileSrc, err := file.Open()
	if err != nil {
		return "", err
	}

	fileName := file.Filename
	fileType := http.DetectContentType([]byte(fileName))

	// create a random 64 byte string for the file key
	randomFileKey, err := randomHexString(64)
	if err != nil {
		return "", err
	}
	randomFileKey = "uploads/" + randomFileKey

	fmt.Println("uploading file", fileName, "with key", randomFileKey, "to bucket", s.bucketID)

	params := &s3manager.UploadInput{
		Body:        fileSrc,
		Bucket:      aws.String(s.bucketID),
		ContentType: aws.String(fileType),
		Key:         aws.String(randomFileKey),
	}
	if !s.taggingDisabled {
		params.Tagging = aws.String(fmt.Sprintf("ProjectID=%d&UserID=%s", projectID, userID))
	}

	_, err = s.uploader.Upload(params)
	if err != nil {
		return "", err
	}
	return randomFileKey, nil
}

func (s *s3Service) DeleteFile(fileKey string) error {
	_, err := s.svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketID),
		Key:    aws.String(fileKey),
	})
	return err
}

func (s *s3Service) GetObjectRequest(fileKey string) (*request.Request, *s3.GetObjectOutput) {
	return s.svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.bucketID),
		Key:    aws.String(fileKey),
	})
}
