// Lightweight interactive logic for homepage
(function(){
  // Utilities
  function qs(sel, ctx){ return (ctx||document).querySelector(sel) }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)) }

  // Modal / Quiz
  const quizModal = qs('#quizModal');
  const takeAssessmentBtn = qs('#takeAssessmentBtn');
  const finalAssessmentBtn = qs('#finalAssessmentBtn');
  const closeQuiz = qs('#closeQuiz');
  const quizForm = qs('#quizForm');
  const quizResult = qs('#quizResult');
  const quizCancel = qs('#quizCancel');

  function openModal(){
    quizModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    quizModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    quizResult.innerHTML = '';
    quizForm.reset();
  }

  takeAssessmentBtn && takeAssessmentBtn.addEventListener('click', openModal);
  finalAssessmentBtn && finalAssessmentBtn.addEventListener('click', openModal);
  closeQuiz && closeQuiz.addEventListener('click', closeModal);
  quizCancel && quizCancel.addEventListener('click', closeModal);

  // Quiz simple logic — map answers to recommended packages
  quizForm && quizForm.addEventListener('submit', function(evt){
    evt.preventDefault();
    const form = new FormData(quizForm);
    const role = form.get('role');
    const phase = form.get('phase');
    const helps = form.getAll('help');
    const email = form.get('email');

    // Simple recommendation rules (customize server-side as needed)
    const recommendations = new Set();
    if(helps.includes('all') || helps.length === 0){
      recommendations.add('Legal Prompts');
      recommendations.add('Accounting Prompts');
      recommendations.add('Due Diligence');
    } else {
      helps.forEach(h => {
        if(h === 'legal') recommendations.add('Legal Prompts');
        if(h === 'accounting') recommendations.add('Accounting Prompts');
        if(h === 'valuation') recommendations.add('Valuation Prompts');
        if(h === 'financing') recommendations.add('Non-Bank Lenders');
        if(h === 'duediligence') recommendations.add('Due Diligence');
      });
    }

    // Phase adjustments
    if(phase === 'offer' || phase === 'pre-closing') recommendations.add('Legal Prompts');
    if(phase === 'duediligence') recommendations.add('Due Diligence');

    // Fallback
    if(recommendations.size === 0){
      recommendations.add('Legal Prompts');
      recommendations.add('Accounting Prompts');
    }

    const recArray = Array.from(recommendations);
    quizResult.innerHTML = '<p><strong>Recommended packages:</strong></p><ul>' + recArray.map(r => `<li>${r} — <a href="/${r.toLowerCase().split(' ')[0]}-prompts">Get Package</a></li>`).join('') + '</ul><p>We also emailed these to <strong>' + (email||'your email') + '</strong>.</p>';

    // Push a sample analytics event to dataLayer for GTM / tracking
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'assessment_completed',
      assessment_role: role,
      assessment_phase: phase,
      recommended: recArray.join(';'),
      user_email: email || ''
    });

    // Example: send email or store lead (replace with real endpoint)
    // fetch('/api/lead', {method:'POST', body: JSON.stringify({email, rec: recArray})});

    // Show a success microcopy
    setTimeout(()=>{ quizResult.insertAdjacentHTML('beforeend','<p class="muted">Check your inbox for next steps.</p>') }, 400);
  });


  // Horizontal scroller controls
  const servicesTrack = qs('#servicesTrack');
  const scrollLeft = qs('#scrollLeft');
  const scrollRight = qs('#scrollRight');

  function scrollByWidth(dir){
    if(!servicesTrack) return;
    const card = servicesTrack.querySelector('.service-card');
    if(!card) return;
    const gap = 12;
    const scrollAmount = card.getBoundingClientRect().width + gap;
    servicesTrack.scrollBy({left: dir === 'left' ? -scrollAmount : scrollAmount, behavior:'smooth'});
  }
  scrollLeft && scrollLeft.addEventListener('click', ()=>scrollByWidth('left'));
  scrollRight && scrollRight.addEventListener('click', ()=>scrollByWidth('right'));

  // CTA tracking
  const ctas = qsa('.btn-primary');
  ctas.forEach(el=>{
    el.addEventListener('click', (e)=>{
      const id = el.id || el.textContent.trim();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'cta_click', cta: id });
    });
  });

  // Basic lead form placeholder handling
  const leadForm = qs('#leadForm');
  if(leadForm){
    leadForm.addEventListener('submit', function(e){
      e.preventDefault();
      // replace with real integration
      window.dataLayer.push({ event: 'lead_submitted', lead: 'placeholder' });
      alert('Thank you! We will respond within 24 hours.');
    });
  }

  // Accessibility enhancement: allow left/right arrow keys to move carousel
  if(servicesTrack){
    servicesTrack.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft') { scrollByWidth('left'); }
      if(e.key === 'ArrowRight') { scrollByWidth('right'); }
    });
  }

  // Close modal on Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && quizModal && quizModal.getAttribute('aria-hidden') === 'false'){
      closeModal();
    }
  });

  // Simple lazy-loading hint for images (if you replace placeholders)
  document.addEventListener('DOMContentLoaded', function(){
    const imgs = qsa('img[data-src]');
    imgs.forEach(img=>{
      img.setAttribute('src', img.getAttribute('data-src'));
    });
  });

})();