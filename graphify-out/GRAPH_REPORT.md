# Graph Report - .  (2026-05-20)

## Corpus Check
- 168 files · ~138,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 834 nodes · 1398 edges · 43 communities (34 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 202,657 input · 22,517 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routes & Error Handling|API Routes & Error Handling]]
- [[_COMMUNITY_App Shell & Server Routes|App Shell & Server Routes]]
- [[_COMMUNITY_Admin UI & Card Primitives|Admin UI & Card Primitives]]
- [[_COMMUNITY_Public Pages & Discovery|Public Pages & Discovery]]
- [[_COMMUNITY_Marketing Pages & Nav|Marketing Pages & Nav]]
- [[_COMMUNITY_Project Docs & Legal Source|Project Docs & Legal Source]]
- [[_COMMUNITY_Booking Form Primitives|Booking Form Primitives]]
- [[_COMMUNITY_Application & Auth Forms|Application & Auth Forms]]
- [[_COMMUNITY_Chat & Booking Actions|Chat & Booking Actions]]
- [[_COMMUNITY_Homepage Screenshot Design|Homepage Screenshot Design]]
- [[_COMMUNITY_Onboarding Flow Mock|Onboarding Flow Mock]]
- [[_COMMUNITY_Legal Page Templates|Legal Page Templates]]
- [[_COMMUNITY_Misc App Screen Mocks|Misc App Screen Mocks]]
- [[_COMMUNITY_Profile Screen Mock|Profile Screen Mock]]
- [[_COMMUNITY_Growth & Outreach Strategy|Growth & Outreach Strategy]]
- [[_COMMUNITY_Host Trust Panel|Host Trust Panel]]
- [[_COMMUNITY_Design-Source Seed Data|Design-Source Seed Data]]
- [[_COMMUNITY_Launch Stages Roadmap|Launch Stages Roadmap]]
- [[_COMMUNITY_Brand Identity Assets|Brand Identity Assets]]
- [[_COMMUNITY_Design Canvas Framework|Design Canvas Framework]]
- [[_COMMUNITY_Reels Overlays Mock|Reels Overlays Mock]]
- [[_COMMUNITY_Social Media Icons|Social Media Icons]]
- [[_COMMUNITY_Web Screens Mock|Web Screens Mock]]
- [[_COMMUNITY_Reels Feed Mock|Reels Feed Mock]]
- [[_COMMUNITY_Customer Discovery Kit|Customer Discovery Kit]]
- [[_COMMUNITY_Two-Way Reviews|Two-Way Reviews]]
- [[_COMMUNITY_New Feature Screen Mocks|New Feature Screen Mocks]]
- [[_COMMUNITY_Design Source Theme|Design Source Theme]]
- [[_COMMUNITY_Funnel Marketing Strategy|Funnel Marketing Strategy]]
- [[_COMMUNITY_Launch Checklist Phases|Launch Checklist Phases]]
- [[_COMMUNITY_Prisma Seed Script|Prisma Seed Script]]
- [[_COMMUNITY_Reels Seed Data|Reels Seed Data]]
- [[_COMMUNITY_Booking Entry Page|Booking Entry Page]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]

## God Nodes (most connected - your core abstractions)
1. `formatPrice()` - 23 edges
2. `Engineering Playbook` - 22 edges
3. `Avatar()` - 17 edges
4. `Launch Stages` - 17 edges
5. `SiteHeader()` - 15 edges
6. `CITIES` - 15 edges
7. `handleError()` - 15 edges
8. `ok()` - 15 edges
9. `cn()` - 14 edges
10. `formatRelative()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `meetlocal Playbook (PDF source)` --conceptually_related_to--> `Engineering Playbook`  [INFERRED]
  design-source/uploads/meetlocal_playbook.pdf → PLAYBOOK.md
- `meetlocal Startup Bundle (PDF)` --conceptually_related_to--> `README — Product Story`  [INFERRED]
  design-source/uploads/meetlocal_startup_bundle.pdf → README.md
- `Zod At Every Boundary` --semantically_similar_to--> `Ten Golden Rules (Claude)`  [INFERRED] [semantically similar]
  PLAYBOOK.md → CLAUDE.md
- `meetlocal Playbook (PDF source)` --conceptually_related_to--> `Strategy Notes (BUS 81 + Chesky/PG)`  [INFERRED]
  design-source/uploads/meetlocal_playbook.pdf → STRATEGY_NOTES.md
- `Painkiller vs Vitamin Test` --semantically_similar_to--> `Sean Ellis PMF Survey (40% Very Disappointed)`  [INFERRED] [semantically similar]
  CUSTOMER_DISCOVERY_KIT.md → GROWTH_PLAYBOOK.md

## Hyperedges (group relationships)
- **Booking Lifecycle Trust Loop (manual capture + 14min accept + two-way reviews)** — readme_manual_capture, playbook_payment_lifecycle, legal_terms_of_service_14_min_accept, playbook_review_lifecycle, readme_two_way_reviews [EXTRACTED 0.95]
- **Stage 0 Customer Validation Engine (discovery + concierge + founding 50 + collison)** — customer_discovery_kit_15_interviews, strategy_notes_concierge_mvp, strategy_notes_collison_installation, strategy_notes_founding_50, outreach_kit_wave_strategy [EXTRACTED 0.90]
- **Trust Marketplace Safety Stack (vetting + Starbucks Rule + AUP + IC FCRA)** — launch_stages_safety_first, launch_stages_starbucks_rule, legal_acceptable_use_policy, legal_independent_contractor_agreement_fcra_consent, launch_stages_trust_scoring [INFERRED 0.85]
- **Top Navigation Cluster** — screenshots_home_logo, screenshots_home_primary_nav, screenshots_home_locale_switcher, screenshots_home_signin_button, screenshots_home_get_app_cta [EXTRACTED 1.00]
- **Hero Composition** — screenshots_home_announcement_pill, screenshots_home_hero_headline, screenshots_home_gradient_accent_text, screenshots_home_live_request_card [EXTRACTED 1.00]
- **Live Request Card Components** — screenshots_home_live_badge, screenshots_home_traveler_avatars, screenshots_home_accept_request_button [EXTRACTED 1.00]
- **meetlocal.ai Brand Identity System** — concept_logomark_pin_sunset, concept_logomark_rounded_square, concept_wordmark_meetlocal_ai, concept_color_palette_warm_gradient, concept_color_palette_sunset_orange, concept_brand_identity_meetlocal [INFERRED 0.85]
- **Wordmark Logo Variants (Light & Dark)** — branding_meetlocal_logo_on_light_1024x256, branding_meetlocal_logo_on_dark_1024x256, concept_wordmark_meetlocal_ai [EXTRACTED 0.95]
- **Pin Icon at Multiple Sizes** — public_meetlocal_icon, branding_meetlocal_icon_512, branding_meetlocal_icon_256, concept_logomark_pin_sunset [EXTRACTED 0.95]

## Communities (43 total, 9 thin omitted)

### Community 0 - "API Routes & Error Handling"
Cohesion: 0.06
Nodes (61): POST(), ApiError, ApiUser, BadRequest(), Forbidden(), handleError(), ok(), parseJson() (+53 more)

### Community 1 - "App Shell & Server Routes"
Cohesion: 0.05
Nodes (47): inter, interTight, jetbrainsMono, metadata, GET(), POST(), BottomNav(), BottomNavProps (+39 more)

### Community 2 - "Admin UI & Card Primitives"
Cohesion: 0.06
Nodes (27): Avatar(), AvatarProps, BookingActionBarProps, LocalCard(), LocalWithUser, SiteHeader(), BookingConfirmedPage(), ConfirmedPageProps (+19 more)

### Community 3 - "Public Pages & Discovery"
Cohesion: 0.05
Nodes (34): NotFound(), Home(), HomeProps, VALID_CITIES, VALID_VIBES, MessagesPage(), CredentialsCard(), CredentialsCardProps (+26 more)

### Community 4 - "Marketing Pages & Nav"
Cohesion: 0.05
Nodes (28): AuthMenu(), ComingSoon(), ComingSoonProps, ITEMS, MainNav(), NavItem, LEGAL_LINKS, NAV_ITEMS (+20 more)

### Community 5 - "Project Docs & Legal Source"
Cohesion: 0.05
Nodes (55): AGENTS.md (Next.js 16 Agent Rules), Next.js 16 Breaking Changes Warning, CLAUDE.md Project Rules, Anti-Patterns List (Claude), Ten Golden Rules (Claude), PII Discipline (No Logs of Emails/Names/Photos), Realtime Channel Per Booking Rule, Safety-First Principles (+47 more)

### Community 6 - "Booking Form Primitives"
Cohesion: 0.06
Nodes (30): DatePicker(), DatePickerProps, OpenStep, PillField(), SearchBar(), SearchBarCity, SearchBarProps, SearchBarVibe (+22 more)

### Community 7 - "Application & Auth Forms"
Cohesion: 0.06
Nodes (23): ApplyForm(), ApplyFormProps, LANG_OPTIONS, maxDobToday(), RESIDENCY_OPTIONS, CheckEmailPage(), LiveSelfieCapture(), LiveSelfieCaptureProps (+15 more)

### Community 8 - "Chat & Booking Actions"
Cohesion: 0.1
Nodes (21): ChatMessage, ChatRoom(), ChatRoomProps, Counterpart, QUICK_PROMPTS, MessagesPageProps, BookingActionBar(), Answer (+13 more)

### Community 9 - "Homepage Screenshot Design"
Cohesion: 0.1
Nodes (24): Homepage Screenshot (home.jpg), Homepage Screenshot (home2.jpg), Announcement Pill (home2), Floating Bottom Tab Bar (home2), Hero Section (home2), Live Request Card (home2), Site Header / Top Nav (home2), Accept a request Button (+16 more)

### Community 10 - "Onboarding Flow Mock"
Cohesion: 0.1
Nodes (3): formatPhoneByCountry(), PHONE_COUNTRIES, PhoneOTP()

### Community 11 - "Legal Page Templates"
Cohesion: 0.12
Nodes (8): metadata, LegalDoc(), LegalDocProps, metadata, metadata, metadata, metadata, metadata

### Community 12 - "Misc App Screen Mocks"
Cohesion: 0.13
Nodes (4): ArrivalScreen(), ChatScreen(), iconBtn(), ReviewsScreen()

### Community 13 - "Profile Screen Mock"
Cohesion: 0.14
Nodes (7): BookingCard(), chipLike(), CITY_TZ, localTimeIn(), stepBtn(), theme_or_fallback(), TopBar()

### Community 14 - "Growth & Outreach Strategy"
Cohesion: 0.14
Nodes (16): Alstromer's 5 Referral Email Ingredients, Engineered Referrals (Airbnb $40/$20 mechanic), Outreach Kit (Wave 1/2/3), Admin Approval Workflow, Three Waves (Locals First Then Travelers), Strategy Notes (BUS 81 + Chesky/PG), Chesky 11-Star Experience Exercise, Brand + PR Playbook (No Paid Marketing) (+8 more)

### Community 15 - "Host Trust Panel"
Cohesion: 0.15
Nodes (6): buildSocialRows(), formatResponseTime(), HostTrustPanel(), HostTrustPanelProps, SocialRow, stripHttp()

### Community 16 - "Design-Source Seed Data"
Cohesion: 0.14
Nodes (11): CATEGORIES, CITY_SUGGESTIONS, defaultSpotFor(), LOCALS, MEETING_SPOTS, PLATFORMS, RESIDENCY, REVIEWS_DATA (+3 more)

### Community 17 - "Launch Stages Roadmap"
Cohesion: 0.16
Nodes (14): Launch Stages, AI Matching Roadmap, AI Moderation Roadmap, Hard Decision Gates Between Stages, Stage 0 — Pre-launch, Stage 1 — Vetted Beta, Stage 2 — Limited Public, Stage 3 — Multi-City (+6 more)

### Community 18 - "Brand Identity Assets"
Cohesion: 0.35
Nodes (12): meetlocal Pin Icon 256px, meetlocal Pin Icon 512px, meetlocal.ai Wordmark Logo on Dark, meetlocal.ai Wordmark Logo on Light, meetlocal.ai Brand Identity System, Color Palette: Sunset Orange on Black (legacy pin), Color Palette: Warm Orange-to-Pink Gradient, Logomark: Map Pin with Sunset & Two Figures (+4 more)

### Community 19 - "Design Canvas Framework"
Cohesion: 0.17
Nodes (3): DC, DCCtx, s

### Community 25 - "Customer Discovery Kit"
Cohesion: 0.22
Nodes (10): Customer Discovery Kit, 15 Customer Discovery Interviews, Stanford BUS 81 Class 1, Four Rules of Customer Discovery, Pain Memo Template, Painkiller vs Vitamin Test, Business Traveler Persona, Couples on First International Trip Persona (+2 more)

### Community 26 - "Two-Way Reviews"
Cohesion: 0.25
Nodes (6): ReviewPage(), ReviewPageProps, ReviewForm(), ReviewFormProps, TAGS_LOCAL, TAGS_TRAVELER

### Community 28 - "Design Source Theme"
Cohesion: 0.29
Nodes (5): Avatar(), avatarGrad(), link, s, THEMES

### Community 29 - "Funnel Marketing Strategy"
Cohesion: 0.25
Nodes (8): Growth Playbook (Alstromer), Brand Marketing Phase, Funnel Optimization Phase, meetlocal LTV/CAC Math, Paid Acquisition (LTV/CAC Gated), Retention First Doctrine, SEO at Scale (Template Page Strategy), Glossier Audience-First Content Play

### Community 30 - "Launch Checklist Phases"
Cohesion: 0.25
Nodes (8): Launch Checklist (184 checkboxes), Phase 0 — Local Dev Environment, Phase 1 — User Flow Verification, Phase 2 — External Integration Verification, Phase 3 — Edge Cases & Failure Modes, Phase 4 — Security & Compliance, Phase 7 — Production Deployment, Phase 8 — Launch Playbook

### Community 31 - "Prisma Seed Script"
Cohesion: 0.29
Nodes (5): LOCALS, prisma, SeedLocal, SeedSpot, SPOTS

### Community 34 - "Reels Seed Data"
Cohesion: 0.5
Nodes (3): REEL_CATEGORIES, REEL_COMMENTS, REELS

## Knowledge Gaps
- **240 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `DC`, `s` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatPrice()` connect `Admin UI & Card Primitives` to `Chat & Booking Actions`, `App Shell & Server Routes`, `Two-Way Reviews`, `Booking Form Primitives`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `SiteHeader()` connect `Admin UI & Card Primitives` to `Legal Page Templates`, `Public Pages & Discovery`, `Marketing Pages & Nav`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `CITIES` connect `Admin UI & Card Primitives` to `API Routes & Error Handling`, `Public Pages & Discovery`, `Application & Auth Forms`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Error Handling` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Shell & Server Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Admin UI & Card Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._