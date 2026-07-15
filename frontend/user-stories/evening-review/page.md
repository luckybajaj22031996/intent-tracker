# Evening Review


- **Wireframe id**: `evening-review-screen`
- **Flow id**: `evening-review`


# User Story: Evening Review

As a returning user, I want to see today's intention in the evening and mark whether I honoured it so that I can close the day with a moment of honest reflection.

## Route

`/evening-review`

## Business Use Case

After 5 PM the app automatically surfaces the evening review screen, presenting the intention the user set that morning. The user taps one of three options — Honoured, Partial, or Not today — to record their self-assessment. This single interaction is the core retention mechanism of the product.

## Goals

* Display today's intention text prominently on screen load.
* Present three clearly distinct rating options: Honoured, Partial, Not today.
* Record the selected rating with a single tap — no confirmation step.
* Navigate to the confirmation screen immediately after a rating is saved.
* Remain fully functional in offline / anonymous mode using local storage.

## Page Interactions

The user reads today's intention and taps one of three rating buttons to record their evening self-assessment.

### Initial Page Load

* On mount: the `get-todays-intention` call fires against the Intention Store to retrieve today's intention record.
* Prefilled from local storage (IndexedDB) when offline; synced from Supabase when online.
* Empty / loading fallback: a skeleton placeholder replaces the intention card while the record loads.
* If no intention was set today, a muted prompt reads "No intention set for today" and the rating buttons are disabled.

### Form Field Interactions

* **Honoured button** — tap target. Selecting it sets the rating value to `honoured` and triggers the save call immediately.
* **Partial button** — tap target. Selecting it sets the rating value to `partial` and triggers the save call immediately.
* **Not today button** — tap target. Selecting it sets the rating value to `not_today` and triggers the save call immediately.

### Submit Button Behavior

* On tap of any rating button: the button enters a brief loading state (spinner overlay) and the other two buttons become non-interactive.
* On success: navigates to the Review Saved Confirmation screen.
* On failure: all buttons restore to their default state and an inline error banner appears above the rating buttons.

### Navigation Links

* Tapping any rating button and receiving a successful save response → navigates to `review-saved`.

### Success State

* On successful save, the app transitions to the Review Saved Confirmation screen with no additional toast on this screen.

## API Specification

This screen calls the Intention Store service via `get-todays-intention` on load and `save-evening-rating` on rating selection.

### Endpoint

`GET /intentions/today` — retrieves today's intention record.
`POST /intentions/today/rating` — persists the selected evening rating.

**Method:** GET (load) / POST (rating save)
**Trigger:** Page load fires GET; rating button tap fires POST.

#### Request Object

```json
{
  "rating": "honoured"
}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| rating | string | One of: `honoured`, `partial`, `not_today` | Yes | User tap |

**Validations:**

* `rating` must be one of the three accepted enum values.

**The System:**

* Tapped button shows a loading spinner; remaining buttons become non-interactive.
* Rating is written to IndexedDB immediately for offline resilience before the network call resolves.

#### Response Object

```json
{
  "status": "success",
  "data": {
    "intentionId": "value",
    "rating": "honoured",
    "savedAt": "value"
  }
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Outcome of the save operation |
| data.intentionId | string | Identifier of the intention record updated |
| data.rating | string | The rating value that was persisted |
| data.savedAt | string | ISO timestamp of when the rating was saved |

#### Response Processing

**Valid Response / Complete Response:**

On a successful POST response the app navigates immediately to the Review Saved Confirmation screen, passing no additional state.

**Error Response / Incomplete Response:**

On a non-2xx response the rating buttons are restored to their default interactive state and an inline error banner is shown above the buttons.

## Error Handling

All API errors render as an inline banner above the rating buttons, preserving the displayed intention text.

### Client-Side Validation Errors

* **Rating selection** — required before any network call fires. Triggered on tap. Error copy: *"Please select a rating to continue."* (This state cannot occur in normal use since tapping a button is the trigger, but guards against programmatic misuse.)

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| 404 | No intention found for today | "No intention found for today. Set one tomorrow morning." | Rating buttons disabled |
| 5xx | Backend unavailable | "Something went wrong. Please try again." | Restore buttons; rating saved locally |

### Edge Case Scenarios

* **No intention set today**
    * When it happens: `get-todays-intention` returns an empty record.
    * System behaviour: intention card shows "No intention set for today"; all three rating buttons are disabled.

* **Rating already saved**
    * When it happens: user navigates back to this screen after already submitting a rating.
    * System behaviour: the previously selected rating button is highlighted; buttons are non-interactive; a muted label reads "Already reviewed today".

* **Offline on save**
    * When it happens: network is unavailable when the user taps a rating button.
    * System behaviour: rating is written to IndexedDB; a muted banner reads "Saved locally — will sync when online"; navigation to the confirmation screen proceeds normally.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| todaysIntention | object \| null | null | `get-todays-intention` response |
| isLoading | boolean | true | API load / save lifecycle |
| selectedRating | string \| null | null | Rating button tap |
| isSaving | boolean | false | Rating save call lifecycle |
| saveError | string \| null | null | API error response |
