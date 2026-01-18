import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteState } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

interface ListNotesInput {
  userId: string;
  search?: string;
  tagId?: string;
  limit?: number;
}

@Injectable()
export class HomarrIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async listNotes({ userId, search, tagId, limit }: ListNotesInput) {
    const normalizedSearch = search?.trim();
    const clampedLimit = clampLimit(limit);

    const notes = await this.prisma.note.findMany({
      where: {
        userId,
        state: NoteState.active,
        isArchived: false,
        ...(tagId && {
          tags: {
            some: { id: tagId },
          },
        }),
        OR: normalizedSearch
          ? [
            { title: { contains: normalizedSearch, mode: 'insensitive' } },
            { content: { contains: normalizedSearch, mode: 'insensitive' } },
          ]
          : undefined,
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      take: clampedLimit,
      include: {
        tags: {
          select: { id: true },
        },
      },
    });

    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      updatedAt: note.updatedAt,
      isPinned: note.isPinned,
      tagIds: note.tags.map((tag) => tag.id),
    }));
  }

  async getNote(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        tags: {
          select: { id: true },
        },
      },
    });

    if (!note || note.userId !== userId || note.state !== NoteState.active) {
      throw new NotFoundException('Note not found');
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      background: note.background,
      tagIds: note.tags.map((tag) => tag.id),
    };
  }

}

const clampLimit = (limit?: number) => {
  const value = typeof limit === 'number' && !Number.isNaN(limit) ? limit : 50;
  return Math.min(Math.max(value, 1), 200);
};
