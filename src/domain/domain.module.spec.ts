import { Test, TestingModule } from '@nestjs/testing';
import { DomainModule } from './domain.module';
import {
  ProfileService,
  ExperienceService,
  ProjectService,
  SkillService,
} from './services';
import { DataLoaderFactory } from './dataloaders';
import { PrismaService } from '../persistence/prisma.service';

describe('DomainModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DomainModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        profile: { findFirst: vi.fn(), findUnique: vi.fn() },
        experience: { findMany: vi.fn() },
        project: { findMany: vi.fn() },
        skill: { findMany: vi.fn() },
        profileSkill: { findMany: vi.fn() },
        achievement: { findMany: vi.fn() },
        profileLink: { findMany: vi.fn() },
        $connect: vi.fn(),
        $disconnect: vi.fn(),
      })
      .compile();
  });

  it('should compile and provide all domain services', () => {
    expect(module).toBeDefined();
    expect(module.get<ProfileService>(ProfileService)).toBeDefined();
    expect(module.get<ExperienceService>(ExperienceService)).toBeDefined();
    expect(module.get<ProjectService>(ProjectService)).toBeDefined();
    expect(module.get<SkillService>(SkillService)).toBeDefined();
    expect(module.get<DataLoaderFactory>(DataLoaderFactory)).toBeDefined();
  });
});
