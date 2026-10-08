# Offset vs cursor pagination

This project uses **offset pagination** because the assignment requires `page`/`limit`, supports page-number navigation, and the seeded catalog contains only 240 records.

Offset advantages here:
- Simple query contract.
- Easy page-number UI.
- Easy first/last page handling.
- Fine for this dataset size.

Cursor pagination is preferable for very large feeds or rapidly changing datasets because large offsets can become expensive and records can shift between pages. It also complicates page-number navigation.

The implementation performs `skip`/`take` in Prisma/PostgreSQL and never loads the complete internship table into Node memory.
