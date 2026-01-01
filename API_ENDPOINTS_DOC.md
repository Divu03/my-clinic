## 📚 API Documentation

### Base URL

```
https://qure-backend-api.onrender.com/api
```

### API Overview

| Method | Endpoint                      | Auth Required | Role        | Description                   |
| ------ | ----------------------------- | ------------- | ----------- | ----------------------------- |
| `GET`  | `/health`                     | ❌            | Public      | Health check                  |
| `POST` | `/api/auth/register`          | ❌            | Public      | Register new user             |
| `POST` | `/api/auth/login`             | ❌            | Public      | Login user                    |
| `POST` | `/api/auth/logout`            | ❌            | Public      | Logout & revoke refresh token |
| `POST` | `/api/auth/refresh-token`     | ❌            | Public      | Refresh access token          |
| `GET`  | `/api/auth/me`                | ✅            | Any         | Get current user profile      |
| `POST` | `/api/clinic`                 | ✅            | Admin       | Create new clinic             |
| `GET`  | `/api/clinic`                 | ✅            | Any         | Get clinics (with geo-filter) |
| `GET`  | `/api/clinic/:clinicId`       | ✅            | Any         | Get clinic by ID              |
| `POST` | `/api/clinic/:clinicId/staff` | ✅            | Admin       | Add staff to clinic           |
| `GET`  | `/api/clinic/:clinicId/staff` | ✅            | Admin/Staff | Get clinic staff members      |
| `POST` | `/api/queues/init/:clinicId`  | ✅            | Admin/Staff | Initialize daily queue        |
| `GET`  | `/api/queues/:queueId/status` | ✅            | Any         | Get queue status              |
| `POST` | `/api/tokens`                 | ✅            | Patient     | Generate token for queue      |

---

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "health": "ok",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "version": "1.0.0",
  "message": "Server is running"
}
```

---

### 🔐 Authentication Endpoints

#### Register a new user

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

| Field             | Type     | Required | Validation            |
| ----------------- | -------- | -------- | --------------------- |
| `firstName`       | `string` | ✅       | Min 3 characters      |
| `lastName`        | `string` | ✅       | Min 3 characters      |
| `email`           | `string` | ✅       | Valid email format    |
| `password`        | `string` | ✅       | Min 6 characters      |
| `confirmPassword` | `string` | ✅       | Must match `password` |

**Example:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

| Field        | Type     | Required | Validation                                   |
| ------------ | -------- | -------- | -------------------------------------------- |
| `email`      | `string` | ✅       | Valid email format                           |
| `password`   | `string` | ✅       | Min 6 characters                             |
| `deviceInfo` | `object` | ❌       | `{ userAgent: string }` for session tracking |

**Example:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT",
      "clinicId": null,
      "profilePicture": "https://..."
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "abc123..."
  }
}
```

#### Get Current User Profile

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

> 🚀 **Cached:** Response is cached in Redis for 24 hours

#### Refresh Access Token

```http
POST /api/auth/refresh-token
Content-Type: application/json
```

**Request Body:**

| Field          | Type     | Required | Description                                  |
| -------------- | -------- | -------- | -------------------------------------------- |
| `refreshToken` | `string` | ✅       | Valid refresh token from login               |
| `deviceInfo`   | `object` | ❌       | `{ userAgent: string }` for session tracking |

**Example:**

```json
{
  "refreshToken": "abc123...",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Logout

```http
POST /api/auth/logout
Content-Type: application/json
```

**Request Body:**

| Field          | Type     | Required | Description             |
| -------------- | -------- | -------- | ----------------------- |
| `refreshToken` | `string` | ✅       | Refresh token to revoke |

**Example:**

```json
{
  "refreshToken": "abc123..."
}
```

---

### 🏥 Clinic Endpoints

#### Create a Clinic (Admin Only)

```http
POST /api/clinic
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**

| Field          | Type     | Required | Validation / Description                                                                                             |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string` | ✅       | Min 1 character                                                                                                      |
| `latitude`     | `number` | ✅       | Clinic's latitude coordinate                                                                                         |
| `longitude`    | `number` | ✅       | Clinic's longitude coordinate                                                                                        |
| `address`      | `string` | ❌       | Street address                                                                                                       |
| `phone`        | `string` | ❌       | Must be exactly 10 digits                                                                                            |
| `email`        | `string` | ❌       | Valid email format                                                                                                   |
| `website`      | `string` | ❌       | Valid URL                                                                                                            |
| `description`  | `string` | ❌       | Clinic description                                                                                                   |
| `logo`         | `file`   | ❌       | Image file (processed via BullMQ → Cloudinary)                                                                       |
| `images`       | `file[]` | ❌       | Multiple image files                                                                                                 |
| `openingHours` | `json`   | ❌       | `{"start": "09:00", "end": "17:00"}` (default: 09:00-17:00)                                                          |
| `type`         | `enum`   | ❌       | One of: `GENERAL_PRACTICE`, `PEDIATRICS`, `DERMATOLOGY`, `PSYCHIATRY`, `GYNECOLOGY`, `ORTHOPEDICS`, `ENT`, `DENTIST` |

**Example:**

```json
{
  "name": "City Health Clinic",
  "address": "123 Main Street",
  "latitude": 40.7128,
  "longitude": -74.006,
  "phone": "1234567890",
  "email": "contact@cityclinic.com",
  "type": "GENERAL_PRACTICE",
  "openingHours": "{\"start\": \"09:00\", \"end\": \"17:00\"}"
}
```

#### Get All Clinics (with Geolocation & Pagination)

```http
GET /api/clinic
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter   | Type     | Required | Default | Description                                                                                                                         |
| ----------- | -------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `latitude`  | `number` | ❌       | -       | User's current latitude (for proximity search)                                                                                      |
| `longitude` | `number` | ❌       | -       | User's current longitude (for proximity search)                                                                                     |
| `radius`    | `number` | ❌       | -       | Search radius in kilometers                                                                                                         |
| `query`     | `string` | ❌       | -       | Search clinics by name (case-insensitive)                                                                                           |
| `type`      | `enum`   | ❌       | -       | Filter by clinic type: `GENERAL_PRACTICE`, `PEDIATRICS`, `DERMATOLOGY`, `PSYCHIATRY`, `GYNECOLOGY`, `ORTHOPEDICS`, `ENT`, `DENTIST` |
| `page`      | `number` | ❌       | `1`     | Page number for pagination                                                                                                          |
| `limit`     | `number` | ❌       | `10`    | Number of results per page                                                                                                          |

**Example Requests:**

```http
# Get all clinics with pagination
GET /api/clinic?page=1&limit=20

# Find clinics within 5km radius of user location
GET /api/clinic?latitude=40.7128&longitude=-74.0060&radius=5&page=1&limit=10

# Search clinics by name
GET /api/clinic?query=city%20health&page=1&limit=10

# Filter by clinic type
GET /api/clinic?type=DENTIST&page=1&limit=10

# Combined: Find dentists within 10km, sorted by distance
GET /api/clinic?latitude=40.7128&longitude=-74.0060&radius=10&type=DENTIST&page=1&limit=10
```

> 🚀 **Cached:** Results are cached in Redis for 15 minutes (unique cache key per filter combination)
>
> 📍 **Geolocation:** When `latitude`, `longitude`, and `radius` are provided, uses Haversine formula to calculate distances and returns clinics sorted by proximity with `distance_km` field

**Response (with pagination):**

```json
{
  "success": true,
  "data": {
    "clinics": [
      {
        "id": "uuid",
        "name": "City Health Clinic",
        "address": "123 Main Street",
        "latitude": 40.7128,
        "longitude": -74.006,
        "phone": "1234567890",
        "email": "contact@cityclinic.com",
        "type": "GENERAL_PRACTICE",
        "distance_km": 0.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 47,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Pagination Object:**

| Field         | Type      | Description                             |
| ------------- | --------- | --------------------------------------- |
| `page`        | `number`  | Current page number                     |
| `limit`       | `number`  | Results per page                        |
| `totalCount`  | `number`  | Total number of matching clinics        |
| `totalPages`  | `number`  | Total number of pages                   |
| `hasNextPage` | `boolean` | Whether there are more pages after this |
| `hasPrevPage` | `boolean` | Whether there are pages before this     |

#### Get Clinic by ID

```http
GET /api/clinic/:clinicId
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter  | Type   | Required | Validation |
| ---------- | ------ | -------- | ---------- |
| `clinicId` | `uuid` | ✅       | Valid UUID |

> 🚀 **Cached:** Response is cached in Redis for 24 hours

#### Add Staff to Clinic (Admin Only)

```http
POST /api/clinic/:clinicId/staff
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter  | Type   | Required | Validation |
| ---------- | ------ | -------- | ---------- |
| `clinicId` | `uuid` | ✅       | Valid UUID |

**Request Body:**

| Field    | Type   | Required | Validation                  |
| -------- | ------ | -------- | --------------------------- |
| `userId` | `uuid` | ✅       | Valid UUID of existing user |

> ⚠️ **Note:** User must not be already assigned to another clinic and cannot be an ADMIN

**Example:**

```json
{
  "userId": "user-uuid-here"
}
```

#### Get Clinic Staff Members (Admin/Staff Only)

```http
GET /api/clinic/:clinicId/staff
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter  | Type   | Required | Validation |
| ---------- | ------ | -------- | ---------- |
| `clinicId` | `uuid` | ✅       | Valid UUID |

> 🚀 **Cached:** Response is cached in Redis for 24 hours

---

### 📋 Queue Endpoints

#### Initialize Daily Queue (Admin/Staff Only)

```http
POST /api/queues/init/:clinicId
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter  | Type   | Required | Validation |
| ---------- | ------ | -------- | ---------- |
| `clinicId` | `uuid` | ✅       | Valid UUID |

**Request Body:**

| Field          | Type     | Required | Default | Description                          |
| -------------- | -------- | -------- | ------- | ------------------------------------ |
| `maxQueueSize` | `number` | ❌       | `50`    | Maximum number of tokens for the day |

> ⚠️ **Note:** Only one queue can be created per clinic per day. Queue times are derived from clinic's `openingHours`.

**Example:**

```json
{
  "maxQueueSize": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "queue-uuid",
    "clinicId": "clinic-uuid",
    "queueDate": "2025-12-30T00:00:00.000Z",
    "currentTokenNo": 0,
    "maxQueueSize": 100,
    "startTime": "2025-12-30T09:00:00.000Z",
    "endTime": "2025-12-30T17:00:00.000Z",
    "isActive": true
  }
}
```

#### Get Queue Status

```http
GET /api/queues/:queueId/status
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type   | Required | Validation |
| --------- | ------ | -------- | ---------- |
| `queueId` | `uuid` | ✅       | Valid UUID |

> 🚀 **Cached:** Response is cached in Redis for 15 minutes (invalidated on token updates)

**Response:**

```json
{
  "success": true,
  "data": {
    "queueId": "uuid",
    "currentTokenNo": 5,
    "waitingCount": 12,
    "startTime": "2025-12-30T09:00:00.000Z",
    "endTime": "2025-12-30T17:00:00.000Z"
  }
}
```

---

### 🎫 Token Endpoints

#### Generate Token for Queue (Patient Only)

```http
POST /api/tokens
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

| Field     | Type   | Required | Validation                              |
| --------- | ------ | -------- | --------------------------------------- |
| `queueId` | `uuid` | ✅       | Valid UUID of an active queue for today |

> ⚠️ **Validation Rules:**
>
> - Patient cannot have multiple active (WAITING) tokens in the same queue
> - Queue must exist and be active for the current date
> - Token numbers are auto-incremented atomically within a transaction

**Example:**

```json
{
  "queueId": "queue-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "token-uuid",
    "queueId": "queue-uuid",
    "patientId": "patient-uuid",
    "tokenNumber": 15,
    "status": "WAITING",
    "createdAt": "2025-12-30T10:30:00.000Z"
  }
}
```

**Token Status Flow:**

```
WAITING → CALLED → COMPLETED
    ↓
  SKIPPED
```

---

## 🔌 WebSocket Events

### Connection

Connect to the WebSocket server with authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your-access-token",
  },
});
```

### Client → Server Events

| Event                  | Payload                            | Description                            |
| ---------------------- | ---------------------------------- | -------------------------------------- |
| `join-queue`           | `queueId: string`                  | Join a queue room to receive updates   |
| `leave-queue`          | `queueId: string`                  | Leave a queue room                     |
| `queue:call_next`      | `queueId: string`                  | Call the next patient in queue (Staff) |
| `queue:skip_token`     | `queueId: string, tokenId: string` | Skip a patient's token (Staff)         |
| `queue:complete_token` | `queueId: string, tokenId: string` | Mark token as completed (Staff)        |

### Server → Client Events

| Event                        | Payload       | Description                        |
| ---------------------------- | ------------- | ---------------------------------- |
| `join-queue`                 | `undefined`   | Confirmation of joining queue room |
| `join-queue-error`           | `string`      | Error while joining queue          |
| `leave-queue`                | `undefined`   | Confirmation of leaving queue room |
| `queue:status_update`        | `QueueStatus` | Real-time queue status update      |
| `queue:empty`                | `string`      | Queue has no more waiting tokens   |
| `queue:your_token_called`    | `Token`       | Patient's token has been called    |
| `queue:your_token_skipped`   | `Token`       | Patient's token has been skipped   |
| `queue:your_token_completed` | `Token`       | Patient's token has been completed |
| `queue:call_next_error`      | `string`      | Error calling next token           |
| `queue:skip_token_error`     | `string`      | Error skipping token               |
| `queue:complete_token_error` | `string`      | Error completing token             |
