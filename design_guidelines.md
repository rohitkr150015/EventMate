# EventMate Design Guidelines

## Design System: Positivus Theme

**Primary Theme**: Dark, modern aesthetic inspired by the Positivus design system.

**Core Colors**:
- **Background**: Dark charcoal (#0B0B0F / HSL 240 50% 3%)
- **Primary Accent**: Lime green (#B9FF66 / HSL 75 100% 70%)
- **Foreground**: Light gray (#F2F2F2 / HSL 0 0% 95%)
- **Card Background**: Dark slate (HSL 240 30% 6%)
- **Muted**: Subtle dark (HSL 240 25% 10%)

**Design Principles**:
- High contrast between dark backgrounds and lime green accents
- Rounded corners (1rem radius) for a friendly, modern feel
- Clean typography with Space Grotesk font family
- Minimal shadows, emphasis on color contrast

## Typography System

**Font Families**:
- Primary: Space Grotesk (UI, body text, headings)
- Monospace: JetBrains Mono (code, technical content)

**Scale**:
- Hero: text-5xl to text-7xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body: text-base, font-normal
- Captions/Meta: text-sm, text-muted-foreground

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8
- Form field spacing: space-y-4

**Containers**:
- Full-width sections: w-full with max-w-7xl mx-auto px-6
- Dashboard content: max-w-6xl
- Form containers: max-w-2xl
- Auth pages: max-w-md centered

## Core Components

### Landing Page Structure

**Hero Section**:
- Gradient background with subtle primary color accent
- Large headline with lime green accent on key words
- Clear CTA buttons with primary (lime green) styling
- Statistics cards showing platform metrics

**Feature Sections**:
- 3-column grid showcasing core capabilities
- Each with lucide icon, headline, description
- Cards with subtle elevation and hover states

**CTA Section**:
- Full-width primary color background
- Centered messaging with secondary button style
- Trust indicators below

### Authentication Pages

**Login/Register**:
- Centered card with backdrop blur
- Lime green accent border
- Icon logo at top
- Clear form labels and inputs
- Primary button for submit
- Link to alternate auth page

### Dashboard Layouts

**Sidebar Navigation**:
- Dark sidebar background
- Lime green accent for active items
- Icon + text menu items
- Collapsible on mobile

**Main Content**:
- Card-based layouts for data display
- Progress indicators with primary color
- Action buttons in primary style

### Event Creation Flow

**Multi-step Form**:
- Progress indicator with lime green completion
- Large form fields with clear labels
- AI recommendation cards with match scores
- Review step with summary

### Budget & Payments

**Budget Dashboard**:
- Donut/pie charts with lime green as primary color
- Expense list with status badges
- Progress bars for budget usage

**Payment Flow**:
- Stripe checkout integration
- Clear breakdown before checkout
- Success/cancel confirmation pages

## Component Patterns

### Buttons
- Primary: Lime green background, dark text
- Secondary: Light/dark background with contrasting text
- Ghost: Transparent with subtle hover
- Icon buttons: Square with icon only

### Cards
- Dark background with subtle border
- Rounded corners (1rem)
- Hover state with elevation
- No nested cards

### Badges
- Small, pill-shaped
- Primary uses lime green
- Status badges (success, warning, error)

### Forms
- Clear labels above inputs
- Rounded input fields
- Error states with destructive color
- Submit buttons full-width on mobile

## Dark/Light Mode

The application supports both dark and light modes:
- **Dark Mode** (Default): Positivus theme with dark backgrounds
- **Light Mode**: Inverted with light backgrounds, same lime green accent

Toggle available in navigation header.

## Accessibility

- Minimum contrast ratio of 4.5:1 for text
- Focus states visible on all interactive elements
- Form labels associated with inputs
- Alt text for all images
- Keyboard navigation support
