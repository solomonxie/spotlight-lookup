# Components

Everything used on more than one screen. Source: `src/ui/`.

## Tab bar

```
 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  LOOK UP    Library    Cards     Settings
              ← caps = notation for "selected"; on screen the
                label stays sentence case and takes the accent tint
```

Four tabs, always visible, never badged. Ionicons: `search`,
`library-outline`, `albums-outline`, `options-outline`.

## EntryRow

One search hit or recent entry. `src/ui/EntryRow.tsx`.

```
 ╭──────────────────────────────────────────────╮
 │ quiet  /ˈkwaɪət/                             │
 │ adj. 安静的；平静的                            │
 │ English → 中文 (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
```

```
indexed     English → 中文 (demo)   ●  in Spotlight
queued      My Flashcards           ○  queued
excluded    CC-CEDICT (full)        ·  not indexed
no reading  bikeshedding
            Debating trivia while the hard part…
long term   Donaudampfschiffahrtsgesell…  /doːnaʊ…/
            2-line definition, then it clips ………
```

Whole row pushes `entry.md`. Definition clamps to 2 lines, term and
reading to 1 each.

## Card, SectionHeader, Pill

```
 INDEX STATUS                                     ← SectionHeader
 ╭──────────────────────────────────────────────╮
 │ Entries in app                         317   │ ← Card
 │ In Spotlight                           317   │
 │ Waiting to index                         0   │
 ╰──────────────────────────────────────────────╯

 ( Dictionary ) ( en ) ( → zh-Hans )              ← Pill: accent, neutral
```

## InfoButton

```
 INDEXING  ⓘ                                      ← sits beside the heading
 ╭──────────────────────────────────────────────╮
 │ Sync on launch                          ─●   │
 ╰──────────────────────────────────────────────╯

 tap ⓘ ↓

 ┌──────────────────────────────────────────┐
 │  Indexing                                │
 │  New and edited entries are pushed to    │
 │  Spotlight in the background.            │
 │  Per-collection limits and language      │
 │  tags live on each collection in         │
 │  Library.                                │
 │                            [ Got it ]    │
 └──────────────────────────────────────────┘
        ← tap anywhere outside also dismisses
```

The reasoning lives here so the controls stay above the fold. Current state
("180 of 180 entries are in system search.") stays inline — that answers
"is this working?", which is not an explanation.

```
✗  INDEXING
   New and edited entries are pushed to
   Spotlight in the background.
   Per-collection limits and language tags
   live on each collection in Library.
   ╭────────────────────────────────────────╮
   │ Sync on launch                    ─●   │
   ╰────────────────────────────────────────╯
```
Four lines of prose before the only control on the screen.

## Button

```
 [[ Import ]]      primary — one per screen, the thing you came to do
 [ New deck ]      secondary
 [ Delete ]!       destructive
 [[ ⟳ ]]           loading, label swaps for a spinner, press disabled
 [ Rebuild ]·      disabled while a sync is running
```

Full width, stacked with 12pt gaps; never side by side except the two
actions at the top of Library.

## Field

```
 TERM
 ┌──────────────────────────────────────────────┐
 │ resilient                                    │
 └──────────────────────────────────────────────┘

 SOURCE LANGUAGE
 ┌──────────────────────────────────────────────┐
 │ en, ja, de …                                 │ ← placeholder
 └──────────────────────────────────────────────┘

 MAX ENTRIES IN SPOTLIGHT  ⓘ
 ┌──────────────────────────────────────────────┐
 │ 20000▌                                       │ ← focused, number pad
 └──────────────────────────────────────────────┘

 DEFINITION
 ┌──────────────────────────────────────────────┐
 │ adj. 有韧性的；能快速恢复的                     │
 │                                              │ ← multiline, 88pt min
 │                                              │
 └──────────────────────────────────────────────┘
```

Labels are caps, always above the field. Empty means null on save, so
clearing a reading removes it rather than storing "".

## Banner

```
 ╭──────────────────────────────────────────────╮
 │ Running without Core Spotlight — in-app      │
 │ search works, but system Spotlight indexing  │
 │ needs a development build (npx expo run:ios).│
 ╰──────────────────────────────────────────────╯
```

Only ever shown for a condition the user can act on. Accent border for
information, danger border on Settings where it explains why the buttons
below will not work.

## EmptyState

```
              Your library is empty

     Import a dictionary file or add a
    flashcard to start filling Spotlight.
```

Title states the fact, body names the next action. Never an illustration.

## Palette

`src/ui/theme.ts`. Dark mode swaps these tokens; no mock is redrawn for it.

| Token | Light | Dark |
|---|---|---|
| `background` | `#F4F5F8` | `#0B0D12` |
| `card` | `#FFFFFF` | `#161A22` |
| `text` | `#11131A` | `#F2F4F8` |
| `muted` | `#6B7280` | `#99A1B0` |
| `border` | `#E2E5EB` | `#262C38` |
| `accent` | `#2F6FED` | `#6B9BFF` |
| `accentSoft` | `#E7EFFD` | `#18233A` |
| `danger` | `#D14343` | `#FF6B63` |
| `success` — the ● dot | `#1F8A54` | `#4ED08A` |
