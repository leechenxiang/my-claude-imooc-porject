---
name: Financial Manager System
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#514345'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#837375'
  outline-variant: '#d6c2c4'
  surface-tint: '#864e5a'
  primary: '#864e5a'
  on-primary: '#ffffff'
  primary-container: '#ffb7c5'
  on-primary-container: '#7b4551'
  inverse-primary: '#fbb3c1'
  secondary: '#655781'
  on-secondary: '#ffffff'
  secondary-container: '#deccfd'
  on-secondary-container: '#62547e'
  tertiary: '#9b4053'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffb7c1'
  on-tertiary-container: '#8f364a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#fbb3c1'
  on-primary-fixed: '#360c19'
  on-primary-fixed-variant: '#6b3743'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d0bfef'
  on-secondary-fixed: '#21143a'
  on-secondary-fixed-variant: '#4d4068'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#ffb2bd'
  on-tertiary-fixed: '#400014'
  on-tertiary-fixed-variant: '#7d283c'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin: 20px
---

## Brand & Style

The brand personality of this design system is defined as a "Gentle Financial Steward." It balances the technical precision required for wealth management with a nurturing, approachable aesthetic that reduces the anxiety often associated with personal finance. The target audience includes young professionals and families seeking a calm, organized way to track their financial life.

The visual style is a hybrid of **Soft Minimalism** and **Modern Corporate**. It avoids the sterility of traditional fintech by using organic gradients, generous white space, and a "tactile-soft" feel. The emotional response should be one of clarity, relief, and optimism. Every interaction is designed to feel effortless, moving away from rigid spreadsheets toward an intuitive, lifestyle-oriented experience.

## Colors

The color palette centers on a sophisticated "Sakura & Lavender" gradient, which serves as the primary brand identifier. This gradient should be used for high-impact areas like primary action buttons, progress charts, and active states. 

- **Primary Dark (Rose Pink):** Reserved for hover states or critical primary actions that require higher contrast against the cream background.
- **Semantic Colors:** Income and Expense are handled with softened versions of green and red (Mint and Coral) to maintain the "warm" theme without triggering the visual "alarm" of traditional high-contrast financial UIs.
- **Backgrounds:** The primary surface is a warm Cream White. To create visual separation, interactive cards and containers utilize a Pale Pink White, providing a subtle layering effect that feels more integrated than a standard gray.
- **Typography:** Warm Gray replaces pure black to soften the reading experience, while Light Gray is used for auxiliary metadata.

## Typography

**Plus Jakarta Sans** is the exclusive typeface for this design system. It was chosen for its modern, geometric construction tempered by slightly rounded terminals, which perfectly mirrors the soft-yet-professional brand narrative.

- **Headlines:** Use Bold weights for H1 and H2 to establish clear information hierarchy.
- **Financial Data:** Large currency displays should use the `price-display` style with semi-bold or bold weight to ensure immediate legibility.
- **Body Text:** Maintain a generous line height (1.6) for paragraph text to preserve the "breathable" feel of the interface.
- **Labels:** Small labels use a slightly increased letter spacing and a medium-to-bold weight to remain readable at reduced sizes.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with a base unit of 4px. For mobile interfaces, a 4-column grid is standard, while desktop views expand to a 12-column grid.

- **Margins:** A standard 20px screen margin is used to ensure content does not feel cramped against device edges.
- **Rhythm:** Vertical spacing between cards should primarily use `lg` (24px) to emphasize the minimalist, airy aesthetic.
- **Padding:** Internal card padding is set to `md` (16px) or `lg` (24px) depending on the complexity of the data, ensuring the "Pale Pink White" background has room to breathe around the content.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. Instead of harsh shadows, this design system uses extra-diffused, low-opacity shadows tinted with the primary Lavender Purple (#C9B8E8) to create a soft glow rather than a dark void.

- **Level 0 (Background):** Cream White (#FFF9F5). No elevation.
- **Level 1 (Cards):** Pale Pink White (#FFF0F3). These elements sit 2px above the background with a very soft 8px blur shadow (3% opacity).
- **Level 2 (Active/Modals):** These elements use a 16px blur shadow (6% opacity) and may feature a thin 1px border in Sakura Pink at 20% opacity to define the edge.
- **Glassmorphism:** Use backdrop blurs (20px radius) for top navigation bars and bottom sheets to maintain a sense of context and depth.

## Shapes

The shape language is consistently rounded to reinforce the friendly and approachable personality. 

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Content cards and main navigation containers use a 1rem (16px) radius.
- **Special Elements:** Search bars and "Add Transaction" buttons use a **Pill-shaped** radius (full rounding) to differentiate them as high-frequency interaction points.
- **Icons:** Use a consistent 2px stroke width with rounded caps and corners. Avoid sharp angles in custom iconography.

## Components

### Buttons
- **Primary:** Sakura-Lavender gradient with white text. Pill-shaped. Subtle shadow matching the gradient's mid-tone.
- **Secondary:** Pale Pink White background with Sakura Pink text. 8px rounded corners.
- **Ghost:** No background, Warm Gray text, used for less frequent actions like "Cancel."

### Cards
- Always use the Pale Pink White background. 
- Avoid borders unless the card contains complex nested data; in that case, use a 1px Sakura Pink border at 10% opacity.

### Input Fields
- Soft Cream White background (slightly darker than the main BG) with a 1px Light Gray border. 
- On focus, the border transitions to Sakura Pink with a soft glow.

### Lists
- Transaction lists should have generous vertical padding (16px).
- Categories are represented by soft-colored circular icons with high-quality, simplified glyphs.

### Chips
- Used for filtering (e.g., "Food," "Travel").
- Inactive: Light Gray background with Warm Gray text.
- Active: Sakura Pink background with white text.

### Progress Bars
- Use the primary gradient for "Current Spend" to make financial progress feel rewarding rather than stressful.