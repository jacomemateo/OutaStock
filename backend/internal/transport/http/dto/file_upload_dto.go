package dto

import "mime/multipart"

type FileUploadRequest struct {
    File *multipart.FileHeader
}