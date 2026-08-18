export const RECEIPT_COPY_UNAVAILABLE = Object.freeze({
  status: "unavailable",
  reason: "receipt-dependent",
} as const);

export type ReceiptCopyUnavailable = typeof RECEIPT_COPY_UNAVAILABLE;
export type InboxTriageCopyValue = string | ReceiptCopyUnavailable;

type ReceiptCopyTask =
  | 143
  | 144
  | 147
  | 148
  | 150
  | 151
  | 153
  | 154
  | 157
  | 160
  | 162;

export interface InboxTriageCopy {
  readonly sectionNames: {
    readonly scratchPool: string;
    readonly breakdown: string;
    readonly staging: string;
    readonly stagingNodes: string;
    readonly stagingBits: string;
    readonly gridExplorer: string;
  };
  readonly baseActions: {
    readonly add: string;
    readonly edit: string;
    readonly delete: string;
    readonly save: string;
    readonly cancel: string;
    readonly clearSearch: string;
    readonly expandScratchPool: string;
    readonly collapseScratchPool: string;
    readonly sortNewestFirst: string;
    readonly sortOldestFirst: string;
  };
  readonly validation: {
    readonly scratchTitleRequired: InboxTriageCopyValue;
    readonly breakdownContentRequired: InboxTriageCopyValue;
    readonly resultTitleRequired: InboxTriageCopyValue;
    readonly resultTitleTooLong: InboxTriageCopyValue;
  };
  readonly inlineEditor: {
    readonly status: {
      readonly pristine: string;
      readonly dirty: string;
      readonly saving: string;
      readonly savingBeforeContinuing: string;
      readonly offline: string;
      readonly notApplied: string;
      readonly reconciling: string;
      readonly saved: string;
    };
    readonly conflict: {
      readonly heading: string;
      readonly latest: string;
      readonly draft: string;
      readonly useMine: string;
      readonly useLatest: string;
      readonly copyDraft: string;
      readonly latestUpdated: string;
    };
    readonly recovery: {
      readonly heading: string;
      readonly scratchInvalid: string;
      readonly breakdownInvalid: string;
      readonly review: string;
      readonly copied: string;
      readonly close: string;
    };
    readonly actions: {
      readonly retrySave: string;
      readonly stayHere: string;
    };
  };
  readonly departure: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly description: string;
    readonly continueAction: string;
    readonly discardAction: string;
  };
  readonly externalRemoval: {
    readonly title: {
      readonly archive: string;
      readonly delete: string;
    };
    readonly destination: {
      readonly running: string;
      readonly runningSearchEmpty: string;
      readonly runningInboxEmpty: string;
      readonly paused: string;
      readonly pausedSearchEmpty: string;
      readonly pausedInboxEmpty: string;
    };
    readonly drafts: {
      readonly heading: string;
      readonly explanation: string;
      readonly add: string;
      readonly scratchTitle: string;
      readonly breakdown: string;
      readonly copy: string;
      readonly copied: string;
    };
    readonly actions: {
      readonly moveNow: string;
      readonly pause: string;
      readonly resume: string;
    };
  };
  readonly lifecycleReasons: {
    readonly externalScratchRemoval: InboxTriageCopyValue;
    readonly poolLifecycleUpdate: InboxTriageCopyValue;
    readonly stagingSourceUnavailable: InboxTriageCopyValue;
    readonly explorerPathFallback: InboxTriageCopyValue;
    readonly placementStale: InboxTriageCopyValue;
    readonly undoUnavailable: InboxTriageCopyValue;
    readonly completionWithdrawal: InboxTriageCopyValue;
    readonly archiveRecovery: InboxTriageCopyValue;
  };
  readonly liveRegions: {
    readonly inlineEditor: InboxTriageCopyValue;
    readonly departure: InboxTriageCopyValue;
    readonly externalRemoval: InboxTriageCopyValue;
    readonly reliability: InboxTriageCopyValue;
    readonly poolActivity: InboxTriageCopyValue;
    readonly stagingActivity: InboxTriageCopyValue;
    readonly success: InboxTriageCopyValue;
    readonly explorerActivity: InboxTriageCopyValue;
    readonly explorerSearch: InboxTriageCopyValue;
    readonly placement: InboxTriageCopyValue;
    readonly resultTitle: InboxTriageCopyValue;
    readonly newlyPlacedUndo: InboxTriageCopyValue;
    readonly completion: InboxTriageCopyValue;
    readonly archive: InboxTriageCopyValue;
  };
  readonly accessibleNames: {
    readonly scratchPool: string;
    readonly breakdown: string;
    readonly staging: string;
    readonly stagingNodes: string;
    readonly stagingBits: string;
    readonly gridExplorer: string;
    readonly searchScratches: string;
    readonly clearPoolSearch: string;
  };
  readonly receiptDependent: Readonly<
    Record<ReceiptCopyTask, ReceiptCopyUnavailable>
  >;
}

const UNAVAILABLE = RECEIPT_COPY_UNAVAILABLE;

export const INBOX_TRIAGE_COPY = {
  sectionNames: {
    scratchPool: "Scratch Pool",
    breakdown: "Breakdown",
    staging: "Staging",
    stagingNodes: "Nodes",
    stagingBits: "Bits",
    gridExplorer: "Grid Explorer",
  },
  baseActions: {
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    clearSearch: "Clear search",
    expandScratchPool: "Expand Scratch Pool",
    collapseScratchPool: "Collapse Scratch Pool",
    sortNewestFirst: "Sort: newest first",
    sortOldestFirst: "Sort: oldest first",
  },
  validation: {
    scratchTitleRequired: "Enter a Scratch title.",
    breakdownContentRequired: "Enter breakdown content.",
    resultTitleRequired: UNAVAILABLE,
    resultTitleTooLong: UNAVAILABLE,
  },
  inlineEditor: {
    status: {
      pristine: "No changes.",
      dirty: "Unsaved changes.",
      saving: "Saving…",
      savingBeforeContinuing: "Saving before continuing…",
      offline: "Offline. Your draft is still here.",
      notApplied: "Not saved. Your draft is still here.",
      reconciling: "Checking whether your changes were saved…",
      saved: "Saved.",
    },
    conflict: {
      heading: "This changed elsewhere.",
      latest: "Latest version",
      draft: "Your draft",
      useMine: "Use mine",
      useLatest: "Use latest",
      copyDraft: "Copy draft",
      latestUpdated: "Latest version updated.",
    },
    recovery: {
      heading: "Draft not saved",
      scratchInvalid: "This Scratch is no longer editable.",
      breakdownInvalid: "This breakdown is no longer editable.",
      review: "Review or copy your draft before closing.",
      copied: "Copied.",
      close: "Close",
    },
    actions: {
      retrySave: "Retry save",
      stayHere: "Stay here",
    },
  },
  departure: {
    eyebrow: "Unsaved Add draft",
    heading: "Keep writing?",
    description: "Continue writing here, or discard this draft and move.",
    continueAction: "Continue writing",
    discardAction: "Discard and move",
  },
  externalRemoval: {
    title: {
      archive: "This Scratch was archived elsewhere",
      delete: "This Scratch was deleted elsewhere",
    },
    destination: {
      running: "Moving to “{title}” in {seconds} seconds.",
      runningSearchEmpty:
        "No matching Scratch is visible. Clearing the selection in {seconds} seconds.",
      runningInboxEmpty:
        "No active Scratches remain. Opening the empty Inbox in {seconds} seconds.",
      paused: "Movement paused. Destination: “{title}”.",
      pausedSearchEmpty:
        "Movement paused. No matching Scratch is visible; the selection will clear.",
      pausedInboxEmpty:
        "Movement paused. No active Scratches remain; the empty Inbox will open.",
    },
    drafts: {
      heading: "Copy drafts before moving",
      explanation:
        "These drafts exist only on this page and will not move with the Scratch.",
      add: "New Breakdown draft",
      scratchTitle: "Scratch title draft",
      breakdown: "Breakdown draft",
      copy: "Copy full draft",
      copied: "Copied",
    },
    actions: { moveNow: "Move now", pause: "Pause", resume: "Resume" },
  },
  lifecycleReasons: {
    externalScratchRemoval: UNAVAILABLE,
    poolLifecycleUpdate: UNAVAILABLE,
    stagingSourceUnavailable: UNAVAILABLE,
    explorerPathFallback: UNAVAILABLE,
    placementStale: UNAVAILABLE,
    undoUnavailable: UNAVAILABLE,
    completionWithdrawal: UNAVAILABLE,
    archiveRecovery: UNAVAILABLE,
  },
  liveRegions: {
    inlineEditor: UNAVAILABLE,
    departure: UNAVAILABLE,
    externalRemoval: UNAVAILABLE,
    reliability: UNAVAILABLE,
    poolActivity: UNAVAILABLE,
    stagingActivity: UNAVAILABLE,
    success: UNAVAILABLE,
    explorerActivity: UNAVAILABLE,
    explorerSearch: UNAVAILABLE,
    placement: UNAVAILABLE,
    resultTitle: UNAVAILABLE,
    newlyPlacedUndo: UNAVAILABLE,
    completion: UNAVAILABLE,
    archive: UNAVAILABLE,
  },
  accessibleNames: {
    scratchPool: "Scratch Pool",
    breakdown: "Breakdown",
    staging: "Staging",
    stagingNodes: "Node staging zone",
    stagingBits: "Bit staging zone",
    gridExplorer: "Grid Explorer",
    searchScratches: "Search scratches",
    clearPoolSearch: "Clear search",
  },
  receiptDependent: {
    143: UNAVAILABLE,
    144: UNAVAILABLE,
    147: UNAVAILABLE,
    148: UNAVAILABLE,
    150: UNAVAILABLE,
    151: UNAVAILABLE,
    153: UNAVAILABLE,
    154: UNAVAILABLE,
    157: UNAVAILABLE,
    160: UNAVAILABLE,
    162: UNAVAILABLE,
  },
} as const satisfies InboxTriageCopy;

export function isInboxTriageCopyAvailable(
  value: InboxTriageCopyValue,
): value is string {
  return typeof value === "string";
}
