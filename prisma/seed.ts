import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
const filePath = rawUrl.replace(/^file:/, '');
const adapter = new PrismaBetterSqlite3({ url: filePath });
const prisma = new PrismaClient({ adapter });

export async function seedDatabase(
  client: PrismaClient = prisma,
  force = process.env.FORCE_SEED === 'true',
): Promise<void> {
  console.log('Checking database seed status...');

  const existingProfile = await client.profile.findFirst({
    where: { name: 'Kirill Gorbunov' },
  });

  if (existingProfile && !force) {
    console.log(
      `Database already seeded for specialist ${existingProfile.name} (${existingProfile.id}). Skipping seed.`,
    );
    return;
  }

  if (force) {
    console.log('FORCE_SEED=true: cleaning existing portfolio records...');
    await client.profileSkill.deleteMany({});
    await client.achievement.deleteMany({});
    await client.experience.deleteMany({});
    await client.project.deleteMany({});
    await client.profileLink.deleteMany({});
    await client.skill.deleteMany({});
    await client.profile.deleteMany({});
  }

  console.log('Seeding database with Kirill Gorbunov CV portfolio data...');

  // 1. Create Profile
  const profile = await client.profile.create({
    data: {
      name: 'Kirill Gorbunov',
      description:
        'Senior Full-Stack Software Engineer with 10 years of commercial experience delivering complex, high-load web applications across frontend and backend. Skilled in TypeScript, Node.js, NestJS, React and Angular. Strong background in interactive visualizations, performance optimization, and application architecture. Experienced in working with large codebases as well as building applications from scratch. I use modern development practices, including AI-assisted tooling, to improve delivery and code quality. Mentored junior engineers and drove the adoption of best engineering practices by introducing effective processes and tools.',
      profileLinks: {
        create: [
          {
            platform: 'GitHub',
            url: 'https://github.com/rylaicf',
          },
          {
            platform: 'LinkedIn',
            url: 'https://www.linkedin.com/in/kirill-gorbunov/',
          },
          {
            platform: 'Telegram',
            url: 'https://t.me/rylaicf',
          },
        ],
      },
    },
  });

  console.log(`Created profile: ${profile.name} (${profile.id})`);

  // 2. Create Skills
  const skillsData = [
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'Node.js' },
    { name: 'NestJS' },
    { name: 'Express' },
    { name: 'GraphQL' },
    { name: 'REST' },
    { name: 'Protobuf' },
    { name: 'Kafka' },
    { name: 'Angular' },
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'React Native' },
    { name: 'HTML' },
    { name: 'CSS' },
    { name: 'SCSS' },
    { name: 'Redux' },
    { name: 'Redux Saga' },
    { name: 'MobX' },
    { name: 'NgRx' },
    { name: 'Google Maps' },
    { name: 'Mapbox' },
    { name: 'ECharts' },
    { name: 'Highcharts' },
    { name: 'Three.js' },
    { name: 'SpreadJS' },
    { name: 'Jest' },
    { name: 'React Testing Library' },
    { name: 'Playwright' },
    { name: 'Storybook' },
    { name: 'Git' },
    { name: 'Docker' },
    { name: 'Webpack' },
    { name: 'npm' },
    { name: 'Vite' },
    { name: 'PostgreSQL' },
    { name: 'MySQL' },
    { name: 'SQLite' },
    { name: 'MongoDB' },
    { name: 'Redis' },
    { name: 'Claude Code' },
    { name: 'OpenAI Codex' },
    { name: 'Antigravity' },
    { name: 'English (B2)' },
  ];

  const createdSkills = [];
  for (const skill of skillsData) {
    const s = await client.skill.create({
      data: skill,
    });
    createdSkills.push(s);

    // Link skill to profile
    await client.profileSkill.create({
      data: {
        profileId: profile.id,
        skillId: s.id,
      },
    });
  }

  console.log(`Created and linked ${createdSkills.length} skills`);

  // 3. Create Experiences with achievements
  const experiencesData = [
    {
      company: 'Robusta',
      position: 'Senior Full-Stack Engineer',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      endDate: new Date('2026-10-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Built the Partners module with funnel, kanban, activity timeline, and partner deduplication.',
          order: 1,
        },
        {
          description:
            'Designed a versioned, admin-configurable workflow engine for deal statuses and approvals.',
          order: 2,
        },
        {
          description:
            'Architected a multi-replica backend using transactional outbox, PostgreSQL locks, and SSE notifications.',
          order: 3,
        },
        {
          description:
            'Implemented two-way synchronization with an external affiliate platform in a dedicated worker pod.',
          order: 4,
        },
        {
          description:
            'Introduced a shared contract package (Zod schemas, DTOs, RBAC, self-generated OpenAPI).',
          order: 5,
        },
        {
          description:
            'Built a reusable UI kit on Mantine with design tokens and dark/light themes.',
          order: 6,
        },
        {
          description:
            'Established automated testing with isolated per-worker database tests and Playwright E2E suites.',
          order: 7,
        },
        {
          description:
            'Set up AI-assisted development practices with project-level prompts and automation skills.',
          order: 8,
        },
      ],
    },
    {
      company: 'Freelance / Contract',
      position: 'Senior Full-Stack Software Engineer',
      startDate: new Date('2025-09-01T00:00:00.000Z'),
      endDate: new Date('2026-06-30T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Developed key product modules and maintained the mobile app for a travel platform with vacation rentals and activities.',
          order: 1,
        },
        {
          description:
            'Developed features across web and mobile using React, React Native, and Next.js.',
          order: 2,
        },
        {
          description:
            'Designed and implemented microservices on NestJS, integrating PostgreSQL and Kafka.',
          order: 3,
        },
        {
          description:
            'Optimized application performance, improving page load speed and app responsiveness.',
          order: 4,
        },
      ],
    },
    {
      company: 'Lyft',
      position: 'Senior Software Engineer (Frontend / Full-Stack)',
      startDate: new Date('2022-07-01T00:00:00.000Z'),
      endDate: new Date('2024-11-30T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Developed an internal tool for visualizing vehicle telematics events during rides (GPS tracks, sensor telemetry, video recordings) on interactive maps and timelines.',
          order: 1,
        },
        {
          description:
            'Built features for analyzing insurance claims, helping teams investigate fraud and reconstruct accident scenarios.',
          order: 2,
        },
        {
          description:
            'Created interactive maps (Google Maps, Mapbox) with synchronized telemetry charts (ECharts) and custom route rendering.',
          order: 3,
        },
        {
          description:
            'Implemented custom timeline components showing sensor metrics (speed, acceleration, G-force) alongside video and route data.',
          order: 4,
        },
        {
          description:
            'Migrated frontend from Lyft-internal SDK to Next.js and React.',
          order: 5,
        },
        {
          description:
            'Built and maintained backend endpoints using Python and Go, working with internal Protobuf services and data pipelines.',
          order: 6,
        },
        {
          description:
            'Mentored junior and mid-level engineers, held 1-on-1s, conducted code reviews, and fostered engineering best practices.',
          order: 7,
        },
      ],
    },
    {
      company: 'TietoEVRY',
      position: 'Lead Software Engineer',
      startDate: new Date('2021-03-01T00:00:00.000Z'),
      endDate: new Date('2022-07-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Led frontend architecture and development for complex enterprise drilling data management platforms.',
          order: 1,
        },
        {
          description:
            'Designed frontend architecture from scratch using Angular, RxJS, and NgRx.',
          order: 2,
        },
        {
          description:
            'Built complex 2D and 3D data visualizations (well logs, trajectories, drilling data) using Highcharts, Three.js, and SpreadJS.',
          order: 3,
        },
        {
          description:
            'Implemented custom spreadsheet-like data entry components (SpreadJS) handling tens of thousands of rows.',
          order: 4,
        },
        {
          description:
            'Led and mentored a distributed frontend team, participated in hiring interviews, and conducted knowledge-sharing sessions.',
          order: 5,
        },
        {
          description:
            'Authored comprehensive technical documentation and ADRs.',
          order: 6,
        },
      ],
    },
    {
      company: 'OOO "Ailok"',
      position: 'Lead Software Engineer',
      startDate: new Date('2019-12-01T00:00:00.000Z'),
      endDate: new Date('2021-03-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Led web engineering for a cryptocurrency exchange ecosystem: web application, trading terminal, partner portal, and admin panel.',
          order: 1,
        },
        {
          description:
            'Built responsive web interfaces with React, Next.js, Redux, and Redux Saga.',
          order: 2,
        },
        {
          description:
            'Implemented real-time data streaming via WebSockets for order book, trades, and market tickers.',
          order: 3,
        },
        {
          description:
            'Designed and built an internal UI component library (Storybook) with unit tests (Jest, RTL).',
          order: 4,
        },
        {
          description:
            'Coordinated technical roadmaps and managed sprint deliverables.',
          order: 5,
        },
      ],
    },
    {
      company: 'Freelance / Contract',
      position: 'Full-Stack Software Engineer',
      startDate: new Date('2016-01-01T00:00:00.000Z'),
      endDate: new Date('2019-11-30T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Delivered custom web applications, e-commerce solutions, and content platforms.',
          order: 1,
        },
        {
          description:
            'Built frontend with React and Angular; backend with Node.js and Express.',
          order: 2,
        },
        {
          description:
            'Integrated payment gateways (Stripe, PayPal) and third-party APIs.',
          order: 3,
        },
      ],
    },
    {
      company: 'OOO "Smart Interaktiv"',
      position: 'Frontend Developer',
      startDate: new Date('2014-07-01T00:00:00.000Z'),
      endDate: new Date('2015-12-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Developed responsive web interfaces with semantic HTML, CSS, JavaScript, and jQuery.',
          order: 1,
        },
        {
          description:
            'Built cross-browser layouts and interactive UI widgets.',
          order: 2,
        },
      ],
    },
  ];

  for (const exp of experiencesData) {
    const { achievements, ...expFields } = exp;
    const createdExp = await client.experience.create({
      data: {
        ...expFields,
        profileId: profile.id,
      },
    });

    for (const ach of achievements) {
      await client.achievement.create({
        data: {
          ...ach,
          experienceId: createdExp.id,
        },
      });
    }
  }

  console.log(`Created ${experiencesData.length} experiences with achievements`);

  // 4. Create Showcase Projects
  const projectsData = [
    {
      name: 'Digital Business Card Backend',
      url: 'https://github.com/RylaiCF/business-card-test-task-ai',
    },
    {
      name: 'Internal B2B CRM Platform',
      url: null,
    },
    {
      name: 'Travel Platform',
      url: null,
    },
    {
      name: 'Vehicle Telematics Events Visualizer',
      url: null,
    },
    {
      name: 'Drilling Rig Data Platform',
      url: null,
    },
    {
      name: 'Crypto Exchange Client Applications',
      url: null,
    },
    {
      name: 'E-commerce Automation Suite',
      url: null,
    },
    {
      name: 'Social Network Web Client',
      url: null,
    },
    {
      name: 'Financial Advisory Portfolio Visualizer',
      url: null,
    },
    {
      name: 'Real Estate Marketplace',
      url: null,
    },
  ];

  for (const proj of projectsData) {
    await client.project.create({
      data: {
        ...proj,
        profileId: profile.id,
      },
    });
  }

  console.log(`Created ${projectsData.length} projects`);
  console.log('Database seeding completed successfully.');
}

if (
  require.main === module ||
  (typeof process !== 'undefined' && process.argv[1]?.includes('seed'))
) {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
