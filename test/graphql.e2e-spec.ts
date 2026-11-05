import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';

describe('GraphQL API & N+1 Prevention (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testDbPath = path.resolve(process.cwd(), 'prisma/test.db');
  const devDbPath = path.resolve(process.cwd(), 'dev.db');

  beforeAll(async () => {
    // Set isolated test database
    if (fs.existsSync(devDbPath)) {
      fs.copyFileSync(devDbPath, testDbPath);
    }
    process.env.DATABASE_URL = `file:${testDbPath}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // file lock cleanup if needed
      }
    }
  });

  describe('Nested Profile Query (Specification Target)', () => {
    it('should successfully execute the full nested profile query with all relations', async () => {
      const fullProfileQuery = `
        query GetFullProfile {
          profile {
            name
            description
            profileLinks {
              platform
              url
            }
            skills {
              name
            }
            experience {
              company
              position
              startDate
              endDate
              isCurrent
              achievements {
                description
              }
            }
            projects {
              name
              url
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: fullProfileQuery })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const profile = response.body.data.profile;

      // 1. Profile aggregate basic fields
      expect(profile).toBeDefined();
      expect(typeof profile.name).toBe('string');
      expect(profile.name.length).toBeGreaterThan(0);
      expect(typeof profile.description).toBe('string');
      expect(profile.description.length).toBeGreaterThan(20);

      // 2. Profile Links
      expect(profile.profileLinks.length).toBeGreaterThanOrEqual(3);
      const platforms = profile.profileLinks.map(
        (l: { platform: string }) => l.platform,
      );
      expect(platforms).toContain('GitHub');
      expect(platforms).toContain('LinkedIn');
      expect(platforms).toContain('Telegram');

      // 3. Skills
      expect(profile.skills.length).toBeGreaterThanOrEqual(15);
      for (const skill of profile.skills) {
        expect(typeof skill.name).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
      }

      // 4. Experiences & Nested Achievements
      expect(profile.experience.length).toBe(7);
      const expCompanies = profile.experience.map(
        (e: { company: string }) => e.company,
      );
      expect(expCompanies).toEqual([
        'Robusta',
        'Yonder',
        'Lyft',
        'EPAM',
        'ScienceSoft',
        'Sportdata',
        'HQSoftware',
      ]);
      for (const exp of profile.experience) {
        expect(typeof exp.company).toBe('string');
        expect(exp.company.length).toBeGreaterThan(0);
        expect(typeof exp.position).toBe('string');
        expect(exp.position.length).toBeGreaterThan(0);
        expect(exp.achievements.length).toBeGreaterThan(0);
        for (const ach of exp.achievements) {
          expect(typeof ach.description).toBe('string');
          expect(ach.description.length).toBeGreaterThan(0);
        }
      }

      // 5. Projects
      expect(profile.projects.length).toBeGreaterThanOrEqual(10);
      for (const proj of profile.projects) {
        expect(typeof proj.name).toBe('string');
        expect(proj.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('N+1 Query Prevention Verification (ADR-0002)', () => {
    it('should batch nested relation queries so each relation executes exactly 1 database call', async () => {
      // Spy on Prisma methods
      const profileSpy = vi.spyOn(prisma.profile, 'findFirst');
      const profileSkillSpy = vi.spyOn(prisma.profileSkill, 'findMany');
      const experienceSpy = vi.spyOn(prisma.experience, 'findMany');
      const achievementSpy = vi.spyOn(prisma.achievement, 'findMany');
      const projectSpy = vi.spyOn(prisma.project, 'findMany');
      const profileLinkSpy = vi.spyOn(prisma.profileLink, 'findMany');

      const query = `
        query TestNPlusOne {
          profile {
            name
            skills {
              name
            }
            experience {
              company
              achievements {
                description
              }
            }
            projects {
              name
            }
            profileLinks {
              platform
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();

      // Root profile: exactly 1 query
      expect(profileSpy).toHaveBeenCalledTimes(1);

      // Skills: exactly 1 batch query for all skills of the profile (NOT 1 per skill)
      expect(profileSkillSpy).toHaveBeenCalledTimes(1);

      // Experience: exactly 1 batch query for all experiences
      expect(experienceSpy).toHaveBeenCalledTimes(1);

      // Achievements: exactly 1 batch query across ALL experiences (NOT 1 query per experience!)
      // This is the core proof of solving N+1 on nested lists
      expect(achievementSpy).toHaveBeenCalledTimes(1);

      // Projects: exactly 1 batch query
      expect(projectSpy).toHaveBeenCalledTimes(1);

      // ProfileLinks: exactly 1 batch query
      expect(profileLinkSpy).toHaveBeenCalledTimes(1);

      profileSpy.mockRestore();
      profileSkillSpy.mockRestore();
      experienceSpy.mockRestore();
      achievementSpy.mockRestore();
      projectSpy.mockRestore();
      profileLinkSpy.mockRestore();
    });
  });

  describe('Introspection & Apollo Sandbox Endpoint', () => {
    it('should respond to GraphQL schema introspection', async () => {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
            types {
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspectionQuery })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const typeNames = response.body.data.__schema.types.map(
        (t: { name: string }) => t.name,
      );

      expect(typeNames).toContain('Profile');
      expect(typeNames).toContain('ProfileLink');
      expect(typeNames).toContain('Experience');
      expect(typeNames).toContain('Achievement');
      expect(typeNames).toContain('Project');
      expect(typeNames).toContain('Skill');
      expect(typeNames).toContain('Query');
    });

    it('should serve Apollo Sandbox landing page on GET /graphql with HTML Accept header', async () => {
      const response = await request(app.getHttpServer())
        .get('/graphql')
        .set('Accept', 'text/html')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/html');
      // Apollo Sandbox local default landing page contains embed HTML / script
      expect(response.text).toMatch(/sandbox|apollo/i);
    });
  });
});
