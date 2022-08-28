import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModuleOptions } from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface";
import { DataSource } from "typeorm";

import { RepoModule } from "./repo/repo.module";
import apiConfig from "./config/api.config";
import dbConfig from "./config/database.config";
import endpointConfig from "./config/endpoint.config";
import { HealthModule } from "./health/health.module";
import { DbRepo } from "./repo/entities/repo.entity";
import { DbUser } from "./user/user.entity";
import { DbContribution } from "./contribution/contribution.entity";
import { RepoToUserVotes } from "./repo/entities/repo.to.user.votes.entity";
import { RepoToUserStars } from "./repo/entities/repo.to.user.stars.entity";
import { RepoToUserSubmissions } from "./repo/entities/repo.to.user.submissions.entity";
import { RepoToUserStargazers } from "./repo/entities/repo.to.user.stargazers.entity";
import { AuthModule } from "./auth/auth.module";
import { VoteModule } from "./vote/vote.module";
import { StarModule } from "./star/star.module";
import { StargazeModule } from "./stargaze/stargaze.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        apiConfig,
        dbConfig,
        endpointConfig
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => <TypeOrmModuleOptions>({
        type: configService.get("db.connection"),
        host: configService.get("db.host"),
        port: configService.get("db.port"),
        username: configService.get("db.username"),
        password: configService.get("db.password"),
        database: configService.get("db.database"),
        autoLoadEntities: false,
        entities: [
          DbUser,
          DbRepo,
          DbContribution,
          RepoToUserVotes,
          RepoToUserStars,
          RepoToUserSubmissions,
          RepoToUserStargazers,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    HttpModule,
    AuthModule,
    HealthModule,
    RepoModule,
    VoteModule,
    StarModule,
    StargazeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
