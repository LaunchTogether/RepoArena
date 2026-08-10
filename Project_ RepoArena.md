# Project: RepoArena

Build a production-ready full-stack web application called **RepoArena**.

RepoArena is a GitHub repository comparison and analysis platform. Users should be able to enter two public GitHub repository URLs and receive a detailed side-by-side comparison based on repository quality, development activity, technology stack, community health, maintenance, documentation, and other engineering metrics.

The product should feel like a real SaaS application, not a basic student project.

---

# 1. Core Product Idea

The main user flow:

1. User opens RepoArena.
2. User enters two GitHub repository URLs.
3. Example:

Repo A:
https://github.com/facebook/react

Repo B:
https://github.com/vuejs/core

4. RepoArena fetches repository data using the GitHub API.
5. The application analyzes both repositories.
6. It calculates category scores.
7. It calculates an overall RepoArena Score between 0 and 100.
8. The repositories are displayed side by side.
9. A winner is shown for each category.
10. An overall winner is displayed.
11. The user can inspect detailed metrics and explanations.

The comparison should not simply compare stars.

The purpose is to answer:

"Which repository appears healthier, better maintained, better documented, and more active from a software engineering perspective?"

---

# 2. Recommended Technology Stack

Use:

Frontend:
- Next.js latest stable version
- React
- TypeScript
- Tailwind CSS

UI:
- shadcn/ui
- Lucide icons
- Recharts for charts

Backend:
- Next.js Route Handlers / Server Actions where appropriate

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth
- GitHub OAuth

External APIs:
- GitHub REST API
- GitHub GraphQL API where useful

Validation:
- Zod

Forms:
- React Hook Form

State:
Use local/server state where possible.
Do not introduce Redux unless actually necessary.

Deployment target:
- Vercel

Code quality:
- ESLint
- Prettier
- strict TypeScript
- reusable components
- clear folder architecture

---

# 3. UI / Visual Direction

Create a premium developer-focused SaaS interface.

Visual inspiration:
- GitHub
- Linear
- Vercel
- Raycast
- Arc
- modern developer tools

Do NOT create a colorful generic startup landing page.

Design characteristics:

- dark-first interface
- optional light mode
- clean typography
- subtle borders
- large spacing
- minimal gradients
- developer-oriented look
- responsive design
- desktop-first but fully mobile compatible

Use cards carefully.

Avoid excessive rounded cards everywhere.

Prefer clear information hierarchy.

Use monospaced typography where repository names, branches, commits, languages, and technical metrics are displayed.

---

# 4. Landing Page

Create a landing page.

Hero section:

Title:

"Which repository wins?"

Subtitle:

"Compare GitHub repositories using real engineering metrics — not just stars."

Main comparison form:

[ GitHub Repository A URL ]

VS

[ GitHub Repository B URL ]

[ Compare Repositories ]

Example button:

"Try React vs Vue"

Clicking the example should automatically populate:

https://github.com/facebook/react

https://github.com/vuejs/core

Additional sections:

- How RepoArena works
- Metrics analyzed
- Example comparison
- Why star count alone is misleading
- CTA

Do not make the landing page extremely long.

---

# 5. Repository URL Validation

Accept GitHub repository URLs such as:

https://github.com/facebook/react

Also allow:

facebook/react

Convert input to:

owner
repository

Validate repository existence before starting analysis.

Show meaningful errors:

- Repository does not exist
- Repository is private
- GitHub API rate limit reached
- Invalid GitHub repository URL
- Repository data unavailable

Never crash the UI because GitHub returned incomplete data.

---

# 6. Comparison Page

URL structure:

/compare/facebook/react-vs-vuejs/core

or use a safe equivalent URL architecture.

The comparison screen should have:

Top section:

Repo A

facebook/react
React logo/avatar
Description
Stars
Forks
Open Issues

VS

Repo B

vuejs/core
Vue avatar
Description
Stars
Forks
Open Issues

Below this:

OVERALL SCORE

React
87

Vue
91

Winner:
Vue

Then show category comparisons.

---

# 7. RepoArena Scoring System

Create an explainable scoring model.

Every repository receives scores from 0-100.

Categories:

1. Activity Score
2. Maintenance Score
3. Community Score
4. Codebase Score
5. Documentation Score
6. Popularity Score
7. Project Health Score

Then calculate:

RepoArena Score

0-100.

Suggested weights:

Activity:
20%

Maintenance:
20%

Community:
15%

Codebase:
15%

Documentation:
15%

Popularity:
5%

Project Health:
10%

Total:
100%

Store scoring constants in a dedicated configuration file.

Example:

src/lib/scoring/config.ts

Do NOT scatter scoring values throughout the application.

---

# 8. Activity Score

Analyze metrics such as:

- commits in last 7 days
- commits in last 30 days
- commits in last 90 days
- last commit date
- contributors active recently
- pull requests created recently
- pull requests merged recently
- release frequency

Example interpretation:

Very active:
85-100

Active:
70-84

Moderate:
50-69

Low activity:
25-49

Inactive:
0-24

Account for repository age and project type where possible.

Do not allow extremely large repositories to automatically dominate smaller but healthy projects.

Normalize metrics.

---

# 9. Maintenance Score

Analyze:

- last commit
- latest release
- frequency of releases
- open issues
- closed issues
- issue closure rate
- open pull requests
- merged pull requests
- stale issues
- stale PRs
- response speed if obtainable
- repository archived status

Archived repositories should receive a major penalty.

Repositories with hundreds of abandoned issues should receive a maintenance penalty.

---

# 10. Community Score

Analyze:

- number of contributors
- contributor distribution
- stars
- forks
- watchers
- issue engagement
- PR engagement
- Discussions availability
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- issue templates
- pull request templates

Avoid simply rewarding repository size.

A smaller repository with an active community should still score well.

---

# 11. Codebase Score

Use GitHub metadata and repository contents.

Analyze:

- programming languages
- presence of package manager files
- lock files
- source folder structure
- test directories
- CI/CD
- lint configuration
- TypeScript usage
- automated testing setup
- Docker
- dependency management
- repository organization

Detect files such as:

package.json
pnpm-lock.yaml
yarn.lock
package-lock.json
tsconfig.json
eslint.config.js
.eslintrc
.prettierrc
Dockerfile
docker-compose.yml
.github/workflows/*
vitest.config.*
jest.config.*
playwright.config.*
cypress.config.*

Do not claim code quality based purely on language.

Call this category "Codebase Health" rather than suggesting we have statically analyzed every line.

---

# 12. Documentation Score

Analyze:

README existence.

README quality indicators:

- README length
- headings
- installation section
- usage section
- examples
- API documentation
- screenshots
- badges
- contributing instructions
- license information

Also detect:

docs/
documentation site
CHANGELOG
CONTRIBUTING
SECURITY
CODE_OF_CONDUCT

Score repositories fairly.

Large README size alone should not equal high quality.

---

# 13. Popularity Score

Analyze:

- stars
- forks
- watchers
- repository age
- star-to-age ratio
- fork-to-star ratio

Popularity should only contribute a small amount to the overall score.

A repository with 100,000 stars should not automatically defeat a technically healthier repository.

---

# 14. Project Health Score

Analyze important repository standards:

README.md
LICENSE
CONTRIBUTING.md
SECURITY.md
CODE_OF_CONDUCT.md
CHANGELOG
CI/CD
tests
releases
issue templates
PR templates
dependency update bot configuration

Examples:

Dependabot
Renovate

Show these as a checklist.

Example:

Project Health

README           ✓
License          ✓
CI/CD            ✓
Tests            ✓
Security Policy  ✕
Contributing     ✓
Changelog        ✕

Score: 79/100

---

# 15. Technology Stack Detection

Show detected technology stack.

Example:

React Repository

Primary Language:
TypeScript

Languages:

TypeScript 67%
JavaScript 20%
Rust 8%
Other 5%

Detected Technologies:

Node.js
TypeScript
Rollup
Jest
ESLint
GitHub Actions

Show technology chips.

Do not fabricate technologies.

Only show technologies when there is evidence in repository files.

---

# 16. Language Comparison

Create a visual language breakdown.

Example:

Languages

React

TypeScript ███████████████ 67%
JavaScript ███████ 25%
Other ██ 8%

Vue

TypeScript ███████████████████ 91%
JavaScript ██ 6%
Other █ 3%

Use Recharts if appropriate.

---

# 17. Repository Activity Chart

Create an activity chart.

Possible ranges:

7D
30D
90D
1Y

Metrics:

commits
pull requests
issues

Display the two repositories on the same chart where it remains readable.

Allow switching metric.

---

# 18. Category Battle UI

Create a "Battle" visualization.

Example:

ACTIVITY

React

84

████████████████░░░

Vue

92

██████████████████░

Winner:
Vue +8

Repeat for:

Activity
Maintenance
Community
Codebase
Documentation
Popularity
Health

Make the winner visually obvious without making the page look like a gaming website.

---

# 19. Strengths and Weaknesses

Generate deterministic insights from metrics.

Do not require AI initially.

Example:

React

Strengths

+ Extremely active contributor community
+ Strong documentation
+ Mature CI/CD setup
+ Frequent releases

Weaknesses

- Large number of open issues
- High contributor concentration

Vue

Strengths

+ Very high TypeScript usage
+ Strong project health
+ Fast issue closure rate

Weaknesses

- Smaller contributor pool

Create these from scoring rules.

Avoid unsupported statements.

---

# 20. Comparison Summary

At the bottom display:

"Why Vue won"

Example:

Vue scores higher primarily because of stronger recent activity, better issue maintenance, and higher project-health metrics.

React leads in popularity and contributor count.

This must be generated from actual metric differences.

Do not hardcode comparison text.

---

# 21. GitHub Authentication

Allow users to use RepoArena without signing in.

Anonymous users:

- compare public repositories
- limited comparison requests

Signed-in users:

Sign in with GitHub.

Features:

- increased API limit where supported
- saved comparisons
- comparison history
- favorite repositories
- profile dashboard

Do not ask users for their GitHub personal access token manually unless absolutely necessary.

Use GitHub OAuth.

Never expose GitHub tokens to the client.

---

# 22. User Dashboard

Route:

/dashboard

Sections:

Recent Comparisons
Saved Comparisons
Favorite Repositories

Example:

Recent Battles

facebook/react
vs
vuejs/core

Winner: vuejs/core

91 vs 87

Compared:
2 hours ago

Allow reopening comparison.

---

# 23. Comparison History

Store comparison history.

Database structure example:

users

id
email
github_id
github_username
avatar_url
created_at

comparisons

id
user_id
repo_a_owner
repo_a_name
repo_b_owner
repo_b_name
repo_a_score
repo_b_score
winner
created_at

saved_repositories

id
user_id
owner
repository
created_at

Do NOT store huge raw GitHub API responses unnecessarily.

---

# 24. Caching

GitHub API rate limits are important.

Implement caching.

Example:

Repository base metadata:
10 minutes

Languages:
1 hour

Repository file structure:
30 minutes

Activity metrics:
10 minutes

Use server-side caching.

Avoid making multiple identical GitHub requests.

Create a GitHub service layer.

Example:

src/lib/github/

client.ts
repositories.ts
activity.ts
contributors.ts
issues.ts
pullRequests.ts
releases.ts
languages.ts

---

# 25. API Architecture

Suggested internal endpoints:

GET /api/github/repository

GET /api/github/activity

GET /api/github/languages

GET /api/github/community

POST /api/compare

Or use server actions if cleaner.

Keep GitHub API logic isolated from UI components.

---

# 26. Folder Architecture

Use a clean scalable structure similar to:

src/

app/
  page.tsx

  compare/
  dashboard/
  login/

  api/

components/

  comparison/
    RepositoryHeader.tsx
    OverallScore.tsx
    CategoryBattle.tsx
    ActivityChart.tsx
    LanguageChart.tsx
    TechStack.tsx
    ProjectHealth.tsx
    StrengthsWeaknesses.tsx

  landing/

  layout/

  ui/

lib/

  github/

  scoring/

  supabase/

  utils/

types/

hooks/

Do not put everything inside page.tsx.

---

# 27. TypeScript Types

Create strong TypeScript models.

Examples:

Repository

RepositoryMetrics

RepositoryActivity

RepositoryCommunity

RepositoryHealth

RepositoryTechnology

RepositoryScores

ComparisonResult

Avoid any unless there is no practical alternative.

---

# 28. Loading Experience

Repository analysis may take several seconds.

Create a polished analysis state.

Example:

Analyzing repositories...

✓ Repository metadata
✓ Commit history
✓ Contributors
✓ Pull requests
✓ Issues
● Detecting technology stack
○ Calculating scores

Do not use a generic spinner as the entire UX.

Use skeleton loaders where appropriate.

---

# 29. Error Handling

Handle:

GitHub API failure
rate limiting
invalid repository
deleted repository
renamed repository
archived repository
empty repository
repository with no releases
repository with disabled issues
GitHub timeout
network errors

Show useful error states.

---

# 30. GitHub Rate Limiting

Detect GitHub rate limit headers.

When limit is close or exceeded:

display:

"GitHub API rate limit reached."

If anonymous:

suggest GitHub login.

Show reset time if available.

Do not repeatedly retry requests that are rate limited.

---

# 31. Responsive Design

Desktop comparison should be side-by-side.

Mobile comparison should become stacked.

Example mobile structure:

Repo A
Score

VS

Repo B
Score

Then category battles.

Charts must remain readable on mobile.

---

# 32. Accessibility

Implement:

semantic HTML
keyboard navigation
proper labels
accessible forms
aria where necessary
sufficient contrast
focus states

---

# 33. SEO

Add metadata.

Homepage title:

RepoArena — Compare GitHub Repositories

Description:

Compare GitHub repositories using engineering metrics including activity, maintenance, documentation, community health, and codebase quality.

Comparison pages should dynamically generate metadata.

---

# 34. Share Comparison

Create a share button.

Comparison URLs must be shareable.

Example:

repoarena.app/compare/facebook/react/vs/vuejs/core

Copy link.

Optional later:

Generate social preview image.

---

# 35. Future Features

Architect the project so these can be added later without rewriting the application.

Future features:

AI repository reviews
private repository analysis
GitHub organization analysis
developer profile comparison
repository leaderboard
weekly trending repositories
repository health alerts
repository history tracking
AI-generated improvement recommendations
GitHub App integration
team workspaces

Do not implement all future features now.

Only structure the code so extension is possible.

---

# 36. MVP Priority

Do not attempt to implement every feature at once.

Build in phases.

## Phase 1

Create:

- project setup
- landing page
- GitHub URL input
- GitHub repository fetching
- basic repository comparison
- scoring engine
- comparison page

Must work end-to-end.

## Phase 2

Add:

- activity metrics
- maintenance metrics
- community metrics
- language detection
- technology detection
- project health
- charts

## Phase 3

Add:

- GitHub OAuth
- Supabase
- saved comparisons
- dashboard
- favorites

## Phase 4

Add:

- improved caching
- performance improvements
- share functionality
- SEO
- edge-case handling

Do not skip ahead before Phase 1 is stable.

---

# 37. Development Rules

Follow these rules throughout development:

1. Never fabricate GitHub metrics.

2. Every displayed metric must come from GitHub API data or clearly defined calculations.

3. Keep scoring logic separate from UI.

4. Every score should be explainable.

5. Avoid huge React components.

6. Reuse components.

7. Keep GitHub API calls server-side whenever authentication is involved.

8. Never expose private credentials.

9. Use environment variables.

10. Provide `.env.example`.

11. Do not commit real secrets.

12. Use strict TypeScript.

13. Avoid unnecessary dependencies.

14. Avoid premature overengineering.

15. Keep the MVP working during every development phase.

16. Before changing architecture, inspect the existing project first.

17. Do not delete functioning features just to rebuild them differently.

18. When modifying existing code, preserve unrelated functionality.

---

# 38. Environment Variables

Prepare:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GITHUB_CLIENT_ID=

GITHUB_CLIENT_SECRET=

GITHUB_TOKEN=

NEXT_PUBLIC_APP_URL=

Add documentation explaining where each variable comes from.

Never place secrets directly inside source code.

---

# 39. README

Create a professional README including:

RepoArena logo/title

What RepoArena is

Features

Screenshots placeholder

Technology stack

Installation

Environment variables

Running locally

GitHub API configuration

Supabase setup

Architecture

Scoring methodology

Roadmap

Contribution guide

License

---

# 40. Repository Collaboration

This project will be developed by multiple developers.

Prepare the repository accordingly.

Branches:

main

development

Feature branch pattern:

feature/github-api
feature/comparison-ui
feature/scoring-engine
feature/auth
feature/dashboard

Bugfix pattern:

fix/github-rate-limit

Do not commit directly to main during normal development.

Each feature should be isolated enough that multiple developers can work independently.

Avoid unnecessary shared-file changes that create merge conflicts.

Keep modules clearly separated.

---

# 41. GitHub Issues

Create an initial development task breakdown.

Suggested issues:

## Setup

- Initialize Next.js project
- Configure Tailwind
- Configure shadcn/ui
- Add project architecture
- Configure linting

## GitHub Integration

- GitHub repository parser
- GitHub API client
- Repository metadata service
- Language service
- Commit activity service
- Contributor service
- Issue metrics
- Pull request metrics
- Release metrics

## Scoring

- Create scoring architecture
- Activity scoring
- Maintenance scoring
- Community scoring
- Documentation scoring
- Codebase health scoring
- Popularity scoring
- Project health scoring
- Overall scoring

## Frontend

- Landing page
- Repository input component
- Repository comparison header
- Overall score component
- Category battle component
- Language comparison
- Activity chart
- Health checklist
- Strengths/weaknesses section

## Authentication

- GitHub OAuth
- Supabase user storage
- Protected dashboard

## Dashboard

- Comparison history
- Saved comparisons
- Favorites

---

# 42. Testing

Add testing where useful.

Test especially:

GitHub URL parsing

Scoring functions

Repository normalization

Score boundaries

Missing GitHub values

Comparison winner logic

Example:

score must always remain between:

0 and 100

Even when GitHub returns unexpected values.

---

# 43. Important Scoring Requirement

The scoring algorithm must NEVER look like:

repoA.stars > repoB.stars ? repoA wins

Each repository must receive an independent normalized score.

Then compare the final scores.

This ensures repositories can later be compared globally.

Example:

calculateRepositoryScore(repositoryMetrics)

returns:

{
  overall: 87,
  activity: 91,
  maintenance: 82,
  community: 89,
  codebase: 92,
  documentation: 84,
  popularity: 95,
  health: 86
}

---

# 44. Explainability

For every category provide:

score

raw metrics

reasons

Example:

Maintenance Score

84 / 100

Why?

+ Last commit 2 days ago
+ Latest release 12 days ago
\+ 81% issue closure rate
- 37 stale issues
- 14 pull requests older than 90 days

Users should understand why the score exists.

This is one of the most important features of RepoArena.

---

# 45. Performance

Do not block the page unnecessarily.

Parallelize independent GitHub requests.

Use Promise.all where safe.

Cache repeated calls.

Avoid fetching entire repository histories when aggregate data is enough.

Be mindful of GitHub API pagination.

Do not blindly download thousands of issues or commits.

---

# 46. Security

Implement:

server-side API calls for secrets
input validation
URL sanitation
rate limiting where appropriate
Supabase RLS
secure authentication callbacks

Never allow arbitrary URLs to be fetched from the server.

Only accept validated GitHub repositories.

---

# 47. Final Objective

RepoArena should feel like a product that could realistically be launched publicly.

The finished MVP should allow me to:

1. Open RepoArena.
2. Enter two GitHub repositories.
3. Click Compare.
4. Fetch real GitHub data.
5. Analyze both repositories.
6. Receive individual engineering scores.
7. View an overall score.
8. See which repository wins.
9. Understand why it won.
10. Share the comparison URL.

Prioritize a functioning architecture and accurate GitHub data over decorative features.

Start by inspecting the existing repository if files already exist.

Then create a development plan.

After creating the plan, implement **Phase 1 only**.

Do not attempt to build the entire application in one uncontrolled pass.

After Phase 1, verify:
- application builds successfully
- there are no TypeScript errors
- comparison works with two real public repositories
- scoring system returns valid 0-100 scores
- error handling works

Then summarize:
- files created
- architecture chosen
- completed functionality
- remaining Phase 2 tasks
- any environment variables I need to configure