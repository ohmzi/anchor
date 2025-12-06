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
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { SyncTagsDto } from './dto/sync-tags.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Request() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.userId, createTagDto);
  }

  @Post('sync')
  sync(@Request() req, @Body() syncDto: SyncTagsDto) {
    return this.tagsService.sync(req.user.userId, syncDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.tagsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tagsService.findOne(req.user.userId, id);
  }

  @Get(':id/notes')
  getNotesByTag(@Request() req, @Param('id') id: string) {
    return this.tagsService.getNotesByTag(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(req.user.userId, id, updateTagDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tagsService.remove(req.user.userId, id);
  }
}

