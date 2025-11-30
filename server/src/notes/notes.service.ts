import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SyncNotesDto } from './dto/sync-notes.dto';
import { NoteState } from 'src/generated/prisma/enums';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        ...createNoteDto,
        state: NoteState.active,
        userId,
      },
    });
  }

  async findAll(userId: string, search?: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        state: NoteState.active,
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string, includeAllStates = false) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    if (!includeAllStates && note.state !== NoteState.active) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
    // Ensure note exists and belongs to user (include all states for sync scenarios)
    await this.findOne(userId, id, true);

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  // Soft delete - moves note to trash
  async remove(userId: string, id: string) {
    await this.findOne(userId, id, true);

    return this.prisma.note.update({
      where: { id },
      data: { state: NoteState.trashed },
    });
  }

  // Restore from trash
  async restore(userId: string, id: string) {
    const note = await this.findOne(userId, id, true);

    if (note.state !== NoteState.trashed) {
      throw new NotFoundException('Note is not in trash');
    }

    return this.prisma.note.update({
      where: { id },
      data: { state: NoteState.active },
    });
  }

  // Permanent delete - sets state to deleted (tombstone)
  async permanentDelete(userId: string, id: string) {
    await this.findOne(userId, id, true);

    return this.prisma.note.update({
      where: { id },
      data: { state: NoteState.deleted },
    });
  }

  // Get trashed notes
  async findTrashed(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        state: NoteState.trashed,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Purge tombstones older than retention period (30 days)
  async purgeTombstones(retentionDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.note.deleteMany({
      where: {
        state: NoteState.deleted,
        updatedAt: { lt: cutoffDate },
      },
    });

    return { purgedCount: result.count };
  }

  // Sync endpoint - handles bi-directional sync with conflict resolution
  async sync(userId: string, syncDto: SyncNotesDto) {
    const { lastSyncedAt, changes } = syncDto;
    const processedIds: string[] = [];
    const conflicts: { noteId: string; resolution: 'server' | 'client' }[] = [];

    // Process incoming changes from client
    for (const change of changes || []) {
      const existingNote = await this.prisma.note.findUnique({
        where: { id: change.id },
      });

      if (!existingNote) {
        // Note doesn't exist on server - create it
        await this.prisma.note.create({
          data: {
            id: change.id,
            title: change.title,
            content: change.content,
            isPinned: change.isPinned ?? false,
            isArchived: change.isArchived ?? false,
            color: change.color,
            state: (change.state as NoteState) ?? NoteState.active,
            userId,
          },
        });
        processedIds.push(change.id);
      } else if (existingNote.userId === userId) {
        // Note exists - compare timestamps for conflict resolution
        const clientUpdatedAt = new Date(change.updatedAt);
        const serverUpdatedAt = existingNote.updatedAt;

        if (clientUpdatedAt > serverUpdatedAt) {
          // Client wins - update server
          await this.prisma.note.update({
            where: { id: change.id },
            data: {
              title: change.title,
              content: change.content,
              isPinned: change.isPinned,
              isArchived: change.isArchived,
              color: change.color,
              state: (change.state as NoteState) ?? existingNote.state,
            },
          });
          conflicts.push({ noteId: change.id, resolution: 'client' });
        } else {
          conflicts.push({ noteId: change.id, resolution: 'server' });
        }
        processedIds.push(change.id);
      }
    }

    // Get all notes modified after lastSyncedAt (including trashed and deleted/tombstones)
    const serverChanges = await this.prisma.note.findMany({
      where: {
        userId,
        updatedAt: lastSyncedAt ? { gt: new Date(lastSyncedAt) } : undefined,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      serverChanges,
      processedIds,
      conflicts,
      syncedAt: new Date().toISOString(),
    };
  }
}
