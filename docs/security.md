# Upload security and OWASP notes

Three mitigations applied:

1. **Server-side allowlisting and size limits:** resumes accept PDF and are limited to 2 MB; logos accept PNG/JPEG/WebP and are limited to 1 MB.
2. **Generated storage filenames:** original filenames are never used as storage paths. UUID names plus controlled extensions prevent path traversal and collisions.
3. **Ownership authorization:** the authenticated user ID is compared with the profile's stored `userId`, so users cannot upload to another person's profile.

Additional protections include multipart file-count limits, separate upload directories, Helmet, and basic file-signature ("magic byte") verification after upload. For production, add antivirus/content scanning, private object storage and signed download URLs.
