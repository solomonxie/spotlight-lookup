# TestFlight external testing

App Store Connect → TestFlight → External Testing → **+** group → add the build. First build of a version goes through Beta App Review (~1 day).

## Test Information

Beta App Description (≤4000):

```
Lookup puts your dictionaries and flashcards into iOS Spotlight. Pull down on the Home Screen, type a word, and the definition or translation appears in the results; tap it to open the entry in the app.

No account, no network. First launch seeds a sample English↔Chinese dictionary and 12 flashcards, so Spotlight works right away. For a larger sample set: Settings → Demo mode (separate store; nothing is indexed into or removed from Spotlight while it's on).

What's in this beta:
• Spotlight indexing with per-collection switch, language tags and an entries cap
• Import dictionaries from JSON, CSV, TSV and CC-CEDICT
• Flashcards in the Cards tab
• Forgiving in-app search: exact, prefix, full-text, substring, typo tolerance; accents and tone marks optional (xiexie finds 谢谢)
```

Feedback Email: `you@example.com`

## Contact Information

| Field | Value |
|---|---|
| First Name | TODO |
| Last Name | TODO |
| Phone number | TODO — yours, with country code (`+1 …`) |
| Email | `you@example.com` |

## Sign-In Information

Sign-in required: **off** (no account in the app). Leave User Name / Password blank.

Review Notes: paste the App Review Notes block from [listing.md](listing.md) if present.

## Per build: What to Test

```
After first launch wait a minute, then pull down on the Home Screen and type a seeded word such as "apple" or "xiexie"; tap the result and confirm it opens the entry. Turn a collection's Spotlight switch off and check its words disappear. Add a flashcard in Cards and find it from Spotlight. Import a small CSV. Report anything that didn't appear in Spotlight, with your iOS version, via TestFlight.
```
