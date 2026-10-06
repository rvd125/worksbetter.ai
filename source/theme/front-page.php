<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('problem-home'); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main-content">Skip to main content</a>
<header class="pf-header shell">
  <a class="pf-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="Works Better home">works<span>better</span><b aria-hidden="true">.</b><small>by Renzo Demartini</small></a>
  <nav aria-label="Main navigation"><a href="#problems">What’s getting stuck?</a><a href="#real-work">Work I’ve built</a><a class="pf-button small" href="#contact">Talk to Renzo <span aria-hidden="true">↗</span></a></nav>
</header>
<main id="main-content" tabindex="-1">
  <section class="pf-hero shell" aria-labelledby="hero-title">
    <div class="pf-hero-copy">
      <p class="eyebrow">Finance &amp; operations · Service businesses · AU &amp; NZ</p>
      <h1 id="hero-title">Stop doing the <em>same work</em> twice.</h1>
      <p class="pf-lead">Re-entering job details. Rebuilding reports. Chasing the next reply.</p>
      <p class="pf-intro">I connect the handoffs between your systems so your team can get on with the work that needs them.</p>
      <div class="pf-actions"><a class="pf-button" href="#contact">Tell me what’s getting stuck <span aria-hidden="true">↗</span></a><a class="pf-text-link" href="#real-work">See work I’ve built <span aria-hidden="true">↓</span></a></div>
      <p class="pf-note">You work directly with Renzo. Start with one process.</p>
    </div>
    <aside class="pf-workboard" aria-label="Examples of the handoffs we can improve">
      <div class="pf-board-heading"><span class="eyebrow">Somewhere between the apps</span><span class="pf-dot" aria-hidden="true"></span></div>
      <div class="pf-handoff"><span class="pf-step">01</span><div><h2>The job is finished.</h2><p>Someone still has to turn the details into an invoice.</p></div><a href="#double-entry" aria-label="Explore repeated job and invoice entry">↗</a></div>
      <div class="pf-handoff"><span class="pf-step">02</span><div><h2>The numbers exist.</h2><p>Someone still has to rebuild the report.</p></div><a href="#reporting" aria-label="Explore manual reporting">↗</a></div>
      <div class="pf-handoff"><span class="pf-step">03</span><div><h2>The enquiry arrived.</h2><p>Someone still has to chase who owns the next step.</p></div><a href="#enquiries" aria-label="Explore enquiry handoffs">↗</a></div>
      <p class="pf-board-footer">Let’s fix the work <strong>between</strong> the tools.</p>
    </aside>
  </section>
  <div class="pf-credibility"><div class="shell"><p>Built by someone who understands the numbers <span>and the systems.</span></p><p>Renzo Demartini <b>Chartered Accountant · MBA</b><a href="https://renzodemartini.com/about/">Meet Renzo ↗</a></p></div></div>

  <section id="problems" class="pf-problems shell" aria-labelledby="problems-title">
    <div class="pf-section-heading"><p class="eyebrow">Find your starting point</p><h2 id="problems-title">Where does work<br>get stuck?</h2><p>You don’t need an automation brief. Start with the bit everyone is tired of doing.</p></div>
    <article class="pf-problem" id="double-entry" data-workflow="invoice">
      <span class="pf-index" aria-hidden="true">01 /</span><div><p class="eyebrow">Repeated entry · Job to invoice</p><h3>“We already entered this.<br>Why are we typing it again?”</h3><p>Job notes, approved extras and customer details move from one screen to another by hand. The invoice waits while someone checks what belongs on it.</p><p class="pf-outcome"><strong>The useful change:</strong> carry the agreed details into a reviewable draft and flag what still needs a decision.</p><div class="pf-actions"><a class="pf-text-link" href="#contact" data-problem="invoice">Discuss this handoff ↗</a><a href="<?php echo esc_url(home_url('/why-are-we-entering-this-twice/')); ?>">What to check first →</a></div></div>
      <div class="pf-route" aria-label="Proposed job to invoice process"><span>Job details</span><i aria-hidden="true">↓</i><span>Check extras &amp; missing information</span><i aria-hidden="true">↓</i><strong>Invoice draft · a person approves</strong><small>Illustrative approach. Your system’s existing features come first.</small></div>
    </article>
    <article class="pf-problem" id="reporting" data-workflow="reporting">
      <span class="pf-index" aria-hidden="true">02 /</span><div><p class="eyebrow">Manual reporting · Finance &amp; operations</p><h3>“By the time the report’s ready,<br>the numbers have moved.”</h3><p>Export the files. Match the rows. Reconcile the totals. Repeat next month. The team spends its time assembling information instead of using it.</p><p class="pf-outcome"><strong>The useful change:</strong> connect the sources, test the calculations and surface the exceptions in a report people can review.</p><div class="pf-actions"><a class="pf-text-link" href="#contact" data-problem="reporting">Discuss our reporting ↗</a><a href="#reporting-proof">See the reporting build →</a></div></div>
      <div class="pf-route" aria-label="Reporting implementation process"><span>Accounting &amp; job records</span><i aria-hidden="true">↓</i><span>Reconcile &amp; calculate</span><i aria-hidden="true">↓</i><strong>Current report · visible exceptions</strong><small>Implemented with five Xero files and Simpro. Details below.</small></div>
    </article>
    <article class="pf-problem" id="enquiries" data-workflow="enquiry">
      <span class="pf-index" aria-hidden="true">03 /</span><div><p class="eyebrow">Customer enquiries · Follow-through</p><h3>“Has anyone replied to this?”</h3><p>The message is in an inbox. The customer details are somewhere else. Getting to a useful reply and an owned next step takes another round of chasing.</p><p class="pf-outcome"><strong>The useful change:</strong> bring the context together, prepare the reply for approval, and pass confirmed details to the calendar and CRM.</p><div class="pf-actions"><a class="pf-text-link" href="#contact" data-problem="enquiry">Discuss our enquiries ↗</a><a href="#enquiry-proof">See the connected handoff →</a></div></div>
      <div class="pf-route" aria-label="Enquiry implementation process"><span>Enquiry &amp; customer context</span><i aria-hidden="true">↓</i><span>Prepared reply · staff approval</span><i aria-hidden="true">↓</i><strong>Customer confirms · owner assigned</strong><small>Implemented with Outlook, customer records, Zapier and a CRM.</small></div>
    </article>
  </section>

  <section id="real-work" class="pf-proof" aria-labelledby="proof-title"><div class="shell">
    <div class="pf-section-heading"><p class="eyebrow">Designed &amp; built by Renzo</p><h2 id="proof-title">Real work.<br>A clearer way through.</h2><p>Two first-hand implementation accounts. The organisations remain private; the process changes are documented.</p></div>
    <article id="reporting-proof" class="pf-case" data-workflow="reporting">
      <div class="pf-case-copy"><p class="eyebrow">01 / Management reporting</p><h3>Five accounting files.<br>One reporting process.</h3><p>I connected five Xero files and Simpro, built the calculations and kept the familiar management reporting layout, filtered by business group.</p><p>Source checks and exceptions are part of the process. People still review the output and make the decisions.</p><a class="pf-text-link" href="https://renzodemartini.com/ai-finance-team-implementation/">Read my implementation account ↗</a></div>
      <div class="pf-case-result"><div><span class="eyebrow">Before / monthly preparation</span><p class="pf-large-number">20 <span>hours</span></p><p>Assembling the reports by hand.</p></div><div><span class="eyebrow">After / reporting cadence</span><p class="pf-large-number">Weekday <span>refresh</span></p><p>Automated preparation. Human review.</p></div><p class="pf-evidence-note">20 hours is the first-hand monthly preparation baseline. Net time saved and financial return have not been measured.</p></div>
    </article>
    <article id="enquiry-proof" class="pf-case secondary" data-workflow="enquiry">
      <div class="pf-case-copy"><p class="eyebrow">02 / Enquiry follow-through</p><h3>From an Outlook enquiry<br>to an owned next step.</h3><p>I connected customer lookup, a prepared brief and reply, staff approval, and the calendar and CRM handoff after customer confirmation.</p><p>The approved information carries through the steps without staff re-entering the same details.</p><a class="pf-text-link" href="https://renzodemartini.com/results/connected-data-workflows/">Follow the implementation ↗</a></div>
      <div class="pf-case-result"><ol class="pf-timeline"><li><b>Context ready</b><span>Customer lookup and a prepared brief.</span></li><li><b>Reply approved</b><span>The support team reviews before sending.</span></li><li><b>Next step owned</b><span>Customer confirmation connects the meeting, CRM record and assignment.</span></li></ol><p class="pf-evidence-note">First-hand account. The linked walkthrough uses fictional records; no measured conversion uplift is claimed.</p></div>
    </article>
  </div></section>

  <section id="start-small" class="pf-start shell" aria-labelledby="start-title">
    <div class="pf-section-heading"><p class="eyebrow">Start with the problem</p><h2 id="start-title">One process.<br>A practical next step.</h2><p>You know where the work hurts. I help turn that into a change you can assess and agree to.</p></div>
    <ol class="pf-start-steps"><li><span class="pf-index">01</span><h3>Tell me where it sticks.</h3><p>What happens today, which systems are involved, and what a better result would look like.</p></li><li><span class="pf-index">02</span><h3>See what’s worth changing.</h3><p>We check the handoffs, existing features and constraints. If a scoped review is useful, you get its fee and deliverables in writing.</p></li><li><span class="pf-index">03</span><h3>Agree the result before the build.</h3><p>Scope, acceptance measures, access and support are agreed before implementation. Your team keeps the decisions that need a person.</p></li></ol>
    <p class="pf-start-detail">Want to see what a scoped review produces? <a href="<?php echo esc_url(get_template_directory_uri() . '/assets/workflow-review-sample.html'); ?>">Open the sample deliverable ↗</a></p>
  </section>

  <section id="contact" class="pf-contact" aria-labelledby="contact-title"><div class="shell pf-contact-grid">
    <div><p class="eyebrow">Talk directly to Renzo</p><h2 id="contact-title">What keeps landing<br>back on your desk?</h2><p class="pf-lead">Tell me about one process. A few sentences are enough.</p><p>I’ll review what you send and reply personally to discuss whether I can help. Scope and fees are agreed before any paid work.</p><p class="pf-contact-byline"><b>Renzo Demartini</b><span>Chartered Accountant · MBA</span><span>Canberra · Working with businesses across AU &amp; NZ</span></p><a class="pf-text-link" href="mailto:hello@worksbetter.ai">hello@worksbetter.ai ↗</a></div>
    <div class="pf-form-panel">
      <form id="enquiry-form" method="post" action="<?php echo esc_url(home_url('/#contact')); ?>" aria-label="Tell Renzo about your process">
        <div class="pf-fields"><label for="contact-name">Your name<input id="contact-name" name="name" autocomplete="name" maxlength="120" required></label><label for="contact-address">Email<input id="contact-address" name="email" type="email" autocomplete="email" maxlength="254" required></label></div>
        <label for="contact-brief">What’s getting stuck?<textarea id="contact-brief" name="brief" rows="5" minlength="12" maxlength="6000" required aria-describedby="brief-help" placeholder="For example: We combine five reports by hand every month. We use Xero and Simpro, and need a clearer view by business group."></textarea></label>
        <p id="brief-help" class="pf-field-help">The process, the tools and the result you need. Please leave out confidential records and passwords.</p>
        <details class="pf-optional"><summary>Add business or referral details <span>(optional)</span></summary><label for="contact-company">Business<input id="contact-company" name="company" autocomplete="organization" maxlength="200"></label><label for="contact-found">How did you find Works Better?<input id="contact-found" name="found" maxlength="300"></label></details>
        <div class="pf-honeypot" aria-hidden="true"><label for="contact-website">Leave this blank<input id="contact-website" name="website" autocomplete="off" tabindex="-1"></label></div>
        <p class="pf-field-help">Submitting saves your details for Renzo to respond. No mailing list or payment commitment. <a href="<?php echo esc_url(home_url('/enquiry-privacy/')); ?>">How your enquiry is handled</a>.</p>
        <button id="enquiry-submit" type="submit" class="pf-button">Send to Renzo <span aria-hidden="true">↗</span></button><p id="enquiry-status" role="status" aria-live="polite" tabindex="-1"></p>
      </form>
      <div id="enquiry-success" hidden><p class="eyebrow">Enquiry received</p><h3>Your brief is saved.</h3><p>Renzo can now review it. A reply has not been sent yet.</p><p id="enquiry-receipt"></p><button id="enquiry-new" type="button" class="pf-button">Start another enquiry</button></div>
      <details class="pf-email-option"><summary>Prefer to email or keep a copy?</summary><div class="pf-actions"><a id="contact-email" href="mailto:hello@worksbetter.ai">Open an email draft ↗</a><button id="copy-brief" type="button">Copy my brief</button></div><p id="copy-message" role="status"></p><p class="pf-field-help">Your draft stays in this page only. Copy it before leaving or reloading.</p></details>
      <noscript><p>The enquiry form needs JavaScript to send. <a href="mailto:hello@worksbetter.ai">Email hello@worksbetter.ai</a> with your process, tools and the result you need.</p><style>#enquiry-submit{display:none}</style></noscript>
    </div>
  </div></section>

  <section class="pf-faq shell" aria-labelledby="faq-title"><h2 id="faq-title">Before we talk.</h2><div>
    <details><summary>Do we have to change our software?</summary><p>We start with what you already use and check its existing capabilities. Connections, permissions and any limitations are assessed before a build is proposed.</p></details>
    <details><summary>Does this have to involve AI?</summary><p>No. Repeated transfers and calculations often need straightforward integration. AI is useful when a step needs interpretation or drafting. The problem determines the approach.</p></details>
    <details><summary>What does it cost?</summary><p>The fee depends on the process and scope. You receive the agreed deliverables, fee and timetable in writing before paid work starts. Implementation, software and ongoing support are scoped separately.</p></details>
    <details><summary>What happens if information is missing or wrong?</summary><p>We agree validation, approval and exception handling as part of the design. The process needs a clear owner and a defined way to stop, review or recover when a check fails.</p></details>
  </div></section>
  <section id="playground" class="pf-explore shell" aria-labelledby="explore-title"><div><p class="eyebrow">Want to explore the mechanics?</p><h2 id="explore-title">See how the work could move.</h2><p>Interactive examples use fictional records and simulated steps.</p></div><div class="pf-example-links"><a href="<?php echo esc_url(home_url('/simpro-xero-invoice-automation/')); ?>">Job to invoice ↗</a><a href="<?php echo esc_url(home_url('/multi-source-report-automation/')); ?>">Multi-source reporting ↗</a><a href="<?php echo esc_url(home_url('/ai-customer-enquiry-automation/')); ?>">Customer enquiries ↗</a><a href="<?php echo esc_url(home_url('/job-profitability-reporting/')); ?>">Job profitability ↗</a><a href="<?php echo esc_url(home_url('/employee-onboarding-automation/')); ?>">Employee onboarding ↗</a><a href="<?php echo esc_url(home_url('/lead-routing-automation/')); ?>">Lead routing ↗</a></div></section>
</main>
<footer class="pf-footer shell"><a class="pf-brand" href="<?php echo esc_url(home_url('/')); ?>">works<span>better</span><b aria-hidden="true">.</b></a><p>Less busywork. More useful work.<br>By Renzo Demartini · Canberra, Australia.</p><nav aria-label="Footer navigation"><a href="<?php echo esc_url(home_url('/guides/')); ?>">Practical guides</a><a href="https://renzodemartini.com/about/">About Renzo</a><a href="<?php echo esc_url(home_url('/enquiry-privacy/')); ?>">Enquiry privacy</a><a href="mailto:hello@worksbetter.ai">Email Renzo ↗</a></nav></footer>
<?php wp_footer(); ?>
</body></html>
