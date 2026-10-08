# SPP QRIS Design Direction

Source of truth for the visual and interaction direction of the SPP QRIS
payment administration system. This document holds design intent only. It is
not a list of prohibitions and it is not a copy of the anti-slop rules.

---

## 1. Product Identity

SPP QRIS is the internal payment administration system of an SMK. It manages
students, classes, academic years, monthly tuition bills (SPP), and QRIS
payments, with Midtrans as the payment gateway.

The product serves two audiences from one backend:

- **ADMIN**: the school finance or administration staff. Their job is to keep
  billing correct, see what is unpaid, and confirm money received.
- **SISWA**: a student. Their job is to see their own bills and pay them.

This milestone builds the ADMIN side only.

Personality: institutional, precise, calm, trustworthy, efficient. The system
is financial software in a school. It should read as dependable infrastructure,
not as a startup marketing surface.

Identity motif: **the ledger rule**. Thin, disciplined horizontal separators
and a consistent left-aligned numeric column are the repeated visual gesture
across the product. Money is always right-aligned in tabular figures. This is
the one pattern that should make the interface recognizable as SPP QRIS.

## 2. Design Principles

1. **Truth over decoration.** Every number on screen is real data or an honest
   empty state. A less full screen is better than a confident wrong one.
2. **Calm by default.** Low visual noise so the one thing that needs attention
   can stand out.
3. **Money is precise.** Rupiah is shown in full, right-aligned, with tabular
   figures. Never abbreviated, never rounded for looks.
4. **Structure is quiet.** Hierarchy comes from spacing, weight, and alignment
   before it comes from color.
5. **State is explicit.** Payment status is always a word, never only a color.
6. **Reversible actions raise a confirm.** Destructive or irreversible actions
   are confirmed before they run.

## 3. Visual Direction

- Deep navy is the structural color: the sidebar, the primary brand surfaces,
  and the strongest headings.
- The application background is a warm off-white, so white content surfaces
  lift without shadows.
- Green is the payment accent. It is used sparingly and it always means paid,
  success, or the primary confirm action.
- Borders are thin and quiet. Shadows are rare and communicate elevation only.
- Radius is small and consistent. The interface is rectilinear and
  institutional, not pill-shaped.
- No gradients as decoration, no glow, no glassmorphism, no background
  patterns. Surfaces are flat and readable.

RHYTHM is 2: sections are consistent, with deliberate breaks where the content
demands a different shape (for example, a wide status summary versus a grid of
KPI cards).

## 4. Color System

### Core palette

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Primary | `navy-900` | `#14213D` | Sidebar, topbar rules, headings, primary text on light |
| Background | `canvas` | `#F6F7F9` | Application background |
| Surface | `surface` | `#FFFFFF` | Cards, tables, topbar, form panels |
| Accent | `green-600` | `#159A6C` | Paid state, primary confirm, success signal |
| Text primary | `ink-900` | `#172033` | Body and values |
| Text secondary | `ink-600` | `#667085` | Labels, metadata, helper text |
| Border | `line-200` | `#E4E7EC` | Dividers, card borders, table rules |
| Border strong | `line-300` | `#D0D5DD` | Input borders, focused containers |

### Semantic status colors

Status color is functional, not brand. It is always paired with a text label.

| State | Foreground | Background | Meaning |
|-------|-----------|------------|---------|
| Lunas / Settlement | `green-700 #0E7A55` | `#E7F6EF` | Paid |
| Belum Lunas | `amber-700 #B54708` | `#FFF6E8` | Outstanding |
| Pending | `ink-700 #344054` | `#F2F4F7` | Awaiting payment |
| Expire / Cancel | `ink-600 #667085` | `#F2F4F7` | Closed, not paid |
| Error / danger | `red-700 #B42318` | `#FEF3F2` | Failed action |

Green is the single brand accent. The status colors above are system colors
reserved for state, and they appear only inside status badges and inline
messages.

## 5. Typography

- Family: **Plus Jakarta Sans** for the entire interface. One family.
- Numerals for money and counts use tabular figures so columns align.

| Token | Size / line-height | Weight | Use |
|-------|--------------------|--------|-----|
| Display | 30px / 36px | 700 | Page title |
| Heading | 20px / 28px | 600 | Section title |
| Metric | 26px / 32px | 700 | KPI value |
| Subtitle | 15px / 22px | 400 | Page description, body lead |
| Body | 14px / 21px | 400 | Default text, table cells |
| Label | 13px / 18px | 500 | Fields, table headers, metadata |
| Caption | 12px / 16px | 500 | Timestamps, helper text |

Headings are navy or ink. Body is ink. Secondary text is `ink-600`. No
uppercase tracking as a default; the only uppercase use is the sidebar group
label at 11px with slight tracking, which is a navigation landmark, not a
heading.

## 6. Layout

- Application background: `canvas`.
- Content surfaces: white cards on the canvas, separated by 1px `line-200`
  borders, radius 8px, no default shadow.
- Card padding: 20px desktop, 16px mobile.
- Section gap: 24px desktop, 16px mobile.
- Page gutter: 32px desktop, 16px mobile.
- The layout is desktop-first and fully responsive. It is not a phone layout
  stretched wide, and it is not a desktop layout shrunk down.

## 7. Navigation (Admin Shell)

- Left sidebar, 240px, navy `#14213D`, fixed on desktop.
- Branding: "SPP QRIS" with the supporting label "Administrasi Pembayaran".
- Navigation groups are real, and only items that exist are shown:
  - **UTAMA**: Dashboard
  - Later milestones add DATA MASTER, KEUANGAN, SISTEM as their pages ship.
- Active item: a solid subtle surface (white at 8 to 10 percent) with a green
  left indicator rule (the ledger rule) and a lighter weight wordmark.
- Inactive item: muted light text that meets contrast, hover lifts to full
  white.
- Below the desktop breakpoint the sidebar becomes a slide-in drawer opened by
  a labeled "Menu" button in the topbar. The drawer is keyboard accessible and
  closes on Escape and on backdrop click.
- Topbar: white, 64px, 1px bottom border. Left: page context or the mobile menu
  button. Right: the administrator identity (username and role) and a logout
  action. No fake notifications, no fake search.

## 8. Admin Dashboard Direction

The dashboard answers three questions, in this order:

1. What is the current payment situation?
2. What requires attention?
3. How much has actually been collected?

Structure, driven by the real API (`totalSiswa`, `totalTagihan`,
`totalLunas`, `totalBelumLunas`, `totalTransaksi`, `totalPendapatan`):

1. **Page header**: "Dashboard" and the description
   "Ringkasan administrasi pembayaran SPP".
2. **KPI summary**: a restrained grid of cards. Total Siswa, Total Tagihan,
   Belum Lunas, Lunas, Total Transaksi, Total Pendapatan. Each card is one
   label and one value. No invented deltas, no fake trends, no arrows.
3. **Payment status summary**: a real breakdown of `totalLunas` against
   `totalTagihan`, shown as a proportion with explicit counts and percentages
   derived only from the returned numbers. Outstanding count is stated in words.
4. **Collection summary**: `totalPendapatan` presented as the settled amount,
   with `totalTransaksi` as its supporting count and a plain-language note that
   it counts settled transactions.

Sections the backend cannot support (monthly charts, recent transactions,
recent bills) are omitted rather than fabricated. An honest, less dense
dashboard is the correct outcome.

## 9. Student Portal Direction (future milestone)

Documented now so the design language stays consistent.

- Light, low-density, single-column and task-first. The student sees the next
  bill and the pay action before anything else.
- Bill rows carry period, amount, due date, and status in words.
- The QRIS payment step is a focused, single-purpose screen with a clear
  amount, a clear status, and a return path. Payment state is polled or
  refreshed explicitly, never faked.
- Language is plain Indonesian, addressed to the student, without corporate
  tone.

## 10. Component Style

- **Cards**: white, 1px `line-200` border, radius 8px, no default shadow.
  Shadow is reserved for the mobile drawer and any dialog.
- **Buttons**: radius 6px. Primary is navy; the confirm/success action is green;
  secondary is white with a border; destructive is red text on a subtle red
  background. Minimum height 40px desktop, 44px on touch.
- **Inputs**: 1px `line-300` border, radius 6px, 40px height, visible
  `:focus-visible` ring in navy at 2px with offset. Labels are always visible,
  never placeholder-only.
- **Status badges**: a small radius 4px label, text first, tinted background.
  Never color-only.
- **Tables**: header row in `ink-600` at label size, 1px row separators, money
  right-aligned with tabular figures. Horizontal scroll is contained inside the
  table region, never on the page.
- **Empty / loading / error states**: each data region has all three. Loading
  uses skeleton blocks that preserve the final layout. Empty and error states
  name the cause and the next action in Indonesian.

## 11. Data Visualization Principles

- A visualization exists only if it answers a question the admin actually has.
- No chart is drawn without historical or comparative data. The current
  dashboard API returns aggregates only, so the dashboard uses no time-series
  chart.
- Proportions (for example paid versus total) are shown as a single measure
  bar with explicit counts, not a decorative donut.
- Every segment is labeled with text and has at least 3:1 contrast against its
  neighbors.
- Money values are never compressed into a chart at the cost of precision.

## 12. Responsive Direction

- Desktop is primary. The reflow is designed, not an override.
- Defined states: mobile (single column), tablet (two-column card grid, drawer
  navigation), desktop (full sidebar, multi-column grid).
- Tap targets are at least 44px on touch, with spacing between adjacent
  controls.
- No horizontal page overflow. Wide tables scroll inside their own container.
- Type and spacing step down on mobile; they are not desktop sizes unchanged.
- The mobile drawer reserves space correctly and never covers content when
  closed.

## 13. Motion

- MOTION is 1 (low). Motion is limited to hover and focus feedback, the mobile
  drawer open/close, and short state transitions (button press, badge change,
  skeleton to content).
- No infinite or looping animation. No floating, bouncing, or pulsing
  decoration.
- Transitions are short (120 to 180ms) and ease-out.

## 14. Copywriting

- Language is Indonesian, administrative, and specific.
- Page titles are nouns. Descriptions state what the page holds.
- No marketing voice, no exclamation, no em dash. No "AI powered", "seamless",
  or similar. Buttons are verbs that name the action: "Masuk", "Keluar",
  "Muat Ulang".
- Empty states explain the state and the next step. Error states name what
  failed and how to recover. The default server error copy is
  "Server tidak merespons. Muat ulang halaman untuk mencoba lagi."

## 15. Accessibility Intent

- All text meets WCAG AA: 4.5:1 for normal text, 3:1 for large text, verified
  against the contrast checker, not by eye.
- Interactive boundaries and status indicators meet 3:1.
- Every control is reachable and operable by keyboard, with a visible
  `:focus-visible` indicator that is never removed without a replacement.
- Status is conveyed by text and shape, not color alone.
- Dialogs and the mobile drawer close with Escape and trap focus while open.
- Text resizes to 200 percent without clipping.

## 16. Backend And Data Integrity

- The backend is the source of truth and is not modified by frontend work.
- The dashboard renders only fields the API actually returns.
- A failed request is shown as an error state, never as zeros or empty values.
- No mock or sample data ships in the application.

## 17. Design Read

> Reading this as: a school SPP payment administration dashboard for finance
> staff, in an institutional-modern language (calm navy, warm off-white, single
> green accent), dial **ENERGY 1 / RHYTHM 2 / MOTION 1**.

Liveliness levers for this product:

- **Focal point per screen**: the single metric that matters most on the
  current screen (outstanding bills on the dashboard) is the largest, highest
  contrast element.
- **Whitespace as structure**: the canvas gap between cards and sections is the
  primary separator; borders support it.
- **One deliberate accent**: green, reserved for paid and confirm.
- **Identity motif**: the ledger rule and the right-aligned tabular money
  column, repeated across cards, tables, and status summaries.

## 18. Quality Bar

3-second test: where am I, what is the overall payment situation, is anything
unpaid.

10-second test: how many bills are unpaid, how much has been collected, what
the next useful action is.

Operational test: navigate, read the dashboard correctly, identify unpaid
status, recover from an error, log out, and use the interface on a small screen
and with the keyboard.
