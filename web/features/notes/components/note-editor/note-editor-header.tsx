"use client";

import {
  ArrowLeft,
  Trash2,
  Pin,
  PinOff,
  Loader2,
  Check,
  Archive,
  ArchiveRestore,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  NoteBackgroundPicker,
} from "@/features/notes";
import { cn } from "@/lib/utils";

interface NoteEditorHeaderProps {
  isNew: boolean;
  isReadOnly: boolean;
  isPinned: boolean;
  isArchived: boolean;
  background: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isSaved: boolean;
  onBack: () => void;
  onTogglePin: () => void;
  onBackgroundChange: (background: string | null) => void;
  onArchiveClick: () => void;
  onDeleteClick: () => void;
  onRestoreClick: () => void;
  onPermanentDeleteClick: () => void;
  restorePending?: boolean;
  deletePending?: boolean;
  permanentDeletePending?: boolean;
  archivePending?: boolean;
  unarchivePending?: boolean;
}

export function NoteEditorHeader({
  isNew,
  isReadOnly,
  isPinned,
  isArchived,
  background,
  isSaving,
  hasUnsavedChanges,
  isSaved,
  onBack,
  onTogglePin,
  onBackgroundChange,
  onArchiveClick,
  onDeleteClick,
  onRestoreClick,
  onPermanentDeleteClick,
  restorePending = false,
  deletePending = false,
  permanentDeletePending = false,
  archivePending = false,
  unarchivePending = false,
}: NoteEditorHeaderProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <header
        className={cn(
          "sticky top-0 z-40 flex h-16 items-center justify-between",
          "border-b border-border/30 backdrop-blur-sm px-4 lg:px-6",
          "bg-background/60 dark:bg-background/40"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Back to notes</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2">
          {/* Save status indicator (hidden when read-only) */}
          {!isReadOnly && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                "backdrop-blur-sm",
                isSaving && "bg-muted/80 text-muted-foreground",
                hasUnsavedChanges &&
                  !isSaving &&
                  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                isSaved && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved</span>
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Saved</span>
                </>
              ) : null}
            </div>
          )}

          {/* Read-only indicator */}
          {isReadOnly && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm bg-muted/80 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Read-only</span>
            </div>
          )}

          <div className="h-6 w-px bg-border/50 mx-1" />

          {!isReadOnly && (
            <>
              <NoteBackgroundPicker
                selectedBackground={background}
                onBackgroundChange={onBackgroundChange}
                disabled={isReadOnly}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onTogglePin}
                    disabled={isReadOnly}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-colors",
                      isPinned
                        ? "text-accent bg-accent/10 hover:bg-accent/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isPinned ? (
                      <Pin className="h-4 w-4 fill-current" />
                    ) : (
                      <PinOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isPinned ? "Unpin note" : "Pin note"}
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {!isNew && (
            <>
              {isReadOnly ? (
                <>
                  {/* Restore button (only for trashed notes) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRestoreClick}
                        disabled={restorePending}
                        className={cn(
                          "h-9 w-9 rounded-xl transition-colors",
                          isReadOnly
                            ? "text-primary bg-primary/10 hover:bg-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Restore note</TooltipContent>
                  </Tooltip>

                  {/* Permanent Delete button (only for trashed notes) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPermanentDeleteClick}
                        disabled={permanentDeletePending}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {permanentDeletePending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete forever</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onArchiveClick}
                        className={cn(
                          "h-9 w-9 rounded-xl transition-colors",
                          isArchived
                            ? "text-primary bg-primary/10 hover:bg-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isArchived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isArchived ? "Unarchive note" : "Archive note"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDeleteClick}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Move to trash</TooltipContent>
                  </Tooltip>
                </>
              )}
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}

