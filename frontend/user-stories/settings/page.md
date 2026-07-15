# Settings


- **Wireframe id**: `settings`
- **Flow id**: `settings-flow`


# User Story: Settings

As a DayDrop user, I want to toggle an optional morning reminder notification and manage my sign-in state so that I can personalise how the app fits into my daily routine.

## Route

`/settings`

## Business Use Case

The Settings screen gives users control over the two optional personalisation features in DayDrop: a morning push reminder and account sign-in for data sync. It is deliberately minimal — one toggle and two auth actions — so it never competes with the core intention-setting flow.

## Goals

* Display the current state of the morning reminder toggle.
* Allow the user to enable or disable the morning reminder.
* Request push notification permission only after the user explicitly enables the toggle.
* Allow the user to initiate sign-in to link their anonymous data to an account.
* Allow the user to sign out of an active session.

## Page Interactions

The user reviews two settings sections — Notifications and Account — and taps controls to change state.

### Initial Page Load

* On mount: no API call fires; toggle state and auth status are read from local storage / session.
* Prefilled from session: current reminder toggle state (on / off) and sign-in status (anonymous or signed in).
* Empty / unauthenticated fallback: toggle defaults to off; account section shows "Signed in anonymously" with a Sign In button.

### Form Field Interactions

* **Morning Reminder toggle** — boolean switch. On enable: browser Push Permission prompt is shown before the toggle visually activates. On deny: toggle reverts to off and a muted helper text explains permission was not granted. On disable: push subscription is cancelled silently.
* **Sign In button** — visible when the user is anonymous. Tap initiates the magic-link auth flow.
* **Sign Out button** — visible when the user has an active session. Tap ends the session and returns the account section to anonymous state.

### Submit Button Behavior

* **Morning Reminder toggle enabled path:**
    * Browser permission prompt is shown.
    * If granted: toggle activates, reminder preference is saved to local storage.
    * If denied: toggle reverts to off; helper text reads "Notification permission was not granted."
* **Sign In tapped:**
    * User is directed to the magic-link auth flow.
* **Sign Out tapped:**
    * Session is cleared; account section reverts to anonymous state.
    * Confirmation is not required — action is immediate.

### Success State

* Reminder enabled: toggle shows active (filled) state; helper text reads "You'll be reminded each morning."
* Sign out: account section reverts to anonymous state with Sign In button visible.

## API Specification

No remote API calls are made from this screen. All state is managed locally (local storage / IndexedDB) and via the browser Push API.

### Endpoint

No remote endpoint. Push subscription is registered via the browser Push API after permission is granted.

**Method:** N/A
**Trigger:** User enables the Morning Reminder toggle.

#### Request Object

```json
{}
```

**Field Description:**

| Object Field | Data Type | Description | Mandatory | Source |
|---|---|---|---|---|
| — | — | No request payload; permission is requested via the browser Push API | — | — |

**Validations:**

* Push permission must be granted by the browser before the subscription is created.

**The System:**

* Toggle remains in a transitional (loading) state while the permission prompt is pending.
* Toggle activates only after permission is confirmed.
* Toggle reverts to off if permission is denied.

#### Response Object

```json
{
  "status": "granted" | "denied" | "default"
}
```

**Field Description:**

| Object Field | Data Type | Description |
|---|---|---|
| status | string | Browser permission result returned by the Push API |

#### Response Processing

**Valid Response / Complete Response:**

When the browser returns `"granted"`, the toggle activates and the reminder preference is persisted to local storage.

**Error Response / Incomplete Response:**

When the browser returns `"denied"` or the user dismisses the prompt, the toggle reverts to off.

## Error Handling

All errors on this screen are surfaced as inline helper text beneath the affected control, preserving the rest of the screen's state.

### Client-Side Validation Errors

* **Morning Reminder toggle** — no form validation. If push permission is denied by the browser, helper text reads: *"Notification permission was not granted. Enable it in your browser settings."*
* **Sign In / Sign Out** — no client-side validation. Auth errors are handled by the downstream auth flow.

### API Error Responses

| Status | Scenario | User-facing message | Recovery |
|---|---|---|---|
| Push API denied | User blocks notification permission | "Notification permission was not granted. Enable it in your browser settings." | Toggle reverts to off; helper text persists |

### Edge Case Scenarios

* **Permission previously denied at OS level**
    * When it happens: User enables toggle but OS has already blocked notifications for the browser.
    * System behaviour: Browser returns `"denied"` immediately; toggle reverts to off; helper text instructs the user to update browser / OS settings.
* **Anonymous user taps Sign Out**
    * When it happens: User is already in anonymous mode and taps Sign Out.
    * System behaviour: No action taken; Sign Out button is not rendered in anonymous state.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| reminderEnabled | boolean | false | Morning Reminder toggle |
| permissionStatus | string | null | Browser Push API response |
| isSignedIn | boolean | false | Session / local storage on mount |
| permissionError | string | null | Push API denial handler |
