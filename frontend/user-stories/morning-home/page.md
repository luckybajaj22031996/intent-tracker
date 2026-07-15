# Morning Home


- **Wireframe id**: `morning-home`
- **Flow id**: `morning-intention`


# User Story: Morning Home

As a returning user, I want to open the app in the morning and set a single daily intention so that I can carry a clear focus into my day.

## Route

`/` — root path, entry screen for the morning intention flow.

## Business Use Case

The Morning Home screen is the primary entry point for the app each day. It lets the user write and save one intention in under 30 seconds. Yesterday's intention is surfaced as secondary context so the user can carry forward any relevant thread without navigating away.

## Goals

* Display a single text input for today's intention.
* Enforce a 140-character maximum on the intention text.
* Show yesterday's saved intention as read-only secondary context.
* Allow submission via the Submit button or the Enter key.
* Prevent submission if today's intention has already been saved.

## Page Interactions

The user types a short intention and submits it; the screen also loads yesterday's intention on mount for passive context.

### Initial Page Load

* On mount: two reads fire against the Intention Store — one to check whether today's intention already exists, one to load yesterday's intention.
* If today's intention already exists, the input is pre-filled and locked (read-only), and the Submit button is replaced with a confirmation label.
* If yesterday's intention exists, it is displayed in the secondary context block below the input.
* If no previous intention is found, the context block shows a neutral placeholder prompt.
* If the store is unavailable, the screen renders in offline mode with the input active and the context block empty.

### Form Field Interactions

* **Intention text** — multi-line text input. Character count updates in real time. Submission is blocked when the field is empty or exceeds 140 characters.
* **Submit button** — active when the input contains 1–140 characters and today's intention has not yet been saved. Pressing Enter in the input triggers the same submit action.
* **Yesterday's intention block** — read-only display. No user interaction; rendered from the loaded previous intention.

### Submit Button Behavior

* Validates that the input is non-empty and ≤ 140 characters before firing.
* Locks the input and button during the save call to prevent double-submission.
* On success: navigates to the Intention Saved Confirmation screen.
* On failure: unlocks the input, preserves the typed text, and shows an inline error message.

### Navigation Links

* On successful save → `intention-saved` (Intention Saved Confirmation).

### Success State

* After a successful save the user is navigated to the confirmation screen; no toast is shown on this screen.

## API Specification

This screen calls the Intention Store service for three operations: checking today's record, loading yesterday's record, and persisting the new intention.

### Endpoint

* `GET /intentions/today` — checks whether today's intention already exists (fires on mount).
* `GET /intentions/previous` — loads yesterday's intention for context (fires on mount).
* `POST /intentions` — persists today's intention on submit.

**Method:** GET / POST (see above)
**Trigger:** Page load (GET calls); Submit button click or Enter key (POST call).

#### Request Object

```json
{
  "text": "My intention for today",
  "date": "YYYY-MM-DD"
}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| text | string | The user's intention text | Yes | User input |
| date | string | ISO date for today | Yes | System clock |

**Validations:**

* `text` must be between 1 and 140 characters.
* `date` must equal today's local date; the server rejects duplicate entries for the same date.

**The System:**

* Disables the input and Submit button while the POST is in flight.
* Displays a loading indicator on the Submit button during the save call.

#### Response Object

```json
{
  "status": "success",
  "data": {
    "id": "<intention-id>",
    "text": "My intention for today",
    "date": "YYYY-MM-DD"
  }
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Outcome of the save operation |
| data.id | string | Unique identifier for the saved intention |
| data.text | string | The saved intention text |
| data.date | string | The date the intention was saved for |

#### Response Processing

**Valid Response / Complete Response:**

On a successful POST response the app navigates to the Intention Saved Confirmation screen, passing the saved intention text for display.

**Error Response / Incomplete Response:**

On a failed POST the input and button are re-enabled, the typed text is preserved, and an inline error banner is shown above the Submit button.

## Error Handling

All errors render as an inline message within the screen, preserving the user's typed intention text.

### Client-Side Validation Errors

* **Intention text** — required. Triggered on submit attempt. Error copy: *"Please write your intention before submitting."*
* **Intention text** — maximum 140 characters. Triggered in real time as the user types. Error copy: *"Intention must be 140 characters or fewer."*

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 409 | Intention already saved for today | "You've already set today's intention." | Lock input; show saved text |
| 5xx | Backend unavailable | "Couldn't save right now. Please try again." | Re-enable input; preserve text |

### Edge Case Scenarios

* **Offline on submit**
    * When it happens: User submits with no network connection.
    * System behaviour: Intention is queued in local storage and synced when connectivity is restored; user is navigated to the confirmation screen immediately.

* **Today's intention already exists on load**
    * When it happens: User opens the app a second time on the same day.
    * System behaviour: Input is pre-filled with the saved text and set to read-only; Submit button is replaced with a "Saved" label.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| intentionText | string | "" | Text input onChange |
| charCount | number | 0 | Text input onChange |
| isSubmitting | boolean | false | Submit handler |
| serverError | string | null | API error response |
| previousIntention | string | null | GET /intentions/previous response |
| todayAlreadySaved | boolean | false | GET /intentions/today response |
