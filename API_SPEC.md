# API Specification

## Table: favs
- id (int, PK)
- user_id (uuid)
- item_id (string)

### Endpoints
- GET /favs — List all favorites
- POST /favs — Add a favorite (body: user_id, item_id)
- DELETE /favs/:id — Remove a favorite

## Table: flagged
- id (int, PK)
- user_id (uuid)
- item_id (string)
- reason (string)

### Endpoints
- GET /flagged — List all flagged items
- POST /flagged — Flag an item (body: user_id, item_id, reason)
- DELETE /flagged/:id — Remove a flag

## Status Codes
- 200 OK — Success
- 400 Bad Request — Invalid input
- 401 Unauthorized — Auth required
- 404 Not Found — Resource missing
- 500 Internal Server Error — Server/database error
