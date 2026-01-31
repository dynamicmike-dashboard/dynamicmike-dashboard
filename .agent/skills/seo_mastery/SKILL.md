---
name: SEO, AEO, & GEO Mastery
description: Strategies for dominating Search, Answer, and Generative Engines.
---

# SEO, AEO, & GEO Mastery

## 1. Concepts
*   **SEO (Search Engine Optimization):** Ranking in Google/Bing links.
*   **AEO (Answer Engine Optimization):** Being the "direct answer" for AI search (Perplexity, ChatGPT Search, Google SGE).
*   **GEO (Generative Engine Optimization):** Structuring content so LLMs can easily parse and synthesize it.

## 2. Meta Data (SEO)
Every HTML page must have:
```html
<title>Product Name | Detailed Keyword - Brand Name</title>
<meta name="description" content="A clear, 160-char summary that includes the primary keyword and a call to action.">
<link rel="canonical" href="https://yourdomain.com/page">
<!-- Open Graph -->
<meta property="og:title" content="...">
<meta property="og:image" content="https://.../image.jpg">
```

## 3. Structural Standards (AEO/GEO)
AI readers prefer structured, logical data over fluff.

*   **Heading Hierarchy:** One `<h1>`, multiple `<h2>` for main topics, `<h3>` for sub-points. Never skip levels.
*   **Direct Answers:** Start sections with a direct answer to the implied question (e.g., "RealAi Elite costs $149/mo.").
*   **Lists & Tables:** Use `<ul>`, `<ol>`, and `<table>` frequently. LLMs parse these better than dense paragraphs.
*   **Semantic HTML:** Use `<article>`, `<section>`, `<nav>`, `<aside>` correctly.

## 4. Schema Markup (JSON-LD)
Always include relevant Schema.org data in `<head>`.

**Example (Software Application):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RealAi Elite",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "495.00",
    "priceCurrency": "USD"
  }
}
</script>
```

## 5. Content Prompts
When writing copy:
*   *Prompt:* "Write clear, concise value propositions. Avoid generic marketing fluff. Focus on benefits (User saves time) vs features (Fast processor)."
*   *Tone:* Professional, confident, slightly premium/exclusive.
