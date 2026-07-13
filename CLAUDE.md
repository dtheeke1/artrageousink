# Markov Regime Bias — Project Rules

## PERMANENT DISPLAY RULE
After EVERY change to MarkovRegimeBias.pine, display the FULL copyable Pine Script in chat.
No exceptions — the user pastes the full script into TradingView each time.

## PERMANENT ONE-BLOCK RULE — NEVER SPLIT THE SCRIPT
ALWAYS output the complete Pine Script in ONE single continuous code block.
NEVER split into Block 1 / Block 2 or any multiple parts for any reason.

WHY THIS IS CRITICAL — VERSION INTEGRITY:
Each version (v1.3, v2.0, v5.2, etc.) must exist as a single complete artifact in the conversation
history. If a version is split across blocks, it does not exist as a coherent whole. Future sessions
cannot retrieve it intact. Fixes applied to a split version go into the wrong piece. The entire
version history becomes unreliable and the workflow breaks.

If the script is too long to fit in one response, that is a token-limit problem — do NOT solve it by splitting.
Instead: output the full script as one block and accept that it may be truncated; the user will ask for the tail separately if needed.
ONE BLOCK. ALWAYS. No exceptions.

## PERMANENT GITHUB URL RULE
Whenever the script output is truncated (chat cuts off before the end of the script), ALWAYS
provide this raw GitHub URL so the user can access the complete file:
https://raw.githubusercontent.com/dtheeke1/artrageousink/claude/markov-regime-pine-script-gq5eu6/MarkovRegimeBias.pine

How to detect truncation: if the last line of the code block is not `// END OF SCRIPT` or the
closing line of the indicator, the output was truncated — append the URL immediately after the block.

## PERMANENT VERSION RULE
Update the version number in EVERY new version of the script:
- Indicator title string: `"Markov Regime Bias  vX.Y"`
- Indicator shorttitle: `"MRB vX.Y"`
- The stats dashboard title cell: `"SIGNAL PERFORMANCE  [MRB vX.Y]"`
- Eval dashboard title cell: `"EVALUATION  [MRB vX.Y]"`
- Current version: **v5.14** — next must be v5.15

## COMMIT AND PUSH AFTER EVERY CHANGE
Branch: `claude/markov-regime-pine-script-gq5eu6`
1. `git add MarkovRegimeBias.pine CLAUDE.md`
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
- v5.3: Fixed NEXT SESSION rows 8-11 in evalDash showing dashes in Replay mode.
        Root cause: rows 8-11 were gated by `if barstate.isconfirmed` inside the
        `if barstate.islast` block. In TradingView Replay, the paused bar has
        barstate.islast=true but barstate.isconfirmed=false — so the populated
        branch never fired and dashes always showed. On the live chart both flags
        are true simultaneously (Friday close IS the last bar), so it worked there.
        Fix: same pattern as v4.0 carrot fix — introduced 6 persistent `var`
        variables (_savedBiasDirLO, _savedSigQualityLO, _savedCompProbLO,
        _savedConfScoreLO, _savedIsHighLO, _savedIsMediumLO) in Section 13C.
        Updated only on barstate.isconfirmed. evalDash rows 8-11 now display
        the saved values unconditionally, removing the isconfirmed/else branch.
- v5.4: Two fixes. (1) NEXT SESSION Signal not showing HIGH even when Composite
        and Confluence meet thresholds: root cause was isSignalHighLO using
        `macdAligned` (which checks main biasDir) instead of a proper
        `macdAlignedLO` that checks biasDirLO. When current session is bearish
        but next session flips bullish and MACD is bullish, `macdAligned` was
        false → LO HIGH suppressed incorrectly. Fixed: added `macdAlignedLO`
        variable; isSignalHighLO now uses it. Also added isSignalHighRawLO and
        enhanced sigQualityLO to emit "MEDIUM  (ext)" / "MEDIUM  (MACD)" when
        a filter is the reason for not reaching HIGH (same annotation pattern as
        CURRENT SESSION). (2) NEXT SESSION and CURRENT SESSION showing identical
        data on many tickers: root cause was v5.3's saved-value approach
        snapshotting at barstate.isconfirmed (Friday's close), where resStateLO
        == resState (both reference the same just-closed weekly bar) → identical
        signals. Fix: removed Section 13C saved variables entirely; evalDash rows
        8-11 now use live LO variables directly. Mid-week on an open weekly bar,
        biasDirLO (lookahead_on) sees the in-progress current week while biasDir
        (lookahead_off) sees last week → CURRENT and NEXT SESSION show genuinely
        different readings. At Friday's confirmed close they naturally match
        (correct behavior — same just-closed bar). Also fixes Replay display
        without needing any isconfirmed gate.
- v5.5: Two fixes. (1) Confirmed session triangle not appearing on same-resolution
        charts (weekly chart + weekly resolution): root cause was `isResUpdate and
        barstate.isconfirmed` never being simultaneously true — isResUpdate fires
        at bar OPEN (bar_index changes) while barstate.isconfirmed fires at bar
        CLOSE. Fix: added `_pendingResBar` flag (set at isResUpdate, cleared at
        isConfirmedResBar); `isConfirmedResBar = _pendingResBar and
        barstate.isconfirmed` fires correctly at bar close on all chart resolutions.
        (2) CURRENT SESSION and NEXT SESSION showing identical data: root cause was
        evalDash CURRENT SESSION using live signal (same as LO) on same-resolution
        chart. Fix: introduced `_cs*` snapshot variables (Section 9D) updated only
        at isConfirmedResBar; evalDash CURRENT SESSION rows 2-5 use `_cs*` (prior
        confirmed close) while NEXT SESSION uses live LO variables.
- v5.6: REVERTED — triangle position change (bar_index+1 to bar_index) was wrong and
        created visual confusion. The underlying CURRENT SESSION data mismatch bug was
        not addressed. Do not use v5.6.
- v5.7: Fixed CURRENT SESSION data mismatch. Root cause: Section 9D snapshotted
        main-signal (lookahead_off) values at isConfirmedResBar, but NEXT SESSION
        displays LO (lookahead_on) values. The two paths diverge because the transition
        matrix update fires at isResUpdate (bar OPEN) — so at isConfirmedResBar the
        matrix is one bar behind relative to resStateLO, causing biasDir to differ from
        biasDirLO even on the same closed bar. Fix: changed all 8 _cs* snapshot
        assignments to capture LO values (biasDirLO, isSignalHighLO, compositeProbLO,
        confScoreLO, etc.) at isConfirmedResBar. CURRENT SESSION on bar N+1 now shows
        exactly the prediction NEXT SESSION displayed during bar N — data transfers
        correctly between sessions in both live and replay mode.
        Also reverted v5.6 triangle position back to x=bar_index+1 (v5.5 behavior).
- v5.8: Fixed CURRENT SESSION = NEXT SESSION identical-data bug (two-cycle staging).
        Root cause: snapping _cs* directly at isConfirmedResBar (bar N close) meant that
        on weekends barstate.islast is still bar N, so _cs* = NEXT SESSION = identical.
        Fix: two-cycle staging. Cycle 1 (isConfirmedResBar): stage bar N's signal in
        _pending* vars. Cycle 2 (isResUpdate, bar N+1 open): promote _pending* → _cs*.
        During bar N, _cs* holds bar N-1's prediction. On weekends _cs* stays at bar N-1's
        prediction while NEXT SESSION shows bar N's prediction — guaranteed different.
        BUG IN v5.8: _pending* was staged using MAIN signal values (biasDir, compositeProb,
        etc.) instead of LO values. At isConfirmedResBar, biasDir ≠ biasDirLO because the
        second-order Markov pair differs (main: stateBuffer[N-2]/[N-1]; LO: [N-1]/resStateLO).
        CURRENT SESSION therefore showed wrong values (main signal instead of what NEXT
        SESSION had been displaying). Fixed in v5.9.
- v5.9: Two fixes. (1) CURRENT SESSION wrong values: changed Section 9D Cycle 1 to stage
        LO values (_pendingBiasDir := biasDirLO, etc.) so CURRENT SESSION always shows
        exactly what NEXT SESSION was showing on the prior bar. (2) Date bug: "Starts"
        date showed Sunday for holiday-shortened weeks (Thursday close + 3 days = Sunday).
        Fix: `9 - dayofweek(time_close, "UTC")` computes exact days to next Monday for
        any close day (Friday dow=6 → 3 days, Thursday dow=5 → 4 days).
        BUG REMAINED: the two-cycle staging (Cycle 1 at isConfirmedResBar, Cycle 2 at
        isResUpdate) collapses for ALL historical bars because barstate.isconfirmed=true
        always, making both cycles fire on the same tick. Additionally, biasDirLO during
        historical processing uses a different Markov pair than during replay: historical
        bars push the current bar's confirmed state (N State) to stateBuffer, while replay
        unconfirmed bars push the previous confirmed state (N-2 State) — different Layer 2
        pairs produce different bias directions.
- v5.10: Replaced broken two-cycle staging (Section 9D) with direct prior-session LO
        recompute. On bar N, the CURRENT SESSION signal is recomputed using:
          resStateLO[1]              → bar N-1's LO state (matches replay resStateLO)
          stateBuffer[size-3]        → bar N-2 State (matches stateBuffer[-1] in replay)
          Layer 2 pair = (N-2) × (N-1 LO) → exact pair NEXT SESSION used during bar N-1
        All non-Markov layers use [1] (prior bar) values: VIX, MTF, MACD, exhaustion,
        duration. This eliminates the CURRENT SESSION = NEXT SESSION identity bug and
        shows the correct prior-session prediction regardless of historical vs replay mode.
        Removed all _pending* and _cs* var variables; removed isConfirmedResBar dependency.
- v5.11: Fixed ~2% composite probability discrepancy between CURRENT SESSION and NEXT SESSION.
        Root cause: v5.10 used bar N's transCount/trans2 for CURRENT SESSION recompute, but
        those arrays contain 2 extra historical transitions not yet present during bar N-1's
        replay pause: (N-2→N-1 and (N-3,N-2)→N-1) added at bar N-1's historical isResUpdate,
        and (N-1→N and (N-2,N-1)→N) added at bar N's historical isResUpdate. Replay instead
        added spurious N-2→N-2 and (N-3,N-2)→N-2 self-transitions (from the unconfirmed
        bar push). Fix: array.copy transCount and trans2, undo the 2 historical additions,
        add the spurious replay transition. Layers 1 and 2 now read matrices that exactly
        match what NEXT SESSION was reading during bar N-1's replay-paused state.
- v5.12: Fixed residual composite probability discrepancy from duration boost mismatch.
        Root cause: Section 9D (CURRENT SESSION) used `regimeDuration[1]` (the raw count
        at bar N-1) for the duration boost, but NEXT SESSION's `_durationLO` formula is
        `regimeDuration + 1` when the regime continues (adds the +1 for the LO bar), or
        resets to `1` on a regime change. Using `regimeDuration[1]` was correct for the
        streak case (off by only 1 bar, < 0.3%), but catastrophically wrong on regime
        changes: NEXT SESSION resets to duration=1 (boost ≈ 0.3), while CURRENT SESSION
        kept the OLD streak count (e.g. 10 bars → boost 3.0) — a ~2.7% discrepancy.
        Fix: changed `_durBoostCS` to use `_durationLO[1]` (bar N-1's NEXT SESSION
        duration value) so CURRENT SESSION exactly reuses what NEXT SESSION computed.
- v5.13: Fixed circular performance measurement bug (0 losses for bearish signals).
        Root cause: Section 9B gated on `isSignalHigh and biasDir != 0` (bar N's own
        signal) and measured bar N's `close vs open`. A BEARISH signal fires because
        bar N's 5-week return is negative → bar N closed down → trivially counted as
        a win every time → 0 losses. The chart triangles (v4.1 fix) already display
        bar N-1's signal on bar N's candle, so stats must match.
        Fix: changed gate to `isSignalHigh[1] and biasDir[1] != 0` (prior bar's
        confirmed signal) and all biasDir references inside the block to `biasDir[1]`.
        Date range check changed from `time` to `time[1]` (signal bar's timestamp).
        Win/loss now measured as "did bar N close in the direction bar N-1 predicted?"
        — non-circular. Bear signals on up-weeks will now count as losses.
- v5.14: Fixed date-range fencepost (win count off by 1). Root cause: v5.13 changed the
        date range check from `time` to `time[1]` (signal bar N-1's timestamp). A signal
        whose N-1 bar falls just before i_drStart was excluded even though its visual
        triangle (placed at bar N+1) is inside the range. Fix: reverted date range check
        to `time >= i_drStart` (outcome bar N's timestamp), which aligns with the user's
        visual count of triangles visible in the selected date range.
