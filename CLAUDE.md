# Markov Regime Bias — Project Rules

## PERMANENT DISPLAY RULE
After EVERY change to MarkovRegimeBias.pine, display the FULL copyable Pine Script in chat.
No exceptions — the user pastes the full script into TradingView each time.

## PERMANENT ONE-BLOCK RULE — NEVER SPLIT THE SCRIPT
ALWAYS output the complete Pine Script in ONE single continuous code block.
NEVER split into Block 1 / Block 2 or any multiple parts for any reason.
If the script is too long to fit in one response, that is a token-limit problem — do NOT solve it by splitting.
Instead: output the full script as one block and accept that it may be truncated; the user will ask for the tail separately if needed.
Splitting wastes the user's tokens and requires manual concatenation. ONE BLOCK. ALWAYS.

## PERMANENT VERSION RULE
Update the version number in EVERY new version of the script:
- Indicator title string: `"Markov Regime Bias  vX.Y"`
- Indicator shorttitle: `"MRB vX.Y"`
- The stats dashboard title cell: `"SIGNAL PERFORMANCE  [MRB vX.Y]"`
- Eval dashboard title cell: `"EVALUATION  [MRB vX.Y]"`
- Current version: **v4.1** — next must be v4.2

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
- v2.7: Three default changes + evalDash readability + brightness. Defaults changed:
        i_resolution "Daily"→"Weekly", i_showMatrix true→false, i_showBgTint true→false,
        i_nextSessionMode false→true, i_evalPos "Top Left"→"Bottom Right",
        i_useExhaustion false→true. evalDash Bias row (1) text_color changed from
        biasColor to color.white — biasColor (e.g. red) on red-tinted bg was unreadable.
        evalDash Signal row (2) text_color changed from sqTxtV to color.white — orange on
        orange-tinted bg was unreadable. Brightness: all evalDash value-cell alpha values
        reduced to 0 (solid) so colors are vivid rather than faded.
- v2.8: evalDash bottom section (rows 6-8: Overall, Price Move, Avg Move) alpha set to 0
        (solid) — gray/green/red cells were faded. _sBgV changed from #0a1a2e@10 to
        #1a3a5c@0 (solid visible navy). evNetBgV green/red alpha 25→0. Added
        i_evalTblSize input (Tiny/Small/Normal/Large, default Small) in Evaluation
        Dashboard group — evalDash now has its own size control independent of
        i_statsTblSize. _sSzV now reads i_evalTblSize instead of i_statsTblSize.
- v2.9: Two bug fixes. (1) Arrow flickering mid-week (Bug 2): Extension Exhaustion
        Filter update block gated with `barstate.isconfirmed` — exhaustion flags now
        only update on closed bars, so live intraweek price on an open weekly bar
        cannot flip bullExhausted/bearExhausted and cause the session triangle to
        appear/disappear during the week. Signal is stable for the entire current
        period. (2) Replay carrot disappears (Bug 1): All 8 next-session carrot
        plotshape calls changed from offset=-1 to offset=0 (no offset). The carrot
        now draws on the isResUpdate bar itself instead of requiring the NEXT bar to
        exist, so it is visible in Replay mode. Visual change: carrot now appears at
        the START of a new session period (same bar as the session triangle, opposite
        side) rather than at the END of the prior period.
- v3.9: Fixed next-session carrot showing wrong signal. Root cause: carrot logic
        fired on `barstate.islast` (every tick of the open bar), using request.security
        data from the prior confirmed bar — so the carrot predicted "next session" using
        stale data that didn't match what the model would compute after the current bar
        closed. When replay advanced to the next bar, the triangle showed a DIFFERENT
        signal than the carrot had shown. Fix: gated carrot on `barstate.isconfirmed and
        barstate.islast` — fires exactly once when the current bar closes. Signal is
        computed from the just-confirmed close data, guaranteed to match the triangle
        that will appear when the next bar opens.
- v4.0: Fixed next-session carrot missing in replay. Root cause: v3.9's
        `barstate.isconfirmed and barstate.islast` both require TRUE simultaneously;
        in TradingView replay, when paused ON a bar, that bar is treated as "open"
        (isconfirmed=false), so the carrot never fired. Fix: introduced persistent
        `var bool _carrotBull/_carrotBear` that update only on barstate.isconfirmed
        (captured at every real bar close). The carrot then displays on barstate.islast
        (any tick of the most-recent bar in live or replay) using those saved values.
        Signal always reflects the last closed bar; carrot is always visible.
        NOTE: The session TRIANGLE and the CARROT are intentionally different:
        Triangle = model state at the OPEN of the current session (current bar data).
        Carrot = model signal from the CLOSE of the prior session (confirmed close data).
        They CAN show different directions when the market gaps — this is by design.
- v4.1: Fixed carrot/triangle mismatch. Root cause: the session triangle fired at
        isResUpdate (new bar OPEN) using biasDir/isSignalHigh from the current bar's
        OPENING state, while the carrot fired based on the PRIOR bar's CONFIRMED CLOSE
        state. Even with no price gap, the Markov lookback window shifts by one bar
        between Friday close and Monday open — different denominators in the 5-bar
        return calc — so the model can flip state without any gap. Fix: changed all
        8 session triangle plotshape calls to use biasDir[1] and isSignalHigh[1]
        (prior bar's confirmed values). Also updated performance tracking to use
        biasDir[1]/isSignalHigh[1] so stats measure "when Friday's carrot fired,
        did the next session go the predicted way?" — matching what the markers show.
        Triangle, carrot, and stats now all use the SAME data source (prior bar's
        confirmed signal) and are guaranteed to always agree.
