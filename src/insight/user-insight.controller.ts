import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { SupabaseGuard } from "../auth/supabase.guard";
import { UserId } from "../auth/supabase.user.decorator";
import { ApiPaginatedResponse } from "../common/decorators/api-paginated-response.decorator";
import { PageDto } from "../common/dtos/page.dto";

import { InsightPageOptionsDto } from "./dtos/insight-page-options.dto";
import { DbInsight } from "./entities/insight.entity";
import { InsightsService } from "./insights.service";

@Controller("user/insights")
@ApiTags("Insights service")
export class UserInsightsController {
  constructor (
    private readonly insightsService: InsightsService,
  ) {}

  @Get("/")
  @ApiOperation({
    operationId: "findAllInsightsByUserId",
    summary: "Listing all insights for a user and paginate them",
  })
  @ApiBearerAuth()
  @UseGuards(SupabaseGuard)
  @ApiPaginatedResponse(DbInsight)
  @ApiOkResponse({ type: DbInsight })
  @ApiNotFoundResponse({ description: "Insights not found" })
  async findAllInsightsByUserId (
    @Query() pageOptionsDto: InsightPageOptionsDto,
      @UserId() userId: string,
  ): Promise<PageDto<DbInsight>> {
    return this.insightsService.findAllByUserId(pageOptionsDto, userId);
  }

  @Post("/")
  @ApiOperation({
    operationId: "addInsightForUser",
    summary: "Adds a new insight page for the authenticated user",
  })
  @ApiBearerAuth()
  @UseGuards(SupabaseGuard)
  @ApiOkResponse({ type: DbInsight })
  @ApiNotFoundResponse({ description: "Unable to add user insight" })
  async addInsightForUser (
    @Body() body: string,
      @UserId() userId: string,
  ): Promise<DbInsight> {
    const newInsight = (JSON.parse(body) || {}) as DbInsight;

    return this.insightsService.addInsight({ ...newInsight, user_id: parseInt(userId) } as DbInsight);
  }
}