import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HomarrIntegrationGuard } from './homarr-integration.guard';
import { HomarrIntegrationService } from './homarr-integration.service';
import { HomarrIntegrationUserId } from './homarr-integration-user-id.decorator';

@Controller('api/integrations/homarr')
@UseGuards(HomarrIntegrationGuard)
export class HomarrIntegrationController {
  constructor(private readonly homarrIntegrationService: HomarrIntegrationService) { }

  @Get('notes')
  listNotes(
    @HomarrIntegrationUserId() userId: string,
    @Query('search') search?: string,
    @Query('tagId') tagId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.homarrIntegrationService.listNotes({
      userId,
      search,
      tagId,
      limit: parseLimit(limit),
    });
  }

  @Get('notes/:id')
  getNote(
    @HomarrIntegrationUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.homarrIntegrationService.getNote(userId, id);
  }
}

const parseLimit = (limit?: string) => {
  if (!limit) return undefined;

  const parsed = Number.parseInt(limit, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
