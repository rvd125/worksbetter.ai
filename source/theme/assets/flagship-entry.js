/* Compact discovery story: confirmed invoice logic, fictional records only. */
(() => {
  'use strict';
  const card = document.querySelector('.wb-proof-card');
  if (card) {
    const select = card.querySelector('#wb-proof-case');
    const next = card.querySelector('#wb-proof-next');
    const decline = card.querySelector('#wb-proof-decline');
    const reset = card.querySelector('#wb-proof-reset');
    const status = card.querySelector('#wb-proof-status');
    const reason = card.querySelector('#wb-proof-reason');
    const reasonWrap = card.querySelector('#wb-proof-reason-wrap');
    const steps = [...card.querySelectorAll('.wb-proof-track li')];
    let step = 0;
    let stopped = false;
    const say = text => { status.textContent = text; };
    function render() {
      steps.forEach((element, index) => {
        element.classList.toggle('complete', index < step);
        element.classList.toggle('current', index === step);
        element.removeAttribute('aria-current');
        if (index === step) element.setAttribute('aria-current', 'step');
      });
      reasonWrap.hidden = stopped || step !== 2 || select.value !== 'mismatch';
      decline.hidden = stopped || step !== 2;
      next.disabled = stopped || step === 3;
      next.textContent = stopped ? 'Stopped' : ['Check MYOB', 'Compare purchase order', 'Approve invoice', 'Example complete'][step];
      reset.disabled = false;
    }
    function start() {
      step = 0; stopped = false; reason.value = '';
      reason.removeAttribute('aria-invalid');
      say('AI checks for an existing invoice in MYOB. Choose a fictional case, then follow the decision.');
      render();
    }
    select.addEventListener('change', start);
    reset.addEventListener('click', start);
    next.addEventListener('click', () => {
      if (stopped || step === 3) return;
      if (step === 0) {
        if (select.value === 'duplicate') {
          stopped = true;
          say('Duplicate found in MYOB. The work stops: nothing is filed, recorded or acknowledged.');
        } else {
          step = 1;
          say('No existing invoice found. Compare this new invoice with its purchase order before asking a person to decide.');
        }
      } else if (step === 1) {
        step = 2;
        say(select.value === 'mismatch' ? 'The purchase order differs. A person must explain the difference before approval, or decline the invoice.' : 'The purchase order matches. Your team still decides whether to approve or decline the invoice.');
      } else if (step === 2) {
        if (select.value === 'mismatch' && !reason.value.trim()) {
          reason.setAttribute('aria-invalid', 'true');
          say('Explain the purchase-order difference before approving.');
          reason.focus();
          return;
        }
        reason.removeAttribute('aria-invalid'); step = 3;
        say('Approved. n8n saves the invoice in Google Drive, records it in MYOB with approver details, and prepares/connects a Gmail receipt acknowledgement. No payment occurs.');
      }
      window.WBAnalytics?.track('workflow_step_open', { workflow: 'invoice' });
      render();
    });
    decline.addEventListener('click', () => {
      if (stopped || step !== 2) return;
      stopped = true;
      say('Declined. Nothing is filed, recorded or acknowledged. Reset to try another fictional case.');
      window.WBAnalytics?.track('workflow_step_open', { workflow: 'invoice' });
      render();
    });
    start();
  }
  const openIdea = () => {
    if (!['#your-idea', '#own-idea'].includes(location.hash)) return;
    const details = document.querySelector('.wb-idea-details');
    if (details) details.open = true;
  };
  window.addEventListener('hashchange', openIdea);
  openIdea();
})();
