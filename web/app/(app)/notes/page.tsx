"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { getNotes } from "@/lib/api/notes";
import { getTags } from "@/lib/api/tags";
import { Header } from "@/components/app/header";
import { NoteCard } from "@/components/app/note-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

const masonryBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
};

export default function NotesPage() {
  const searchParams = useSearchParams();
  const tagIdParam = searchParams.get("tagId");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["notes", tagIdParam],
    queryFn: () => getNotes({ tagId: tagIdParam || undefined }),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }, [notes, searchQuery]);

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  // Get selected tag
  const selectedTag = tagIdParam
    ? tags.find((tag) => tag.id === tagIdParam)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 p-4 lg:p-8">
        {/* Tag filter indicator */}
        {selectedTag && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50">
              <span className="text-sm text-muted-foreground">Filtering by</span>
              <Badge
                variant="secondary"
                className="gap-1.5"
                style={{
                  backgroundColor: selectedTag.color
                    ? `${selectedTag.color}20`
                    : undefined,
                  color: selectedTag.color || undefined,
                }}
              >
                {selectedTag.name}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                asChild
              >
                <Link href="/notes">
                  <X className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {notesLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            {searchQuery ? (
              <>
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium text-muted-foreground">
                  No matching notes found
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-accent/70" />
                </div>
                <h3 className="text-xl font-medium text-foreground">
                  Capture your ideas here
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first note to get started
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2 px-1">
                  <span>Pinned</span>
                  <span className="text-muted-foreground/50">({pinnedNotes.length})</span>
                </h2>
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="masonry-grid"
                  columnClassName="masonry-grid-column"
                >
                  {pinnedNotes.map((note, index) => (
                    <NoteCard key={note.id} note={note} index={index} />
                  ))}
                </Masonry>
              </section>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <section>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">
                    Others
                  </h2>
                )}
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="masonry-grid"
                  columnClassName="masonry-grid-column"
                >
                  {unpinnedNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={pinnedNotes.length + index}
                    />
                  ))}
                </Masonry>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
