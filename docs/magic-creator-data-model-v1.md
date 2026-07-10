# Magic Creator Data Model v1

## 1. Purpose

Magic Creator turns a Sample into a custom order through configuration, preview, pricing, negotiation, and manufacturing data.

For Einkauf Centrum Plus, the v1 domain model keeps the creator flow focused on one reliable source of truth: the Recipe. Customers can configure a product, see a preview, receive a price, negotiate within safe business limits, and finally create an order package that manufacturing can use.

## 2. Core Flow

Sample
→ Configuration
→ Recipe
→ Preview
→ Price
→ Customer Offer
→ Negotiation
→ Manufacturing Package
→ Order

## 3. Core Entities

### Sample

The starting product or design template selected by the customer. A Sample defines what can be customized.

### Configuration

The customer-selected options for the Sample, such as size, material, color, text, quantity, and other allowed customization choices.

### Recipe

The normalized source-of-truth object created from the Configuration. It describes exactly what should be produced and is used to generate previews, prices, manufacturing files, and order documents.

### Preview

A visual or structured representation generated from the Recipe so the customer can understand the configured product before ordering.

### Price

The pricing result generated from the Recipe. It includes customer-facing price information and internal business limits.

### CustomerOffer

The price offered by the customer during negotiation.

### NegotiationDecision

The result of evaluating a CustomerOffer against pricing rules, minimum acceptable prices, and business constraints.

### ManufacturingPackage

The production-ready data generated from the Recipe, including manufacturing instructions, measurements, materials, and files needed to make the order.

### Order

The confirmed purchase record created after the Recipe, final price, negotiation result, and manufacturing data are ready.

### Knowledge

Reusable internal knowledge used by Magic Creator, such as product rules, material constraints, pricing assumptions, production notes, and configuration guidance.

### FutureIdea

A saved improvement idea, feature request, business insight, or future workflow concept that should be stored without interrupting v1 development.

## 4. Golden Rule

Recipe is the source of truth.

Preview, price, manufacturing files, and order documents are generated from the Recipe.

## 5. Pricing Layer

The pricing layer should support:

- Calculated price: the normal price generated from the Recipe.
- Hidden minimum acceptable price: the internal lowest preferred price for negotiation.
- Hard minimum price: the absolute lowest allowed price.
- Customer offered price: the price proposed by the customer.
- Counter offer: the system or business response when the customer offer is too low but still negotiable.
- Installment suggestion: an optional payment split suggested when the final price is high.

The customer should see the final price, accepted offer, counter offer, or installment suggestion. Internal calculation details and minimum thresholds remain hidden.

## 6. Future Ideas / Update Layer

New ideas should be stored as FutureIdea records.

FutureIdea is for capturing improvements without disrupting Magic Creator v1. Ideas can include new configuration options, smarter pricing rules, manufacturing improvements, negotiation experiments, or customer experience upgrades.

FutureIdea items should be reviewed later and promoted into the product roadmap only when they are ready.

## 7. Business Rules

- No order without Recipe.
- No Recipe without Configuration.
- No Configuration without Sample.
- Every configuration change updates preview, price, and manufacturing data.
- Customer negotiation must not go below hard minimum.
- Customer sees final price only, not internal calculation details.
