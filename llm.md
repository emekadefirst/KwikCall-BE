# KwikCall API Documentation for Frontend Agents

This document provides a comprehensive guide for frontend AI agents to integrate with the KwikCall backend API. The API is structured logically around RESTful patterns, utilizing JSON (unless specified otherwise) and Cookie/Bearer based authentication.

**Base URL**: `http://localhost:3000/v1`

---

## 1. Authentication (`/v1/auth`)

The API primarily uses HTTP-only cookies (`accessToken` and `refreshToken`) for browser-based clients. If requests are deemed to come from a native app or script without cookies, the API can return tokens directly.

### POST `/users` (Signup/Create User)
**Description**: Creates a new user account.
**Request Body (JSON)**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 6 characters)",
  "phoneNumber": "string (optional)"
}
```
**Responses**:
- `201 Created`: User created successfully.
- `400 Bad Request`: Validation error or user already exists.

### POST `/auth/login`
**Description**: Authenticates a user. Sets HTTP-only cookies (`accessToken`, `refreshToken`) for browsers, or returns them in body.
**Request Body (JSON)**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Responses**:
- `200 OK`: `null` (Token set in Cookies) OR `{ "accessToken": "...", "refreshToken": "..." }`.
- `401 Unauthorized`: Invalid credentials.

### GET `/auth/whoami`
**Description**: Retrieves the currently authenticated user's information.
**Headers**: `Authorization: Bearer <token>` (if not using cookies).
**Responses**:
- `200 OK`: Returns the current user `UserObject`.
- `401 Unauthorized`: Unauthorized access / User not found.

### POST `/auth/refresh-token`
**Description**: Refreshes session tokens.
**Request Body (JSON)**:
```json
{
  "refreshToken": "string (optional if using cookies)"
}
```
**Responses**:
- `200 OK`: Token refreshed successfully.
- `401 Unauthorized`: Invalid refresh token.

### POST `/auth/logout`
**Description**: Clears authentication cookies.
**Responses**:
- `200 OK`: `{ "success": true }` or `null`.

---

## 2. Users (`/v1/users`)

### GET `/users`
**Description**: Retrieve a paginated list of users.
**Query Parameters**:
- `page`: integer (default: 1)
- `pageSize`: integer (default: 10)
- `id`: UUID (optional)
- `search`: string (optional)
- `role`: `"user" | "admin" | "moderator"` (optional)
- `email`: string (optional)
- `isActive`: boolean (optional)
- `isVerified`: boolean (optional)
**Responses**:
- `200 OK`: `{ "page": number, "pageSize": number, "total": number, "data": [UserObject] }`

### PATCH `/users/{id}`
**Description**: Update an existing user.
**Path Parameters**: `id` (UUID)
**Request Body (JSON)**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phoneNumber": "string (optional)",
  "role": "string (optional)",
  "isActive": "boolean (optional)",
  "isVerified": "boolean (optional)"
}
```
**Responses**:
- `200 OK`: Returns the updated `UserObject`.

### DELETE `/users/{id}`
**Description**: Delete a user.
**Path Parameters**: `id` (UUID)
**Responses**:
- `200 OK`: `{ "success": true }`

---

## 3. Events / Meetings (`/v1/events`)

### GET `/events`
**Description**: List events.
**Query Parameters**:
- `page` (default 1), `pageSize` (default 10)
- `id`: UUID
- `search`: string (Fuzzy search on title/description)
- `shortCode`: string (Meeting code, e.g., 'abc-defg-hij')
- `slug`: string (Vanity URL)
- `type`: `"INSTANT" | "SCHEDULED" | "RECURRING" | "WEBINAR"`
- `status`: `"IDLE" | "LIVE" | "ENDED" | "CANCELLED"`
- `hostId`: UUID
- `startTimeFrom`: ISO Date string
- `startTimeTo`: ISO Date string
**Responses**:
- `200 OK`: `{ "page": number, "pageSize": number, "total": number, "data": [EventObject] }`

### POST `/events`
**Description**: Create a new event.
**Request Body (JSON)**:
```json
{
  "title": "string",
  "description": "string",
  "type": "INSTANT",
  "status": "IDLE",
  "startTime": "2026-03-19T14:53:46.737Z",
  "endTime": "2026-03-19T14:53:46.737Z",
  "inviteesEmail": "string",
  "recurrenceRule": "string",
  "isRecordingEnabled": true,
  "requiresApproval": true
}
```
**Responses**:
- `201 Created`: Returns the created `EventObject`.

### PATCH `/events/{id}`
**Description**: Update an existing event.
**Path Parameters**: `id` (UUID)
**Request Body (JSON)**: (Same structure as POST + status)
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "type": "string (optional)",
  "status": "string ('IDLE', 'LIVE', 'ENDED', 'CANCELLED') (optional)"
  // ... other properties from creation
}
```
**Responses**:
- `200 OK`: Returns the updated `EventObject`.
- `403/404`: Forbidden or Not Found.

### DELETE `/events/{id}`
**Description**: Delete an event.
**Path Parameters**: `id` (UUID)
**Responses**:
- `204 No Content`: Event deleted successfully.

---

## 4. Live Sessions / WebRTC (`/v1/live`)

This integration provides the entry point for LiveKit WebRTC tokens.

### POST `/live/start/{shortCode}`
**Description**: Starts a stream for the host, returning an SFU (LiveKit) connection token.
**Path Parameters**: `shortCode` (string)
**Responses**:
- `200 OK`: 
  ```json
  {
    "token": "string (LiveKit JWT)",
    "serverUrl": "string (LiveKit Server URL)"
  }
  ```
- `401 Unauthorized`: Unauthorized - You do not own this event.

### GET `/live/join/{shortCode}`
**Description**: Joins an active stream as a participant, returning an SFU token.
**Path Parameters**: `shortCode` (string)
**Responses**:
- `200 OK`: 
  ```json
  {
    "token": "string (LiveKit JWT)",
    "serverUrl": "string (LiveKit Server URL)"
  }
  ```
- `404 Not Found`: Stream not found or not live.

---

## 5. Files / Uploads (`/v1/files`)

### POST `/files`
**Description**: Upload a generic file (image, document, video, or audio).
**Content-Type**: `multipart/form-data`
**Body Parameters**:
- `file`: The actual file buffer/blob.
**Responses**:
- `201 Created`: Returns the newly uploaded file object.
- `400 Bad Request`: No file provided.
- `500 Server Error`: Upload/Storage service failure.

### GET `/files`
**Description**: Fetch a list of files with pagination and filtering.
**Query Parameters**:
- `page`: integer (default: 1)
- `pageSize`: integer (default: 10)
- `id`: UUID (optional)
- `search`: string (optional)
- `type`: `"image" | "video" | "document" | "audio"` (optional)
**Responses**:
- `200 OK`: `{ "page": number, "pageSize": number, "total": number, "data": [FileResponseSchema] }`

### PATCH `/files/{id}`
**Description**: Update file metadata.
**Path Parameters**: `id` (UUID)
**Request Body (JSON)**:
```json
{
  // Any updateable properties on the file model
}
```
**Responses**:
- `200 OK`: File updated successfully.

### DELETE `/files/{id}`
**Description**: Delete a file.
**Path Parameters**: `id` (UUID)
**Responses**:
- `200 OK`: File deleted successfully.
