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

  const hasResumeCompanies = await client.experience.findFirst({
    where: { company: 'Yonder' },
  });

  const needsReSeed = force || !existingProfile || !hasResumeCompanies;

  if (!needsReSeed && existingProfile) {
    console.log(
      `Database already seeded with verified resume data for ${existingProfile.name} (${existingProfile.id}). Skipping seed.`,
    );
    return;
  }

  console.log('Cleaning and re-seeding database with verified resume data...');
  await client.profileSkill.deleteMany({});
  await client.achievement.deleteMany({});
  await client.experience.deleteMany({});
  await client.project.deleteMany({});
  await client.profileLink.deleteMany({});
  await client.skill.deleteMany({});
  await client.profile.deleteMany({});

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

  // 2. Create Skills (categorized exactly according to Page 1 of resume)
  const skillsData = [
    // Core
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    // Backend
    { name: 'Node.js' },
    { name: 'NestJS' },
    { name: 'Express' },
    { name: 'GraphQL' },
    { name: 'REST' },
    { name: 'Protobuf' },
    { name: 'Kafka' },
    // Frontend
    { name: 'Angular' },
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'React Native' },
    { name: 'HTML' },
    { name: 'CSS' },
    { name: 'SCSS' },
    // State Management
    { name: 'Redux' },
    { name: 'Redux Saga' },
    { name: 'MobX' },
    { name: 'NgRx' },
    // Data & Visualization
    { name: 'Google Maps' },
    { name: 'Mapbox' },
    { name: 'ECharts' },
    { name: 'Highcharts' },
    { name: 'Three.js' },
    { name: 'SpreadJS' },
    // Testing
    { name: 'Jest' },
    { name: 'React Testing Library' },
    { name: 'Playwright' },
    { name: 'Storybook' },
    // Tooling
    { name: 'Git' },
    { name: 'Docker' },
    { name: 'Webpack' },
    { name: 'npm' },
    { name: 'Vite' },
    // Databases
    { name: 'PostgreSQL' },
    { name: 'MySQL' },
    { name: 'SQLite' },
    { name: 'MongoDB' },
    { name: 'Redis' },
    // AI-Assisted Development
    { name: 'Claude Code' },
    { name: 'OpenAI Codex' },
    { name: 'Antigravity' },
    // Language
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

  // 3. Create Experiences with achievements (7 companies from Page 1 of resume)
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
            'Engineered an AI-agent workflow with a custom TypeScript LSP MCP server and verification skills.',
          order: 8,
        },
      ],
    },
    {
      company: 'Yonder',
      position: 'Senior Full-Stack Engineer',
      startDate: new Date('2024-05-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Created reusable UI-kit components for a travel platform connecting guests with property owners and activity providers.',
          order: 1,
        },
        {
          description:
            'Integrated Stripe API for processing secure online transactions, bookings, and payments.',
          order: 2,
        },
        {
          description:
            'Designed end-to-end localization architecture supporting seamless multi-language delivery.',
          order: 3,
        },
        {
          description:
            'Implemented automated E2E tests ensuring reliable cross-browser and platform stability.',
          order: 4,
        },
        {
          description:
            'Introduced API client code generation, reducing frontend-backend integration time by 40% and eliminating type-mismatch bugs.',
          order: 5,
        },
        {
          description:
            'Handled real-time data streams and instant updates through WebSocket connections.',
          order: 6,
        },
      ],
    },
    {
      company: 'Lyft',
      position: 'Senior Software Engineer (Frontend / Full-Stack)',
      startDate: new Date('2022-09-01T00:00:00.000Z'),
      endDate: new Date('2024-04-30T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Built an internal tool for visualizing vehicle telematics events during rides on interactive maps and timelines, reducing claims processing time by ~30% and eliminating manual data entry.',
          order: 1,
        },
        {
          description:
            'Built map and timeline visualizations from scratch using Google Maps, Mapbox, and Apache ECharts.',
          order: 2,
        },
        {
          description:
            'Integrated the visualization platform directly with Lyft internal workflow tools.',
          order: 3,
        },
        {
          description:
            'Built an aggregation service that collected telematics and ride data from multiple sources for unified visualization.',
          order: 4,
        },
        {
          description:
            'Developed a high-performance system for generating complex PDF incident reports.',
          order: 5,
        },
        {
          description:
            'Maintained and extended Server-Driven UI backend services leveraging Python, Go, and Protobuf.',
          order: 6,
        },
      ],
    },
    {
      company: 'EPAM',
      position: 'Senior Software Engineer',
      startDate: new Date('2020-07-01T00:00:00.000Z'),
      endDate: new Date('2022-07-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Resolved critical rendering bottlenecks in large drilling rig datasets, improving dashboard load time from ~5s to under 1.2s using virtualization.',
          order: 1,
        },
        {
          description:
            'Implemented new specialized chart types and built interactive 3D visualizations of drilling elements using Three.js and Highcharts.',
          order: 2,
        },
        {
          description:
            'Extended SpreadJS spreadsheet tables with custom enterprise functionality and high-volume data handling.',
          order: 3,
        },
        {
          description:
            'Delivered and maintained platform consisting of six Angular applications and one React application.',
          order: 4,
        },
        {
          description:
            'Developed an admin panel for managing TV content and multimedia assets, implementing complex business logic covered with tests.',
          order: 5,
        },
        {
          description:
            'Created an internal UI Kit based on design system guidelines using React, Next.js, and Storybook.',
          order: 6,
        },
        {
          description:
            'Integrated microservice APIs and managed predictable state flows with Redux and Redux Saga.',
          order: 7,
        },
        {
          description:
            'Conducted comprehensive peer code reviews and fostered engineering best practices across teams.',
          order: 8,
        },
      ],
    },
    {
      company: 'ScienceSoft',
      position: 'Full-Stack Software Engineer',
      startDate: new Date('2018-02-01T00:00:00.000Z'),
      endDate: new Date('2020-07-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Implemented backend and frontend architecture for a multilingual web and desktop training platform with role-based access, quizzes, and reporting (Angular, NestJS, Electron, SQLite).',
          order: 1,
        },
        {
          description:
            'Designed GraphQL schemas, implemented Apollo Client integrations, and streamlined schema typing with GraphQL Codegen.',
          order: 2,
        },
        {
          description:
            'Estimated scope, designed, and implemented architecture for a fleet management system with a real-time coordinates provider service (NestJS, Socket.io, PostgreSQL).',
          order: 3,
        },
        {
          description:
            'Refactored large parts of legacy fleet management applications to reduce technical debt and improve code quality.',
          order: 4,
        },
        {
          description:
            'Analyzed business requirements and engineered CRM to manage car sales, orchestrating communication between distributed microservices.',
          order: 5,
        },
        {
          description:
            'Implemented high-throughput data import pipelines from diverse XML formats and wrote comprehensive unit tests.',
          order: 6,
        },
        {
          description:
            'Created an interactive visual editor for composing promotional media slides and videos on canvas (Fabric.js).',
          order: 7,
        },
        {
          description:
            'Animated objects on HTML5 canvas and built an embeddable player for shop promotional screens.',
          order: 8,
        },
      ],
    },
    {
      company: 'Sportdata',
      position: 'Full-Stack Developer',
      startDate: new Date('2017-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Integrated third-party gaming feeds, poker/casino engines, and secure payment processing systems into a sports betting platform.',
          order: 1,
        },
        {
          description:
            'Implemented interactive video calls with customer support using Twilio API.',
          order: 2,
        },
        {
          description:
            'Developed high-traffic web features with React server-side rendering (SSR), Backbone.js, and Node.js.',
          order: 3,
        },
        {
          description:
            'Improved built-in CMS capabilities and optimized backend database performance in MySQL.',
          order: 4,
        },
        {
          description:
            'Refactored large sections of legacy code to enhance modularity, reliability, and execution speed.',
          order: 5,
        },
      ],
    },
    {
      company: 'HQSoftware',
      position: 'Full-Stack Developer',
      startDate: new Date('2016-11-01T00:00:00.000Z'),
      endDate: new Date('2017-05-31T00:00:00.000Z'),
      isCurrent: false,
      achievements: [
        {
          description:
            'Developed responsive, cross-browser web interfaces and interactive client-side widgets using JavaScript, HTML5, and CSS/SCSS.',
          order: 1,
        },
        {
          description:
            'Implemented backend application endpoints, RESTful APIs, and database queries for commercial client projects.',
          order: 2,
        },
        {
          description:
            'Collaborated closely with cross-functional development teams, participating in code reviews, bug fixing, and QA testing.',
          order: 3,
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

  // 4. Create Showcase Projects (10 Highlighted Projects from Resume + Digital Business Card Backend)
  const projectsData = [
    {
      name: 'Internal B2B CRM Platform for Affiliate Partner Management',
      url: null,
    },
    {
      name: 'Travel Platform Connecting Guests with Property Owners and Activity Providers',
      url: null,
    },
    {
      name: 'Vehicle Telematics Events Visualizer for Interactive Ride Analysis',
      url: null,
    },
    {
      name: 'Enterprise Drilling Rig Data Platform with 2D/3D Visualization',
      url: null,
    },
    {
      name: 'Admin Panel for Managing TV Content and Multimedia Assets',
      url: null,
    },
    {
      name: 'Multilingual Web and Desktop Training & Skill Management Platform',
      url: null,
    },
    {
      name: 'Real-Time Fleet Management System with Live Coordinates Tracking',
      url: null,
    },
    {
      name: 'CRM Platform to Manage Car Sales and Multi-format XML Ingestion',
      url: null,
    },
    {
      name: 'Interactive Visual Editor for Promotional Canvas Slides and Video',
      url: null,
    },
    {
      name: 'Sports Betting and Real-Time Gaming Platform',
      url: null,
    },
    {
      name: 'Digital Business Card Backend (Vizitka GraphQL API)',
      url: 'https://github.com/RylaiCF/business-card-test-task-ai',
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
