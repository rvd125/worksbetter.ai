(()=>{
 'use strict';const form=document.querySelector('#own-form');if(!form||document.querySelector('.flagship-entry'))return;
 const section=document.createElement('section');section.className='flagship-entry';section.setAttribute('aria-labelledby','flagship-title');
 section.innerHTML='<p class="flagship-kicker">START WITH A FAMILIAR PROBLEM</p><h2 id="flagship-title">Pick the work<br>that gets stuck.</h2><p>Repeated entry, missed handovers or numbers that do not agree. See where AI could take on the work, what should run automatically and where your team stays involved.</p><div class="flagship-actions"><a class="button primary" href="#playground">Show me the examples <span aria-hidden="true">↓</span></a><a class="flagship-text-link" href="/#delivery-modes">Choose how the work runs <span aria-hidden="true">↗</span></a></div><p class="flagship-note">Fictional demonstrations. The solution and safeguards depend on your business.</p>';
 form.insertAdjacentElement('beforebegin',section);
})();
