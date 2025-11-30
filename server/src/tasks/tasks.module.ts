import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotesModule],
  providers: [TasksService],
})
export class TasksModule { }
