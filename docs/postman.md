# Postman testing

Import `postman_collection.json`.

Seeded demo identities:
- Student user: `x-user-id: 26`, `x-user-role: STUDENT`; student profile ID is `1`.
- Company users: IDs `1` through `25`; their company profile IDs are also `1` through `25`.

Test:
- Search/filter/sort/pagination.
- Valid company logo.
- Valid student PDF resume.
- Invalid/oversized uploads → `422`.
- Upload to another user's profile → `403`.
