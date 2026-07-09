# DekoKraft Future Ideas Roadmap

This document collects long-term product ideas for DekoKraft. It is a planning document, not an implementation contract.

## Vision

The goal is not only to build an online marketplace, but to create a digital ecosystem that empowers people with disabilities and talented hobby craftsmen across Europe.

The platform should become:

- Marketplace
- Community
- Learning platform
- Social inclusion project
- AI assistant
- Future registered association, or e.V.

## Version 1: MVP

### User Management

- Customer accounts
- Vendor accounts
- Admin dashboard
- Email verification
- Password recovery
- Multi-language support:
  - Arabic
  - German
  - English
  - French

### Vendor Dashboard

Each vendor has:

- Products
- Orders
- Earnings
- Messages
- Reviews
- Shipping status
- Statistics

### Marketplace

- Categories
- Candles
- Gifts
- Children
- Decoration
- Handmade
- Personalized products

### Product Features

- Multiple images
- Videos
- Variants
- Stock
- SEO
- QR code

### Payments

- Stripe
- PayPal
- Bank transfer

### Security

- HTTPS and SSL
- DSGVO compliance
- Cookie consent
- Privacy policy
- Terms

### Accessibility

- Screen reader support
- High contrast mode
- Keyboard navigation
- Large text

## Version 2

### AI

- AI product descriptions
- AI translation
- AI SEO
- AI pricing
- AI image enhancement
- AI assistant

### Social

- Vendor profiles
- Followers
- Favorites
- Messaging
- Community

### Logistics

- DHL
- Hermes
- DPD
- GLS
- Tracking

### Marketing

- Coupons
- Gift cards
- Newsletters
- Affiliate program

## Version 3

### Social Inclusion Platform

Dedicated platform for:

- Disabled artisans
- Elderly creators
- Refugees
- Hobby makers

### Registered Association

Future objective: found a German nonprofit association, or e.V., supporting disabled artisans.

Possible goals:

- Social inclusion
- Training
- Employment
- Workshops
- Financial support
- Donations

### Education

- Courses
- Tutorials
- Certificates

### AI Studio

- Automatic product photography
- Automatic translations
- Voice assistant
- AI customer service

### Accessibility+

- Voice navigation
- Eye tracking
- Speech recognition

### Sustainability

- Eco packaging
- CO2 statistics
- Green shipping

### Trust

- DSGVO compliant
- SSL/TLS encryption
- Accessibility compliant, including BFSG
- Regular security audits
- Backups
- Two-factor authentication

## Long-Term Vision

Become one of the largest European platforms dedicated to handmade products created by people with disabilities while helping them achieve financial independence, social inclusion, and equal opportunities.

## Current Magic Web Prototype Context

DekoKraft CMS is currently evolving into a smart product creation workspace. The Product Modal is the first Magic Web workspace and currently supports local UI workflows for:

- Basic product fields
- Natural-language product specifications
- Color selection and custom color requests
- Multi-image upload previews
- Image role assignment
- Local image ordering
- Smart Analysis preview
- Product Card preview
- Smart Product Blueprint preview
- Smart Product Engine pipeline display

There is no backend saving, real file processing, payment processing, or AI call in this workflow yet.

## Near-Term Product Creation Roadmap

- Connect Product Engine steps more deeply to local state.
- Improve modal section layout and reduce visual density.
- Add product draft state locally.
- Add stronger local product preview.
- Add validation for required product fields.
- Add validation for 3 to 4 product images.
- Make pipeline steps clickable.
- Show exact missing requirements for each pipeline step.
- Add completion percentage.
- Extract large modal sections into reusable product components when requested.

## Implementation Guardrails

- Make small safe changes.
- Modify only the files requested by the user.
- Do not add backend behavior unless explicitly requested.
- Do not make real AI calls yet.
- Do not save products or files unless explicitly requested.
- Do not add payment, logistics, email, account, or legal flows unless explicitly requested.
- Keep Arabic, German, English, and French labels when touching product UI.
- Preserve Arabic RTL support.
- Preserve current local UI behavior unless the user asks to change it.
- Prefer local state and placeholders while the workflow is still in prototype mode.
- Keep product work modular so future extraction stays easy.

## Related Documents

- `MAGIC_WEB_ROADMAP.md`
- `MAGIC_WEB_IDEAS.md`
- `MAGIC_WEB_ARCHITECTURE.md`
- `MAGIC_WEB_RULES.md`
- `MAGIC_WEB_CHANGELOG.md`
