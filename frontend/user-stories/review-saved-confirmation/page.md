# Review Saved Confirmation


- **Wireframe id**: `review-saved`
- **Flow id**: `evening-review`


# User Story: Review Saved Confirmation

As a user who has just submitted an evening rating, I want to see a clear confirmation that my reflection was saved so that I can trust the app recorded my response and optionally browse my history.

## Route

`/evening-review/saved`

## Business Use Case

This screen closes the evening review loop by confirming to the user that their rating was persisted. It is a terminal step in the Evening Reflection flow and provides a single onward path to the calendar history view for users who want to browse past intentions.

## Goals

* Confirm to the user that their evening rating was successfully recorded.
* Offer a clear tap target to navigate to the calendar history view.
* Render without any additional API calls — confirmation state is passed from the previous screen.

## Page Interactions

The user reads the confirmation message and optionally taps to view their intention history.

### Initial Page Load

* On mount: no API call fires — the screen renders from state passed by the Evening Review screen.
* Prefilled from: navigation state (rating value and save timestamp from the previous screen).
* Empty / loading fallback: if no navigation state is present, the confirmation message renders with generic copy and the history link remains active.

### Form Field Interactions

* **View History button** — tap target. Navigates to the calendar history screen (`calendar-history` in the `history-browse` flow).

### Navigation Links

* Tapping "View History" → navigates to `calendar-history`.

## API Specification

This screen makes no service calls; all data is derived from navigation state passed by the Evening Review screen.

### Endpoint

No endpoint is called on this screen.

**Method:** N/A
**Trigger:** N/A

#### Request Object

```json
{}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|

**Validations:**

* No server-side validation runs on this screen.

**The System:**

* Screen renders immediately on navigation; no loading state is shown.

#### Response Object

```json
{}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|

#### Response Processing

**Valid Response / Complete Response:**

No API response is processed on this screen.

**Error Response / Incomplete Response:**

No API error can occur on this screen.

## Error Handling

No API errors can occur on this screen; no error states are surfaced.

### Client-Side Validation Errors

* No client-side validation runs on this screen.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| ratingValue | string \| null | null | Navigation state from Evening Review |
| savedAt | string \| null | null | Navigation state from Evening Review |
