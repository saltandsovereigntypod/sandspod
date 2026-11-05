---
description: Triage the Salt & Sovereignty inbox (privacy deadlines, coaching, podcast, community)
argument-hint: "[days back, default 3]"
---

# Triage the S&S inbox

Load the `sands-correspondence` skill first and follow it.

1. `search_emails` on account `sands` with `in:inbox newer_than:<N>d` (N = `$ARGUMENTS`, default 3), then
   `in:inbox is:unread` to catch older unread mail.
2. Read each thread as needed (`get_email_thread`) and sort it into the skill's categories.
3. Report, in this order:
   - **Needs care now:** anything suggesting crisis or risk of harm (quote nothing sensitive,
     just who and why).
   - **Privacy & Deletion:** each request with the date received and **days left of 30**.
   - **Coaching inquiries**
   - **Podcast**, **Community**, **App Support**, **Books**, **Support the Work**
   - **Can wait / no reply needed**
   One line each: sender, gist, suggested next step.
4. Offer to (a) apply the `S&S/…` labels and (b) create drafts for the replies Ashley picks.
   Don't label, draft, or send anything until Ashley says which.
