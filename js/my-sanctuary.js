/* =========================================================
   MY SANCTUARY PANEL REFINEMENT
   ========================================================= */

.my-sanctuary-card {
  overflow-y: auto;
}

.my-sanctuary-card h2 {
  max-width: 100%;
  margin: 0 0 0.7rem;
  font-size: clamp(2.4rem, 7vw, 4.2rem);
  line-height: 0.95;
}

.my-sanctuary-intro {
  max-width: 34rem;
  margin-bottom: 0.8rem;
  color: var(--cream);
  font-size: 1rem;
  line-height: 1.6;
}

.my-sanctuary-soft-note {
  margin-bottom: 1.1rem;
  color: var(--gold);
  font-size: 0.95rem;
}

.my-sanctuary-view {
  animation: sanctuaryPanelFade 0.22s ease both;
}

@keyframes sanctuaryPanelFade {
  from {
    opacity: 0;
    transform: translateY(0.35rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.my-sanctuary-choice-actions,
.my-sanctuary-auth-actions,
.my-sanctuary-actions {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.my-sanctuary-auth-form {
  margin: 1rem 0 1.15rem;
}

.my-sanctuary-notice {
  margin: 0.75rem 0;
  border: 1px solid rgba(185, 160, 93, 0.3);
  border-radius: 0.85rem;
  padding: 0.65rem 0.8rem;
  color: var(--cream);
  background: rgba(185, 160, 93, 0.1);
  font-size: 0.9rem;
}

.my-sanctuary-notice[hidden] {
  display: none;
}

.my-sanctuary-user {
  margin-bottom: 0.65rem;
}

.my-sanctuary-links {
  gap: 0.8rem;
  margin-top: 1rem;
}

.my-sanctuary-links a,
.my-sanctuary-links span {
  align-items: flex-start;
  padding: 0.95rem 1rem;
}

.my-sanctuary-links strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--cream);
  font-size: 1.05rem;
}

.my-sanctuary-links small {
  display: block;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.4;
}

@media (max-width: 520px) {
  .my-sanctuary-card h2 {
    font-size: clamp(2.1rem, 14vw, 3.4rem);
  }

  .my-sanctuary-card {
    width: 100%;
  }
}
