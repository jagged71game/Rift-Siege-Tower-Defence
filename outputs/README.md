# Splinterlands: Rift Siege

A self-contained fan-made browser tower-defence game inspired by Splinterlands, using recognizable monsters, Elements, card art, Dark Energy Crystal currency, tower evolution, five realms, escalating waves, and legendary boss fights.

## Play online

This repository includes an automatic GitHub Pages workflow. After publishing, set **Settings → Pages → Source** to **GitHub Actions**.

## Repository contents

- `outputs/` — playable browser game and artwork
- `desktop/` — Windows launcher source
- `work/simulate-balance.js` — automated campaign balance simulation
- `package.json` — optional Electron desktop packaging configuration

## Play

Open `index.html` in a modern desktop browser.

## Controls

- Select a champion card, then click a glowing map rune to summon it.
- Click a placed champion to evolve or sell it.
- Cycle each selected tower between **First**, **Strong**, **Weak**, and **Fast** targeting.
- Press **Begin Wave** when your defence is ready.
- Use the speed button in the top-right to cycle between 1×, 2×, and 3×.
- Pause with the `Ⅱ` button or Space. Press `T` to cycle the selected tower's targeting.
- Use the full-screen button for edge-to-edge play. Supported mobile browsers will also request landscape orientation.
- On mobile, pinch the battlefield to zoom and drag it to pan. Use the `+`, `−`, and reset controls to adjust the view precisely.
- The compact summon icons remain fixed above the safe area in fullscreen landscape, including on notched phones.

Completing a wave without losing Core grants an escalating Flawless streak bonus. Taking damage resets the streak.

## Monster tower abilities

- **Living Lava:** impact splash plus a lingering burning lava pool.
- **Deeplurker:** extended-range snipe targeting wounded enemies, followed by poison.
- **Mycelic Slipspawn:** armor-piercing magic that chains through nearby enemies.
- **Cursed Windeku:** armor curse and a thorn burst against enemies that pass close by.
- **Pelacor Arbalest:** two visibly staggered attacks every time it fires.

Placed monsters appear as upright animated card-totems mounted on elemental stone plinths. Core health updates and flashes immediately whenever an enemy escapes.

The summon deck is mounted directly over the lower edge of the battlefield, keeping every card selectable in fullscreen and short landscape displays. Battlefield card-totems and enemy portraits use larger, less-cropped artwork for clearer character recognition.

Use the gold arrow above the summon deck to retract it completely during combat. A small pull-tab remains available to restore the deck without interrupting the wave or clearing the current selection.

Hover or keyboard-focus any summon card to inspect its complete artwork in a large battlefield preview. Touch players can tap a card to display the same preview briefly while selecting it.

The campaign and battle-intel rail is also retractable. On desktop it releases its full width back to the battlefield; on phones and tablets it becomes a temporary slide-over drawer, so the map always keeps the entire screen when the information panel is closed.

## Enemy mechanics

- Enemies now use Splinterlands card portraits, including Antoid Platoon, Cruel Sethropod, Hill Giant, Riftwing, Stitch Leech, Legionnaire Alvar, Disintegrator, and Chaos Agent.
- Orange-ringed Antoid Platoons are immune to Living Lava's splash pools.
- Riftwings release smaller Chaos Agents when badly wounded.
- Hill Giants and Legionnaire Alvar fracture into multiple smaller enemies when defeated, which can split again.
- Opening waves contain more enemies with increased health.
- Boss health appears as soon as the boss wave begins.
- Procedural sound effects cover attacks, splitting enemies, core damage, waves, and boss defeats. Use the music-note button to mute them.

## Deeper Rift journeys

- Anumün Wilds introduces two simultaneous attack lanes.
- Mortis Catacombs uses two widely separated corridors.
- Chaos Dragon Rift culminates in a three-lane defence.
- Summoned and splitting enemies remain on their parent's lane.

The campaign culminates at **Chaos Dragon Rift**. Chaos Dragon resists Earth magic and summons Riftwings across all three lanes at 66% and 33% health.

## Balance simulation

The campaign is checked with a headless five-realm simulation covering mixed, control, raw-damage, fire-heavy, and five single-character builds. Current results:

- All four varied strategies complete the campaign with 7–10 Core remaining.
- Every single-character strategy fails in Realm 1 or early Realm 2, even after fully upgrading that tower.
- Matchup-aware damage uses a 1.38× weakness bonus and a 0.62× resistance penalty.

## Strengths and weaknesses

- **Living Lava:** excels against swift swarms; fireproof enemies resist direct fire and ignore lava pools.
- **Deeplurker:** excels against flying enemies; melee brutes resist its water attacks.
- **Mycelic Slipspawn:** magic pierces armored enemies; swift enemies resist earth magic.
- **Cursed Windeku:** thorns and curses punish melee enemies; ethereal enemies resist death damage.
- **Pelacor Arbalest:** double strikes purge ethereal enemies; armored enemies resist Life damage.
- **Time Mage:** every hit slows enemies by 40% for 2.2 seconds, but deals modest direct damage.
- Time Snare evolves to 50% for 2.7 seconds at level 2 and 60% for 3.2 seconds at level 3.
- Enemy Magic Resistance reduces both the applied slow percentage and duration; the Bestiary displays each unit's resistance or immunity.

Tower evolution now increases attack range by 20% per level as well as improving damage and attack rate. Selling requires a second confirmation to prevent accidental Dark Energy refunds while selecting towers.

Enemy portraits display `W:` for their elemental weakness and `R:` for their resistance. Bosses also have realm-specific matchups.

Later campaign levels introduce Forgotten One, Goblin Psychic, Soul Strangler, and Supply Runner. These add fire immunity, regeneration, ethereal speed, and enemy speed auras.

River Hellondale enters later campaigns as a Frost Mage. Every 5.8 seconds it freezes the nearest tower within 175 range for 2.4 seconds. Frozen towers cannot attack or trigger thorns; the ice shell displays the remaining duration.

Supply Runner now projects a visible 155-range same-lane aura that accelerates allies by 22%. Boosted units display gold speed trails, while the Runner moves slowly enough to remain with its pack.

**Yaba's Pickle** has a 22% chance to wander into non-boss waves from wave two onward. Defeating this rare special enemy restores 3 Core.

## Time immunity and boss tuning

- Yodin Zaku, Harklaw, Chaos Dragon, Forgotten One, Legionnaire Alvar, and Chaos Agent are immune to Time Mage's slow.
- Slow-immune units display a crossed hourglass and produce a `TIME IMMUNE` combat notice.
- Yodin now summons two fireproof Antoid guards at 72% and 38% health.
- Boss durability was increased to account for the additional time-on-target granted by evolved tower range.
- The balance simulation now models range coverage, slow immunity, Yodin's guards, and individual boss armor.

## Rift Bestiary

Open **Enemy Bestiary** from the Rift Intel panel to review every enemy encountered so far in the campaign. Each dossier displays the complete Splinterlands card, encountered health, armor, speed, elemental weakness, resistance, and special behavior. Discoveries persist through later waves and realms, while unseen enemies, spawned children, and bosses remain hidden until they actually enter the battlefield. Close it with Escape.

## Attribution

Inspired by Splinterlands. Splinterlands names, card references, and card artwork are used with the project team's stated permission for this prototype. This is a fan-made game concept and is not presented as an official Splinterlands release.
