import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SyncNotesDto } from './dto/sync-notes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Post()
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(req.user.userId, createNoteDto);
  }

  @Post('sync')
  sync(@Request() req, @Body() syncDto: SyncNotesDto) {
    return this.notesService.sync(req.user.userId, syncDto);
  }

  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    return this.notesService.findAll(req.user.userId, search);
  }

  @Get('trash')
  findTrashed(@Request() req) {
    return this.notesService.findTrashed(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.update(req.user.userId, id, updateNoteDto);
  }

  @Patch(':id/restore')
  restore(@Request() req, @Param('id') id: string) {
    return this.notesService.restore(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.userId, id);
  }

  @Delete(':id/permanent')
  permanentDelete(@Request() req, @Param('id') id: string) {
    return this.notesService.permanentDelete(req.user.userId, id);
  }
}
