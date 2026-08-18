---
name: LumixEngine
description: Automações & Sites para Negócios Locais
colors:
  primary: "#8B5CF6"
  primary-glow: "#A855F7"
  secondary: "#3B82F6"
  accent-success: "#34D399"
  accent-star: "#FBBF24"
  neutral-night: "#0B0813"
  neutral-panel: "#130F24"
  neutral-border: "#261C47"
  text-primary: "#FFFFFF"
  text-muted: "#CBD5E1"
  text-dim: "#64748B"
  text-accent: "#DDD6FE"
typography:
  display:
    fontFamily: '"Plus Jakarta Sans", sans-serif'
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: '"Plus Jakarta Sans", sans-serif'
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: '"Plus Jakarta Sans", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: '"Plus Jakarta Sans", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: '"Plus Jakarta Sans", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.025em"
rounded:
  sm: "4px"
  md: "8px"
  xl: "16px"
  "2xl": "24px"
  "3xl": "32px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-glow}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
  badge-eyebrow:
    backgroundColor: "rgba(139, 92, 246, 0.1)"
    textColor: "{colors.text-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  card-panel:
    backgroundColor: "{colors.neutral-panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: "28px"
---

# Design System: LumixEngine

## Overview

**Creative North Star: "The Midnight Signal"**

LumixEngine's visual language evokes the energy and precision of an advanced nocturnal command center, built specifically to convey immediate responsiveness, high performance, and continuous 24/7 conversion for local businesses. The dark canvas (`#0B0813`) creates a calm, focused backdrop where electric violet (`#8B5CF6`), magenta (`#A855F7`), and radiant cobalt (`#3B82F6`) pulses lead the visitor's eye directly to conversion actions.

The interface balances sleek glassmorphism and subtle gradient borders with tight, high-contrast typography in Plus Jakarta Sans. Instead of generic corporate aesthetics or stark flat wireframes, LumixEngine uses layered atmospheric lighting and tactile card containers to make automation feel tangible, modern, and effortless.

**Key Characteristics:**
- **Deep Obsidian Canvas**: Immersive dark surfaces with ambient radial light leaks that focus attention.
- **Electric Accent Hierarchy**: Luminous violet and magenta gradients dedicated strictly to high-value actions and active statuses.
- **Atmospheric Depth**: Glass-morphic navigation, fine borderlines (`#261C47`), and subtle reactive glow borders on hover.
- **High-Velocity Typography**: Geometric, bold Plus Jakarta Sans providing instant readability and assertive authority.

## Colors

The palette uses a high-contrast dark scheme punctuated by vibrant spectral gradients that signal speed, modern automation, and live status.

### Primary
- **Neon Violet** (`#8B5CF6`): The central brand accent. Used for primary CTAs, icon containers, active badges, and focus rings.
- **Electric Magenta** (`#A855F7`): Atmospheric highlight and gradient companion to Neon Violet for intense visual energy.

### Secondary
- **Cobalt Azure** (`#3B82F6`): Tertiary gradient anchor for CTA buttons and chat bubble gradients, adding depth and tech maturity.

### Tertiary
- **Emerald Pulse** (`#34D399`): Dedicated exclusively to positive status signals (e.g. "Online", sub-2s response indicators, checklist confirmations).
- **Amber Star** (`#FBBF24`): Used for 5-star customer review indicators and trust proofs.

### Neutral
- **Deep Obsidian / Night** (`#0B0813`): Root canvas background and base atmosphere.
- **Indigo Panel** (`#130F24`): Structural card surfaces, accordion panels, and mock UI frames.
- **Borderline Violet** (`#261C47`): Structural dividers, card borders, and subtle glass separation lines.
- **Pure White** (`#FFFFFF`): Primary headlines, emphasized card titles, and high-contrast CTA text.
- **Slate 300** (`#CBD5E1`): Body copy and supporting descriptive text.
- **Slate 500 / Dim** (`#64748B`): Secondary labels, muted indicators, and placeholder notes.
- **Violet Tint** (`#DDD6FE`): Eyebrow badge text and highlighted tags.

### Named Rules
**The Luminescence Rule.** Bright violet and magenta gradients are reserved strictly for conversion triggers (CTAs, featured badges, active chat bubbles) and must never exceed 15% of the viewport area.  
**The Status Purity Rule.** Emerald green is strictly functional—used exclusively for active system states, checkmarks, and operational signals.

## Typography

**Display Font:** Plus Jakarta Sans (with `sans-serif` fallback)  
**Body Font:** Plus Jakarta Sans (with `sans-serif` fallback)  

**Character:** Plus Jakarta Sans brings clean geometric forms with humanist open counters, delivering authoritative, ultra-modern clarity suited for rapid scanning on mobile and desktop alike.

### Hierarchy
- **Display** (800 / ExtraBold, `clamp(2.25rem, 5vw, 3.75rem)`, line-height: `1.15`): Hero headlines. High visual weight, direct, compelling.
- **Headline** (800 / ExtraBold, `clamp(1.875rem, 4vw, 3rem)`, line-height: `1.2`): Section titles (`Soluções`, `Depoimentos`, `FAQ`).
- **Title** (800 / ExtraBold, `1.5rem` / 24px, line-height: `1.3`): Card titles and service headers.
- **Body** (400/500 / Regular & Medium, `1.125rem` / 18px on desktop, `1rem` / 16px on mobile, line-height: `1.75`): Descriptive copy, testimonial quotes, and answers. Max line length 65ch.
- **Label / Eyebrow** (700 / Bold, `0.875rem` / 14px, line-height: `1.4`, letter-spacing: `0.025em`): Section eyebrow pills, benefit checkmarks, and button labels.

### Named Rules
**The Scan-First Weight Rule.** All headings and interactive labels must maintain an `800` (ExtraBold) or `700` (Bold) weight to guarantee immediate comprehension during fast scroll-scanning.

## Layout

The spatial model relies on a clean, centralized 12-column grid container bounded at `max-w-7xl` (1280px) with fluid mobile padding (`px-5` / 20px) transitioning to `px-8` (32px) on desktop.

- **Vertical Rhythm:** Major sections utilize generous vertical separation (`py-20` / 80px mobile to `py-28` / 112px desktop) with subtle horizontal divider lines (`border-y border-borderline/70`).
- **Grid Patterns:**
  - Hero: Asymmetrical 2-column split (`1.05fr / 0.95fr`) pairing conversion copy with the live WhatsApp simulation.
  - Services & Testimonials: Uniform 3-column responsive grid (`gap-5` / 20px), stacking to 1 column on mobile.
  - FAQ: Split layout (`0.8fr / 1.2fr`) with persistent sticky context on the left and stacked accordion items on the right.
- **Density:** Balanced density with generous internal card padding (`p-7` / 28px) ensuring effortless tap targets and zero visual clutter.

## Elevation & Depth

LumixEngine conveys spatial hierarchy through a combination of layered dark panels, atmospheric radial light leaks, and reactive gradient borders rather than harsh drop shadows.

### Shadow Vocabulary
- **Soft Ambient** (`box-shadow: 0 24px 80px rgba(15, 23, 42, 0.26)`): Default card elevation providing separation from the dark background.
- **Violet Aura** (`box-shadow: 0 18px 60px rgba(139, 92, 246, 0.25)`): Featured service card and primary interactive highlights.
- **Hover Lift Glow** (`box-shadow: 0 22px 70px rgba(139, 92, 246, 0.38)`): High-intensity glow triggered during primary button hover state.
- **Inner Frame Glow** (`box-shadow: inset 0 0 42px rgba(255, 255, 255, 0.04)`): Internal smartphone simulator depth.

### Named Rules
**The Gradient Border Rule.** Surface boundaries use a 1px masked linear gradient (`135deg, rgba(139,92,246,0.78), rgba(59,130,246,0.24), rgba(168,85,247,0.1)`) that transitions opacity from `0` to `1` on hover, signaling interactivity through light rather than harsh structural displacement.

## Shapes

- **Pill Silhouette (`rounded-full` / 9999px):** Universal treatment for call-to-action buttons, eyebrow badges, status tags, and avatar rings.
- **Container Radii (`rounded-3xl` / 24px - 32px):** Applied to all major surface containers (services cards, testimonial cards, FAQ accordion items).
- **Nested Radii (`rounded-2xl` / 16px):** Used for interior elements such as icon container blocks and speech bubbles.
- **Asymmetric Corners (`rounded-2xl rounded-br-sm` / `rounded-bl-sm`):** WhatsApp chat bubbles utilize asymmetric 4px corner pinches on their tail side to reinforce conversational authenticity.

## Components

### Buttons
- **Primary CTA:**
  - **Shape:** Pill (`rounded-full` / 9999px).
  - **Color:** Linear gradient (`from-violetGlow via-magentaGlow to-blue-500`), text `#FFFFFF` font-extrabold.
  - **Padding:** `16px 28px` (`px-7 py-4`).
  - **States:** Hover `-translate-y-0.5` with amplified violet shadow (`0 22px 70px rgba(139,92,246,0.38)`). Focus ring `ring-2 ring-violetGlow ring-offset-2 ring-offset-night`.
- **Secondary CTA:**
  - **Shape:** Pill (`rounded-full` / 9999px).
  - **Color:** Translucent dark fill (`bg-white/5`), 1px border `#261C47` (`border-borderline`), text `#FFFFFF` font-bold.
  - **Padding:** `16px 28px` (`px-7 py-4`).
  - **States:** Hover `border-violetGlow/70` and `bg-violetGlow/10`.

### Eyebrow Badges
- **Style:** Compact pill (`rounded-full`, `px-4 py-2`), border `border-violetGlow/30`, background `bg-violetGlow/10`, text `text-violet-200` (`#DDD6FE`) with leading inline icon.

### Service & Testimonial Cards
- **Corner Style:** `rounded-3xl` (24px).
- **Background:** Regular cards use `bg-panel` (`#130F24`); Featured cards use `bg-gradient-to-b from-violetGlow/16 to-panel`.
- **Border:** 1px `border-borderline` (`#261C47`) with `.gradient-border` mask overlay. Featured card has permanent `border-violetGlow/50`.
- **Internal Padding:** `28px` (`p-7`).
- **Interactive State:** `hover:-translate-y-1` smooth lift with gradient border activation.

### FAQ Accordion Items
- **Structure:** Rounded card (`rounded-3xl`, `bg-panel`, `border-borderline`).
- **Trigger:** Full-width header button with bold question text and a circular `+` indicator badge (`bg-violetGlow/10`, `text-violetGlow`).
- **State Transition:** Circular badge rotates 45 degrees to form an `×` when opened, while content expands smoothly via Framer Motion height animation.

### Mock Chat Simulator (Signature Component)
- **Structure:** Simulated smartphone viewport (`rounded-[2.35rem]` outer chassis, `rounded-[2rem]` inner screen) with dynamic live message queue, animated 3-dot typing indicator, and green pulse status pill.

## Do's and Don'ts

### Do:
- **Do** maintain the high-contrast dark foundation (`#0B0813` background with `#130F24` panels) for all new surfaces and sections.
- **Do** use `Plus Jakarta Sans` with bold/extrabold weights (`700`/`800`) for headers and CTAs to preserve brand punchiness.
- **Do** apply the `.gradient-border` treatment and `rounded-3xl` corner radius to all content cards for visual consistency.
- **Do** reserve emerald green (`#34D399`) exclusively for positive status, confirmation checkmarks, and operational indicators.
- **Do** ensure all primary actions link directly to formatted `wa.me` links with pre-filled conversion text.

### Don't:
- **Don't** introduce flat light mode panels or harsh white backgrounds; LumixEngine's identity relies on deep nocturnal atmosphere.
- **Don't** use sharp rectangular corners (`rounded-none` or `rounded-sm`) on cards or buttons; preserve the smooth modern pill and `rounded-3xl` radii.
- **Don't** use unstyled, raw generic drop shadows (`rgba(0,0,0,0.8)`); always use tinted ambient diffusion (`rgba(15,23,42,0.26)`) and violet glows (`rgba(139,92,246,0.25)`).
- **Don't** overload screens with competing bright colors; stick to the Violet-Magenta-Azure spectral gradient hierarchy.
