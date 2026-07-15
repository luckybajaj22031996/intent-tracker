# Auth Callback


- **Wireframe id**: `auth-callback`
- **Flow id**: `auth-flow`


# User Story: Auth Callback

As a user who has clicked a magic link in their email, I want the app to automatically verify my link and sync my local data so that I am signed in and my intentions are preserved in the cloud.

## Route

`/auth/callback`

## Business Use Case

When the user clicks the magic link, Supabase redirects them to this route with a one-time token in the URL. The app verifies the token, establishes a persistent session, and then triggers a sync of any intentions stored locally in IndexedDB to Supabase. The user sees a brief processing state before being redirected into the app.

## Goals

* Verify the magic link token with Supabase on page load.
* Establish a Supabase session for the authenticated user.
* Trigger a sync of local IndexedDB data to Supabase.
* Redirect the user to the morning home screen on success.
* Display a clear error state if the token is invalid or expired.

## Page Interactions

This is an automated processing screen; the user takes no action — all steps execute on mount.

### Initial Page Load

* On mount: the app extracts the token from the URL and calls `GET /auth/v1/verify` to validate it.
* On successful verification: a Supabase session is established, then `triggerSync` is called on the Sync Service to push local IndexedDB data.
* On sync completion: the user is redirected to the morning home screen.
* Error fallback: if token verification fails, an inline error message is shown with a link back to the sign-in screen.

### Form Field Interactions

* No interactive fields are present on this screen.

### Navigation Links

* On successful auth and sync: navigates to `morning-home` in the morning-intention flow.
* On error: a retry link navigates back to `sign-in`.

## API Specification

This screen calls the Supabase Auth service to verify the magic link token and the Sync Service (`sync-service`) to push local data to Supabase.

### Endpoint

`GET /auth/v1/verify`

**Method:** GET
**Trigger:** Automatic on page mount; token extracted from the URL query string.

#### Request Object

```json
{
  "token": "<one-time-token>",
  "type": "magiclink"
}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| token | string | One-time magic link token issued by Supabase | Yes | URL query parameter |
| type | string | Auth type identifier; always "magiclink" for this flow | Yes | Hardcoded |

**Validations:**

* Token must be present in the URL; if absent, the error state is shown immediately without calling the API.

**The System:**

* Displays a progress indicator and "Signing you in…" message while the request is in flight.
* Locks the screen from any user interaction during processing.

#### Response Object

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<token>",
  "user": { "id": "<uuid>", "email": "<email>" }
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| access_token | string | JWT used to authenticate subsequent Supabase requests |
| refresh_token | string | Token used to refresh the session when the JWT expires |
| user | object | Authenticated user record containing id and email |

#### Response Processing

**Valid Response / Complete Response:**

On a successful verification response the session tokens are persisted, the Sync Service `triggerSync` call is made to push local IndexedDB data to Supabase, and the user is redirected to the morning home screen.

**Error Response / Incomplete Response:**

On a non-200 response or a missing token the progress indicator is replaced by an inline error banner; the user is offered a link to return to the sign-in screen.

## Error Handling

Errors surface as an inline error banner within the processing card, replacing the progress indicator.

### Client-Side Validation Errors

* **Token** — required; must be present in the URL on mount. Triggered immediately on page load. Error copy: *"This sign-in link is missing or invalid. Please request a new one."*

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 401 | Token invalid or already used | "This sign-in link has expired or already been used. Please request a new one." | Show link to sign-in screen |
| 5xx | Supabase unavailable | "Something went wrong. Please try again." | Show retry link to sign-in screen |

### Edge Case Scenarios

* **Sync failure after successful auth**
    * When it happens: Supabase session is established but the Sync Service call fails (e.g. network offline).
    * System behaviour: The user is still redirected to the morning home screen; local data remains in IndexedDB and sync is retried automatically when connectivity is restored.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| verifyStatus | string | "idle" | Token verification response |
| syncStatus | string | "idle" | Sync Service response |
| errorMessage | string | null | API error response or missing-token check |
