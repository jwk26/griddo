# Node Health Rollup + Focus + Aging — Notes

## Open Planning Questions

### OQ #2 — Aging Threshold Tuning

The proposed values (3/7/14 days) are defaults based on initial reasoning, not
empirical data. May need adjustment after real usage. Consider:

- Are 3 days too short for "Fresh" in a weekly planning rhythm?
- Does 14+ days as "Neglected" match real project cadence?
- Does opacity 0.6 remain readable across all themes (especially light themes
  with light background)?
- Should thresholds be user-configurable via settings?

Resolve after real usage or during implementation testing.

## Aging State Definitions

| State | Source | Meaning |
|-------|--------|---------|
| Fresh | Aging | Recently created or updated |
| Cooling | Aging | Settling — no action needed yet |
| Stagnant | Aging | Ignored for a while |
| Neglected | Aging | Long neglected — needs attention or archive |
| Urgent | Deadline | Overdue — needs immediate action |
| Completed | Status | Work is done |

Urgent and Completed are not aging states. They come from `deadline` and
`status`. Aging and urgency are independent systems; urgency wins visually at
rest.
