---
description: Handle an account deletion or data request within the 30-day commitment
argument-hint: "[sender email or search terms]"
---

# Privacy or deletion request

Load the `sands-correspondence` skill first. The privacy policy and `/delete-account` page
promise a response **within 30 days** for deletion, removal, copy, and correction requests.

1. Find the request on account `sands` (`search_emails` with `$ARGUMENTS`, or recent mail
   mentioning delete, remove, my data, or privacy). Read the thread.
2. Identify:
   - Type: full account deletion / remove specific item (which) / copy of data / correction
   - Sign-up address and sign-in method (email, Google, Apple), or what's missing
   - Whether the request came from the sign-up address. If not, the reply must ask them to
     confirm from it before anything is deleted.
   - Date received and the **deadline (received + 30 days)**
3. Draft the acknowledgement with `create_email_draft` (reply in-thread) using the skill's
   standard reply. Don't send it.
4. Offer to add an all-day `S&S Admin: privacy request due – <first name>` event on the `sands`
   calendar 5 days before the deadline. Use no description beyond the request type.
5. Offer to apply the `S&S/Privacy & Deletion` label.
6. Remind Ashley that the deletion itself happens in Supabase/the app, outside this plugin, and
   that the thread is done only when Ashley confirms it was carried out. A final "it's done" draft
   is ready on request.
