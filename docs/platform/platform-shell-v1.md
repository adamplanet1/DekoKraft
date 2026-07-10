# Platform Shell Blueprint v1

## 1. Global Navigation

The Platform Shell provides the global navigation structure for DekoKraft.

It gives users a consistent way to move between major platform spaces without each space inventing its own navigation model. The shell should remain stable while individual spaces evolve.

Global navigation should help users understand:

- Where they are.
- Which spaces they can access.
- Which actions are available.
- How to return to important platform areas.

## 2. Main Spaces

The Platform Shell includes these main spaces:

- Marketplace
- Creator Space
- Partner Space
- Learning Space
- Community Space
- Administration Space

## 3. Space Responsibilities

### Marketplace

The Marketplace is where customers discover, configure, and buy products or services.

### Creator Space

Creator Space is where creators build products, manage recipes, improve listings, and prepare offers for publishing.

### Partner Space

Partner Space is where creator partners, makers, or business partners manage their profiles, products, orders, and growth support.

### Learning Space

Learning Space provides education, tutorials, onboarding guidance, best practices, and creator growth resources.

### Community Space

Community Space supports interaction between creators, customers, makers, and the platform through updates, feedback, showcases, and future community features.

### Administration Space

Administration Space is where admins manage products, creators, partners, quality review, publishing, platform data, and operational workflows.

## 4. Navigation Rules

Users move between spaces through the Platform Shell.

Navigation rules:

- The shell owns top-level navigation.
- Each space owns its internal navigation.
- Users should only see spaces they are allowed to access.
- Switching spaces should preserve user context where possible.
- Critical workflows should clearly show progress and current location.
- Admin and partner tools should not be mixed into the customer marketplace experience.

## 5. Future Expansion

New spaces can be added without changing the shell architecture.

The shell should treat spaces as modular entries with:

- Name
- Route
- Icon or visual marker
- Access rules
- Short description
- Optional notification count

Future spaces could include:

- Workshop Space
- Analytics Space
- Events Space
- Supplier Space
- Support Space

Adding a new space should extend the shell configuration rather than redesigning the entire platform navigation.
