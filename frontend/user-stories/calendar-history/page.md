# Calendar History


- **Wireframe id**: `calendar-history`
- **Flow id**: `history-browse`


# User Story: Calendar History

As a returning user, I want to browse a monthly calendar showing which days I set an intention so that I can quickly navigate to any past day and review what I wrote.

## Route

`/history`

## Business Use Case

The Calendar History screen gives users a bird's-eye view of their intention practice over time. Each day that has a recorded intention is marked with a dot, letting users see patterns at a glance. Tapping any marked day opens the full detail for that day.

## Goals

* Display the current month in a 7-column calendar grid.
* Show a dot indicator on every day that has a recorded intention.
* Allow the user to navigate to the previous or next month.
* Allow the user to tap any day to open its detail view.

## Page Interactions

The user browses a monthly calendar grid and taps a day cell to open its detail.

### Initial Page Load

* On mount: the `list-intentions` service call fires to retrieve all stored intention records.
* Prefilled from nothing: the calendar defaults to the current calendar month.
* Loading fallback: calendar grid renders with empty day cells and no dots until data resolves.
* Empty state: if no intentions exist, the grid renders with no dots and a muted helper text below the grid.

### Form Field Interactions

* **Previous month button (‹)** — tap control. Decrements the displayed month by one. Re-filters the already-loaded intention records to the new month; no additional API call.
* **Next month button (›)** — tap control. Increments the displayed month by one. Disabled when the displayed month is the current month (cannot navigate into the future).
* **Day cell** — tap target. Tapping a day cell that has a dot indicator navigates to the Day Detail screen, passing the selected date. Tapping a day cell with no dot has no effect.

### Navigation Links

* Tapping a day cell with a dot → opens `day-detail`, passing the selected date as context.

## API Specification

This screen calls the Intention Store service (`intention-store-service`) via `list-intentions` to retrieve all intention records and derive which calendar days should display a dot.

### Endpoint

`GET /intentions`

**Method:** GET
**Trigger:** Page load (on mount).

#### Request Object

```json
{}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| — | — | No request body; all records are fetched for the authenticated or anonymous local session. | — | — |

**Validations:**

* Records are scoped to the current device's local store (anonymous mode) or the authenticated user's account (synced mode).

**The System:**

* A subtle loading indicator appears on the calendar grid while the fetch is in progress.
* Day cells render without dots until the response resolves.

#### Response Object

```json
{
  "status": "success",
  "data": [
    {
      "date": "2026-07-02",
      "intentionText": "Value",
      "eveningRating": "Value"
    }
  ]
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Outcome of the fetch. |
| data | array | List of intention records, each with a date, intention text, and optional evening rating. |

#### Response Processing

**Valid Response / Complete Response:**

The UI extracts the `date` field from each record and renders a dot on the corresponding calendar cell. The full record is held in memory so it can be passed to the Day Detail screen without a second fetch.

**Error Response / Incomplete Response:**

The calendar grid renders without dots and an inline error banner appears above the grid.

## Error Handling

All data errors render as an inline banner above the calendar grid, preserving the current month view.

### Client-Side Validation Errors

* No client-side validation runs on this screen.

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 5xx | Local store or sync service unavailable | "Couldn't load your history. Please try again." | Retry button shown in the banner; calendar renders empty. |

### Edge Case Scenarios

* **No intentions recorded yet**
    * When it happens: The user opens History for the first time before setting any intention.
    * System behaviour: Calendar renders with no dots; muted helper text reads "No intentions recorded yet."
* **Future month navigation**
    * When it happens: User attempts to tap the next-month button while viewing the current month.
    * System behaviour: The next-month button is visually disabled and does not respond to taps.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| displayedMonth | Date | Current month | Previous / next month buttons |
| intentionRecords | array | [] | list-intentions response |
| isLoading | boolean | true | On mount / response received |
| fetchError | string | null | API error response |
