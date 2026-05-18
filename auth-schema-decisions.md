# Auth Schema — Design Decisions

This doc explains why each table exists and why we made certain choices.

---

## Tables and why we kept them

### `users`

This is the main table. It only stores who the user is — name, email, role. Things like bio or social links will go in a separate table later when needed.

**Why soft delete (`deleted_at`) instead of actually deleting the row?**
If we delete a user row, all their forms and responses break because they point back to that user. So instead we just set `deleted_at` to mark them as deleted. The data stays safe. Also if someone deletes their account and wants to sign up again with the same email later, they can — because we only block duplicate emails where `deleted_at` is null.

**Why both `is_email_verified` and `email_verified_at`?**
`is_email_verified` is a simple true/false, easy to check in code. `email_verified_at` tells you the exact time they verified. Both are useful and storing both costs almost nothing.

---

### `credentials`

This table holds the password. It is separate from `users` on purpose.

**Why not just put `password_hash` on the `users` table?**
Users who sign in with Google or GitHub don't have a password. If we put `password_hash` on `users`, those users would have an empty password column sitting there for no reason. Keeping it separate means OAuth users simply have no row in this table at all. Clean and simple.

**Why are `failed_attempts` and `locked_until` here?**
These only matter for password login. An OAuth user can never have failed password attempts, so putting these on the main `users` table would make no sense.

**Why `last_password_change`?**
Two reasons. First, you can remind users who haven't changed their password in a long time. Second, if someone's account gets hacked and the attacker changed the password, this field tells you exactly when that happened.

---

### `oauth_accounts`

This table stores the connection between a user and their Google or GitHub account.

**Why encrypt the tokens?**
The access token and refresh token from Google or GitHub can be used to act as the user on that platform. If someone reads our database, we don't want them to get those tokens. So we encrypt them before saving.

**Why the unique rule on `(provider, provider_account_id)`?**
This stops the same Google account from being linked to two different users. Without it, a bug could accidentally create that situation.

---

### `sessions`

A session is created every time someone logs in. It represents one active login on one device.

**Why store `token_hash` instead of the actual token?**
The token is what we send to the user's browser. If someone reads our database, we don't want them to get working tokens. So we only store a hash of it. The hash is useless without the original token.

**Why store `user_agent` and `metadata`?**
This is what powers the "active sessions" page where users can see all their logged-in devices and log out of specific ones. If we don't store this, all sessions look the same — just a list of IDs. The user can't tell which one is their phone and which is their laptop. `metadata` stores things like browser name, OS, and device type so we can show something readable.

**Why store `ip_address`?**
We don't use IP to make auth decisions — IPs change too often to be reliable. But we show it on the sessions page so users can spot a login from a strange location. It is also useful for spotting abuse.

**Why `last_active_at`?**
So we can show "active 2 hours ago" next to each session. Also useful for automatically expiring sessions that haven't been used in a while.

---

### `refresh_tokens`

**Why is this a separate table from `sessions`?**
A session is the device. A refresh token is a short-lived key used to get a new access token. Refresh tokens rotate — every time you use one, it gets replaced with a new one. If we stored this on the sessions table, we'd be constantly updating that row and we'd lose the history of rotations.

**Why `revoke_reason`?**
When we revoke a token we want to know why: was it a normal logout, a routine rotation, or something suspicious? The suspicious case is the important one. If someone uses a refresh token that was already rotated out, it means an attacker got hold of an old token. Knowing this lets us immediately lock down the account.

**Why does deleting a session also delete its refresh tokens?**
Because a refresh token with no session is useless and dangerous. If a session is gone, any tokens tied to it should go too.

---

### `email_verification_tokens`

This one table handles two things: verifying a new account's email, and confirming an email address change.

**Why handle both in one table?**
Both flows work the same way — generate a token, send a link, check the token when clicked. The `type` column tells us which flow it belongs to. One table is simpler than two near-identical tables.

**Why `new_email`?**
When someone wants to change their email, we need to store what the new email is while we wait for them to confirm it. This column holds that. It is only used for the email change flow.

**Why `is_used` and `used_at`?**
Tokens should only work once. As soon as someone clicks the link, `is_used` is set to true. Any attempt to use the same link again is rejected. `used_at` records when it was used, which helps with support issues.

---

### `password_reset_tokens`

**Why is this separate from `email_verification_tokens`?**
A password reset link lets someone take over an account. An email verification link just confirms an email address. These are very different in terms of risk. Password reset tokens should expire in 15 minutes. Verify tokens can last 24 hours. Keeping them separate makes sure a verify token can never accidentally be used as a password reset, even if there is a bug in the code.

**Why store `ip_address` here?**
If the same IP is requesting password resets for many different accounts, that is a sign of an attack. Storing the IP makes it easy to detect and block that.

---

## What we removed and why

### `audit_logs` — removed

**What it was:** A table that recorded every auth event — every login, logout, password change, failed attempt — with the IP address, device info, and what happened.

**Why we had it in the first place:** It is useful for debugging ("a user says they didn't change their password — let's check"), for investigating security incidents, and for compliance requirements that some big companies ask for.

**Why we removed it:** For this project right now, it is more complexity than it is worth. Every single login and token rotation would write a row to this table. It would grow fast and need cleanup jobs to manage. All that work for data we are not actively using yet.

**What we already have instead:** The other tables give us enough information for now. `sessions` shows when and where someone logged in. `credentials.failed_attempts` tracks bad password attempts. `password_reset_tokens.used_at` shows when a reset happened. `refresh_tokens.revoke_reason` shows why a token was killed. That covers the basics.

**When to bring it back:** Once you have business users or need to answer detailed security questions, add it back. Removing it now is about keeping things simple early on, not about it being a bad idea.

---

## General patterns we used everywhere

**UUIDs as primary keys, not 1, 2, 3 integers.**
Auto-increment IDs leak information. If a form has `id=4`, anyone can guess there are only 4 forms. UUIDs are random so they reveal nothing. They are also safe to put in URLs and API responses.

**Timezone on all timestamps.**
Without timezone info, timestamps behave differently depending on where your server is. Always storing with timezone keeps everything consistent no matter where the app runs.

**Two types per table: one for reading, one for writing.**
`$inferSelect` is the type you get back when you query a row. `$inferInsert` is what you pass when creating one. They are different — for example `id` is optional on insert because the database generates it, but always present when you read. Using both catches a whole category of bugs at compile time.

**Indexes on every foreign key and every filtered column.**
Without an index, looking up "all sessions for this user" means scanning every single session row. With an index it is instant. We added indexes on every column that appears in a WHERE or a JOIN.