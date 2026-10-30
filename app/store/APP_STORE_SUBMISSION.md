# Submitting Salt & Sovereignty 1.1.0 to the App Store

Everything left to do, in order. The text to paste (subtitle, description,
keywords, What's New) is in `app-store-listing.md`. Checked against the app
as it is on October 26, 2026.

---

## 0. The one big decision: make build 14 first

Build 13 (1.1.0, made on October 23 from commit `49398da`) has an old copy of
the app inside it. It has **no Coven tab and no Practice tab**: covens, coven
chat, divination spreads, the Seasonal drawer and everything since October 23
reach it only as an over-the-air update, which a fresh install downloads in the
background and shows only after a restart ("A new version is ready · Restart").
An App Reviewer who doesn't restart would see an app without most of what the
description promises, and without the coven chat whose Report and Block
buttons Apple checks for. That is the most likely reason for a rejection.

A new build from today's code fixes that, and also brings in the iPhone
settings fixed on this branch (clearer permission wording, and the disk-space
line Apple's privacy manifest asks for). It is still version 1.1.0, so every
over-the-air update keeps reaching it and build 13 alike.

1. Merge the `app-store-audit` branch into `main`, and let the website deploy
   (it carries the updated Privacy Policy and Delete your account page).
2. In the database, apply the SQL in `ugc-block.sql` (see section 9) and
   check that the `delete-account` and `coven-notify` Edge Functions deployed
   are the current ones from `supabase/functions/`.
3. In `app/`: `npx eas-cli@latest build --platform ios --profile production`
   (EAS numbers it 14 by itself).
4. When it finishes: `npx eas-cli@latest submit --platform ios --latest`.
   It appears in App Store Connect → TestFlight after Apple processes it
   (about 15–30 minutes). Install it from TestFlight once and open Covens,
   a chat, and Divination to be sure.

If you decide to send build 13 anyway: publish an over-the-air update to the
`production` channel first, and keep the restart sentence in the review notes
(section 6).

---

## 1. App Store Connect → Apps → Salt & Sovereignty → App Information

| Field | Enter |
|---|---|
| Name | `Salt & Sovereignty` |
| Subtitle | `Altar, grimoire & moon rituals` |
| Category | Primary **Lifestyle**, secondary **Reference** (or none) |
| Content Rights | **Yes**, it contains third-party content, and you have the rights |
| Age Rating | the questionnaire in section 4 |
| Privacy Policy URL (App Privacy page) | `https://saltandsovereignty.com/privacy.html` |

## 2. Pricing and Availability

- Price: **USD 4.99** (tier of your choice in Price Schedule). No in-app purchases.
- Availability: all countries you want. Paid apps need the **Paid Apps Agreement**
  signed, with banking and tax forms complete (Business → Agreements). Check that
  it says Active; without it the app can't go on sale.
- iPad: the app runs on iPad (it's built for iPhone and iPad), so leave
  "Make this app available on Apple Vision Pro / Mac" as you prefer; both are optional.

## 3. The 1.1.0 version page (left sidebar → iOS App → 1.1.0)

If the page still says 1.0 (1.0 was never released), change its version number
to **1.1.0**. If 1.0 is live, press **+** beside iOS App and add **1.1.0**.

| Field | Enter |
|---|---|
| Promotional Text | from `app-store-listing.md` |
| Description | from `app-store-listing.md` |
| Keywords | `witchcraft,witch,tarot,coven,pagan,wicca,spell,book of shadows,sabbat,herb,crystal,sigil,dream,lunar` |
| Support URL | `https://saltandsovereignty.com/#contact` |
| Marketing URL | `https://saltandsovereignty.com/` |
| What's New | from `app-store-listing.md` (the box only appears when updating a released app) |
| Build | **14** (or 13, see section 0). Export compliance won't be asked: the app declares it uses no non-exempt encryption. |
| Copyright | `2026 Ashley P.` |
| Sign-In Information | the demo account from section 6 |
| Notes | the review note from section 6 |
| Contact | your name, `ashley.p@saltandsovereignty.com`, a phone number Apple can reach |
| Version Release | "Manually release" if you want to choose the day; otherwise automatic |

Screenshots: section 7.

---

## 4. Age rating questionnaire (the 2025 form)

| Question | Answer | Why |
|---|---|---|
| Parental Controls | No | |
| Age Assurance | No | Covens ask people to confirm they're 18 or over; that's self-declared, not age assurance |
| Unrestricted Web Access | No | Links open specific pages (our website, sources) in an in-app browser; there's no address bar to go anywhere |
| User-Generated Content | **Yes** | Community Grimoire offerings, coven pages, chat |
| Messaging and Chat | **Yes** | Coven chat and one-to-one and group conversations |
| Advertising | No | |
| Profanity or Crude Humor | None | |
| Horror/Fear Themes | **Infrequent/Mild** | Graveyard dirt, Samhain and ancestor work, a few darker tarot cards |
| Alcohol, Tobacco, or Drug Use or References | **Infrequent/Mild** | Wine and mead offerings; the Living Library names poisonous and mind-altering plants (always with warnings) |
| Mature or Suggestive Themes | **Infrequent/Mild** | Love workings, some deity lore |
| Sexual Content or Nudity | **Infrequent/Mild** | The Rider–Waite–Smith tarot has unclothed figures in a few cards (The Lovers, The Star, The Sun, The World, The Devil); the coming Marseille, Sola Busca and oracle decks too. Non-sexual, artistic. |
| Graphic Sexual Content and Nudity | None | |
| Cartoon or Fantasy Violence | **Infrequent/Mild** | Tarot imagery (Ten of Swords, Tower) |
| Realistic Violence | None | |
| Prolonged Graphic or Sadistic Realistic Violence | None | |
| Guns or Other Weapons | None | Ritual knives are tools, not weapons in use |
| Medical or Treatment Information | **Infrequent/Mild** | Traditional herbal uses, always with warnings and "not medical advice"; support lines |
| Health or Wellness Topics | **Yes** | Self-care rituals, grief and ancestor work, crisis support lines |
| Gambling / Simulated Gambling / Contests / Loot Boxes | None / None / None / No | Tarot draws are not gambling |

**Expected result: 13+.** The nudity, medical and alcohol answers each put it at
13+; nothing reaches 16+. Covens are adults-only by your own rule; if you'd like
the store to say so too, you may choose a higher rating (18+) on the summary
screen, but it isn't required and would hide the app from younger teens
who use everything else.

---

## 5. App Privacy (the "nutrition label")

App Store Connect → App Privacy → Get Started / Edit.

- **Do you or your third-party partners collect data from this app?** Yes.
- **Tracking:** answer **No** for every data type. There are no ads, no
  analytics SDK, no crash reporter, and nothing is shared with data brokers.

Select these data types, then for each answer: **Linked to the user's identity:
Yes** (except where it says No), **Used for tracking: No**, purposes as listed.

| Category → Data type | Linked | Purposes | What it is |
|---|---|---|---|
| Contact Info → **Email Address** | Yes | App Functionality | Your account sign-in |
| Contact Info → **Name** | Yes | App Functionality | Preferred or magical name, coven name, the name Apple may share |
| User Content → **Emails or Text Messages** | Yes | App Functionality | Coven chat and one-to-one and group conversations |
| User Content → **Photos or Videos** | Yes | App Functionality | Pictures you choose for your own altar items, apothecary workings and oracle cards (signed in) |
| User Content → **Customer Support** | Yes | App Functionality, Customer Support | Reports sent to the moderators, emails to you |
| User Content → **Other User Content** | Yes | App Functionality | Altars, grimoire, rituals, journal, readings, dreams, sigils, birth chart, coven altars, petitions, community offerings |
| Sensitive Info → **Sensitive Info** | Yes | App Functionality | Your path, traditions and deities reveal religious or spiritual belief. Apple lists "religious or philosophical beliefs" as sensitive, so declare it. |
| Identifiers → **User ID** | Yes | App Functionality | Your account id |
| Identifiers → **Device ID** | Yes | App Functionality | The phone's push token, kept with your account so coven messages can reach you |
| Location → **Coarse Location** | **No** | App Functionality | Only for the weather: rounded coordinates go to Open-Meteo, without anything about you. Your location itself stays on the phone. |

**Not collected** (leave unticked): Precise Location, Contacts, Health & Fitness,
Financial Info, Browsing History, Search History, Usage Data, Diagnostics,
Purchases, Audio, Gameplay, Other Data. The calendar is written on the phone
only; reminders are scheduled on the phone; photos are read only when you
pick one; tilt and sounds never leave the phone.

Two judgement calls, explained so you can decide:
- *Coarse Location.* Apple counts data as collected when it leaves the device
  and someone can keep it longer than it takes to answer. Open-Meteo answers
  and may log requests, so declaring it (not linked) is the careful answer. If
  you'd rather not, the alternative is "not collected"; it is only ever sent
  to fetch a forecast.
- *Expo update checks.* The app asks Expo's update server for new versions,
  which sends the app version, platform and a random install id, not linked to
  you. Expo uses these only to serve updates and count installs for you in
  aggregate. Most Expo apps don't declare this; if you want to be maximally
  careful, add Identifiers → Device ID as *not linked*, App Functionality.

**Cycle & Moon (menstrual cycle notes).** Its notes are end-to-end encrypted
(only ciphertext reaches Supabase; we hold no key), and the "in moon time"
status a person may choose to show their covens is stored as written. Careful
answer: add **Health & Fitness → Health**, Linked: Yes, Tracking: No, App
Functionality only, and say in review notes that cycle notes are encrypted on
the device and never used for ads, analytics or anything else. (Apple lets
end-to-end encrypted data go undeclared in some cases, but the plaintext
status is health-adjacent, so declaring it is the safer choice.) Nothing from
it goes to HealthKit, advertising or analytics; reminders are local and
discreet by default.

The Privacy Policy on this branch now covers coven conversations, push tokens,
photos for oracle decks, the weather service and what deletion keeps; deploy
the website before you submit.

---

## 6. Sign-in information and review notes

The coven parts need an account, a coven profile (18+ confirmation) and a coven
with someone else in it, so make Apple a demo world before submitting:

1. Make two email accounts on the app, e.g. `appreview@saltandsovereignty.com`
   (give this one to Apple) and `appreview2@saltandsovereignty.com` (a second
   member). Use real inboxes you can confirm.
2. Sign in as the first, open Covens, make the coven profile, and **found a
   coven** called "Review Circle" (open to join).
3. Sign in as the second, make a profile, join "Review Circle", and post two or
   three messages in its chat. Start a one-to-one conversation with the first
   account and write a line there too.
4. As the first account, light a candle on the coven altar, so it isn't empty.
5. Don't make the reviewer account a site moderator.

**Sign-in required:** Yes. User name: `appreview@saltandsovereignty.com`,
password: (the one you set).

**Notes** (paste, then fill in the blanks):

> Thank you for reviewing Salt & Sovereignty.
>
> Most of the app works without an account: on the Welcome screen tap "Continue as a guest". Signing in (Sign in with Apple, Google or email) syncs your practice with saltandsovereignty.com and opens Covens.
>
> To see covens and chat, sign in with the demo account above. Open the Coven tab, then "Review Circle". Tap Messages (the envelope button) to see the coven's chat and a one-to-one conversation with another demo member.
>
> Reporting and blocking (Guideline 1.2): press and hold any message from someone else for Report and Block. In a conversation, the ⓘ button lists everyone in it, each with Report and Block. A coven's Members page has Report and Block for each person too. Blocking hides that person's messages everywhere, stops their notifications, closes your one-to-one chat with them, and stops either of you starting a new conversation. Reports go to the Salt & Sovereignty moderators (not the coven's leaders), who review them in the app's moderation screen and can remove messages and ban people from the community. Everyone agrees to the community guidelines before joining covens (https://saltandsovereignty.com/covens/guidelines/), and covens are for adults. Community Grimoire offerings are reviewed before publishing, and every published one has Report, Hide and Hide this person. Contact: More → Contact us (ashley.p@saltandsovereignty.com).
>
> Account deletion (Guideline 5.1.1(v)): More → Account → Delete account. It deletes the account and its data, including coven memberships and messages.
>
> Location, calendar and photos are only asked for when you use the feature that needs them (Today's sky and weather, adding a ritual to your calendar, adding your own picture).
>
> If the app shows "A new version is ready · Restart" at the top, please tap it: the app updates its content over the air.

(The last line matters only if you send build 13.)

---

## 7. Screenshots

Upload in App Store Connect → 1.1.0 → Previews and Screenshots. Portrait.
Take them on a simulator or phone with the app signed in and well used, so
nothing is empty. Status bar: full battery, no carrier clutter.

**iPhone 6.9" display** (1320 × 2868; required, up to 10; smaller iPhones scale from these):

1. **Altar**: a full altar at night, candles burning, herbs, crystals, a deity and an offering. Caption idea: "A living altar, lit by real candlelight".
2. **Today**: tonight's moon, today's holy days, planetary hour and the weather.
3. **Divination**: a Celtic Cross or three-card spread laid out (choose cards without nudity for the store picture, e.g. not The Lovers or The Star).
4. **Coven**: a coven's home with its shared altar.
5. **Coven chat**: a friendly conversation in bubbles (demo accounts, kind words, no real names).
6. **Grimoire**: a Book of Shadows page, or a sigil being made.
7. **Rituals**: a planned ritual's steps, or the premade book.
8. **Seasonal drawer**: the altar cabinet open on festivals of several traditions.
9. **Widgets**: the home screen with the Altar and Moon widgets (optional).
10. **Practice / journeys**: a dedication journey or the practice tools (optional).

**iPad 13" display** (2064 × 2752; required, because the app runs on iPad):
the same first five or six shots, taken on the iPad simulator (iPad Pro 13-inch).
At least one is required; three to five look complete.

No App Preview video is needed.

---

## 8. Before pressing Submit for Review

- [ ] Website deployed (Privacy Policy dated October 26, 2026; Delete your account lists covens).
- [ ] `ugc-block.sql` applied (section 9).
- [ ] Demo accounts and "Review Circle" ready, password in Sign-In Information.
- [ ] Build 14 attached (or build 13 plus a production OTA update).
- [ ] App Privacy published, Age Rating done, price set, Paid Apps Agreement active.
- [ ] Screenshots for iPhone 6.9" and iPad 13".
- [ ] Someone checks the moderation screen (Coven → Coven moderation) and the
      support inbox daily while the app is in review and after launch. Apple
      expects reports to be acted on promptly, and reviewers sometimes send a test one.

## 9. Things only you can do outside App Store Connect

- **Database change for blocking (needs your approval):** `ugc-block.sql`
  (handed over with this checklist) stops a blocked person writing into an
  existing one-to-one chat with the person who blocked them. Today their
  messages there are already hidden and don't notify; this closes the gap
  completely. Run it in the Supabase SQL editor (it changes no data).
- **Edge Functions:** make sure the deployed `delete-account` is the current one
  (it removes coven messages, conversations, push tokens and the rest; an older
  copy would fail on the newer tables), and that `coven-notify` is deployed.
- **What deletion keeps, by design:** published Community Grimoire pages
  (anonymized), covens the person founded (left without a founder), pages they
  published in a coven's book (without their name), and moderation reports
  (without their account). The Privacy Policy and Delete your account page now say so.
