# Recipe Validator v1

## Purpose

Recipe Validator v1 defines how every Product Recipe is checked before it can be used as a reliable product foundation.

The validator does not produce UI, prices, previews, or manufacturing files. It only describes whether the recipe is structurally ready.

## 1. Required Sections

Every Product Recipe should include these sections:

- Identity
- Sizes
- Materials
- Finish
- Engraving
- Configuration
- Manufacturing Rules
- Packaging
- Production Time
- Pricing Variables
- Required Engines
- Success Criteria

Each section must contain enough information for the shared platform engines to understand and process the product.

## 2. Validation Status

Every section can be one of three statuses:

- Missing
- Incomplete
- Complete

### Missing

The section does not exist or has no meaningful content.

### Incomplete

The section exists but lacks required details, examples, constraints, or clear rules.

### Complete

The section exists and contains enough detail to support the product recipe lifecycle.

## 3. Recipe Completion Score

Recipe Completion Score measures how much of the required recipe structure is complete.

Each required section contributes to the final score. A simple first version can treat every section equally.

Example:

- Identity ✓
- Sizes ✓
- Materials ✓
- Finish ✓
- Engraving ✓
- Configuration ✓
- Manufacturing Rules ✓
- Packaging ✗
- Production Time ✓
- Pricing Variables ✓
- Required Engines ✓
- Success Criteria ✓

Completion:

91%

The score should help admins and creators understand what remains before the recipe is ready.

## 4. Validation Messages

Validation messages should be short and actionable.

Examples:

- Missing Packaging
- No Pricing Variables
- Missing Required Engine
- No Manufacturing Rules
- Incomplete Size Options
- Missing Material Constraints
- No Success Criteria

Messages should explain what is missing without changing the recipe automatically.

## 5. Ready For Marketplace

A recipe is allowed to become sellable when:

- All required sections are Complete.
- Manufacturing Rules are clear.
- Pricing Variables are present.
- Required Engines are listed.
- Packaging is defined.
- Success Criteria are documented.
- The recipe can support configuration, preview, price, and manufacturing preparation.

If any critical section is Missing, the recipe is not ready for marketplace publishing.

If a section is Incomplete, an admin or creator must review and finish the recipe before it becomes sellable.
