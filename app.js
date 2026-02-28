const chat = document.getElementById("chat");
const form = document.getElementById("composer");
const userInput = document.getElementById("userInput");
const voiceBtn = document.getElementById("voiceBtn");
const status = document.getElementById("status");
const installBtn = document.getElementById("installBtn");
let deferredInstallPrompt = null;

const phraseReplacements = [
  { pattern: /\bkindly revert\b/gi, replacement: "please reply", note: "Use 'please reply' instead of 'kindly revert'." },
  { pattern: /\bdo the needful\b/gi, replacement: "please take the required action", note: "Replace 'do the needful' with clear action wording." },
  { pattern: /\brevert back\b/gi, replacement: "reply", note: "Use 'reply', not 'revert back'." },
  { pattern: /\breturn back\b/gi, replacement: "return", note: "Use 'return', not 'return back'." },
  { pattern: /\bdiscuss about\b/gi, replacement: "discuss", note: "Use 'discuss', not 'discuss about'." },
  { pattern: /\byour good name\b/gi, replacement: "your name", note: "Use 'your name' in professional communication." },
  { pattern: /\bmyself ([a-z][a-z'-]*)\b/gi, replacement: "my name is $1", note: "Use 'my name is ...', not 'myself ...'." },
  { pattern: /\bplease do one thing\b/gi, replacement: "please", note: "Avoid filler phrase 'please do one thing'." },
  { pattern: /\bjust checking\b/gi, replacement: "checking", note: "Removed weak filler 'just' to sound confident." },
  { pattern: /\bif possible\b/gi, replacement: "", note: "Removed under-confident phrase 'if possible'." },
  { pattern: /\basap\b/gi, replacement: "as soon as possible", note: "Expanded 'ASAP' for clear professional tone." },
  { pattern: /\bI have a doubt\b/gi, replacement: "I have a question", note: "Use 'I have a question' in global teams." },
  { pattern: /\bpassed out from\b/gi, replacement: "graduated from", note: "Use 'graduated from', not 'passed out from'." },
  { pattern: /\bmore better\b/gi, replacement: "better", note: "Use 'better', not 'more better'." },
  { pattern: /\bcould able to\b/gi, replacement: "could", note: "Use either 'could' or 'was able to', not both." },
  { pattern: /\bcan able to\b/gi, replacement: "can", note: "Use either 'can' or 'am able to', not both." },
  { pattern: /\bdiscuss regarding\b/gi, replacement: "discuss", note: "Use 'discuss', not 'discuss regarding'." }
];

const grammarReplacements = [
  { pattern: /\bI am agree\b/gi, replacement: "I agree", note: "Use 'I agree', not 'I am agree'." },
  { pattern: /\bI didn't went\b/gi, replacement: "I didn't go", note: "After 'didn't', use base verb: 'go'." },
  { pattern: /\bI didn't understood\b/gi, replacement: "I didn't understand", note: "After 'didn't', use base verb: 'understand'." },
  { pattern: /\bI am having\b/gi, replacement: "I have", note: "Use 'I have' for possession." },
  { pattern: /\bI am understanding\b/gi, replacement: "I understand", note: "Use 'I understand' in this context." },
  { pattern: /\bHe don't\b/gi, replacement: "He doesn't", note: "Use 'doesn't' with he/she/it." },
  { pattern: /\bShe don't\b/gi, replacement: "She doesn't", note: "Use 'doesn't' with he/she/it." },
  { pattern: /\bIt don't\b/gi, replacement: "It doesn't", note: "Use 'doesn't' with he/she/it." },
  { pattern: /\bHe do\b/gi, replacement: "He does", note: "Use 'does' with he/she/it." },
  { pattern: /\bShe do\b/gi, replacement: "She does", note: "Use 'does' with he/she/it." },
  { pattern: /\bWe was\b/gi, replacement: "We were", note: "Use 'were' with we/they." },
  { pattern: /\bThey was\b/gi, replacement: "They were", note: "Use 'were' with we/they." },
  { pattern: /\bI has\b/gi, replacement: "I have", note: "Use 'have' with I/we/they/you." },
  { pattern: /\bHe have\b/gi, replacement: "He has", note: "Use 'has' with he/she/it." },
  { pattern: /\bShe have\b/gi, replacement: "She has", note: "Use 'has' with he/she/it." }
];

const spellingReplacements = [
  { pattern: /\bteh\b/gi, replacement: "the", note: "Spelling: 'teh' should be 'the'." },
  { pattern: /\brecieve\b/gi, replacement: "receive", note: "Spelling: 'recieve' should be 'receive'." },
  { pattern: /\bseperate\b/gi, replacement: "separate", note: "Spelling: 'seperate' should be 'separate'." },
  { pattern: /\bdefinately\b/gi, replacement: "definitely", note: "Spelling: 'definately' should be 'definitely'." },
  { pattern: /\baccomodate\b/gi, replacement: "accommodate", note: "Spelling: 'accomodate' should be 'accommodate'." },
  { pattern: /\bcomming\b/gi, replacement: "coming", note: "Spelling: 'comming' should be 'coming'." },
  { pattern: /\badress\b/gi, replacement: "address", note: "Spelling: 'adress' should be 'address'." },
  { pattern: /\benviroment\b/gi, replacement: "environment", note: "Spelling: 'enviroment' should be 'environment'." },
  { pattern: /\bacheive\b/gi, replacement: "achieve", note: "Spelling: 'acheive' should be 'achieve'." },
  { pattern: /\bwich\b/gi, replacement: "which", note: "Spelling: 'wich' should be 'which'." }
];

const issueHints = [
  {
    pattern: /\bkindly revert|do the needful|revert back|discuss about|your good name\b/i,
    hint: "I replaced common Indian office phrases with globally natural wording."
  },
  {
    pattern: /\bI am agree|didn't went|didn't understood|He don't|She don't|We was|They was|I has|He have|She have\b/i,
    hint: "I corrected grammar so the sentence sounds right and professional."
  },
  {
    pattern: /\bteh|recieve|seperate|definately|accomodate|comming|adress|enviroment|acheive|wich\b/i,
    hint: "I corrected spelling mistakes so your message looks polished."
  },
  {
    pattern: /\bI think maybe|I am not sure|if possible|just checking\b/i,
    hint: "I made the tone more confident so you sound professional."
  },
  {
    pattern: /^.{0,20}$/i,
    hint: "I made the sentence more complete, so your message is clearer."
  }
];

let previousIssueCount = null;
let recognition = null;
let listening = false;

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  chat.appendChild(node);
  chat.scrollTop = chat.scrollHeight;
}

function sentenceCase(input) {
  const cleaned = input.trim().replace(/\s+/g, " ");
  if (!cleaned) return cleaned;
  const fixPronoun = cleaned.replace(/\bi\b/g, "I");
  const cased = fixPronoun.charAt(0).toUpperCase() + fixPronoun.slice(1);
  return /[.!?]$/.test(cased) ? cased : `${cased}.`;
}

function normalizeForCompare(text) {
  return text
    .toLowerCase()
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function improve(raw) {
  let output = raw;
  let issueCount = 0;
  const notes = [];

  [...phraseReplacements, ...grammarReplacements, ...spellingReplacements].forEach(
    ({ pattern, replacement, note }) => {
      if (pattern.test(output)) {
        issueCount += 1;
        output = output.replace(pattern, replacement);
        if (note) notes.push(note);
      }
    }
  );

  // Fix repeated modal/auxiliary structures that sound awkward.
  const structuralFixes = [
    { pattern: /\bcan be able to\b/gi, replacement: "can", note: "Use either 'can' or 'be able to', not both." },
    { pattern: /\bwill be able to can\b/gi, replacement: "will be able to", note: "Use one modal structure only." },
    { pattern: /\bregarding to\b/gi, replacement: "regarding", note: "Use 'regarding', not 'regarding to'." },
    { pattern: /\binform to\b/gi, replacement: "inform", note: "Use 'inform someone', not 'inform to'." }
  ];

  structuralFixes.forEach(({ pattern, replacement, note }) => {
    if (pattern.test(output)) {
      issueCount += 1;
      output = output.replace(pattern, replacement);
      if (note) notes.push(note);
    }
  });

  output = output.replace(/\s{2,}/g, " ");
  output = sentenceCase(output);

  const uniqueNotes = [...new Set(notes)];
  const canBeSaidBetter = normalizeForCompare(raw) !== normalizeForCompare(output);
  return { improved: output, issueCount, notes: uniqueNotes, canBeSaidBetter };
}

function whyText(raw, issueCount, canBeSaidBetter) {
  const hint = issueHints.find((item) => item.pattern.test(raw));
  if (hint) return hint.hint;
  if (!canBeSaidBetter && issueCount === 0) {
    return "Your sentence is already clear and natural. No correction was needed.";
  }
  if (canBeSaidBetter && issueCount === 0) {
    return "Your sentence is clear, and I made a small wording improvement for a more polished tone.";
  }
  return "I improved clarity and flow so it sounds more natural at work.";
}

function coachReply(raw) {
  const { improved, issueCount, notes, canBeSaidBetter } = improve(raw);
  const progress =
    previousIssueCount !== null && issueCount < previousIssueCount
      ? "Good improvement from your previous line.\n"
      : "";
  previousIssueCount = issueCount;

  const mistakes =
    notes.length > 0
      ? `Mistakes I fixed:\n- ${notes.slice(0, 3).join("\n- ")}`
      : "Mistakes I fixed:\n- No major mistake. I only polished the wording.";
  const betterFeedback = canBeSaidBetter
    ? "Can this be said in a better way?\n- Yes. I improved it above."
    : "Can this be said in a better way?\n- Your original sentence is already good.";

  return [
    "Here’s a better way to say it:",
    `${progress}${improved}`,
    "",
    "Why this works better:",
    `${whyText(raw, issueCount, canBeSaidBetter)}\n${mistakes}\n${betterFeedback}`,
    "",
    "Your turn: say it again naturally.",
    "Now say the same idea in your own words."
  ].join("\n");
}

function submitUserText(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage("user", clean);
  addMessage("coach", coachReply(clean));
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.disabled = true;
    status.textContent = "Voice input is not available in this browser. Type your message instead.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    voiceBtn.textContent = "Listening...";
    status.textContent = "Speak now.";
  };

  recognition.onend = () => {
    listening = false;
    voiceBtn.textContent = "Speak";
    if (!status.textContent.includes("Captured")) {
      status.textContent = "Ready.";
    }
  };

  recognition.onerror = () => {
    status.textContent = "Could not capture voice. Please try again or type.";
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript || "";
    status.textContent = "Captured your voice. Coaching now.";
    submitUserText(text);
    userInput.value = "";
    userInput.focus();
  };
}

voiceBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (listening) {
    recognition.stop();
    return;
  }
  status.textContent = "";
  recognition.start();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitUserText(userInput.value);
  userInput.value = "";
  userInput.focus();
  status.textContent = "Ready.";
});

addMessage(
  "coach",
  [
    "Here’s a better way to say it:",
    "Share one sentence you use in office communication.",
    "",
    "Why this works better:",
    "We will practice your real lines so improvement feels natural.",
    "",
    "Your turn: say it again naturally.",
    "Type it or press Speak."
  ].join("\n")
);

setupVoice();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // App works without offline mode if registration fails.
    });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      status.textContent = "Use browser menu -> Add to Home Screen to install.";
      return;
    }

    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === "accepted") {
      status.textContent = "App installation started.";
    } else {
      status.textContent = "Install dismissed. You can continue using it here.";
    }
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });
}
