# Day Detail


- **Wireframe id**: `day-detail`
- **Flow id**: `history-browse`


# User Story: Day Detail

As a returning user, I want to view the intention I set on a specific past day along with my evening rating so that I can reflect on how that day went.

## Route

`/history/:date`

## Business Use Case

The Day Detail screen surfaces the full record for a single past day: the morning intention text and, if the user completed an evening review, the rating they gave themselves. It is a read-only view reached by tapping a dot-marked day on the Calendar History screen.

## Goals

* Display the selected day's date as a clear heading.
* Show the full intention text the user wrote that morning.
* Show the evening rating if one was recorded.
* Indicate clearly when no evening review was completed.
* Provide a back affordance to return to the calendar.

## Page Interactions

The user reads a single past day's intention and evening rating, then taps back to return to the calendar.

### Initial Page Load

* On mount: no API call fires; the intention record for the selected date is passed from the Calendar History screen via navigation context.
* Prefilled from route param: the `date` segment of the route identifies which record to display.
* Empty / missing fallback: if no record is found for the date, a muted message reads "No intention recorded for this day."

### Form Field Interactions

* **Back button (‹ Back / ← Back to Calendar)** — tap control. Returns the user to the Calendar History screen without modifying any data.
* **Evening rating display** — read-only. Renders the stored rating value (Honoured / Partial / Not today) as a highlighted badge. If no rating exists, a muted helper text is shown instead.

### Navigation Links

* Tapping the back button → returns to `calendar-history`.

## API Specification

This screen makes no service calls; the intention record is passed from the Calendar History screen via in-memory navigation context.

### Endpoint

`GET /intentions/:date`

**Method:** GET
**Trigger:** Page load — only if the record was not passed via navigation context (e.g. deep-link access).

#### Request Object

```json
{
  "date": "2026-07-14"
}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| date | string | ISO 8601 date string identifying the day to retrieve. | Yes | Route param |

**Validations:**

* `date` must be a valid ISO 8601 date string.
* `date` must not be in the future.

**The System:**

* A brief loading state is shown if the record must be fetched (deep-link scenario).

#### Response Object

```json
{
  "status": "success",
  "data": {
    "date": "2026-07-14",
    "intentionText": "Value",
    "eveningRating": "Value"
  }
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Outcome of the fetch. |
| data.date | string | The date of the record. |
| data.intentionText | string | The morning intention the user wrote. |
| data.eveningRating | string \| null | The evening rating (Honoured / Partial / Not today), or null if not completed. |

#### Response Processing

**Valid Response / Complete Response:**

The intention text is rendered in the Morning Intention card. The evening rating, if present, is highlighted as a badge; if absent, a muted helper text is shown.

**Error Response / Incomplete Response:**

An inline error message replaces the content area: "Couldn't load this day. Please go back and try again."

## Error Handling

Errors render as an inline message within the content area, with the back button remaining accessible.

### Client-Side Validation Errors

* No client-side validation runs on this screen.

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 404 | No record found for the date | "No intention recorded for this day." | Back button remains active. |
| 5xx | Store unavailable | "Couldn't load this day. Please go back and try again." | Back button remains active. |

### Edge Case Scenarios

* **No evening rating recorded**
    * When it happens: The user set a morning intention but did not complete the evening review.
    * System behaviour: The Evening Review section renders with a muted helper text: "No evening review recorded."
* **Deep-link access**
    * When it happens: User navigates directly to `/history/:date` without coming from the calendar.
    * System behaviour: The screen fires a fetch for the specific date record on mount.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| intentionRecord | object \| null | Passed via navigation context or null | On-mount fetch (deep-link) |
| isLoading | boolean | false | On-mount fetch start / completion |
| fetchError | string | null | API error response |
