# Refund and Cancellation Policy

> ⚠️ **First draft for lawyer review.** Not legal advice. Search for
> `[BRACKETS]` to fill before publishing.

**Effective date:** [DATE]
**Last updated:** [DATE]

This policy describes when and how cancellations and refunds happen on
the meetlocal.ai platform. It is incorporated into our [Terms of Service
](TERMS_OF_SERVICE.md) by reference.

---

## How payment works (the short version)

We use **Stripe manual capture**. When a Traveler books, the funds are
**authorized but not charged** until the Local accepts. This means most
"refund" scenarios on similar platforms don't apply here — if the Local
doesn't accept, no charge ever happens.

```
Booking submitted ──► Stripe authorizes (HOLD, no charge)
                  │
                  ├── Local Accept ──► Captured (real charge)
                  └── Local Decline / Timeout / Traveler Cancel
                                    ──► Hold released (no charge ever)
```

---

## Scenarios

### 1. Local declines or fails to respond
- The Local has **14 minutes** to accept after a booking is submitted.
- If the Local declines or fails to respond within that window, the
  authorization is **cancelled** and the hold is released.
- The Traveler is **not charged**. The hold typically clears from the
  Traveler's bank within **3–7 business days**, depending on the bank.

### 2. Traveler cancels before Local accepts
- A Traveler may cancel a booking before the Local accepts. The
  authorization is cancelled and no charge occurs.

### 3. Traveler cancels after Local accepts
| Time of cancellation | Refund |
|---|---|
| **More than 24 hours** before the scheduled meet | **Full refund** of subtotal and service fee, less Stripe processing fees |
| **Between 1 hour and 24 hours** before | **50% refund** of subtotal; service fee non-refundable |
| **Less than 1 hour** before | **No refund** |
| Local was already en route or arrived | **No refund** |

### 4. Local cancels after accepting
- A Local cancelling after acceptance is a serious matter and may result
  in:
  - **Full refund** to the Traveler
  - Suspension or removal of the Local from the Platform
  - Deduction of any Stripe processing fees from the Local's future payouts

### 5. No-show by Traveler
- If a Traveler does not show up at the agreed location within 30
  minutes of the scheduled time, the Local may mark them as a no-show.
- The Traveler is **not refunded** for the booking; the Local receives
  full payout (less platform fee).

### 6. No-show by Local
- If a Local does not show up at the agreed location within 30 minutes
  of the scheduled time, the Traveler may mark them as a no-show.
- The Traveler receives a **full refund** including service fee. The
  Local may face suspension.

### 7. Quality dispute (post-meet)
- If a Traveler reports a quality issue (e.g., experience materially
  different from what was advertised), they may request a **partial or
  full refund** within **48 hours of completion**.
- We will review the booking, messages, and any other evidence and make
  a final determination at our sole discretion (typically within **5
  business days**).
- Frivolous or repeat-disputing accounts may be suspended.

### 8. Force majeure
- If the meet cannot happen due to events outside either party's control
  (severe weather, public emergency, government action), either party
  may cancel without penalty. Refunds will be issued at our discretion
  on a case-by-case basis.

### 9. Platform-initiated cancellation
- We may cancel a booking at our sole discretion if we believe it
  violates our Terms of Service or Acceptable Use Policy, or in response
  to safety concerns. The Traveler will be refunded; the Local will not
  be paid for that booking.

### 10. Payment disputes (chargebacks)
- If a Traveler initiates a chargeback with their bank instead of
  contacting us, we reserve the right to:
  - Suspend the Traveler's account
  - Recover the chargeback fee from the Traveler
  - Provide evidence to the bank including booking records and messages

We strongly encourage Travelers to contact us at **[support@meetlocal.ai]**
before initiating a chargeback.

---

## How to request a refund

Email **[support@meetlocal.ai]** with:
- Booking ID (e.g., `ML-XXXXXXX`)
- Reason for refund request
- Any evidence (photos, messages, etc.)

We respond within **3 business days** and resolve within **5 business
days** in most cases.

---

## Refund processing time

Once approved, refunds are issued via Stripe to the original payment
method. Refund processing time depends on your bank:
- **Credit/debit cards:** 5–10 business days
- **Bank transfers:** 3–5 business days
- **Apple Pay / Google Pay / Link:** typically same business day

We are not responsible for delays caused by your bank.

---

## Service fee and platform fee

- **Service fee** (8% of subtotal, paid by Traveler) is **refundable** in
  cases of platform-initiated cancellation, force majeure, or no-show by
  Local.
- **Platform fee** (22% of subtotal, deducted from Local payout) is
  retained by us in completed or no-show-by-Traveler scenarios.
- **Stripe processing fees** (~2.9% + $0.30 per transaction) are
  generally non-refundable per Stripe's policy.

---

## Contact

Refund or cancellation questions: **[support@meetlocal.ai]**
