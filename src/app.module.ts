import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { PersistenceModule } from './persistence/persistence.module';
import { DomainModule } from './domain/domain.module';
import { PresentationModule } from './presentation/presentation.module';
import { DataLoaderFactory } from './domain/dataloaders';

@Module({
  imports: [
    PersistenceModule,
    DomainModule,
    PresentationModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DomainModule],
      inject: [DataLoaderFactory],
      useFactory: (dataLoaderFactory: DataLoaderFactory) => ({
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        playground: false,
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({ embed: true }) as any,
        ],
        context: ({ req, res }: { req: unknown; res: unknown }) => ({
          req,
          res,
          loaders: dataLoaderFactory.createDataLoaders(),
        }),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
