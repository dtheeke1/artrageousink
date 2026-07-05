# Markov Regime Bias — Project Rules

## PERMANENT DISPLAY RULE
After EVERY change to MarkovRegimeBias.pine, display the FULL copyable Pine Script in chat.
No exceptions — the user pastes the full script into TradingView each time.

## PERMANENT VERSION RULE
Update the version number in EVERY new version of the script:
- Indicator title string: `"Markov Regime Bias  vX.Y"`
- Indicator shorttitle: `"MRB vX.Y"`
- The stats dashboard title cell: `"SIGNAL PERFORMANCE  [MRB vX.Y]"`
- Current version: **v1.7** — next must be v1.8

## COMMIT AND PUSH AFTER EVERY CHANGE
Branch: `claude/markov-regime-pine-script-gq5eu6`
1. `git add MarkovRegimeBias.pine`
2. `git commit`
3. `git push -u origin claude/markov-regime-pine-script-gq5eu6`
4. Display full script in chat

## KNOWN BUG HISTORY
- v1.3: multiline ternary parsing bug zeroed date-range counter (fixed v1.4)
- v1.5: historical markers defaulted ON, confusing user (fixed: default OFF)
- v1.6: two sequential `if barstate.islast` blocks — Pine absorbed the second
        into the first's scope, hiding stats dashboard when main was toggled off.
        Fix: single outer `if barstate.islast` with nested `if i_showTable` / `if i_showStats`.
- v1.7: durationConf was computed but never fed into compositeProb — i_useDuration
        toggle had zero effect on the model. isMax was computed but never used in
        matrix cell rendering. Both fixed.
