package laundrybo

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var staticFiles embed.FS

// GetStaticFiles returns the embedded static files for serving
func GetStaticFiles() fs.FS {
	// Attempt to return the dist subdirectory from the embedded filesystem
	sub, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		panic("Failed to create subdirectory from embedded files: " + err.Error())
	}
	return sub
}
