"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
  index?: number;
}

export function NoteCard({ note, index = 0 }: NoteCardProps) {
  // Extract plain text preview from content (assuming Delta JSON or plain text)
  const getContentPreview = (content: string | null | undefined): string => {
    if (!content) return "";

    try {
      // Try to parse as Quill Delta
      const parsed = JSON.parse(content);
      if (parsed.ops) {
        return parsed.ops
          .map((op: { insert?: string }) =>
            typeof op.insert === "string" ? op.insert : ""
          )
          .join("")
          .slice(0, 200);
      }
    } catch {
      // Plain text or other format
      return content.slice(0, 200);
    }
    return "";
  };

  const preview = getContentPreview(note.content);

  // Calculate stagger delay (max 500ms for first 10 items)
  const staggerDelay = Math.min(index * 50, 500);

  return (
    <Link href={`/notes/${note.id}`} className="block">
      <Card
        className={cn(
          "group relative overflow-hidden cursor-pointer",
          "bg-card border border-border/40",
          "shadow-sm hover:shadow-lg",
          "transition-all duration-300 ease-out",
          "hover:border-border hover:-translate-y-1",
          "animate-in fade-in-0 slide-in-from-bottom-4"
        )}
        style={{
          backgroundColor: note.color || undefined,
          animationDelay: `${staggerDelay}ms`,
          animationFillMode: "backwards",
        }}
      >
        <CardContent className="p-5">
          {/* Pin indicator */}
          {note.isPinned && (
            <div className="absolute top-3 right-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                <Pin className="h-3.5 w-3.5 text-accent fill-accent" />
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-lg leading-tight mb-2 pr-8 line-clamp-2 group-hover:text-accent transition-colors duration-200">
            {note.title || "Untitled"}
          </h3>

          {/* Content Preview */}
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-6 mb-3 leading-relaxed">
              {preview}
            </p>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: tag.color
                      ? `${tag.color}20`
                      : undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded-full"
                >
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className="font-medium">
              {format(new Date(note.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
