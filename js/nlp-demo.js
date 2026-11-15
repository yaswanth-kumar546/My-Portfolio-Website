/**
 * MindWell AI — Interactive NLP Sentiment & Wellness Pipeline Demo
 * Showcases real-time token preprocessing, sentiment polarity, and conversational response
 */
(function() {
  const inputEl = document.getElementById('nlp-demo-input');
  const analyzeBtn = document.getElementById('nlp-demo-analyze-btn');
  const presetButtons = document.querySelectorAll('.nlp-preset-chip');
  
  // Metric result elements
  const polarityScoreEl = document.getElementById('nlp-polarity-score');
  const wellnessBadgeEl = document.getElementById('nlp-wellness-badge');
  const dnnProbEl = document.getElementById('nlp-dnn-prob');
  const lstmProbEl = document.getElementById('nlp-lstm-prob');
  const svmScoreEl = document.getElementById('nlp-svm-score');
  const tokensContainer = document.getElementById('nlp-tokens-container');
  const botResponseEl = document.getElementById('nlp-bot-response');
  const barPositive = document.getElementById('bar-positive');
  const barStress = document.getElementById('bar-stress');
  const barResilience = document.getElementById('bar-resilience');

  if (!inputEl || !analyzeBtn) return;

  // Preset triggers
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (text) {
        inputEl.value = text;
        runAnalysis(text);
      }
    });
  });

  analyzeBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) {
      inputEl.focus();
      return;
    }
    runAnalysis(text);
  });

  // Emotional dictionaries for lightweight client-side demo
  const distressWords = [
    'stressed', 'stress', 'anxious', 'anxiety', 'exhausted', 'tired', 'depressed', 
    'hopeless', 'sad', 'isolated', 'lonely', 'overwhelmed', 'burnout', 'lost', 
    'failure', 'giving up', 'panic', 'pressure', 'struggling', 'helpless'
  ];

  const positiveWords = [
    'excited', 'happy', 'great', 'confident', 'succeeded', 'deploy', 'achieved', 
    'proud', 'passionate', 'loving', 'growth', 'hopeful', 'energized', 'motivated', 
    'enjoying', 'thrilled', 'calm', 'peaceful', 'supported'
  ];

  function runAnalysis(rawText) {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="status-dot-pulse"></span> Processing Neural Pipeline...';

    // Simulate neural inference latency
    setTimeout(() => {
      const text = rawText.toLowerCase();
      const rawTokens = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);

      let positiveCount = 0;
      let distressCount = 0;
      const flaggedTokens = [];

      rawTokens.forEach(token => {
        let isFlagged = false;
        if (positiveWords.includes(token)) {
          positiveCount++;
          flaggedTokens.push({ word: token, type: 'positive' });
          isFlagged = true;
        } else if (distressWords.includes(token)) {
          distressCount++;
          flaggedTokens.push({ word: token, type: 'distress' });
          isFlagged = true;
        }

        if (!isFlagged && flaggedTokens.length < 8 && token.length > 4) {
          flaggedTokens.push({ word: token, type: 'neutral' });
        }
      });

      // Calculate score between -1 and 1
      const totalEvaluated = positiveCount + distressCount;
      let polarity = 0.05;
      if (totalEvaluated > 0) {
        polarity = (positiveCount - distressCount) / Math.max(totalEvaluated, 1);
      } else {
        polarity = (Math.random() * 0.3) - 0.1;
      }

      // Clamp between -0.95 and +0.95
      polarity = Math.max(-0.95, Math.min(0.95, polarity));

      // Display Polarity
      polarityScoreEl.textContent = (polarity >= 0 ? '+' : '') + polarity.toFixed(2);
      polarityScoreEl.className = polarity >= 0.15 ? 'text-emerald-400 font-mono text-2xl font-bold' : (polarity <= -0.15 ? 'text-rose-400 font-mono text-2xl font-bold' : 'text-amber-300 font-mono text-2xl font-bold');

      // Classification & Ensemble values
      let wellnessState = 'Balanced / Stable';
      let badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
      let botResponse = '';
      let posPct = 50, stressPct = 30, resPct = 75;

      if (polarity <= -0.25) {
        wellnessState = 'Emotional Strain / Stress Detected';
        badgeClass = 'bg-rose-950 text-rose-300 border-rose-500/50';
        posPct = Math.round(15 + Math.random() * 15);
        stressPct = Math.round(75 + Math.random() * 20);
        resPct = Math.round(40 + Math.random() * 20);

        botResponse = "“I hear how heavy this feels right now. Remember that challenging phases don't define your trajectory. Take a slow breath, break the immediate load into one small action, and remember your well-being comes first.”";
      } else if (polarity >= 0.3) {
        wellnessState = 'High Resilience / Positive Momentum';
        badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
        posPct = Math.round(80 + Math.random() * 18);
        stressPct = Math.round(10 + Math.random() * 15);
        resPct = Math.round(88 + Math.random() * 10);

        botResponse = "“That sense of clarity and accomplishment is powerful! Channeling this energy into continuous learning will accelerate your engineering milestones.”";
      } else {
        wellnessState = 'Neutral / Steady State';
        badgeClass = 'bg-amber-950 text-amber-300 border-amber-500/40';
        posPct = Math.round(45 + Math.random() * 15);
        stressPct = Math.round(30 + Math.random() * 15);
        resPct = Math.round(65 + Math.random() * 15);

        botResponse = "“Thank you for sharing your thoughts. Consistent focus and pacing are essential for sustainable growth. How can I assist you with your current goals?”";
      }

      wellnessBadgeEl.textContent = wellnessState;
      wellnessBadgeEl.className = `px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`;

      // Ensemble breakdown
      const dnnConfidence = (88 + Math.random() * 9).toFixed(1);
      const lstmTemporal = (91 + Math.random() * 7).toFixed(1);
      const svmHyperplane = (0.75 + Math.random() * 0.22).toFixed(2);

      dnnProbEl.textContent = `${dnnConfidence}%`;
      lstmProbEl.textContent = `${lstmTemporal}%`;
      svmScoreEl.textContent = svmHyperplane;

      // Update progress bars
      if (barPositive) barPositive.style.width = `${posPct}%`;
      if (barStress) barStress.style.width = `${stressPct}%`;
      if (barResilience) barResilience.style.width = `${resPct}%`;

      // Token display
      tokensContainer.innerHTML = '';
      flaggedTokens.slice(0, 10).forEach(tok => {
        const span = document.createElement('span');
        let bg = 'bg-zinc-800 text-zinc-300 border-zinc-700';
        if (tok.type === 'positive') bg = 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40';
        if (tok.type === 'distress') bg = 'bg-rose-950/80 text-rose-300 border-rose-600/40';
        span.className = `px-2 py-0.5 rounded text-xs border font-mono ${bg}`;
        span.textContent = tok.word;
        tokensContainer.appendChild(span);
      });

      // Conversational response
      botResponseEl.innerHTML = `<span class="text-gold-champagne font-semibold mr-1">MindWell Assistant:</span> ${botResponse}`;

      // Reset button
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i> Run NLP Analysis';
      if (window.lucide) window.lucide.createIcons();
    }, 450);
  }

  // Trigger initial run on load
  runAnalysis(inputEl.value);
})();

