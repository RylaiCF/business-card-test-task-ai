# Digital Business Card (Vizitka)

A backend service representing a specialist's professional profile, skills, work experience, and projects via a GraphQL API.

## Language

**Profile**:
The root domain aggregate representing the professional identity of the specialist, including personal details, bio, and social links.
_Avoid_: User, Account, Candidate

**ProfileLink**:
A named external reference or social profile (such as GitHub, LinkedIn, Telegram) belonging to a specialist.
_Avoid_: SocialLink, ContactUrl, Link

**Experience**:
A chronological record of employment at a company, capturing the role, time period, and key achievements.
_Avoid_: Job, WorkHistory, Employment

**Achievement**:
A distinct measurable accomplishment or engineering result delivered during a work experience.
_Avoid_: Accomplishment, BulletPoint, Task

**Project**:
A showcase of a software product, open-source repository, or personal pet project highlighting practical applications of skills.
_Avoid_: PortfolioItem, PetProject

**Skill**:
A specific professional competency or tool (e.g., TypeScript, NestJS, GraphQL).
_Avoid_: Technology, Tag, Competency
