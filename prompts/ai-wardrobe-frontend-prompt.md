# Master Frontend Generation Prompt — AI Wardrobe SaaS

> **How to use:** Give the entire prompt below to your coding agent (Cursor, GitHub Copilot, Claude Code, etc.) from the root of a new project. Ask it to create the complete working frontend, not just a visual mockup. The backend can be connected later through the service layer described here.

---

## ROLE

Act as a senior product designer and senior React + TypeScript frontend engineer. Build a polished, responsive, production-minded frontend for an AI-powered wardrobe SaaS application. The working product name is **Wardrobe AI**. Keep the brand name, logo text and theme tokens in one central configuration file so they can be changed easily.

The app lets a user:

1. Sign up and create a personal account.
2. Upload face and full-body reference photos and generate a personal full-body AI avatar.
3. Upload photos of clothing and accessories.
4. See each item processed into a clean catalogue image, categorized and enriched with suggested metadata.
5. Browse, search, filter, edit and manage a digital wardrobe.
6. Select garments in an outfit builder: one top, one bottom, footwear and optional accessories.
7. Generate an AI try-on preview using the user's avatar and selected garment references.
8. Save generated combinations as outfits, attach tags such as Party, Office, Western, Traditional, Wedding, Casual or Travel, and revisit them later.
9. Get outfit suggestions from an AI stylist, plan outfits on a calendar and review wardrobe analytics.
10. Manage subscription, AI generation credits, account, privacy and preferences.

Build the frontend as a coherent SaaS application with realistic navigation and useful interactions. Do not create disconnected page mockups.

## 1. TECHNICAL REQUIREMENTS

Use the following stack:

- React with TypeScript.
- Vite for the development/build toolchain.
- React Router for routing.
- Tailwind CSS for styling.
- shadcn/ui (or equivalent accessible Radix-based components) for dialogs, dropdowns, tabs, forms, tooltips, popovers, select menus and other primitives.
- lucide-react for icons.
- React Hook Form + Zod for forms and validation.
- TanStack Query for asynchronous server state and cache patterns.
- Zustand or a small React context for app-level UI state only. Avoid unnecessary global state.
- Recharts for analytics charts.
- date-fns for date formatting and calendar utilities.
- react-dropzone for drag-and-drop file upload.
- Sonner (or an equivalent) for toast notifications.

Use current compatible stable package versions at implementation time. Do not add large dependencies without a clear need.

### Engineering rules

- Enable TypeScript strict mode.
- Do not use `any`; define proper interfaces, discriminated unions and generic types.
- Use functional components and custom hooks.
- Keep components small and reusable. Avoid one enormous page component.
- Do not put business logic directly inside JSX.
- Use semantic HTML, keyboard-accessible controls, visible focus states and accessible labels.
- Provide loading, empty, error, success and disabled states for all important workflows.
- Use responsive layouts for desktop, tablet and mobile.
- Use consistent naming and formatting.
- Avoid fake links (`href="#"`) and dead buttons. Every visible interactive control must have a working frontend action, even when backed by mock data.
- Do not expose API keys, secrets or privileged configuration in frontend code.
- Do not call Gemini directly from the browser. AI actions must call a frontend service method that will later call the Spring Boot backend.
- Do not implement a backend. Implement a well-defined frontend API/service layer with a mock adapter so the UI runs without a backend and can later be connected to Spring Boot.

## 2. VISUAL DIRECTION AND BRAND

Create a premium, editorial fashion-tech experience. It should feel like a refined personal styling studio, not a generic admin dashboard and not a loud e-commerce marketplace.

### Visual language

- Main theme: warm off-white / ivory canvas, white or very light warm-grey cards, deep charcoal text.
- Accent: muted terracotta or clay, used sparingly for primary actions and selected states.
- Secondary accent: soft sage or muted olive for positive states and subtle chips.
- Borders: subtle warm grey; use shadows lightly.
- Use generous whitespace, strong alignment, clean typography and consistent spacing.
- Use large, attractive garment photography and outfit previews as the visual focus.
- Prefer rounded-xl or rounded-2xl cards, restrained shadows and subtle hover transitions.
- Use an editorial mix of bold headings, compact labels and readable body copy.
- Make the app feel premium, calm, fashionable and trustworthy.
- Default to a light theme. A dark theme is optional, but do not let it delay completion of the light theme.

### Typography

Use a modern sans-serif such as Inter or DM Sans for interface text. Use a tasteful display/serif accent for a few editorial headings only if it improves the design. Ensure fonts have sensible system fallbacks.

### Avoid

- Excessive gradients, neon colors or glassmorphism.
- Overcrowded screens and tiny text.
- Generic blue-purple AI gradients.
- An admin-template appearance.
- Emoji as a replacement for interface icons.
- Random decorative charts that do not represent meaningful data.
- Broken external image URLs. Provide local placeholder assets or robust image fallbacks.

### Design tokens

Centralize colors, spacing choices, radii, shadows and brand name. Use CSS variables where practical so the theme is easy to rebrand.

## 3. APPLICATION SHELL AND GLOBAL NAVIGATION

Build a shared authenticated application shell used by all `/app/*` pages.

### Desktop shell

- Fixed or sticky left sidebar, approximately 248–270px wide.
- Brand mark and “Wardrobe AI” at the top.
- Navigation grouped into sections:
  - **Overview:** Dashboard
  - **My Style:** My Avatar, My Wardrobe, Outfit Studio, Saved Outfits, AI Stylist, Outfit Calendar
  - **Insights:** Wardrobe Analytics
  - **Account:** Subscription & Credits, Settings
- Highlight the current route with a subtle filled background and accent indicator.
- Bottom of sidebar: user avatar, name, email or plan label, and profile dropdown.
- Main content area with a top bar, page title/breadcrumb, optional search, notification control and user menu.

### Mobile shell

- Replace the permanent sidebar with a compact top header and bottom navigation or an accessible slide-out navigation drawer.
- Keep primary actions reachable with one hand.
- Use responsive grids and stack split-screen layouts vertically.
- Avoid horizontal overflow.

### Global UI

Create reusable components for:

- `AppShell`, `Sidebar`, `MobileNav`, `Topbar`, `PageHeader`.
- `UserMenu`, `NotificationMenu`, `GlobalSearch`.
- `StatCard`, `SectionHeader`, `EmptyState`, `ErrorState`, `LoadingSkeleton`.
- `ConfirmDialog`, `FormDialog`, `FilterPopover`, `TagBadge`, `StatusBadge`.
- `ImageWithFallback`, `UploadDropzone`, `CreditBalance`, `GenerationStatus`.
- `Toast` notifications.

Use realistic sample user content, not lorem ipsum. Example user greeting: “Good evening, Alex”.

## 4. ROUTES AND SCREENS

Implement all the routes below. Protect `/app/*` routes behind an authentication guard. For the demo, provide mock sign-in/sign-up behavior and a clear way to access the authenticated experience.

### Public/auth routes

#### `/` — Optional marketing landing page

Create a polished landing page with:

- Hero headline: “Your wardrobe. Reimagined.”
- Supporting line explaining that users can digitize their clothes, create a personal avatar and preview outfits before getting dressed.
- Primary CTA: “Create your wardrobe”. Secondary CTA: “Explore how it works”.
- A strong product visual showing an avatar and a selection of wardrobe items.
- Three or four feature sections: Digital Wardrobe, Your AI Avatar, Virtual Try-On, Personal Stylist.
- A simple “How it works” three-step section.
- Pricing preview and footer with Privacy, Terms and Contact links.

#### `/login`

- Email and password fields.
- Show/hide password control.
- Remember-me checkbox.
- Forgot password link.
- Sign-in button with loading and validation states.
- Link to registration.
- Optional Google sign-in visual button; if no OAuth is configured, show a clear demo/not-configured response rather than pretending to authenticate.

#### `/signup`

- Name, email, password and confirm-password fields.
- Terms/privacy consent checkbox.
- Password strength / requirements guidance.
- Submit state and validation messages.
- Link to login.

#### `/forgot-password`

- Email input and submit action.
- Confirmation state explaining that a reset link would be sent in a connected production environment.

### First-time onboarding

#### `/app/onboarding`

Build a short, elegant stepper with progress indication:

1. Welcome and basic profile details.
2. Select style preferences (e.g. Minimal, Casual, Formal, Streetwear, Traditional, Sporty, Experimental); allow multiple selections.
3. Select common occasions (Office, College, Daily, Party, Wedding, Travel, Fitness, Other).
4. Invite the user to create an avatar now or do it later.
5. Completion screen with a button to open the dashboard.

Allow users to skip optional steps. Save selections in mock state.

### Authenticated app routes

#### `/app/dashboard` — Main dashboard

This is the most important screen. Make it visually impressive, useful and personalized.

Above the fold:

- Greeting with user's first name and a short contextual subtitle.
- Primary CTA: “Create an outfit”. Secondary CTA: “Add clothes”.
- A prominent “Your AI Avatar” card with avatar preview, avatar status and “View / Create avatar” action.
- Four summary cards: Total Items, Saved Outfits, AI Try-ons This Month, Remaining Credits.

Below the fold:

- **Outfit inspiration / Outfit of the day:** a large visual card with outfit image, tags and “View outfit” action. Use a realistic mock outfit.
- **Recently added to your wardrobe:** horizontal or grid list of 4–6 garment cards, category and date added.
- **Recently created outfits:** 3–4 saved outfit cards.
- **Quick actions:** Upload clothes, Generate outfit, Update avatar, Ask AI Stylist.
- **Wardrobe insight:** example “You have 4 pairs of shoes and 2 jackets you haven’t styled yet.” Make these insights clearly mock-data-based.

Dashboard content should adapt to an empty/new account. For a new user, show onboarding-oriented empty states with clear actions to add the first garment and create an avatar instead of zero-heavy charts.

#### `/app/avatar` — My Avatar

Build an avatar setup and management screen.

- Explain that a face photo and a full-body reference photo improve identity and body consistency.
- Two upload cards: Face Photo and Full-body Reference.
- Show file type/size guidance, upload progress, preview and remove/replace actions.
- Include consent checkbox acknowledging that the user owns or has permission to use the uploaded photos and agrees to AI processing.
- Primary CTA: “Generate my avatar”.
- Show a clear generation state with progress/status steps. Do not claim real percentage progress if no backend event provides it; use indeterminate progress or named stages.
- On completion, show a large avatar preview with actions: Regenerate, Replace references, Set as active avatar.
- Explain that avatar output is a visual representation and can vary from the original photos.
- Show generation history/version thumbnails if convenient.
- Include an option to delete avatar and source images, with confirmation.
- Include first-time empty state and error/retry state.

Mock generation should return a believable placeholder avatar image or a generated local mock asset. Keep the interaction behind `avatarService.generateAvatar()` so a real API can be wired in later.

#### `/app/wardrobe` — My Wardrobe

This is the user's digital closet.

Header:

- Title “My Wardrobe”.
- Item count and short supporting text.
- Primary CTA “Add clothes”.
- Optional secondary CTA “Bulk upload”.

Category navigation or tabs:

- All Items, Tops, Bottoms, One-piece, Outerwear, Footwear, Accessories, Traditional.
- Show counts per category.

Filters and search:

- Search by item name, brand or color.
- Filter by category, color, season, occasion, style and status.
- Sort by Recently Added, Name, Category or Most Worn.
- Grid/list view toggle.
- Clear all filters control.

Garment card:

- Clean item image.
- Garment name and subcategory.
- Color chip and optional brand.
- Optional favorite control.
- Overflow menu: View details, Edit, Add to outfit, Archive/Delete.
- Show processing badge for pending/failed images.
- Hover/focus actions on desktop; visible actions on mobile.

Item details drawer/page/modal:

- Large image and original image toggle if available.
- Editable name, category, subcategory, colors, pattern, brand, size, material, style, season and occasion tags.
- Added date, wear count and notes.
- Save/cancel actions.

Include high-quality states for loading, no items, no search results, category empty, image-processing pending and processing failure.

#### `/app/wardrobe/upload` — Add clothes / bulk upload

Create an upload workflow with:

- Drag-and-drop zone and file picker.
- Support multiple image selection.
- Accept common image formats (JPG, PNG, WebP); show reasonable file-size guidance.
- Preview selected files before submission, with remove/replace actions.
- Option to upload one item per image; explain that separate images produce better item recognition.
- Upload progress per file and overall progress.
- Per-item processing states: Uploaded, Cleaning image, Identifying item, Ready, Failed.
- Show processed item cards with clean image and AI-suggested category, color, pattern and name.
- Let the user correct suggested metadata before adding items to the wardrobe.
- “Add all ready items” and “Retry failed” actions.
- Preserve successful items if another file fails.
- Do not imply image background removal or Gemini processing has really happened in mock mode; mark it as a simulated demo operation in code and use the service abstraction.

#### `/app/wardrobe/:itemId` — Garment detail

A full detail route is optional if a drawer is sufficient, but the app must support viewing and editing an individual garment. Show the garment image, metadata, tags, notes, wear count, outfits that use it and actions to edit, archive or add it to Outfit Studio.

#### `/app/outfit-studio` — Outfit Studio

This is the core interactive screen. Design it as an intuitive outfit composition workspace.

Desktop layout:

- Main area split into three logical columns or two columns with a sticky preview panel.
- Left: wardrobe item selector with category tabs (Top, Bottom, Shoes, Accessories, Outerwear / One-piece).
- Center: selected garment slots and outfit configuration.
- Right: avatar preview / try-on result panel.

Mobile layout:

- Use a step-based flow or stacked sections: Select Items → Review Outfit → Generate Preview.
- Keep selected item summary accessible.

Selection behavior:

- One primary top slot.
- One primary bottom slot.
- One footwear slot.
- Optional accessory slots (watch, chain, cap, belt, sunglasses, bag, etc.).
- Optional outerwear layer.
- Support a one-piece garment that can replace top + bottom selection.
- Selecting an item again deselects it or allows replacing the slot.
- Show a visible selected state on each garment card.
- Show selected-item thumbnails and a remove/replace action.
- Do not allow the same garment to occupy incompatible slots.
- Provide filters/search within each category.
- Provide a “Clear selection” action.

Avatar and generation:

- Show active avatar or a useful empty state linking to Avatar setup.
- Before generation, show a summary of selected garments.
- Button: “Generate try-on”. Disable it when required selection or avatar is missing; explain what is missing.
- Show estimated credit cost before generation using mock configuration, e.g. “Uses 1 AI credit”.
- Confirmation dialog before consuming credits.
- Show a generation loading panel with status: Preparing references, Generating look, Saving preview.
- On success, show large full-body try-on image.
- Actions: Save outfit, Regenerate, Edit selection, Compare (can be a simple comparison state), Download preview (mock browser download only if a real image asset exists), Share (optional).
- Show a visible disclaimer: “AI previews are illustrative and may not reproduce exact fit, fabric or details.”

Use `outfitService.generateTryOn()` and typed request/response models. Never call the AI provider directly from a page component.

#### `/app/outfits` — Saved Outfits

- Grid of saved look cards with large generated preview image.
- Outfit name, tags, created date and garment count.
- Search by outfit name and filter by tag, occasion, season and date.
- Sort by Recently Created, Recently Worn or Name.
- Favorite toggle.
- Card actions: Open, Edit tags/name, Duplicate, Delete.
- Empty state CTA: “Create your first outfit”.

#### `/app/outfits/:outfitId` — Outfit details

- Large try-on image.
- Outfit name and editable description.
- Tags and occasion chips.
- “Items in this outfit” section showing the actual linked garment cards.
- Actions: Edit details, Recreate in Outfit Studio, Duplicate, Delete.
- Show created date and optional notes.
- If a linked garment has been archived, show a graceful archived-item state rather than breaking the page.

#### `/app/stylist` — AI Stylist

Design a refined chat-style personal stylist interface.

- Header explaining that suggestions are based on the user's own wardrobe.
- Chat transcript with distinct user and stylist message styles.
- Suggested prompt chips, e.g.:
  - “Create a smart-casual office look.”
  - “What can I wear to a dinner party?”
  - “Style my blue shirt in three ways.”
  - “Suggest an outfit using items I rarely wear.”
- Text input with send action and loading state.
- Optional occasion selector and style preference chips.
- AI responses can include outfit recommendation cards using garment images from the mock inventory.
- Each recommendation card has “Open in Outfit Studio” and “Save suggestion” actions.
- Include a clear empty state and no-wardrobe state.
- Use `stylistService.sendMessage()`; mock the conversation in demo mode.

#### `/app/calendar` — Outfit Calendar

- Month and week view toggle.
- Calendar navigation (previous/next/current date).
- Display saved outfit thumbnails or small outfit chips on planned dates.
- Add outfit to date via dialog.
- Edit/remove a planned outfit.
- Occasion label such as Office, Party, Travel or Wedding.
- Clicking a date opens that day's plan.
- On mobile, show a compact calendar and a selected-day agenda list.
- Use date-fns for date calculations.

#### `/app/analytics` — Wardrobe Analytics

Create meaningful charts based on mock data:

- Total wardrobe items by category (bar or donut chart).
- Most-used garments.
- Least-worn / never-worn items.
- Saved outfits by occasion.
- Outfit generation activity over time.
- Wardrobe utilization summary.
- Optional cost-per-wear metric only when mock purchase-price and wear-count data exist.

Include date-range filters and clear chart legends/tooltips. Provide a plain-language insight next to each chart. Do not fabricate metrics that conflict with the displayed data.

#### `/app/subscription` — Subscription & Credits

- Current plan card and renewal/expiry information.
- Remaining AI credits and monthly usage indicator.
- Plan comparison cards: Free, Pro and Premium.
- Upgrade/downgrade CTA with confirmation/checkout placeholder flow.
- Credit usage history table.
- Explain what consumes a credit (e.g. successful avatar or try-on generation, according to configurable mock rules).
- Provide an honest “Payments are in demo mode” state until payment integration exists.

Suggested illustrative Indian pricing for the UI only:

- Free: ₹0/month.
- Pro: ₹399/month.
- Premium: ₹799/month.

Keep plan prices and limits in a central mock configuration, not hard-coded throughout components. Mark prices as configurable demo values.

#### `/app/settings/profile`

- Name, email, profile photo and basic account details.
- Save/cancel actions and validation.
- Email verification status display (mock).

#### `/app/settings/preferences`

- Preferred styles, colors, fits, occasions and seasons.
- Default avatar selection if multiple avatars are supported later.
- Units and display preferences if relevant.

#### `/app/settings/notifications`

- Toggles for generation completion, product updates, weekly wardrobe insights and marketing emails.
- Save state with feedback.

#### `/app/settings/privacy`

- Explain what avatar and wardrobe data are stored for.
- Links or panels for privacy policy and terms placeholders.
- Download my data action (mock flow).
- Delete avatar and source photos action.
- Delete account action with typed confirmation / strong confirmation dialog.
- Clearly distinguish deleting source images, avatar images and saved outfit previews.

## 5. DATA TYPES AND MOCK DATA

Define shared TypeScript models in a central `types` area. Use string literal unions where appropriate.

At minimum, create types equivalent to:

```ts
export type GarmentCategory =
  | 'TOP'
  | 'BOTTOM'
  | 'ONE_PIECE'
  | 'OUTERWEAR'
  | 'FOOTWEAR'
  | 'ACCESSORY'
  | 'TRADITIONAL';

export type ProcessingStatus =
  | 'PENDING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  createdAt: string;
}

export interface Garment {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  imageUrl: string;
  originalImageUrl?: string;
  color: string;
  secondaryColor?: string;
  pattern?: string;
  brand?: string;
  size?: string;
  material?: string;
  styleTags: string[];
  occasionTags: string[];
  seasonTags: string[];
  favorite: boolean;
  status: ProcessingStatus;
  wearCount: number;
  createdAt: string;
  notes?: string;
}

export interface AvatarProfile {
  id: string;
  userId: string;
  faceReferenceUrl?: string;
  bodyReferenceUrl?: string;
  avatarImageUrl?: string;
  status: 'NOT_STARTED' | 'UPLOADED' | 'GENERATING' | 'READY' | 'FAILED';
  createdAt?: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  generatedImageUrl: string;
  garmentIds: string[];
  tags: string[];
  occasion?: string;
  favorite: boolean;
  createdAt: string;
}

export interface AiJob {
  id: string;
  type: 'AVATAR' | 'GARMENT_PROCESSING' | 'TRY_ON' | 'STYLIST';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progressMessage?: string;
  resultUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface SubscriptionSummary {
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  creditsRemaining: number;
  creditsIncluded: number;
  renewsAt?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIAL';
}
```

Adjust or extend these types where needed. Avoid using untyped objects for API payloads.

### Seed data

Create realistic sample data for a demo account:

- 18–24 wardrobe items spread across all main categories.
- A mix of shirts, T-shirts, jeans, trousers, jackets, sneakers, formal shoes, a kurta and accessories.
- 5–8 saved outfits with different occasions and tags.
- One active avatar.
- A realistic subscription summary and credit balance.
- Recent activity and calendar plans.

Use consistent mock IDs and relationships: every `Outfit.garmentIds` entry should refer to an existing garment unless the UI is intentionally demonstrating an archived item.

Provide robust placeholder images. Prefer project-owned local assets. If none are supplied, create attractive local SVG placeholders or use stable image assets with an `onError` fallback. Do not make the UI depend on an unreliable random-image endpoint.

## 6. FRONTEND SERVICE / API ARCHITECTURE

The UI must not import mock data directly into every page. Create a clean service layer that can be switched from mock to real Spring Boot APIs.

Suggested service modules:

- `authService`: login, register, logout, current user.
- `userService`: profile, preferences and settings.
- `avatarService`: upload references, generate avatar, fetch avatar, delete avatar.
- `wardrobeService`: upload garments, list, get, update, archive, delete, favorite.
- `outfitService`: generate try-on, save, list, get, update, duplicate, delete.
- `stylistService`: send message and retrieve conversation.
- `calendarService`: list, create, update and remove outfit plans.
- `analyticsService`: fetch analytics summary.
- `subscriptionService`: fetch plan, usage, change plan and purchase credits.

Create a typed HTTP client wrapper with:

- Centralized base URL from `VITE_API_BASE_URL`.
- Authorization header injection point for the session token.
- JSON parsing and typed error handling.
- Consistent handling of 401, 403, 404, 422 and 5xx errors.
- Request timeout/abort support where appropriate.

For this first frontend build, implement `mock` services that return seeded data and simulate network delay. Keep the mock adapter separate from real API implementations. Add an environment switch such as `VITE_USE_MOCK_API=true`.

Do not claim that actual Gemini generation, payments, email delivery or social sign-in works when using mocks. Label those flows clearly as demo/simulated where appropriate.

### Suggested API contract placeholders

Keep the frontend ready for these Spring Boot endpoints (exact paths can be adjusted later):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/avatar`
- `POST /api/avatar/upload-references`
- `POST /api/avatar/generate`
- `DELETE /api/avatar`
- `GET /api/wardrobe/items`
- `POST /api/wardrobe/upload-url`
- `POST /api/wardrobe/items/complete`
- `GET /api/wardrobe/items/{id}`
- `PATCH /api/wardrobe/items/{id}`
- `DELETE /api/wardrobe/items/{id}`
- `POST /api/outfits/preview`
- `POST /api/outfits`
- `GET /api/outfits`
- `GET /api/outfits/{id}`
- `PATCH /api/outfits/{id}`
- `DELETE /api/outfits/{id}`
- `POST /api/stylist/messages`
- `GET /api/calendar/outfits`
- `POST /api/calendar/outfits`
- `GET /api/analytics/overview`
- `GET /api/subscription`

For long-running AI operations, model the response as a job ID and poll a typed job status endpoint or subscribe through SSE. The frontend should support pending, processing, completed and failed states.

## 7. STATE, FORMS AND INTERACTION DETAILS

- Use URL query parameters for shareable filters where appropriate (wardrobe category, search, outfit tag).
- Keep temporary outfit selections in a dedicated Outfit Studio state store or hook.
- Preserve the current outfit selection when moving between item categories inside Outfit Studio.
- Keep filters and search state local to the relevant page unless there is a strong reason otherwise.
- Use optimistic updates only for safe actions such as favorites; revert on error.
- Confirm destructive actions such as delete, archive, remove avatar and delete account.
- Validate all form inputs with Zod.
- Display field-level errors and accessible form descriptions.
- Disable submit buttons during requests and prevent duplicate submissions.
- Handle file selection, file previews, cleanup of temporary object URLs and upload errors safely.
- Make empty states actionable. Example: “Your wardrobe is waiting” with an “Upload your first items” button.
- Make successful actions visible through toast feedback and/or updated content.
- Add a not-found page and a route-level error boundary.

## 8. RESPONSIVE AND ACCESSIBILITY REQUIREMENTS

Test and refine the design at these approximate viewport sizes:

- Desktop: 1440 × 900.
- Laptop: 1280 × 800.
- Tablet: 768 × 1024.
- Mobile: 390 × 844 and 360 × 800.

Requirements:

- No horizontal overflow at any viewport.
- Cards and forms resize gracefully.
- Wardrobe grids adapt column count to available width.
- Outfit Studio becomes a logical mobile step flow.
- Tables become scrollable or card-based on mobile.
- Modals fit smaller screens and allow internal scrolling.
- Every input has a visible label.
- Icon-only buttons have accessible names/tooltips.
- Use logical heading order and semantic landmarks.
- Ensure reasonable text contrast and visible keyboard focus.
- Do not rely on color alone to communicate status.

## 9. PERFORMANCE AND QUALITY

- Lazy-load route-level pages where useful.
- Use image loading and aspect-ratio placeholders to reduce layout shift.
- Render garment and outfit grids efficiently; use pagination or “Load more” if appropriate.
- Avoid unnecessary re-renders and giant state objects.
- Keep uploaded image previews at appropriate display sizes; do not use original full-resolution files for every thumbnail.
- Add sensible error boundaries and fallback UI.
- Keep console free of avoidable warnings and runtime errors.
- Include basic unit/component tests for key flows if the project setup supports it.

## 10. SUGGESTED PROJECT STRUCTURE

Use a feature-oriented structure similar to this (adjust when useful, but preserve separation of concerns):

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    query-client.ts
  components/
    layout/
    common/
    forms/
    feedback/
    wardrobe/
    outfits/
    avatar/
  features/
    auth/
      pages/
      components/
      schemas/
    onboarding/
    dashboard/
    avatar/
    wardrobe/
    outfit-studio/
    outfits/
    stylist/
    calendar/
    analytics/
    subscription/
    settings/
  services/
    http-client.ts
    adapters/
      mock/
      api/
    auth.service.ts
    user.service.ts
    avatar.service.ts
    wardrobe.service.ts
    outfit.service.ts
    stylist.service.ts
    calendar.service.ts
    analytics.service.ts
    subscription.service.ts
  hooks/
  store/
  types/
  lib/
  config/
  mocks/
  styles/
  assets/
```

## 11. IMPLEMENTATION ORDER

Build the app in this order, but keep the architecture ready for all routes:

1. Set up Vite, React, TypeScript, Tailwind and the component system.
2. Define design tokens, fonts, app shell, sidebar, topbar and responsive navigation.
3. Create shared types, seed data and mock services.
4. Implement auth screens and route protection with demo authentication.
5. Build Dashboard using seeded mock data.
6. Build Wardrobe list, item detail/edit and bulk upload workflow.
7. Build Avatar setup and simulated generation flow.
8. Build Outfit Studio selection, validation, simulated try-on and save flow.
9. Build Saved Outfits and outfit detail.
10. Build AI Stylist, Calendar, Analytics and Subscription.
11. Build Settings, privacy actions, empty/error/loading states and responsive refinements.
12. Run TypeScript checks, lint/build and fix all errors.

Do not stop after the dashboard. All routes listed in this prompt must exist and be navigable.

## 12. ACCEPTANCE CRITERIA

The frontend is complete only when all of the following are true:

- The project starts locally with documented commands.
- Every route listed above exists and renders without runtime errors.
- A user can use demo signup/login and reach the dashboard.
- Sidebar/mobile navigation works and highlights the correct route.
- Dashboard shows realistic sample wardrobe and outfit information.
- User can open Avatar, select local reference images, preview them and simulate avatar generation.
- User can upload multiple local clothing images, preview them, remove files, simulate processing and add ready items to the wardrobe.
- Wardrobe search, category filters, sorting, favorite, edit and archive/delete interactions work.
- Outfit Studio allows selecting and replacing top, bottom, footwear and optional accessories.
- Outfit generation validates the avatar/selection, shows credit cost, simulates a job and displays a result state.
- User can save the outfit, attach tags and find it in Saved Outfits.
- Saved outfit details show their linked garment items.
- Stylist chat accepts a message and returns a useful mock response with wardrobe-based recommendations.
- Calendar allows assigning and removing outfits on dates.
- Analytics charts reflect the seeded data.
- Subscription and settings pages render and their demo interactions work.
- Loading, empty, error and success states are included in the important workflows.
- No API key or secret is present in frontend source code.
- No visible primary button is inert.
- The UI is responsive at the target viewport sizes.
- `npm run build` and TypeScript checks pass without errors.

## 13. FINAL DELIVERY INSTRUCTIONS

When finished:

1. Create the complete project files in the current workspace.
2. Provide a concise summary of the screens and interactions implemented.
3. List the exact commands to install dependencies and run the app.
4. List the environment variables required for mock mode and future backend mode in a `.env.example` file.
5. Explain where to change the brand name, theme colors, mock pricing and mock credit limits.
6. Identify any feature that is deliberately simulated because a backend/API integration is not connected yet.
7. Do not say the app is production-ready unless authentication, storage, backend APIs, AI processing and payments are actually connected and tested.

**Now build the complete React + TypeScript frontend. Prioritize a polished, cohesive product experience, functional navigation and working interactions over decorative complexity.**
