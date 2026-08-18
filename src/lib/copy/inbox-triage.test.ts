import { describe, expect, it } from "vitest";
import {
  INBOX_TRIAGE_COPY,
  RECEIPT_COPY_UNAVAILABLE,
  isInboxTriageCopyAvailable,
} from "./inbox-triage";

describe("Inbox/Triage core-English copy", () => {
  it("owns the source-approved section names and base actions", () => {
    expect(INBOX_TRIAGE_COPY.sectionNames).toEqual({
      scratchPool: "Scratch Pool",
      breakdown: "Breakdown",
      staging: "Staging",
      stagingNodes: "Nodes",
      stagingBits: "Bits",
      gridExplorer: "Grid Explorer",
    });
    expect(INBOX_TRIAGE_COPY.baseActions).toEqual({
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
    });
  });

  it("types validation, lifecycle, and live-region keys without inventing reserved copy", () => {
    expect(Object.values(INBOX_TRIAGE_COPY.validation)).toEqual([
      "Enter a Scratch title.",
      "Enter breakdown content.",
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
    ]);
    expect(Object.values(INBOX_TRIAGE_COPY.lifecycleReasons)).toEqual([
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
      RECEIPT_COPY_UNAVAILABLE,
    ]);
    expect(Object.values(INBOX_TRIAGE_COPY.liveRegions)).toHaveLength(14);
    expect(
      Object.values(INBOX_TRIAGE_COPY.liveRegions).every(
        (value) => value === RECEIPT_COPY_UNAVAILABLE,
      ),
    ).toBe(true);
    expect(INBOX_TRIAGE_COPY.accessibleNames).toEqual({
      scratchPool: "Scratch Pool",
      breakdown: "Breakdown",
      staging: "Staging",
      stagingNodes: "Node staging zone",
      stagingBits: "Bit staging zone",
      gridExplorer: "Grid Explorer",
      searchScratches: "Search scratches",
      clearPoolSearch: "Clear search",
    });
  });

  it("owns the complete approved DP-VQ04 inline-editor wording", () => {
    expect(INBOX_TRIAGE_COPY.inlineEditor).toEqual({
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
    });
    expect(INBOX_TRIAGE_COPY.liveRegions.inlineEditor).toBe(
      RECEIPT_COPY_UNAVAILABLE,
    );
  });

  it("owns the complete approved DP-VQ03 departure wording", () => {
    expect(INBOX_TRIAGE_COPY.departure).toEqual({
      eyebrow: "Unsaved Add draft",
      heading: "Keep writing?",
      description:
        "Continue writing here, or discard this draft and move.",
      continueAction: "Continue writing",
      discardAction: "Discard and move",
    });
  });

  it("owns the complete approved DP-VQ01 external-removal wording", () => {
    expect(INBOX_TRIAGE_COPY.externalRemoval).toEqual({
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
    });
  });

  it("owns the complete approved DP-VQ05 Add/Delete reliability wording", () => {
    expect(INBOX_TRIAGE_COPY.reliability).toEqual({
      add: {
        pending: "Adding…",
        unknown: "We couldn’t confirm whether it was added.",
        reconciling: "Checking whether it was added…",
        notApplied: "Not added. Your draft is still here.",
        rejected: "Add unavailable. Your draft is still here.",
        conflict: "This Scratch changed. Your draft is still here.",
      },
      delete: {
        pending: "Deleting…",
        unknown: "We couldn’t confirm whether it was deleted.",
        reconciling: "Checking whether it was deleted…",
        notApplied: "Not deleted. This breakdown is still here.",
        rejected: "Delete unavailable. This breakdown is still here.",
        conflict: "This breakdown changed. Delete was not completed.",
      },
      actions: {
        checkAgain: "Check again",
        retryAdd: "Retry Add",
      },
    });
  });

  it("keeps every later receipt-owned copy bundle explicitly unavailable", () => {
    expect(Object.keys(INBOX_TRIAGE_COPY.receiptDependent).map(Number)).toEqual([
      144, 147, 148, 150, 151, 153, 154, 157, 160, 162,
    ]);

    for (const value of Object.values(INBOX_TRIAGE_COPY.receiptDependent)) {
      expect(value).toBe(RECEIPT_COPY_UNAVAILABLE);
      expect(isInboxTriageCopyAvailable(value)).toBe(false);
      expect(typeof value).not.toBe("string");
    }
    expect(isInboxTriageCopyAvailable(INBOX_TRIAGE_COPY.baseActions.add)).toBe(
      true,
    );
  });

  it("does not introduce locale state or a second language resource", () => {
    expect(INBOX_TRIAGE_COPY).not.toHaveProperty("locale");
    expect(INBOX_TRIAGE_COPY).not.toHaveProperty("translations");
    expect(INBOX_TRIAGE_COPY).not.toHaveProperty("ko");
  });
});
