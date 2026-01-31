---
name: Web Development & Design Mastery
description: Expert standards for creating premium, high-converting, and animated web interfaces.
---

# Web Development & Design Mastery

## 1. Aesthetic Design Standards ("Luxury Glassmorphism")
*   **Visual Style:** Dark mode by default (unless specified), deep navy/black backgrounds, gold/blue accents.
*   **Glassmorphism:** Use clear, frosted-glass cards for content containers.
    *   *Class:* `bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl`
*   **Typography:** Sans-serif (Inter, Outfit) for clean, modern readability.
*   **Colors:**
    *   Primary: `#1349ec` (Royal Blue) or `#D4AF37` (Gold)
    *   Background: `#101828` (Slate 900) or `#0f172a` (Slate 950)
    *   Text: White for headings, Slate-400 for subtext.

## 2. Technical Stack
*   **CSS Framework:** Tailwind CSS (via CDN for static HTML, or `postcss` for Next.js).
    *   *Config:* Enable `darkMode: 'class'`, extend colors in `tailwind.config.js`.
*   **Animations:** GSAP (GreenSock) is mandatory for premium feel.
    *   *Core:* `gsap.from()`, `ScrollTrigger`.
    *   *Avoid:* CSS `@keyframes` for complex sequences; use GSAP.

## 3. Animation Templates (GSAP)
Always register ScrollTrigger: `gsap.registerPlugin(ScrollTrigger);`

### Fade Up (Standard Reveal)
```javascript
gsap.from(".fade-up", {
    scrollTrigger: { trigger: ".element", start: "top 80%" },
    y: 50, opacity: 0, duration: 0.8, ease: "power2.out"
});
```

### Staggered Cards (Features/Grid)
```javascript
gsap.from(".card", {
    scrollTrigger: { trigger: ".grid-container", start: "top 75%" },
    y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)"
});
```

### Hero Sequence
```javascript
const tl = gsap.timeline();
tl.from("h1", { y: 30, opacity: 0, duration: 1 })
  .from("p", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
  .from("button", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.4");
```

## 4. Responsive Design
*   **Mobile First:** Design for mobile view first, then add `md:` and `lg:` breakpoints.
*   **Touch Targets:** Buttons must be at least 44px height (`h-11`+).
*   **Overflow:** Always checking `overflow-x: hidden` on `body` to prevent scrollbar glitches.
