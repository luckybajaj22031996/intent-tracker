# Magic Link Sent


- **Wireframe id**: `magic-link-sent`
- **Flow id**: `auth-flow`


# User Story: Magic Link Sent

As a user who has submitted their email address, I want to see a clear confirmation that a magic link has been sent so that I know to check my inbox to complete sign-in.

## Route

`/magic-link-sent`

## Business Use Case

After the magic link is dispatched, the user needs immediate reassurance that the action succeeded and clear guidance on what to do next. This screen provides that confirmation and sets expectations about link expiry, reducing support requests from users who are unsure whether the email was sent.

## Goals

* Confirm to the user that a magic link email has been sent.
* Instruct the user to check their inbox.
* Communicate that the link has a limited validity window.
* Offer guidance if the email is not received.

## Page Interactions

This is a read-only confirmation screen; the user reads the message and then switches to their email client to click the magic link.

### Initial Page Load

* On mount: no API call fires.
* Prefilled from nothing: the screen renders its static confirmation message.
* Empty / loading / unauthenticated fallback: the confirmation message is always shown; no auth check is performed on this screen.

### Form Field Interactions

* No interactive fields are present on this screen.

## API Specification

No API calls are made from this screen.

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

* No server-side validation applies to this screen.

**The System:**

* Renders the static confirmation card immediately on mount with no loading state.

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

No errors can occur on this read-only confirmation screen.

### Client-Side Validation Errors

* No client-side validation runs on this screen.

## UI State Management

| State Variable | Type | Initial Value | Updated By |
|---|---|---|---|
| (none) | — | — | — |
