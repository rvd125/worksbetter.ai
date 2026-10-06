# Problem-first homepage release — 7 October 2026

Visitors currently arrive at a large demonstration-led homepage before describing a business problem. This candidate leads with repeated entry, manual reporting and enquiry follow-through, then shows two first-hand implementations and an inline enquiry form.

The homepage uses its own lightweight template and assets. The demonstrations keep their existing URLs and remain available below the main commercial journey. Existing incoming `#contact`, `#playground` and `#start-small` links remain usable. Limited `?problem=invoice|reporting|enquiry#contact` links supply an editable enquiry prompt without accepting arbitrary content. Recognised partner campaign links show their context on the form and retain it in the saved brief and email fallback; arbitrary URL values are ignored.

The reporting case preserves the distinction between a 20-hour monthly preparation baseline and unmeasured net savings. The enquiry case describes an implemented process without claiming conversion uplift. The homepage metadata follows the new positioning and its structured data removes the inappropriate Article entity.

## State and verification

The redesign is **published**, with native WordPress preview checks and public verification completed on 7 October 2026 (Australia/Sydney). The earlier quota block was resolved before any upload resumed.

52 DOM/submission assertions pass against both the native preview HTML and the published homepage HTML: inline form, existing modal compatibility, input preservation, saved-receipt confirmation, timeout handling, stable retry IDs, duplicate-submit suppression, owner analytics exclusion, campaign context and no enquiry content in interaction events. PHP syntax and CSS parsing pass. All 15 sitemap URLs return HTTP 200 with one H1, and all nine changed CSS/JavaScript files match the candidate bytes. An empty enquiry request is rejected with HTTP 400 and no-store; no real enquiry was submitted during this release. An 82-link fragment audit found 75 static matches, two verified script-handled story routes and five hidden placeholder links; no actionable missing target was identified. See [public-verification.json](public-verification.json).

The homepage uses approximately 28 KB of uncompressed first-party CSS and JavaScript, compared with approximately 302 KB for the previous homepage. Fonts, plugins and third-party scripts are excluded; this is not a Core Web Vitals measurement. Existing demonstrations load their assets only when visited.

A final metadata correction removes reading-time and Article social tags derived from the retained old CMS body, uses the Australian Open Graph locale, and updates the homepage WebPage modification time. Guide article metadata remains unchanged. Hooks were verified against the public Rank Math plugin source and native output.

No computer-use tools or browser automation were used for this release. Screenshot-based responsive visual review, field performance, processed Analytics, genuine lead qualification and revenue outcomes remain unproven. Passing the stated checks is not a ranking, conversion or accessibility certification.

Follow [manifest.json](manifest.json) for the exact patch and rollback. Do not upload this partial repository as an entire theme. The current automatic theme backup contains the main redesign before its final metadata correction; the earlier audit source is the reference for a complete redesign rollback.

## Run the form contract checks

Use Node with `jsdom@26.1.0` installed outside the deployed theme:

```sh
NODE_PATH=/absolute/path/to/qa-runtime/node_modules node release/problem-first-2026-10-06/test-enquiry.cjs
```

The harness performs no browser automation, live submissions or outgoing messages. It is intentionally limited to DOM and submission contracts; visual acceptance requires separate evidence.
