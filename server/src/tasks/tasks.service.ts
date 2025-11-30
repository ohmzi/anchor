import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotesService } from '../notes/notes.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly notesService: NotesService) { }

  // Run daily at 3:00 AM to purge tombstones older than 30 days
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleTombstonePurge() {
    this.logger.log('Starting scheduled tombstone purge...');

    try {
      const result = await this.notesService.purgeTombstones(30);
      this.logger.log(
        `Tombstone purge completed. Purged ${result.purgedCount} notes.`,
      );
    } catch (error) {
      this.logger.error('Tombstone purge failed:', error);
    }
  }
}
