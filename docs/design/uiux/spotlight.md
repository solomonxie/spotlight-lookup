# Spotlight result

The product's main surface, and the only one Apple draws. We author three
strings; iOS decides everything else.

```
 ┌──────────────────────────────────────────┐
 │ ⌕ coffee                             ✕   │
 └──────────────────────────────────────────┘

 LOOKUP                                    ›
  ▣  coffee                                   ← title
      /ˈkɔːfi/ · English → 中文 (demo)         ← subtitle
      n. 咖啡                                  ← body, 2 lines max
      I drink coffee in the morning.

  ▣  咖啡
      kā fēi · 中文 → English (demo)
      coffee
      我每天早上喝咖啡。
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
matched    ▣ quiet
            /ˈkwaɪət/ · English → 中文 (demo)
            adj. 安静的；平静的

card       ▣ 加油
            jiā yóu · My Flashcards
            Go for it; keep it up. Literally
            'add fuel' — the standard way to…

long       ▣ 入乡随俗
            rù xiāng suí sú · My Flashcards
            When in Rome, do as the Romans
            do………                              ← iOS truncates, we don't

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
✗  ▣  coffee
       Lookup
```
Title plus app name is what a generic Core Spotlight integration produces. It
forces a tap to learn anything, which is the entire behaviour this app exists
to avoid.

```
✗  ▣  coffee
       n. 咖啡 · I drink coffee in the morning. ·
       English → 中文 (demo) · /ˈkɔːfi/…
```
Everything on one line truncates the definition away on a narrow phone. The
reading and collection go first precisely because they are short and bounded.

## Notes

- The simulator indexes items but its Spotlight UI cannot be driven headlessly,
  so these rows are drawn from the attribute set we submit, not from a
  screenshot. First device run should re-check the truncation points.
- `keywords` carries the language tag (`zh-Hans`), so a deck can be found by
  searching the language name as well as the word.
- Both directions of the demo dictionary are indexed, so one English query
  surfaces the English headword and the Chinese one whose gloss matches it.
