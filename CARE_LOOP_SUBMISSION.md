# YAGI Care Loop

## One-line pitch
YAGI connects a skincare purchase to routine, grounded support, check-ins, verified feedback, loyalty, and a truthful return.

## Problem
Skincare customer relationships often end at checkout. The questions, daily routine, feedback, and repurchase that follow can become fragmented and lose the context of the original purchase.

## Solution
YAGI Care Loop keeps the post-purchase experience connected. A paid product can enter a customer-owned routine; care check-ins and Ask YAGI stay scoped to that customer; verified feedback is tied to a paid order; and loyalty and reorder use authoritative transaction and catalog truth.

## Customer Journey
Purchase -> payment confirmation -> routine -> check-in -> Ask YAGI -> safety policy -> verified review -> loyalty reward -> current-catalog reorder.

## Why AI
Ask YAGI provides grounded, contextual support using the authenticated customer’s own self-reported care profile, routine, latest order where relevant, product data, and available care knowledge. Deterministic services, not AI, enforce identity, ownership, prices, payment state, review verification, reward balances, and safety escalation.

## Grounding
Product facts come from the YAGI catalog. Health-related responses only use explicitly trusted care sources when available. When no authoritative source exists, Ask YAGI states that information is unavailable rather than inventing an ingredient, certification, price, or citation.

## Safety
YAGI uses deterministic safety policy before commerce guidance. Concerning messages trigger professional-care or urgent guidance and suppress product, reward, and reorder suggestions. Sometimes the best customer experience is knowing when not to sell.

## Business Impact
The system can measure Care Continuation Rate from authoritative paid-order and qualifying care-action records. Verified feedback, rewards, and reorder capability are connected to server-validated ownership and current catalog data. Observed evidence is separate from seeded demonstration data. Metrics remain `INSUFFICIENT_DATA` until a mature real cohort exists; no number is manufactured for submission.

## Evidence Methodology
The Care Continuation Rate denominator is unique real customers with a paid order confirmed at least seven days ago. The numerator is those customers with at least one qualifying owned care action in the following seven days. Demo, test, and legacy records without an explicit `real` classification are excluded. The public endpoint returns aggregate values and methodology only, never customer, order, check-in, or conversation records.

## What Was Built
- Public `/care-loop` competition experience with a deterministic, clearly labeled seeded journey.
- Aggregate evidence endpoint with methodology, cohort maturity, exclusion rules, and data-availability states.
- Care Continuation Rate based on mature paid cohorts and qualified persisted care actions.
- Private-data-safe public evidence payload and focused exclusion tests.
- Existing checkout, routine, review, rewards, reorder, and Ask YAGI safety paths reused as evidence-backed system capabilities.

## Demo Instructions
1. Open `/care-loop` and use **Follow the journey**.
2. Follow Sari from order creation through routine, check-in, Ask YAGI, safety, review, reward, and return.
3. Open **How we calculate this** on observed evidence cards.
4. Use **Explore YAGI** to open the real shop.

## Known Limitations
- Manual static bank transfer is the implemented payment method; no payment gateway is present.
- Ask YAGI depends on its configured provider for normal live answers. Provider failure returns a clear unavailable state rather than a fabricated answer.
- The rate limiter is process-local per worker, not distributed.
- Payment-proof malware scanning and external error monitoring are not implemented.
- Care evidence may legitimately remain insufficient while the real cohort matures.

## Three-Minute Judge Script
Most skincare journeys end at checkout. YAGI starts there.

This is the YAGI Care Loop: a connected path from purchase to routine, check-in, support, verified feedback, loyalty, and a relevant return. The core claim is not that YAGI is an AI skincare app. It is that a customer relationship does not have to end at checkout.

This seeded, fictional journey follows Sari. Her order is created with server-authoritative totals and payment state. Once payment is confirmed, she can add the product she actually purchased to her routine. That ownership comes from the paid order, not an identifier entered by the client.

Later, Sari records a lightweight care check-in and asks Ask YAGI a routine-related question. Ask YAGI is scoped to her own context: her routine, self-reported care context, relevant product data, and available care knowledge. It is grounded support, not a diagnosis engine.

The key trust moment is safety-over-selling. For a controlled urgent prompt, the same deterministic safety policy used by Ask YAGI activates urgent guidance. Product, reward, and reorder suggestions are suppressed. Sometimes the best customer experience is knowing when not to sell.

The loop continues with verified feedback tied to a paid purchase, ledger-backed rewards, and reorder behavior that checks today’s catalog truth rather than silently substituting products or prices.

Finally, this evidence section is separate from Sari. It uses aggregate server-calculated observed data and shows its calculation, cohort size, observation window, and exclusions. Demo, automated test, and unverifiable legacy records do not affect these metrics.

We did not build a chatbot. We connected the customer journey around it.

## Owner Input Required
- Competition URL and official submission wording.
- Submission deadline.
- Team and organization names.
- Any legitimate voting or social destination.
