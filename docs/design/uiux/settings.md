# Settings

Whether the index is healthy, and the three buttons that fix it when it is
not. Fourth tab.

```
                    Settings

 INDEX STATUS
 ╭──────────────────────────────────────────────╮
 │ Entries in app                          18   │
 │ In Spotlight                            18   │
 │ Waiting to index                         0   │
 ╰──────────────────────────────────────────────╯

 INDEXING  ⓘ
 ╭──────────────────────────────────────────────╮
 │ Sync on launch                          ─●   │
 ╰──────────────────────────────────────────────╯

 [[ Sync now ]]
 [ Rebuild index ]
 [ Clear Spotlight index ]!
```

Reached from: tab bar

Three numbers answer the only question this screen exists for: is what I
added actually findable?

## States

```
working    │ Entries in app                 18  │
           │ In Spotlight                   18  │
           │ Waiting to index                0  │

behind     │ Entries in app               4839  │
           │ In Spotlight                   18  │
           │ Waiting to index             4821  │ ← import not synced yet

syncing    │ Waiting to index             3200  │
           │ indexing 1621/4821                 │ ← accent, replaces nothing
           [[ ⟳ ]]
           [ Rebuild index ]·                   ← disabled during a run
           [ Clear Spotlight index ]!·

removing   │ removing 40/120                    │ ← tombstones flush first

expo go    ╭──────────────────────────────────╮
           │ Core Spotlight is not part of    │ ← danger border
           │ this binary. Expo Go cannot      │
           │ index — run `npx expo run:ios`   │
           │ once to get a development build  │
           │ with the native module.          │
           ╰──────────────────────────────────╯
           │ In Spotlight                    0  │
```

## Overlays

```
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

 [ Clear Spotlight index ]! ↓

 ┌──────────────────────────────────────────┐
 │  Clear Spotlight index?                  │
 │  Your entries stay in the app but leave  │
 │  system search.                          │
 │        ( Cancel )       [[ Clear ]]!     │
 └──────────────────────────────────────────┘

 after Sync now ↓

 ┌──────────────────────────────────────────┐
 │  Index updated                           │
 │  4821 entries added, 0 removed.          │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘

 after Rebuild index ↓

 ┌──────────────────────────────────────────┐
 │  Index rebuilt                           │
 │  4839 entries added, 0 removed.          │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘

 on a build without the module ↓

 ┌──────────────────────────────────────────┐
 │  Not available here                      │
 │  Core Spotlight is missing from this     │
 │  build.                                  │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| Sync on launch | toggle | persisted; off means only manual syncs |
| Sync now | tap | pushes what is queued, alert with the counts |
| Rebuild index | tap | drops the whole index, re-pushes everything |
| Clear Spotlight index | tap | alert, then the app leaves system search |
| tab | return to it | counts reload |

## Copy

| Where | String |
|---|---|
| sections | INDEX STATUS · INDEXING |
| rows | Entries in app · In Spotlight · Waiting to index |
| toggle | Sync on launch |
| actions | Sync now · Rebuild index · Clear Spotlight index |
| progress | `{phase}` `{done}`/`{total}` |
| result | Index updated / Index rebuilt — `{n}` entries added, `{n}` removed. |
| clear | Clear Spotlight index? / Your entries stay in the app but leave system search. |

## Notes

- Three buttons rather than one: "Sync now" is routine, "Rebuild" is for when
  the index is wrong, "Clear" is for leaving system search without deleting
  anything. Collapsing them would hide the only recovery path from a bad
  index.
- Progress is a phase and a count, not a bar. A sync's total is only known per
  collection, so a bar would jump backwards.
- Open: nothing here survives a reinstall. Imported dictionaries and
  hand-written cards both live only in the app's SQLite file, and there is no
  export. The cards are the irreplaceable half.
