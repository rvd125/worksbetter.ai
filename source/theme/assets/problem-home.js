/* Keep the first conversation about the buyer's process; never overwrite a draft. */
(() => {
  'use strict';
  const prompts = Object.freeze({
    invoice: 'We are re-entering job or invoice details.\n\nOur systems: \nWhere the handoff gets stuck: \nThe result we need: ',
    reporting: 'We are assembling reports by hand.\n\nOur source systems: \nWhat we prepare and how often: \nThe result we need: ',
    enquiry: 'We want a clearer handoff from an enquiry to an owned next step.\n\nOur systems: \nWhere follow-through gets stuck: \nThe result we need: '
  });
  // Referral links carry a fixed problem category, never customer details.
  const incomingProblem = new URL(window.location.href).searchParams.get('problem');
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
