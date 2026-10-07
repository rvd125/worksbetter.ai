/* Keep the first conversation about the buyer's process; never overwrite a draft. */
(() => {
  'use strict';
  const prompts = Object.freeze({
    invoice: 'We are re-entering job or invoice details.\n\nOur systems: \nWhere the handoff gets stuck: \nThe result we need: ',
    reporting: 'We are assembling reports by hand.\n\nOur source systems: \nWhat we prepare and how often: \nThe result we need: ',
    enquiry: 'We want a clearer handoff from an enquiry to an owned next step.\n\nOur systems: \nWhere follow-through gets stuck: \nThe result we need: '
  });
  // Referral links carry a fixed problem category, never customer details.
  const params = new URL(window.location.href).searchParams;
  const incomingProblem = params.get('problem');
  const campaigns = Object.freeze({
    invoice: { code: 'job_to_invoice', label: 'Job to invoice' },
    reporting: { code: 'reporting_handoff', label: 'Reporting handoff' },
    enquiry: { code: 'enquiry_handoff', label: 'Enquiry handoff' }
  });
  const campaign = Object.hasOwn(campaigns, incomingProblem) ? campaigns[incomingProblem] : null;
  const campaignNote = document.getElementById('contact-campaign');
  if (campaignNote && campaign && params.get('utm_source') === 'partner' && params.get('utm_medium') === 'referral' && params.get('utm_campaign') === campaign.code) {
    campaignNote.textContent = 'Campaign link: ' + campaign.label + ' (partner / referral). This context is included with your enquiry.';
    campaignNote.hidden = false;
  }
  if (incomingProblem && Object.hasOwn(prompts, incomingProblem)) {
    window.WBEnquiry?.seed(prompts[incomingProblem]);
    document.getElementById('contact-brief')?.dispatchEvent(new Event('change'));
    window.WBAnalytics?.track('problem_selected', { workflow: incomingProblem });
    window.WBAnalytics?.track('contact_open', { workflow: incomingProblem });
  }
  document.querySelectorAll('[data-problem]').forEach(link => {
    link.addEventListener('click', () => {
      const workflow = link.dataset.problem;
      if (!Object.hasOwn(prompts, workflow)) return;
      window.WBEnquiry?.seed(prompts[workflow]);
      document.getElementById('contact-brief')?.dispatchEvent(new Event('change'));
      window.WBAnalytics?.track('problem_selected', { workflow });
      window.WBAnalytics?.track('contact_open', { workflow });
    });
  });
  document.querySelectorAll('a[href="#contact"]:not([data-problem])').forEach(link => {
    link.addEventListener('click', () => window.WBAnalytics?.track('contact_open', { workflow: 'general' }));
  });
  document.querySelector('.skip')?.addEventListener('click', () => document.getElementById('main-content')?.focus({ preventScroll: true }));
})();
