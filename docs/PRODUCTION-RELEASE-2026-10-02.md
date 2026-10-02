# Works Better production release — 2 October 2026

Works Better is publicly deployed. The release was published through the authenticated WordPress draft-theme controls on 2 October, followed by anonymous public HTTPS, content/asset readback, actual desktop/mobile browser checks and one labelled enquiry test. GitHub source alone was not treated as deployment.

## Business positioning and implemented work

The opening retains “What if work worked better?” and explains AI workflows and tools built around familiar apps, with after-hours invoicing alongside enquiry and reporting problems. Renzo personally designs and builds the solutions. Customers can explore automatic work, work with human approval and tools their team operates. Compatibility, permissions and necessary changes are established during scoping; no universal compatibility promise is made.

Navigation connects examples, safeguards, useful guides and a reachable enquiry. The enquiry asks about process, tools, desired result and operating preference, explains Renzo’s personal reply and agreeing scope/fees before paid work. Guides and examples lead to a consulting conversation before optional external experimentation. The consulting site owns Renzo’s expertise and service depth; AI Labs owns experiments. No material change was deployed to the main consulting site.

Confirmed enquiry, supplier-invoice and reporting stories retain separate approvals, customer confirmation, duplicate stops, explained mismatches and held data/reruns. Demonstration records are fictional; invoice approval does not imply payment. Sensitive historical exports were privately backed up and replaced with verified harmless files before release. Personal contact fallbacks and the verified privacy disclosures now align with the owner-confirmed Works Better inbox.

Nine native page bodies and published post45 were revised, retaining native dates/statuses/slugs. Post46’s distinct reporting checklist and metadata were revised but remain a draft. Posts47–52 retain their existing future statuses and dates; corrected local editorial candidates for these posts were not applied. Before their scheduled publication, revise and review each exact article/metadata against the latest sites, particularly post49’s known incorrect accounts-payable/payment wording. Its confirmed supplier-invoice story records approval and receipt acknowledgement, never payment. No eight-week draft was newly scheduled or distributed.

## Actual review and production verification

Actual Astra controlled-release acceptance included the final page10/privacy and both JavaScript contact-address corrections. The exact decision is in [the Astra release record](ASTRA-RELEASE-2026-10-02.md). Actual Astra subsequently granted [scoped production acceptance](ASTRA-PRODUCTION-REVIEW-2026-10-02.md) after reviewing public desktop/mobile and independent production evidence. No commercial outcome is inferred from acceptance.

- [Public content and asset verification](verification/production-public-2026-10-02.json): eleven published routes returned200 with one H1, expected self canonicals, descriptions/indexable directives and valid parsed JSON-LD. Actual missing route and removed preview sidecar returned404. Legacy destinations were checked. Ten deployed public assets/exports exactly match reviewed source hashes.
- [Actual desktop/mobile browser evidence](verification/wordpress-production-browser-2026-10-02.json):65 checks passed, zero browser errors,1440px/390px. Menus, mode-to-enquiry choice, validation, intercepted success/one client conversion, guide/contact routes, approval/exception states, readable privacy and contact fallbacks were exercised. Intercepted regression requests sent no notifications.
- [Six interactive examples](verification/wordpress-production-tools-2026-10-02.json):61 additional public desktop/mobile checks passed for diagram, scenario opening, result progression, bounded completion and replay; zero errors. Only site GET requests were allowed; notifications and external analytics were blocked. Total126 actual public browser checks passed.
- [Native source parity](verification/production-native-parity-2026-10-02.json): nine revised published bodies exactly match reviewed bytes; unpublished draft46 separately matches. The homepage differs only in WordPress encoding three outward arrows as HTML entities; full decoded content is identical. [Exact encoding evidence](verification/home-native-encoding-2026-10-02.json) records both hashes and all differences. Theme export remains byte-identical to reviewed source.
- [Single real synthetic enquiry](verification/production-synthetic-enquiry-2026-10-02.json): one POST at09:40UTC returned200/saved:true and showed its receipt. Independent storage readback found one saved row and notification state sent. Renzo explicitly confirmed inbox receipt. The browser observed one generate_lead request to the expected measurement ID without contact PII. The processed current-day GA4 report still returns no rows, so processed receipt remains pending. Never replay or resend the test to obtain it.

The synthetic test is excluded from all genuine/qualified lead and commercial totals. Actual message/receipt details remain private. No performance saving, ranking lift, qualified lead or revenue improvement is claimed.

## Separate baseline and scorecard

Windsor authenticated only sc-domain:worksbetter.ai. Latest returned finalized date29September, three calendar days behind this review; missing later rows remain unknown. Domain, page/query subsets and overlapping sitemap properties were not added together. [Windsor evidence](verification/windsor-search-console-2026-10-02.json).

| Measure | Verified pre-release baseline | Limit / next assessment |
|---|---|---|
| Google clicks / impressions,9–29Sep |0 /76 | AU9 and NZ3 impressions;12 target-geography impressions, relevance/qualification not established |
| Google clicks / impressions,23–29Sep |0 /15 | Previous16–22Sep0 /32; small sample |
| Google clicks / impressions,2–29Sep |0 /76 | Previous28-day report returned no rows: unknown |
| GA4 page views / sessions,9–29Sep |106 /36 | Direct104 /35; Organic Social2 /1. Not verified buyers; owner/test activity not separated |
| GA4 page views / sessions,23–29Sep |6 /5 | Previous16–22Sep77 /13 |
| GA4 page views / sessions,2–29Sep |106 /36 | Property created12Sep; no valid prior28-day comparison |
| Organic Search landing visits | Unknown | Accessible independent landing report returned no rows, not automatically a verified zero |
| Example engagement / enquiry starts | New category-only event handling deployed | Historical1–28Sep workflow_view23, step_open2, before_after_toggle1, form_start3; older naming/duplication limits comparison |
| Successful enquiries | One synthetic verified, excluded | Four historical saved rows were verified1Oct; genuine/test/spam disposition is unknown |
| Genuine / qualified opportunities | Unknown / unknown | Requires private message review, contact deduplication and owner disposition |
| Meetings / proposals / wins | Unknown / unknown / unknown | Private commercial status not verified |
| Target | At least one qualified consulting opportunity/week | Target, not forecast; not yet assessable as achieved |

[GA4 authenticated evidence](verification/ga4-baseline-2026-10-02.json) records separate host-filtered reports. Zero Google clicks and106 page views describe different measures; the earlier “no views” concern is not confirmed as a site-wide absence of visits. Generic form_submit can include tools and is not a lead. The successful save emits one generate_lead; enquiry_started, contact_started and example/tool events stay separate. Future reports must exclude synthetic_qa/test campaign activity and reconcile genuine opportunities privately. Qualification requires a genuine business need fitting Renzo’s services and willingness to discuss paid consulting; uncertainty stays pending.

## Source, backup and rollback

Reviewed material release source: [GitHub commit b16f0be](https://github.com/rvd125/worksbetter.ai/commit/b16f0be8190b8ac76bf0301262f3712211517b55). The repository is public; only sanitized source and aggregates are published. Screenshots are locally retained review evidence. This is an explicit partial WordPress patch, not a full site/database checkout.

Fresh full UpdraftPlus database/themes/plugins/uploads/others backup was verified2October09:03; anonymous checks of backup objects returned403. The earlier scoped private backup/retirement completed with281 files and18 native records/meta. WPVibe additionally created worksbetter-wpvibe-draft-wpvibe-backup when publishing. Its known exports were verified harmless. Original runtime functions.php was restored exactly and preview-only content removed before publication.

Rollback uses the full/scoped private backups, known content revisions and WPVibe’s theme backup, with the [release procedure](../release/RELEASE-AND-ROLLBACK.md). Restore only affected behavior; retain confidentiality replacements, do not republish original internal exports and preserve all legitimate enquiry records. Recheck public URLs and enquiry behavior after any rollback. Private backup locations and credentials are excluded from GitHub.

## Eight-week acquisition work and review cadence

The [eight-week buyer-intent plan](EIGHT-WEEK-ORGANIC-PLAN-2026-10-01.md) and [eight useful drafts](eight-week-drafts.html) cover reporting definitions, onboarding handovers, step roles, conflicting customer records, useful approval briefs, enquiry ownership, automation pauses and preparation for a scoped conversation. They are distinct worksheets supporting the examples, with latest-main-site overlap checks required before each publication. No whole-article copying or ranking-damage conclusion is made.

Current regional competitor search-result patterns informed the intent map; competitor traffic and conversion numbers were not invented. Google Trends AU/NZ requests returned429, so trend direction and search volume remain unavailable. Search samples do not substitute for Trends data. Homepage and service/example discoverability take priority over article volume.

Proposed cadence: Monday09:00 Australia/Sydney review of latest complete7/28-day search windows, organic landings, example engagement, saved enquiries, genuine/qualified opportunities, meetings/proposals/wins and one next action; monthly technical/form/privacy check. Existing main-site automation was inspected and no second recurring reviewer was created. First full28-day post-release window is3–30October; first eight full weeks are3October–27November. Reports must wait for finalized source dates and state lag. No ads, bulk messaging, outreach or LinkedIn activity occurred.

Remaining gaps: outstanding scheduled47–52 editorial revisions before their existing publication dates (particularly49’s incorrect accounts-payable/payment wording); processed GA4 receipt for the single test; private historical enquiry/qualification and commercial disposition; Google Trends access/volume; hosting/DNS account management access for changes beyond connected WordPress. None is represented as a verified zero or completed commercial result.
