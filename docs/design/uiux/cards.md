# Cards

Write a flashcard and have it searchable from the Home Screen seconds later.
Third tab.

```
                     Cards
 ╭──────────────────────────────────────────────╮
 │ FRONT                                        │
 │ ┌──────────────────────────────────────────┐ │
 │ │ Term or question                         │ │
 │ └──────────────────────────────────────────┘ │
 │ BACK                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ Definition, translation or answer        │ │
 │ │                                          │ │
 │ └──────────────────────────────────────────┘ │
 │ TAGS                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ comma, separated                         │ │
 │ └──────────────────────────────────────────┘ │
 │ [[ Add card ]]                               │
 ╰──────────────────────────────────────────────╯

 CARDS IN MY FLASHCARDS
 ╭──────────────────────────────────────────────╮
 │ 走后门                                        │
 │ To pull strings; to use back-door            │
 │ connections.                                 │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ 拍马屁                                        │
 │ To flatter; to suck up. Literally 'pat the   │
 │ horse's rump'.                               │
 ╰──────────────────────────────────────────────╯

 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  Look up    Library    CARDS     Settings
```

Reached from: tab bar

The form sits above the list, not behind a `+`: adding is the reason to open
this tab, and a card takes three fields.

## States

```
empty      No cards yet
           Anything you add here becomes
           searchable from the Home Screen.
           ← only after the 12 demo cards are deleted

saving     [[ ⟳ ]]                              ← fields stay filled until
                                                  the write succeeds

multi-deck DECK
           ( My Flashcards ) ( HSK 4 ) ( Chengyu )
                 ^^^^^^^^^^^^ selected, accent border
           ← only appears with 2+ flashcard decks

no deck    [[ Add card ]] ──▶ creates "My Flashcards", then saves
```

## Overlays

```
 ┌──────────────────────────────────────────┐
 │  Missing text                            │
 │  A card needs both a front and a back.   │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| Add card | tap | writes, clears the form, syncs in the background |
| Add card | empty front or back | alert, nothing written |
| deck chip | tap | switches the list and the save target |
| card row | tap | — (not yet; see Notes) |
| tab | return to it | list reloads |

## Copy

| Where | String |
|---|---|
| labels | FRONT · BACK · TAGS |
| placeholders | Term or question · Definition, translation or answer · comma, separated |
| action | Add card |
| section | Cards in `{deck}` |
| empty title | No cards yet |
| empty body | Anything you add here becomes searchable from the Home Screen. |
| error | Missing text / A card needs both a front and a back. |

## Notes

- Front/back rather than term/definition: this tab is for memorisation, and
  the back is often a question's answer rather than a dictionary sense. The
  same two columns are what a dictionary import fills.
- The form has no READING field, though the schema and the demo cards have one.
  Seeded cards show their pinyin on Entry; a card typed here does not. Either
  add the field or drop it from the seed — currently inconsistent.
- Deck chips are hidden at one deck so the common case is one screen with no
  chrome.
- Open: rows here do not push Entry, so a typo on a card can only be fixed by
  finding it in Look up. Should route the same as an EntryRow.
- Open: no review or spaced-repetition mode. The cards are for lookup today;
  "memorization" in the product goal is only half served.
