# Markov Regime Bias — Project Rules

## PERMANENT DISPLAY RULE
After EVERY change to MarkovRegimeBias.pine, display the FULL copyable Pine Script in chat.
No exceptions — the user pastes the full script into TradingView each time.

## PERMANENT VERSION RULE
Update the version number in EVERY new version of the script:
- Indicator title string: `"Markov Regime Bias  vX.Y"`
- Indicator shorttitle: `"MRB vX.Y"`
- The stats dashboard title cell: `"SIGNAL PERFORMANCE  [MRB vX.Y]"`
- Current version: **v2.6** — next must be v2.7

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
- v2.1: Attempted fix for next-session carrot / session triangle Christmas tree
        by changing offset=-1 → -2. Incomplete: the stacking still occurred
        because any fixed offset lands on a bar that may still have a triangle
        when there are consecutive HIGH signals.
- v2.2: Proper fix for Christmas tree. Root cause: the carrot at offset=-1
        always draws on the PREVIOUS resolution bar, which has its own triangle
        whenever that bar was also a HIGH signal. Fix: added priorResHigh bool
        (snapshot of prevResWasHigh before the isResUpdate update block) and
        gated all 8 carrot plotshape calls with `and not priorResHigh`. Carrot
        only fires when the prior resolution bar was NOT a HIGH signal (no
        triangle there). Reverted offset back to -1.
- v2.3: Added Price Move profitability row to each tracking section of the
        Signal Performance dashboard. Signed price move in signal direction:
        session mode = close-open (bull) / open-close (bear); gap mode =
        open-close[1] (bull) / close[1]-open (bear). Positive = win direction,
        negative = loss direction. Win $, Loss $, Net $ per window (All History
        row 5, Last N row 10, Date Range row 15). statsDash expanded from 13
        to 16 rows. New accumulators: ahBull/BearWAmt/LAmt, drBull/BearWAmt/
        LAmt, lnAmtArr parallel rolling array. Helper f_fmtAmt returns "+X.XX"
        or "-X.XX".
- v2.4: Two changes: (1) Fixed consecutive-signal carrot gap: v2.2's priorResHigh
        suppression prevented the next-session carrot from appearing at all when
        consecutive HIGH signals fired. Fix: removed priorResHigh entirely; instead
        placed bull carrots at location.abovebar and bear carrots at location.belowbar
        (opposite sides from their session triangles which are below/above respectively),
        so a carrot and triangle on the same bar are spatially separated and both always
        render. (2) Added Avg Move row below each Price Move row in the Signal Performance
        dashboard. Shows average winning move and average losing move (total ÷ count).
        f_fmtAvg(float total, int count) returns "--" when count==0 to avoid division
        by zero. statsDash expanded from 16 to 19 rows (new rows 6, 12, 18).
- v2.5: Three changes: (1) Added Avg Net row to each tracking section of statsDash
        (below Avg Move). Formula: net price move / total signals. Displayed as a single
        merged cell (green/red bg). statsDash expanded from 19 to 22 rows. (2) Added new
        Evaluation Dashboard (evalDash, 4×9 table). Shows: bias + signal quality, composite
        probability, confluence score, and Date Range perf stats (Overall W/L, Price Move,
        Avg Move, Avg Net). Controlled by i_showEval (default ON) and i_evalPos (default
        Top Left). (3) Changed defaults: i_showTable and i_showStats now default OFF so the
        Evaluation Dashboard is the only visible panel on fresh load.
        Bug fixed same version: CE10156 in Section 14C — multi-line ternary color
        declarations in if-block scope collapsed to single lines.
- v2.6: Redesigned evalDash layout for clarity. Old row 1 had two unlabeled colored
        boxes (bias + signal quality side by side) — unreadable without context. Fix:
        each metric now has its own labeled row: row 1 = "Bias" label + value (cols 1-3),
        row 2 = "Signal" label + value (cols 1-3), rows 3-4 unchanged. Avg Net removed
        as a standalone row; now occupies the 4th column (col 3) of the Avg Move row
        (row 8), eliminating the empty box that was there. Table stays 4×9.
