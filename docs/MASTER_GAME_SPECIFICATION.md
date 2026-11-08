# NORTHMEN: The Viking Age
## Master Game Specification — Version 1.0

**Status:** Consolidated design baseline  
**Authority:** Confirmed decisions are authoritative. Provisional values and open decisions are not implementation-ready.

## 1. Game overview

NORTHMEN is a 3–5 player strategy game inspired by the Viking world. Each player leads a clan competing through territorial control, settlement development, resource management, exploration, trade, military expeditions, maritime activity and diplomacy.

Three alternative endgame paths:
1. **Christianisation** — diplomatic, cultural and economic transformation.
2. **Crusade** — military endgame available to Christian clans.
3. **Ragnarök** — shared catastrophic endgame that immediately ends the game.

### 1.1 Game length and actions
- Maximum normal game length: 15 rounds.
- Each clan starts with 2 actions per turn.
- Owning 2 Outposts permanently unlocks 4 actions, starting the following turn.
- At the beginning of Round 8, every clan receives 4 actions regardless of development.
- Unused actions expire.
- If no endgame has triggered by the end of Round 15, final scoring follows the normal final round.
- Special endgame procedures already underway take precedence over the normal Round 15 limit. Ragnarök ends the game immediately.

## 2. Map and geography

The map covers Scandinavia, the British Isles, Iceland, the Faroe Islands, Greenland, the Baltic, parts of continental Europe and Eastern Europe. Target scale is approximately 45–50 regions, generally with 3–5 territories per region. Exact geography remains open.

Each territory has one dominant terrain type, one primary resource and one secondary resource. Terrain types: Forest, Mountains, Farmland, Coastal, Marshland, Open Plains and Arctic/Tundra.

Terrain provides defensive combat modifiers; exact values are open. Terrain does not affect movement distance in the initial ruleset and does not modify a settlement defensive die. Rivers are geographical features only.

Land routes and sea routes are separate networks. Coastal routes form a predefined connected network. Open-ocean routes are predefined direct connections and carry a fixed surcharge by route category. Each open-ocean connection draws one Voyage Event Card; coastal routes do not.

The complete geography is visible from the beginning. Exploration is a separate action that reveals hidden opportunities, resources and special territorial information. Discoveries may award resources, cards or VP.

Starting territories are randomly selected from eligible regions. No two clans start in the same region. Starting positions need sufficient connections and reasonably balanced advantages.

## 3. Settlements, territories and regional control

### 3.1 Settlement development
Development sequence: **Outpost → Village → Trading Post → Town**.

- Each clan starts with one main settlement; other clan settlements are Outposts.
- Outposts require resources and at least one stationed warrior.
- No fixed maximum number of Outposts has been established.
- Outposts cannot be built in a territory containing another clan's settlement.
- Only the territory owner may upgrade.
- Upgrades are sequential, immediate and do not require warriors.
- Increased production applies from the next applicable production phase.
- Construction costs increase with the clan's total settlement development.
- Upgrades from Trading Post onwards require Silver.
- Exact costs and production increments remain open.

The main settlement can be captured; its development level remains intact and ownership transfers. If lost, the clan may designate an existing Outpost as its new main settlement. Main settlement development is tracked on the Player Home Card.

### 3.2 Settlement defence
| Settlement | Defensive modifier |
|---|---:|
| Outpost | +1 |
| Village | +1 |
| Trading Post | +2 |
| Town | +3 |

The modifier applies to one settlement defensive die, not extra warrior dice. An empty settlement still has one defensive die plus its modifier.

### 3.3 Territorial control
Settlement ownership and control of its territory are inseparable. A hostile army entering a territory with a settlement triggers military confrontation. Capturing the settlement conquers the territory.

For ordinary territories without settlements:
- One warrior can establish control by remaining for one full turn.
- The occupation period begins immediately.
- Leaving before the full turn ends the claim.
- Once secured, control persists without a stationed warrior until another clan takes over.
- Passing through without leaving a warrior does not transfer control.

Capturing an existing Village, Trading Post or Town requires the attacker to draw a Settlement Event Card. Capturing an Outpost does not.

### 3.4 Regional control
A clan qualifies as regional controller when it owns at least one settlement in the region and controls more territories there than any rival. A tie for the highest territory count makes the region contested; neither clan receives the regional bonus. Regional control changes immediately when territorial control changes. Exact regional VP bonus and final scoring conditions remain open.

### 3.5 Ports
Ports are independent assets and may be built without settlements.
- Only designated coastal territories are eligible.
- No garrison is required.
- Ports have one fixed level and produce 1 Fish per round.
- Ports enable their owner to build longboats.
- Maximum 1 longboat per owned port.
- Multiple ports per clan are allowed.
- Port construction costs more if another clan has a settlement or port in the region.

Port ownership is independent of territorial control unless the port itself is captured. A port in a settlement territory transfers when that settlement is captured. A port in a territory without a settlement must be captured separately.

## 4. Resources and economy

Five resources: **Timber, Iron, Provisions, Fish and Silver**.

- Every territory has one primary and one secondary resource.
- Primary production: 1 unit per territory automatically each round.
- Secondary production: 1 unit per eligible territory when gathering.
- Gathering is available in the main settlement region and regions where the clan has established presence; exact definition remains open.
- Settlement development increases production in the territory containing the settlement, for both primary and secondary resources.
- Main settlement gives an additional small production bonus.
- Each port produces 1 Fish per round.
- Silver is not territorial production; it comes from trade, raids, events and other defined rewards.
- Captured territorial production transfers next round.

Each clan has an unlimited regional storage pool for each region. If a clan loses its final settlement in a region, its stored resources there are lost. If eliminated, all remaining resources disappear.

One Resource Transportation action transfers any quantity between one origin and one destination regional pool. The clan must own a settlement in both regions. No physical transport or escort is required; transfers may cross enemy-controlled territories.

## 5. Construction and recruitment

- Outposts require resources and at least one stationed warrior.
- Upgrades are sequential; only the territory owner may upgrade.
- Ports are independent, require no garrison and have one fixed level.
- Longboats require an owned port and resources.
- Warriors can be recruited at any owned settlement; no existing garrison is required.
- Each warrior costs both Provisions and Silver, at the same cost regardless of location.
- Recruitment capacity depends on settlement development and available resources.
- Unused capacity resets each turn.
- Multiple settlements may recruit during one Recruitment action.
- Stationary warriors consume no Provisions.
- Exact costs and capacities remain open.

## 6. Movement, logistics and maritime system

### Land movement
One Military Expedition action allows an army to travel as far as permitted by route access and available Provisions. Armies may stop partway and split. Each separate group needs its own later movement action and its own Provisions. Provisions are paid before departure and depend on army size, not distance. Stationary warriors consume none.

### Passage
Passage through another clan's territory may require permission. The owner may allow or deny it; passage is free. If denied, the army must route around or force passage through military confrontation. Passing through does not establish control. Settlement territories require permission. Allies have unrestricted passage through allied territories, including settlements.

Neutral clans may allow or deny passage to either side of a war without becoming involved. They cannot let belligerent armies use their settlements as temporary bases, but may trade or gift resources to either side.

### Longboats and sea routes
There is one ship type: the Viking longboat. It transports warriors and Provisions and is not a warship. Provisional capacity is 5 warriors plus Provisions; exact capacity accounting remains open. Only a port owner may build a longboat there; maximum one longboat per owned port.

Coastal routes follow a predefined connected network, allow multiple connections in one movement action, use normal army-size Provisions and do not draw Voyage Events.

Open-ocean routes connect distant regions directly, carry a separate fixed Provisions surcharge by route category and draw one Voyage Event per connection. Events resolve immediately before the journey continues. Mandatory consequences cannot be ignored. Exceptional outcomes are event-specific.

No naval battles at sea. Longboats can only be captured or destroyed through the established failed coastal raid mechanism. If the ship's port is captured while it is at sea, it must return to another friendly port. Emergency refuge at an enemy or neutral port is allowed only when a Voyage Event explicitly permits it.

## 7. Combat and raiding

### Core combat
- Standard D6.
- Attacker rolls up to 3 warrior dice; defender up to 2.
- 1 warrior = 1 die; 2 warriors = 2 dice; 3+ use the applicable maximum.
- Both sides roll simultaneously; sort high to low.
- Compare highest against highest, then second-highest against second-highest.
- Defender wins ties.
- Each lost comparison causes one warrior casualty.
- Combat continues until one army has no warriors, a player retreats between rounds, or both armies are eliminated.
- Attacker chooses first whether to continue or retreat after each round, then defender.
- Neither side can retreat after attack declaration but before the first round.

A defeated land army with survivors retreats to the territory from which it entered battle. Settlement defenders who survive capture retreat to a legal territory; if none exists, they are eliminated. If both armies are eliminated, territorial ownership remains unchanged.

Settlement defence adds one settlement die with the relevant modifier to the normal defender warrior dice.

### Raiding
Raiding is a naval-only economic action. Targets are accessible coastal enemy settlements, Outposts and ports. Inland settlements cannot be raided directly. No friendly port is required in the target region. Own assets cannot be raided.

Only Provisions and Silver can be stolen. The attacker chooses the combination, limited by defender holdings.

Provisional rewards: major success 3 resources; moderate success 2; failure 0. If only one comparison occurs, a win grants 2 and a loss 0. Failed-raid casualty details and minimum warrior requirement remain open.

A successful raid must return to its original departure port or another friendly port if the original is captured. After an unsuccessful raid, the longboat remains exposed at the target coast. The defender may attack during its turn. If not attacked, raiders may move away on their next turn. If attacked, normal combat applies; surviving raiders still wait until their next turn to move.

Each target may be raided once per turn and each longboat once per turn. A failed raid counts against the target restriction. Multiple longboats may raid different targets if enough actions exist. Raiding an ally immediately breaks the alliance between the pair.

## 8. Trade, diplomacy and alliances

Trade is direct between two clans, with no central market. It occurs during the active player's turn. One Diplomacy action can encompass multiple trades or gifts with different clans. All five resources are tradable; quantities and exchange rates are negotiated freely. Transfers are immediate and simultaneous. Either party may refuse. No formal future debts or promises.

Gifts are voluntary, unconditional and immediate. No fixed quantity limit beyond holdings. Transferred resources become the recipient's property. Trade and gifts are permitted between allies, enemies and neutral clans.

Alliances may contain two or more clans; a clan may belong to multiple alliances. All current members must agree to invite a new clan, and the invitee must accept. Alliances have no fixed duration. A clan may leave during its own turn without notice, permission or action cost. Expulsion requires agreement of all other members. Remaining alliance membership continues after a member leaves or is expelled.

Raiding an ally or combat between allies immediately breaks the alliance between the involved pair. Larger alliances otherwise continue. Mere passage or positioning does not break an alliance. No automatic betrayal bonus or penalty.

Allies may station warriors in one another's territories with permission. Warriors retain their original ownership and command and do not transfer control. They may help defend the host and contribute normal defensive dice; settlement modifiers do not change. Assistance is voluntary. No joint offensive expeditions: one clan controls an offensive expedition during its own turn. Combat is initiated and resolved during the attacking player's turn.

Neutral clans may trade/gift and allow/deny passage but cannot provide settlements as temporary bases for belligerent armies.

## 9. Cards and events

### Bonus Cards
- One shared deck and discard pile.
- Cards enhance existing actions; they do not replace actions.
- One card drawn for every action, including failed actions, at end of turn.
- Newly drawn cards cannot be played that turn.
- Maximum 7 regular cards in hand; Objective Cards excluded.
- Cards may be played during another player's turn if explicitly permitted.
- Unlimited cards per turn if each affects a different action; no stacking multiple cards on one action.
- Single-use or explicit duration.
- Voluntary discards are free during own turn.
- Discard pile is public.

### Objective Cards
- Each clan starts with 2.
- Additional cards through actions, achievements or events.
- Easy, medium and difficult.
- Secret unless voluntarily revealed.
- Completed objectives award VP at endgame.
- Some objectives are exclusive; others can be completed by multiple clans.
- Voluntary discard free during own turn; no cap on completed objectives.

### Event decks
- General Events: initial 50 cards; one at beginning of each round.
- Settlement Events: initial 30 cards; mandatory blind draw when capturing existing Village, Trading Post or Town; none for founding or capturing Outpost.
- Voyage Events: initial 20 cards, expandable; one per open-ocean connection, none for coastal routes.

General Events may be historical, political, economic, environmental, military or religious; global or targeted. Durations are explicit. Effects overlap unless instructions conflict. Each card defines timing; beginning of round is default. Discard piles are public, remaining decks hidden. Reshuffle when exhausted unless specified.

### Rule hierarchy
1. A card explicitly overrides a core rule when it states an exception.
2. More specific card instructions take precedence.
3. If equally specific card instructions directly conflict, the later card takes precedence.
4. Between a card and an ongoing General Event, the most specific instruction takes precedence.
5. Compatible ongoing event effects both apply.
6. Permanent interpretations are recorded in the official rulebook.

## 10. Endgame paths

### Christianisation
Requires sufficient diplomatic influence, sufficient settlement development, contact with an established Christian power through trade/diplomacy/alliance, and at least one established Christian settlement.

Any clan may initiate, regardless of religion. One shared Christian Influence Track exists; all clans may contribute. Reaching the threshold and satisfying prerequisites triggers Christianisation automatically. It cannot be reversed or prevented once triggered.

Finish the current round, then play one final round; all clans receive 4 actions in that final round. Each clan independently chooses to convert or remain pagan. The choice is permanent. Christian and pagan clans coexist; religious difference does not automatically cause war. They may fight, trade, gift and ally without religious restrictions. Both religions have distinct strategic advantages. No dedicated religious structures. Existing settlements and ports remain unchanged.

The triggering clan receives a fixed VP bonus; value open. Christianisation reduces Ragnarök risk by a provisional 5. Individual conversion does not directly reduce Ragnarök, though actions of converted clans may.

### Crusade
A deliberate military endgame and alternate-history extension. Only Christian clans can initiate. The initiator needs military, religious and diplomatic prerequisites, a shared Christian influence threshold and formal support from at least one other clan; supporter may be pagan. Diplomatic support does not imply military participation.

Two additional rounds follow declaration. All clans receive 4 actions during both. Other clans participate, oppose or remain neutral. Neutral clans may join either side during the first additional round, but not after the second begins. Participants may withdraw and become neutral; withdrawal loses collective base reward eligibility but preserves earned contribution points. No direct switch from Crusading to opposing.

Crusading clans form one side; opposing clans the other. Neutral clans do not contribute. Higher combined military contribution wins; tie means no collective reward. Winners who remain committed receive shared base reward plus individual contribution points.

Eligible contributions: territory captures, settlement captures by development level, enemy longboat capture/destruction and successful raids. No defensive victory points, failed attack points or incomplete capture points. Scoring limits prevent repeated scoring of the same territory, settlement, ship or raid target. Only achievements during an active Crusade count; earlier achievements are not banked. Elimination itself gives no separate Crusade contribution points. Crusade increases Ragnarök risk by a provisional 7.

### Ragnarök
Rare catastrophic ending; no player deliberately initiates it. It can be influenced but not fully prevented. Three public stages: Omens, Fimbulwinter, Ragnarök.

Potential triggers include clan elimination, General Events, political/military/economic instability, aggressive actions and betrayal. First clan elimination does not automatically trigger Stage 1; it contributes to instability. All initial triggers begin at Stage 1. The public track can move backwards through stabilizing conditions.

Stage 1: minor production, trade and military disruption.  
Stage 2: severe resource disruption, increased Provisions requirements, maritime restrictions and global instability.  
Stage 3: immediate game end.

Effects are global. Settlements and territories are not randomly destroyed. 5–8 catastrophic cards are included in the General Event deck; all advance Ragnarök. Durations are explicit. Examples such as Fimbulwinter, Great Famine, Wolf Unbound, Serpent Stirs, Twilight of Gods, Broken Oaths and Long Night are fictional game events inspired by mythology, not claims of documented historical events.

Ragnarök can occur during Christianisation's final round or Crusade's additional rounds and overrides them immediately. Normal VP scoring applies.

## 11. Victory points

Highest total VP wins regardless of endgame path.

- Each territory: 1 VP, awarded at final scoring according to current ownership.
- Territory with a settlement receives no additional territory VP for that settlement.
- Regional control adds a bonus; amount and scoring condition open.
- Outposts, Villages, Trading Posts and Towns all score at final scoring by final development and current ownership.
- Main settlement receives no extra settlement VP.
- Each owned port awards fixed VP.
- Longboats do not score for ownership alone; successful maritime achievements may score. Criteria open.
- Ordinary military achievements award VP outside Crusade.
- Capturing ordinary territory does not add immediate VP.
- Capturing an enemy settlement awards additional military VP based on development.
- Successful raids award ordinary VP.
- Defensive victories do not award ordinary military VP.
- Only Silver scores directly as wealth: **5 Silver = 1 VP**.
- Other resources, trade volume, alliances, gifts and diplomacy do not directly award VP.
- Conversion and Christian Influence Track contribution do not directly award VP.
- Triggering Christianisation gives a fixed VP bonus.
- Objective Cards have fixed rewards by difficulty.
- A small number of special endgame bonuses will be selected later.
- No Ragnarök survival bonus.

Tie-breakers: most territories; most completed secret objectives; highest settlement development; most Silver; shared victory.

## 12. Clan elimination

A clan is eliminated when it has neither settlements nor warriors remaining.

Upon elimination:
- Resources disappear.
- Bonus Cards are discarded.
- Objective Cards are removed and remain secret.
- Settlements, ports and longboats become neutral assets.
- Ragnarök tracker advances.
- Crusade-related tracker is affected; exact treatment open.
- Eliminated clan is skipped in subsequent turns.

Neutral asset acquisition and interaction rules must be defined before implementing those interactions.

## 13. Digital product requirements

The engine tracks all game state: clans, resources, regional storage, warriors, armies, settlements, ports, ships, territory/control, cards/deck order, alliances/wars, events/durations, turn/action sequence, objectives, scoring and endgame trackers.

Every action and event is recorded chronologically. Undo is permitted only for the most recent action if no other player has acted since.

Players use both action menus and direct map interaction. Legal actions are highlighted, illegal actions disabled, costs shown before confirmation and unmet requirements explained. Actions and resources remain visible.

Main interface: large central map; clan panels; trackers and card stacks; dedicated clan/home-settlement display; dedicated combat screen with armies, modifiers, dice and casualties.

Map: historically recognizable with clear territory boundaries; free zoom/pan; clan colors and ownership symbols; settlements, ports and warriors always visible; territory selection reveals terrain, resources, ownership, control, assets, warriors and legal actions subject to information rules.

All rules are enforced by the engine. Random outcomes are automatic in normal play. Production, ongoing effects, trackers and scoring are automatic. Manual random-result entry may exist only in developer/test mode.

Required game modes: single-player against AI, online multiplayer and asynchronous online play. Local hot-seat play has not been selected as a requirement.

Autosave after every completed action; multiple save slots; preserve all hidden information, deck order and random outcomes.

Developer test mode must support custom territories, resources, armies and game states. Automated tests cover important rules and edge cases.

## 14. Technical direction

Existing starter technology: TypeScript, React and Vite. The game engine must remain independent of the UI. The UI submits commands; the engine validates and resolves them. Architecture should support AI and online multiplayer from the beginning. Build small testable systems, integrate a playable prototype early, and prioritize a complete but basic game over early visual polish. Browser first; desktop should reuse the shared codebase where practical.

## 15. Open decisions register

Rules needing clarification:
1. Regional control VP amount and final scoring condition.
2. Longboat VP achievements, repeatability and retention after ship loss.
3. Minimum warriors required for coastal raids.
4. Whether defensive victories/failed attacks contribute to Christianisation and which clans qualify.
5. Exact elimination effect on Crusade-related tracker.
6. Definition of established presence for gathering.
7. Neutral asset acquisition and use.
8. Exact longboat capacity accounting.
9. Whether/how split armies can regroup.

Values needing balancing:
- Production bonuses; construction/upgrade/recruitment costs and capacities.
- Terrain combat modifiers.
- Provisions movement costs and open-ocean surcharges.
- Raid rewards and casualty rules.
- VP values.
- Christianisation/Crusade thresholds.
- Ragnarök thresholds and modifiers.

Content still to create:
- Final map, territory definitions and resource assignments.
- Starting locations and port sites.
- Bonus, Objective, General Event, Settlement Event and Voyage Event card catalogues.
- AI strategies and personalities.

## 16. Specification governance

Labels:
- **Confirmed:** explicitly agreed.
- **Provisional:** direction agreed, values/details not final.
- **Recommendation:** proposed, not approved.
- **Open:** requires a decision.

For every rule change: record the decision, check conflicts, update this specification and architecture/roadmap, and add or update tests. No unapproved recommendation may silently become a game rule.

**End of Master Game Specification — Version 1.0**
