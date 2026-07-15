# Sign In


- **Wireframe id**: `sign-in`
- **Flow id**: `auth-flow`


# User Story: Sign In

As a new or returning user, I want to enter my email address and receive a magic link so that I can sign in to DayDrop without a password.

## Route

`/sign-in`

## Business Use Case

DayDrop uses passwordless authentication to reduce sign-in friction. The user provides only their email address; the system dispatches a one-time magic link that establishes a secure session when clicked. This screen is the sole entry point for account-based access and also surfaces a path to continue in anonymous local-only mode.

## Goals

* Display a single email input field for the user to enter their address.
* Enable the user to submit the form and trigger a magic link email.
* Communicate that no pre-existing account is required.
* Offer a clear path to continue without signing in.

## Page Interactions

The user types their email address into a single field and taps the primary button to request a magic link.

### Initial Page Load

* On mount: no API call fires.
* Prefilled from nothing: the email field is empty.
* Empty / loading / unauthenticated fallback: the form renders in its default empty state; no redirect occurs.

### Form Field Interactions

* **Email address** — text input. Validated on submit for non-empty value and valid email format. No dependent fields.

### Submit Button Behavior

* Client-side validation runs on tap; invalid email prevents submission and shows an inline error.
* On valid input: button enters a loading / disabled state and the email field is locked.
* On success: user is navigated to the Magic Link Sent confirmation screen.
* On API failure: button is re-enabled, field is unlocked, and an inline error banner is shown above the form.

### Navigation Links

* Tapping "Continue without account" dismisses the sign-in screen and returns the user to the anonymous local-only experience (target: morning-home in the morning-intention flow).
* On successful magic link dispatch: navigates to `magic-link-sent`.

### Success State

On a successful API response the user is navigated to the Magic Link Sent screen; no toast is shown on this screen.

## API Specification

This screen calls the Supabase Auth service to dispatch a magic link email to the supplied address.

### Endpoint

`POST /auth/v1/magiclink`

**Method:** POST
**Trigger:** User taps "Send magic link" after passing client-side validation.

#### Request Object

```json
{
  "email": "user@example.com"
}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| email | string | The user's email address to which the magic link is sent | Yes | User input |

**Validations:**

* Email must be a non-empty string in valid email format.

**The System:**

* Disables the submit button and locks the email input while the request is in flight.
* Displays a loading indicator inside the button.

#### Response Object

```json
{
  "status": "success",
  "data": {}
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Indicates whether the magic link was dispatched successfully |
| data | object | Empty on success for this endpoint |

#### Response Processing

**Valid Response / Complete Response:**

On a 200 response the UI navigates to the Magic Link Sent screen, passing the submitted email address for display in the confirmation message.

**Error Response / Incomplete Response:**

On a non-200 response the submit button is re-enabled, the email field is unlocked, and an inline error banner is rendered above the form.

## Error Handling

All errors surface as an inline banner above the email input, preserving the entered value so the user can correct and retry.

### Client-Side Validation Errors

* **Email address** — required, valid email format. Triggered on submit. Error copy: *"Please enter a valid email address."*

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 429 | Rate limit exceeded | "Too many requests. Please wait a moment and try again." | Re-enable form; user retries manually |
| 5xx | Supabase unavailable | "Something went wrong. Please try again." | Re-enable form; preserve email value |

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| email | string | "" | Email input onChange |
| isSubmitting | boolean | false | Submit handler |
| clientError | string | null | Client-side validation |
| serverError | string | null | API error response |
