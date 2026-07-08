# Markov Regime Bias — Project Rules

## PERMANENT DISPLAY RULE
After EVERY change to MarkovRegimeBias.pine, display the FULL copyable Pine Script in chat.
No exceptions — the user pastes the full script into TradingView each time.

## PERMANENT VERSION RULE
Update the version number in EVERY new version of the script:
- Indicator title string: `"Markov Regime Bias  vX.Y"`
- Indicator shorttitle: `"MRB vX.Y"`
- The stats dashboard title cell: `"SIGNAL PERFORMANCE  [MRB vX.Y]"`
- Current version: **v2.0** — next must be v2.1

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
- v1.8: Added Extension Exhaustion Filter (Section 8C). Bull exhausted when
        high >= ema20 + N×ATR; resets when low <= ema10. Bear exhausted when
        low <= ema20 - N×ATR; resets when high >= ema10. notExhausted gate
        added to isSignalHigh. Dashboard row 5 shows live state. Table
        expanded from 23 to 24 rows; matrix rows shifted from 18-22 to 19-23.
- v1.9: Fixed exhaustion filter same-bar race condition. notExhausted used
        live bullExhausted flag, which could be cleared intra-bar by an EMA10
        retest on the same bar the signal fires — causing a spurious marker.
        Fix: snapshot bullExhaustedAtOpen/bearExhaustedAtOpen before the
        update block; notExhausted uses the snapshot so a same-bar retest
        cannot unlock a same-bar signal. Reset must close on a prior bar.
- v2.0: Split i_overnightMode into two independent toggles:
        i_nextSessionMode (Visuals group) — offset=-1 carrot arrows at close
        of current session for D/W/M; visual only, no performance impact.
        i_gapMode (Backtesting group) — win measured as overnight gap (open
        vs prior close) instead of session direction (open→close); independent
        of visual arrows. Removed all overnight window time logic (Section 10)
        and 3 overnight alertconditions. Added i_statsTblSize dropdown
        (Tiny/Small/Normal/Large, default Small) — _sSz variable drives all
        statsDash text_size params for legibility control.
