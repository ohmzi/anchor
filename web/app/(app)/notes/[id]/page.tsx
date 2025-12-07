"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Trash2,
  Pin,
  PinOff,
  Loader2,
  AlertTriangle,
  Check,
  Cloud,
} from "lucide-react";
import { getNote, createNote, updateNote, deleteNote } from "@/lib/api/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TagSelector } from "@/components/app/tag-selector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CreateNoteDto, UpdateNoteDto } from "@/lib/types";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const noteId = params.id as string;
  const isNew = noteId === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<{
    title: string;
    content: string;
    isPinned: boolean;
    tagIds: string[];
  } | null>(null);

  // Fetch existing note
  const { data: note, isLoading } = useQuery({
    queryKey: ["notes", noteId],
    queryFn: () => getNote(noteId),
    enabled: !isNew,
  });

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setIsPinned(note.isPinned);
      setSelectedTagIds(note.tags?.map((t) => t.id) || []);
      lastSavedRef.current = {
        title: note.title,
        content: note.content || "",
        isPinned: note.isPinned,
        tagIds: note.tags?.map((t) => t.id) || [],
      };
    }
  }, [note]);

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateNoteDto) => createNote(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created");
      router.replace(`/notes/${newNote.id}`);
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateNoteDto) => updateNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", noteId] });
      setHasUnsavedChanges(false);
      lastSavedRef.current = { title, content, isPinned, tagIds: selectedTagIds };
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note moved to trash");
      router.push("/notes");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  // Check for unsaved changes
  const checkUnsavedChanges = useCallback(() => {
    if (!lastSavedRef.current && isNew) {
      return title.trim() !== "" || content.trim() !== "";
    }
    if (!lastSavedRef.current) return false;

    return (
      title !== lastSavedRef.current.title ||
      content !== lastSavedRef.current.content ||
      isPinned !== lastSavedRef.current.isPinned ||
      JSON.stringify(selectedTagIds.sort()) !==
        JSON.stringify(lastSavedRef.current.tagIds.sort())
    );
  }, [title, content, isPinned, selectedTagIds, isNew]);

  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges());
  }, [checkUnsavedChanges]);

  // Auto-save with debounce
  const save = useCallback(() => {
    if (!title.trim() && !content.trim()) return;

    if (isNew) {
      createMutation.mutate({
        title: title.trim() || "Untitled",
        content: content || undefined,
        isPinned,
        tagIds: selectedTagIds,
      });
    } else {
      updateMutation.mutate({
        title: title.trim() || "Untitled",
        content: content || undefined,
        isPinned,
        tagIds: selectedTagIds,
      });
    }
  }, [title, content, isPinned, selectedTagIds, isNew, createMutation, updateMutation]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, save]);

  // Save on unmount if there are changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      save();
    }
    router.push("/notes");
  };

  const togglePin = () => {
    setIsPinned((prev) => !prev);
  };

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Loading note...</span>
        </div>
      </div>
    );
  }

  const isSaving = updateMutation.isPending || createMutation.isPending;
  const isSaved = !hasUnsavedChanges && !isSaving && !isNew;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 flex h-16 items-center justify-between",
            "border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Back to notes</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            {/* Save status indicator */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                isSaving && "bg-muted text-muted-foreground",
                hasUnsavedChanges && !isSaving && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                isSaved && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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

            <div className="h-6 w-px bg-border/50 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePin}
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

            {!isNew && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Move to trash</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 lg:px-6 py-8">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={cn(
              "border-0 bg-transparent text-3xl lg:text-4xl font-bold",
              "placeholder:text-muted-foreground/40",
              "focus-visible:ring-0 px-0 h-auto py-2 mb-4"
            )}
          />

          {/* Tags */}
          <div className="py-3 border-b border-border/30 mb-6">
            <TagSelector
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
            />
          </div>

          {/* Content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your thoughts..."
            className={cn(
              "w-full min-h-[calc(100vh-320px)] resize-none",
              "border-0 bg-transparent",
              "text-base lg:text-lg leading-relaxed",
              "placeholder:text-muted-foreground/40",
              "focus-visible:ring-0 px-0 py-0"
            )}
          />
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                Delete note?
              </DialogTitle>
              <DialogDescription className="pt-2">
                This note will be moved to trash. You can restore it within 30
                days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate();
                  setDeleteDialogOpen(false);
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Move to Trash"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
