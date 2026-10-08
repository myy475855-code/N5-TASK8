# Architecture

```text
Browser
  |
  | GET /internships?search&location&category&sort&page&limit
  v
Express API
  |
  +--> Prisma --> PostgreSQL
  |
  +--> Multer --> validation --> UUID storage
  |
  +--> ownership checks --> Task 6 authentication
```

All search/filter/sort/pagination work happens server-side. The browser never fetches the full internship table.
