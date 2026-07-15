# Intention Saved Confirmation


- **Wireframe id**: `intention-saved`
- **Flow id**: `morning-intention`


# User Story: Intention Saved Confirmation

As a user who has just set their morning intention, I want to see a clear confirmation that my intention was saved so that I can close the app and get on with my day.

## Route

`/intention-saved` — reached immediately after a successful intention submission.

## Business Use Case

This screen closes the morning loop by confirming the save and echoing the user's intention back to them. It also surfaces the calendar history as the natural next destination for users who want to review past intentions.

## Goals

* Confirm to the user that today's intention has been saved.
* Display the saved intention text for immediate reassurance.
* Provide a clear path to the calendar history view.

## Page Interactions

The user lands here after a successful save and can either close the app or navigate to their intention history.

### Initial Page Load

* On mount: no API call fires; the saved intention text is passed from the previous screen.
* Prefilled from navigation state: the intention text saved in the prior step.
* If no intention text is available in navigation state, the echo block shows a neutral placeholder.

### Form Field Interactions

* **View History button** — tap navigates to the calendar history screen.
* **Saved intention echo block** — read-only display of the intention text just saved.

### Navigation Links

* Tapping "View History" → `calendar-history` (Calendar History screen in the history-browse flow).

## API Specification

This screen makes no API calls; all data is passed via navigation state from the Morning Home screen.

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

* Renders immediately on arrival with no loading state.

#### Response Object

```json
{}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|

#### Response Processing

**Valid Response / Complete Response:**

No API response to process; the screen is fully static on arrival.

**Error Response / Incomplete Response:**

If navigation state is missing the intention text, the echo block renders a neutral placeholder without blocking the user.

## Error Handling

This screen has no API calls and no user input; errors are limited to missing navigation state.

### Client-Side Validation Errors

* No client-side validation runs on this screen.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| savedIntentionText | string | "" | Navigation state on mount |
