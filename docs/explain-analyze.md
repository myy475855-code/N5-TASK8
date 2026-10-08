# EXPLAIN ANALYZE — before/after index comparison

Run this against the PostgreSQL database after seeding.

```sql
EXPLAIN ANALYZE
SELECT id, title, location, category, "createdAt"
FROM "Internship"
WHERE location = 'Lahore'
ORDER BY "createdAt" DESC
LIMIT 12 OFFSET 0;
```

For a baseline, temporarily remove the relevant indexes:

```sql
DROP INDEX IF EXISTS "Internship_location_idx";
DROP INDEX IF EXISTS "Internship_createdAt_idx";
```

Run the query and record PostgreSQL's actual `Execution Time`.

Then add:

```sql
CREATE INDEX "Internship_location_createdAt_idx"
ON "Internship" (location, "createdAt" DESC);
```

Run the same EXPLAIN ANALYZE again and record the new `Execution Time` and query plan. The assignment report should contain the actual numbers from your PostgreSQL instance rather than invented benchmark values.

The included Prisma schema already indexes common filter/sort columns.
