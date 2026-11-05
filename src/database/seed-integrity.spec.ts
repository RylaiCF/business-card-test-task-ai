import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

describe('Database Seed Integrity', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
    const filePath = rawUrl.replace(/^file:/, '');
    const adapter = new PrismaBetterSqlite3({ url: filePath });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have specialist profile seeded with valid schema attributes', async () => {
    const profile = await prisma.profile.findFirst({
      where: { name: 'Kirill Gorbunov' },
    });

    expect(profile).toBeDefined();
    expect(typeof profile?.name).toBe('string');
    expect(profile?.name.length).toBeGreaterThan(0);
    expect(typeof profile?.description).toBe('string');
    expect(profile?.description.length).toBeGreaterThan(20);
  });

  it('should have profile links with valid protocol associated with profile', async () => {
    const profile = await prisma.profile.findFirst({
      where: { name: 'Kirill Gorbunov' },
      include: { profileLinks: true },
    });

    expect(profile).toBeDefined();
    expect(profile?.profileLinks.length).toBeGreaterThanOrEqual(3);

    const platforms = profile?.profileLinks.map((link) => link.platform);
    expect(platforms).toContain('GitHub');
    expect(platforms).toContain('LinkedIn');
    expect(platforms).toContain('Telegram');

    for (const link of profile!.profileLinks) {
      expect(link.url).toMatch(/^https?:\/\//);
      expect(link.profileId).toBe(profile!.id);
      expect(typeof link.platform).toBe('string');
      expect(link.platform.length).toBeGreaterThan(0);
    }
  });

  it('should have skills linked to profile', async () => {
    const skills = await prisma.skill.findMany({
      include: { profiles: true },
    });

    expect(skills.length).toBeGreaterThanOrEqual(20);

    const profile = await prisma.profile.findFirst({
      where: { name: 'Kirill Gorbunov' },
    });
    expect(profile).toBeDefined();

    const skillNames = skills.map((s) => s.name);
    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('NestJS');
    expect(skillNames).toContain('Claude Code');
    expect(skillNames).toContain('Antigravity');
    expect(skillNames).toContain('English (B2)');

    for (const skill of skills) {
      expect(typeof skill.name).toBe('string');
      expect(skill.name.length).toBeGreaterThan(0);
      expect(skill.profiles.some((ps) => ps.profileId === profile!.id)).toBe(
        true,
      );
    }
  });

  it('should have work experiences with distinct achievements and sequential ordering', async () => {
    const experiences = await prisma.experience.findMany({
      include: { achievements: { orderBy: { order: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });

    expect(experiences.length).toBe(7);
    const companies = experiences.map((e) => e.company);
    expect(companies).toEqual([
      'Robusta',
      'Yonder',
      'Lyft',
      'EPAM',
      'ScienceSoft',
      'Sportdata',
      'HQSoftware',
    ]);

    for (const exp of experiences) {
      expect(typeof exp.company).toBe('string');
      expect(exp.company.length).toBeGreaterThan(0);
      expect(typeof exp.position).toBe('string');
      expect(exp.position.length).toBeGreaterThan(0);
      expect(exp.startDate).toBeInstanceOf(Date);
      expect(exp.achievements.length).toBeGreaterThan(0);

      // Verify achievements ordering sequence
      for (let i = 0; i < exp.achievements.length; i++) {
        expect(exp.achievements[i].order).toBe(i + 1);
        expect(exp.achievements[i].description.length).toBeGreaterThan(10);
      }
    }
  });

  it('should have showcase projects satisfying schema contract', async () => {
    const projects = await prisma.project.findMany();

    expect(projects.length).toBeGreaterThanOrEqual(10);
    const projectNames = projects.map((p) => p.name);
    expect(
      projectNames.some((n) => n.includes('B2B CRM Platform')),
    ).toBe(true);
    expect(
      projectNames.some((n) => n.includes('Travel Platform')),
    ).toBe(true);
    expect(
      projectNames.some((n) => n.includes('Telematics Events Visualizer')),
    ).toBe(true);
    expect(
      projectNames.some((n) => n.includes('Drilling Rig Data Platform')),
    ).toBe(true);

    for (const proj of projects) {
      expect(typeof proj.name).toBe('string');
      expect(proj.name.length).toBeGreaterThan(0);

      if (proj.url !== null) {
        expect(proj.url).toMatch(/^https?:\/\//);
      }
    }
  });
});
