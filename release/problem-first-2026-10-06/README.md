# Problem-first homepage candidate — 6 October 2026

Visitors currently arrive at a large demonstration-led homepage before describing a business problem. This candidate leads with repeated entry, manual reporting and enquiry follow-through, then shows two first-hand implementations and an inline enquiry form.

The homepage uses its own lightweight template and assets. The demonstrations keep their existing URLs and remain available below the main commercial journey. Existing incoming `#contact`, `#playground` and `#start-small` links remain usable. Limited `?problem=invoice|reporting|enquiry#contact` links supply an editable enquiry prompt without accepting arbitrary content.

The reporting case preserves the distinction between a 20-hour monthly preparation baseline and unmeasured net savings. The enquiry case describes an implemented process without claiming conversion uplift. The homepage metadata follows the new positioning and its structured data removes the inappropriate Article entity.

## State and verification

The previous audit release is published. This new candidate is **not uploaded or published**: WPVibe created a clone, but rejected the first file upload at its rolling daily limit. There are no partially uploaded candidate files.

47 DOM/submission assertions pass: existing modal compatibility, inline form, input preservation, saved-receipt confirmation, timeout handling, stable retry IDs, duplicate-submit suppression, owner analytics exclusion and no enquiry content in interaction events. PHP syntax and CSS parsing pass. All 13 existing public link destinations return HTTP 200. No real enquiry was submitted. These checks do not establish visual quality, native WordPress rendering, processed analytics, real leads or conversion performance.

The local first-party homepage assets total 16,520 CSS bytes and 11,021 JavaScript bytes at the measured checkpoint, compared with approximately 302 KB for the prior homepage assets. Subsequent edits can change these counts. Fonts, plugins and third-party scripts are excluded; this is not a Core Web Vitals measurement.

Native draft rendering, responsive visual review, public deployment and post-release verification remain pending. Follow [manifest.json](manifest.json); do not upload this partial repository as an entire theme. The previous audit manifest remains a record of the already published release.

## Run the form contract checks

Use Node with `jsdom@26.1.0` installed outside the deployed theme:

```sh
NODE_PATH=/absolute/path/to/qa-runtime/node_modules node release/problem-first-2026-10-06/test-enquiry.cjs
```

The harness performs no browser automation, live submissions or outgoing messages. It is intentionally limited to DOM and submission contracts; visual acceptance requires separate evidence.
