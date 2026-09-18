# Spotlight result

The product's main surface, and the only one Apple draws. We author three
strings; iOS decides everything else.

```
 ┌──────────────────────────────────────────┐
 │ ⌕ resilient                          ✕   │
 └──────────────────────────────────────────┘

 LOOKUP                                    ›
  ▣  resilient                                ← title
      /rɪˈzɪliənt/ · English → 中文 (starter)  ← subtitle
      adj. 有韧性的；能快速恢复的                ← body, 2 lines max
      A resilient system recovers without
      a restart.

  ▣  resilience
      /rɪˈzɪliəns/ · English → 中文 (starter)
      n. 韧性；恢复力
```

Reached from: pull down on the Home Screen · swipe right to Today view

## What we put in each field

| `CSSearchableItemAttributeSet` | Our data |
|---|---|
| `title`, `displayName` | `entry.term` |
| `contentDescription` line 1 | `reading · collection.name` |
| `contentDescription` line 2+ | `definition` then `example` |
| `keywords`, `alternateNames` | term, reading, collection, language, tags |
| `uniqueIdentifier` | `entry.id` — routes the tap back |
| `domainIdentifier` | `collection.id` — lets one switch drop a whole set |

`expirationDate = .distantFuture`. iOS otherwise evicts an untouched item
after about a month, which would quietly empty the index of rare words —
exactly the ones worth indexing.

## States

```
matched    ▣ resilient
            /rɪˈzɪliənt/ · English → 中文 (starter)
            adj. 有韧性的；能快速恢复的

no reading ▣ idempotent                        ← flashcards have no reading
            My Flashcards
            Running it twice changes nothing
            more than running it once.

long       ▣ 一期一会
            いちごいちえ · Japanese idioms
            One meeting, one chance — treat
            every encounter as unrepeatabl…    ← iOS truncates, we don't

not indexed                                    ← collection switched off,
           (no row at all)                       or entry still queued
```

## Flow

```
Spotlight row ──tap──▶ iOS delivers NSUserActivity
                          CSSearchableItemActionType
                              │
            cold start ───────┼─────── already running
                 │            │              │
        buffered in the       │       event to JS
        native registry       │              │
                 │            │              │
                 └──▶ router.push('/entry/<id>') ──▶ entry.md
```

## ✗ Rejected

```
✗  ▣  resilient
       Lookup
```
Title plus app name is what a generic Core Spotlight integration produces. It
forces a tap to learn anything, which is the entire behaviour this app exists
to avoid.

```
✗  ▣  resilient
       adj. 有韧性的；能快速恢复的 · A resilient system
       recovers without a restart. · English → 中文…
```
Everything on one line truncates the definition away on a narrow phone. The
reading and collection go first precisely because they are short and bounded.

## Notes

- The simulator indexes items but its Spotlight UI cannot be driven headlessly,
  so these rows are drawn from the attribute set we submit, not from a
  screenshot. First device run should re-check the truncation points.
- `keywords` carries the language tag (`zh-Hans`), so a deck can be found by
  searching the language name as well as the word.
