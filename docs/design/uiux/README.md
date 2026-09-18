# Screen map and drawing conventions

Every surface in the app, the edges between them, and the glyphs these files
use. Filenames match the screens in `app/`.

```
                  iOS Home Screen
                        │ pull down
                        ▼
              [ Spotlight search ]  ──▶ spotlight.md
                        │ tap a result
                        │ spotlightlookup://entry/<id>
                        ▼
  Launch ──────────▶ Entry ◀────────────────┐
     │                 │ Edit               │
     │                 ▼                    │
     │             (inline editor)          │
     │                                      │
     ▼                                      │
 ┌──────────────── tab bar ──────────────┐  │
 │ LOOK UP   Library   Cards   Settings  │  │
 └───┬─────────┬─────────┬──────────┬────┘  │
     │         │         │          │       │
     │         │         │          │       │
  search.md library.md cards.md settings.md │
     │         │         │                  │
     └─────────┼─────────┴──tap a row───────┘
               │
               ├──tap a collection──▶ collection.md ──▶ Entry
               │
               └──Import dictionary──▶ [ Files picker ]
                                            │ pick
                                            ▼
                                      Import sheet
                                   (library.md → Overlays)

  [brackets] = OS-owned surface, not ours to design
```

```
back    Entry ──▶ Look up · Library · Collection   whichever pushed it
        Collection ──▶ Library
        Import sheet ──▶ Library                   ( Cancel ) or Import
```

## Glyph legend

Standard alphabet from the `uiux` skill. Only the app-specific ones:

```
●  in Spotlight        entry is in the system index
○  queued              entry is waiting for the next sync
·  not indexed         its collection is switched off
ⓘ  explanation         opens a popover; never inline prose
›  pushes a screen
─● ○─                  toggle on / off
CAPS in a tab bar      the selected tab — notation only, never copy
```

## Conventions these files hold to

```
60 columns     every fence, so stacked mocks compare column by column
real data      "resilient · /rɪˈzɪliənt/ · adj. 有韧性的" — never lorem
light theme    dark mode swaps tokens only; see components.md → Palette
← outside      annotations sit right of the frame, never inside it
```
