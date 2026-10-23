/*
 * Covens: the rules the pages share, kept free of the page and the database
 * so they can be tested on their own (tests/covens.test.js).
 *
 * The database decides who may do what (supabase/migrations/…_covens.sql);
 * these mirror its rules only to show the right buttons and explanations.
 */
(function (global) {
  "use strict";

  const JOINING = {
    open: { label: "Open to join", detail: "Sign the agreements and you’re in." },
    application: { label: "By application", detail: "Apply, and the coven’s elders review it." },
    closed: { label: "Not taking members", detail: "This coven isn’t welcoming new members right now." }
  };

  const DOCUMENT_KINDS = [
    { kind: "creed", label: "Creed" },
    { kind: "rules", label: "Rules" },
    { kind: "requirements", label: "Requirements" },
    { kind: "agreement", label: "Agreement" },
    { kind: "other", label: "Other" }
  ];

  const REPORT_REASONS = [
    { value: "harassment", label: "Harassment or bullying" },
    { value: "coercion", label: "Pressure for money, secrets, photos or obedience" },
    { value: "hate", label: "Hate or discrimination" },
    { value: "sexual", label: "Sexual content or advances" },
    { value: "minor", label: "Someone may be under 18" },
    { value: "self_harm", label: "Someone may be at risk of harm" },
    { value: "scam", label: "Scam or fraud" },
    { value: "spam", label: "Spam" },
    { value: "other", label: "Something else" }
  ];

  const CANDLE_FORMS = [
    { id: "vigil", label: "Vigil", wick: [0.508, 0.0534] },
    { id: "taper", label: "Taper", wick: [0.4984, 0.0552] },
    { id: "pillar", label: "Pillar", wick: [0.5108, 0.1394] },
    { id: "votive", label: "Votive", wick: [0.5008, 0.2627] },
    { id: "chime", label: "Chime", wick: [0.5038, 0.0805] },
    { id: "tea-light", label: "Tea light", wick: [0.5021, 0.2366] }
  ];

  const CANDLE_COLORS = ["white", "black", "red", "orange", "yellow", "green", "blue", "indigo", "purple", "pink", "magenta", "brown", "grey", "silver", "gold", "rainbow"];

  const BURN_CHOICES = [15, 30, 60, 120, 240, 480, 1440];

  /** A web address for a coven, from its name: "Moon & Thistle" → "moon-thistle". */
  function slugify(name) {
    return String(name || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "");
  }

  const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  function parseTags(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(",");
    const seen = new Set();
    const tags = [];
    for (const raw of list) {
      const tag = String(raw || "").trim().replace(/\s+/g, " ").slice(0, 30);
      const key = tag.toLowerCase();
      if (!tag || seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
      if (tags.length === 12) break;
    }
    return tags;
  }

  /** Problems with a coven's founding details, in the words the form shows. */
  function validateCoven(draft) {
    const errors = [];
    const name = String(draft?.name || "").trim();
    const slug = String(draft?.slug || "");
    if (name.length < 3 || name.length > 80) errors.push("Give the coven a name of 3 to 80 characters.");
    if (slug.length < 3 || slug.length > 60 || !SLUG_PATTERN.test(slug)) errors.push("The coven’s address needs 3 to 60 lower-case letters, numbers and dashes.");
    if (String(draft?.tagline || "").length > 160) errors.push("Keep the tagline to 160 characters.");
    if (String(draft?.description || "").length > 5000) errors.push("Keep the description to 5,000 characters.");
    if (draft?.joining && !JOINING[draft.joining]) errors.push("Choose how people join.");
    if (draft?.visibility && !["listed", "unlisted"].includes(draft.visibility)) errors.push("Choose whether the coven is listed.");
    return errors;
  }

  /** Application questions as the database keeps them: [{ id, prompt, required }]. */
  function normalizeQuestions(list) {
    const used = new Set();
    const out = [];
    for (const raw of Array.isArray(list) ? list : []) {
      const prompt = String(raw?.prompt || "").trim().slice(0, 300);
      if (!prompt) continue;
      let id = String(raw?.id || "").trim() || `q-${slugify(prompt).slice(0, 24) || "question"}`;
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      out.push({ id, prompt, required: Boolean(raw?.required) });
      if (out.length === 20) break;
    }
    return out;
  }

  function missingAnswers(questions, answers) {
    return normalizeQuestions(questions).filter((q) => q.required && !String(answers?.[q.id] || "").trim());
  }

  /** Documents in reading order, creed first, then rules, requirements and agreements. */
  function orderDocuments(documents) {
    const rank = Object.fromEntries(DOCUMENT_KINDS.map((d, i) => [d.kind, i]));
    return [...(documents || [])].sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) || (a.position || 0) - (b.position || 0) || String(a.title).localeCompare(String(b.title)));
  }

  /** Agreements that still need this person's signature (the current version only). */
  function unsignedAgreements(documents, signatures, userId) {
    const signed = new Set((signatures || []).filter((s) => !userId || s.user_id === userId).map((s) => `${s.document_id}@${s.version}`));
    return orderDocuments(documents).filter((d) => d.requires_signature && d.published !== false && !signed.has(`${d.id}@${d.version}`));
  }

  /**
   * What this person can do in this coven, as the database decides it.
   * `membership` is their coven_members row (or null), `ranks` the coven's ranks.
   */
  function permissions({ coven, membership, ranks, userId, siteModerator }) {
    const active = Boolean(membership && membership.status === "active");
    const rank = active ? (ranks || []).find((r) => r.id === membership.rank_id) || null : null;
    const founder = Boolean(userId && coven && coven.founder_id === userId && active);
    const open = coven?.status === "active";
    const level = founder ? 1000 : rank ? rank.level : 0;
    const may = (flag) => open && active && (founder || Boolean(rank && (rank.can_manage || rank[flag])));
    const muted = Boolean(active && membership.muted_until && new Date(membership.muted_until) > new Date());
    return {
      member: active,
      founder,
      rank,
      level,
      manage: open && active && (founder || Boolean(rank?.can_manage)),
      review: may("can_review"),
      moderate: may("can_moderate"),
      lead: open && active && (founder || Boolean(rank && (rank.can_lead_rituals || rank.can_moderate || rank.can_manage))),
      muted,
      site: Boolean(siteModerator),
      status: membership?.status || null
    };
  }

  /** Whether chat and the altar are open to this person, and if not, why. */
  function standing(perms, unsigned, banned) {
    const reasons = [];
    if (!perms.member) reasons.push("Only members can speak in the coven’s gathering.");
    if (perms.member && perms.status === "active" && unsigned?.length) reasons.push("Sign the coven’s updated agreements to take part.");
    if (perms.muted) reasons.push("A coven moderator has paused your messages for a while.");
    if (banned) reasons.push("Your account can’t take part in covens.");
    return { ok: perms.member && !reasons.length, reasons };
  }

  /** Mirrors public.coven_can_grant: which positions this person may give. */
  function grantableRanks(ranks, perms) {
    return (ranks || []).filter((r) => {
      if (perms.site || perms.founder) return true;
      if (perms.manage) return r.level <= perms.level;
      if (perms.review) return r.level < perms.level && !(r.can_manage || r.can_review || r.can_moderate);
      return false;
    });
  }

  /** Positions this member could apply to rise to. */
  function advancementOptions(ranks, perms) {
    return [...(ranks || [])].filter((r) => r.open_to_applications && r.level > perms.level).sort((a, b) => a.level - b.level);
  }

  function rankPowers(rank) {
    const powers = [];
    if (rank?.can_manage) powers.push("leads the coven");
    if (rank?.can_review) powers.push("reviews applications");
    if (rank?.can_moderate) powers.push("keeps the gathering safe");
    if (rank?.can_lead_rituals || rank?.can_moderate || rank?.can_manage) powers.push("leads rituals");
    return powers;
  }

  /** The directory's search and filters. */
  function filterDirectory(covens, { query = "", joining = "all" } = {}) {
    const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
    return (covens || []).filter((c) => {
      if (joining !== "all" && c.joining !== joining) return false;
      if (!words.length) return true;
      const text = [c.name, c.tagline, c.description, c.tradition, c.meeting_rhythm, ...(c.tags || [])].join(" ").toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }

  /** A candle's flame, from when it was lit and how long it burns. */
  function candleState(item, now = Date.now()) {
    if (!item || item.kind !== "candle" || !item.lit || !item.lit_at) return { lit: false, burntOut: false, remaining: 1, minutesLeft: 0 };
    const total = Math.max(1, Number(item.burn_minutes) || 60) * 60000;
    const elapsed = Math.max(0, now - new Date(item.lit_at).getTime());
    const remaining = Math.max(0, 1 - elapsed / total);
    return { lit: remaining > 0, burntOut: remaining === 0, remaining, minutesLeft: Math.ceil((remaining * total) / 60000) };
  }

  function candleImage(color, form) {
    const c = CANDLE_COLORS.includes(color) ? color : "white";
    const f = CANDLE_FORMS.find((x) => x.id === form) || CANDLE_FORMS[0];
    if (f.id === "vigil") return `/assets/altar/objects/candles/${c}-candle.${c === "black" || c === "white" ? "PNG" : "png"}`;
    return `/assets/altar/objects/candles/${f.id}/${c}-${f.id}.png`;
  }

  /** Where the wick sits in a candle picture, as fractions of its width and height. */
  function candleWick(image) {
    const match = /\/candles\/([a-z-]+)\/[^/]+$/i.exec(String(image || ""));
    const form = match ? match[1] : "vigil";
    return (CANDLE_FORMS.find((f) => f.id === form) || CANDLE_FORMS[0]).wick;
  }

  /** The altar artwork's "../assets/…" paths, as site paths the coven page can load. */
  function sitePath(image) {
    return String(image || "").replace(/^(\.\.\/)+/, "/");
  }

  const clamp = (value, low, high) => Math.min(high, Math.max(low, Number.isFinite(Number(value)) ? Number(value) : low));

  function clampPosition(x, y) {
    return { x: Math.round(clamp(x, 0, 1) * 10000) / 10000, y: Math.round(clamp(y, 0, 1) * 10000) / 10000 };
  }

  /**
   * Chat messages oldest first, without blocked people's words, with the day
   * marked where it changes. Each entry is { type: "day", label } or
   * { type: "message", message, hidden }.
   */
  function chatTimeline(messages, blockedIds, locale) {
    const blocked = new Set(blockedIds || []);
    const sorted = [...(messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const out = [];
    let lastDay = "";
    for (const message of sorted) {
      const date = new Date(message.created_at);
      const day = date.toDateString();
      if (day !== lastDay) {
        out.push({ type: "day", label: date.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" }) });
        lastDay = day;
      }
      out.push({ type: "message", message, hidden: blocked.has(message.user_id) });
    }
    return out;
  }

  /** Put a live change into a list kept by id: insert, update or delete. */
  function applyChange(list, change) {
    const items = [...(list || [])];
    const record = change?.new && Object.keys(change.new).length ? change.new : null;
    const id = record?.id || change?.old?.id;
    if (!id) return items;
    const at = items.findIndex((item) => item.id === id);
    if (change.eventType === "DELETE") {
      if (at >= 0) items.splice(at, 1);
      return items;
    }
    if (at >= 0) items[at] = { ...items[at], ...record };
    else items.push(record);
    return items;
  }

  /** The words people see when the database refuses something. */
  function errorMessage(error) {
    const text = String(error?.message || error || "");
    if (/row-level security|permission denied/i.test(text)) return "You don’t have permission to do that here.";
    if (/duplicate key|already exists/i.test(text)) return "That already exists.";
    if (/violates check constraint/i.test(text)) return "Something in that form is too long or not allowed.";
    if (/Failed to fetch|NetworkError|network/i.test(text)) return "You seem to be offline. Please try again.";
    return text || "That didn’t work. Please try again.";
  }

  function relativeTime(value, now = Date.now()) {
    const minutes = Math.round((now - new Date(value).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(value).toLocaleDateString();
  }

  // --- coven rituals ------------------------------------------------------------

  /** Whose a ritual step is: a person, everyone in a position, or the whole coven. */
  function stepAssignee(step, ranks, nameOf) {
    if (step?.assigned_user_id) return { kind: "person", label: nameOf ? nameOf(step.assigned_user_id) : "A member" };
    if (step?.assigned_rank_id) {
      const rank = (ranks || []).find((r) => r.id === step.assigned_rank_id);
      return { kind: "rank", label: rank ? `Every ${rank.name}` : "A position" };
    }
    return { kind: "everyone", label: "The whole coven" };
  }

  /** Mirrors public.coven_step_is_mine: by name, by position, or everyone's. */
  function stepIsMine(step, membership, userId) {
    if (!step || !userId || membership?.status !== "active") return false;
    if (step.assigned_user_id) return step.assigned_user_id === userId;
    if (step.assigned_rank_id) return step.assigned_rank_id === membership.rank_id;
    return true;
  }

  /** A ritual's steps in order. */
  const orderSteps = (steps, ritualId) => [...(steps || [])].filter((s) => !ritualId || s.ritual_id === ritualId).sort((a, b) => a.position - b.position);

  /** Rituals grouped as the Rituals tab shows them. */
  function ritualGroups(rituals, now = Date.now()) {
    const by = (key, dir = 1) => (a, b) => dir * ((new Date(a[key] || 0)) - (new Date(b[key] || 0)));
    const list = rituals || [];
    return {
      live: list.filter((r) => r.status === "live"),
      upcoming: list.filter((r) => r.status === "scheduled").sort((a, b) => (a.scheduled_for ? new Date(a.scheduled_for) : Infinity) - (b.scheduled_for ? new Date(b.scheduled_for) : Infinity)),
      drafts: list.filter((r) => r.status === "draft").sort(by("updated_at", -1)),
      past: list.filter((r) => r.status === "done" || r.status === "cancelled").sort(by("ended_at", -1)).slice(0, 20)
    };
  }

  /** A timestamp as a datetime-local input's value, in this browser's time. */
  function toLocalInput(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fromLocalInput(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  /** A saved personal ritual's steps, ready to become coven ritual steps. */
  function stepsFromTemplate(templateSteps) {
    return [...(templateSteps || [])]
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .filter((s) => String(s.title || "").trim())
      .slice(0, 60)
      .map((s) => ({
        title: String(s.title).trim().slice(0, 120),
        instructions: s.instructions ? String(s.instructions).slice(0, 4000) : "",
        spoken_text: s.spoken_text ? String(s.spoken_text).slice(0, 4000) : "",
        duration_minutes: s.duration_seconds ? Math.min(240, Math.max(0, Math.round(s.duration_seconds / 60))) : null,
        assigned_user_id: null,
        assigned_rank_id: null
      }));
  }

  const api = {
    JOINING,
    DOCUMENT_KINDS,
    REPORT_REASONS,
    CANDLE_FORMS,
    CANDLE_COLORS,
    BURN_CHOICES,
    slugify,
    parseTags,
    validateCoven,
    normalizeQuestions,
    missingAnswers,
    orderDocuments,
    unsignedAgreements,
    permissions,
    standing,
    grantableRanks,
    advancementOptions,
    rankPowers,
    filterDirectory,
    candleState,
    candleImage,
    candleWick,
    sitePath,
    clampPosition,
    chatTimeline,
    applyChange,
    errorMessage,
    relativeTime,
    stepAssignee,
    stepIsMine,
    orderSteps,
    ritualGroups,
    toLocalInput,
    fromLocalInput,
    stepsFromTemplate
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.CovenLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
