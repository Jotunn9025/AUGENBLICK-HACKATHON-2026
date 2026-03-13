const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Initial tasks data (from Tasks.md)
let tasks = [
  {
    id: 1,
    title: "Task 1 — Follow the Code: What Actually Happens When You Tokenize?",
    description: `Take this Sanskrit mantra:

\`\`\`
ॐ भूर्भुवः स्व: तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥
\`\`\`

Pick **one model** (BPE is a good choice), train it on a small corpus, and encode this string. Then trace **what actually happened** — from the moment you called \`encode()\` all the way to the final list of token IDs.

**What we're looking for:**
- Which files and classes were involved at each stage?
- What did the normalizer do to the string before the model saw it?
- What did the pre-tokenizer do after normalization?
- How did the model turn pre-tokens into subword pieces?
- How were those pieces turned back into a string during \`decode()\`?

You don't need to find every single line — the goal is a clear mental map of the pipeline from input string to output IDs.

*Hint: the pipeline has roughly 4 stages. Each stage has a dedicated module.*`,
    status: 'not-started', // not-started, in-progress, completed
    notes: ''
  },
  {
    id: 2,
    title: "Task 2 — Who Does What? Mapping Module Responsibilities",
    description: `The codebase is split into several distinct modules. Your task is to figure out which module is responsible for each of the following, and explain **why** that separation exists:

- Training a tokenizer (learning vocabulary from text)
- Using a trained tokenizer to encode new text
- Saving and loading a tokenizer to/from disk
- Measuring tokenizer quality (fertility, UNK rate, etc.)
- Comparing abctokz against external tokenizers like HuggingFace or SentencePiece

**What we're looking for:**
- A short mapping of "responsibility → file/module"
- One example of a module boundary that you think is **especially clean** — why is it satisfying?
- One example where the boundary feels **blurry or inconsistent** — what would you do about it?

*Tip: look at the import structure. What does each module import from? What does it avoid importing?*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 3,
    title: "Task 3 — The National Anthem Test",
    description: `Take the **Indian national anthem** (Jana Gana Mana, first stanza) in two forms:

- English transliteration: *"Jana Gana Mana Adhinayaka Jaya He Bharata Bhagya Vidhata Punjab Sindhu..."*
- Devanagari: *"जन गण मन अधिनायक जय हे भारत भाग्य विधाता पंजाब सिंधु..."*

Train a tokenizer and encode both versions. Count the tokens.

**What we're looking for:**
- Token counts for both scripts
- The **fertility score** for both (tokens ÷ words)
- A clear explanation of *why* the numbers differ — is it the script, the vocabulary, the training data, or something else?
- **Bonus:** Run the same text through a well-known external tokenizer (e.g., GPT-4's tokenizer via the \`tiktoken\` library). How does it compare? What does the difference reveal?

*Fertility is defined in \`src/abctokz/eval/metrics.py\`. Read it — it's short.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 4,
    title: "Task 4 — How Does a Config Become a Tokenizer?",
    description: `The library uses Pydantic config objects to define every aspect of a tokenizer. Trace what happens between writing a config and having a working, trained tokenizer object.

**What we're looking for:**
- Where do default values come from?
- Where does validation happen, and what kinds of invalid configs are caught?
- Walk through the construction step by step: config → normalizer → pre-tokenizer → model → trained tokenizer
- Demonstrate at least **two failure modes** by writing configs that should fail and showing the error

*Try: mismatched model and trainer types, or an invalid vocab_size. What error do you get? Is the message helpful?*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 5,
    title: "Task 5 — Is It Truly Deterministic?",
    description: `The codebase claims to produce deterministic output: train the same tokenizer twice on the same corpus with the same config, and you get identical results.

Verify this claim **experimentally**. Don't just take the documentation's word for it.

**What we're looking for:**
- Which parts are deterministic? Which parts are *not* (and why is that acceptable)?
- A concrete experiment: train the same model twice, encode the same text, compare the output
- What are the remaining risks — scenarios where the output *could* legitimately differ?

*Think beyond just "are the token IDs the same". What about vocabulary ordering? Merge rule order? Benchmark timing?*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 6,
    title: "Task 6 — Making the Tokenizer Say \"I Don't Know\"",
    description: `Find inputs that cause the tokenizer to produce \`<unk>\` (unknown token) in at least one model. Then explain *why*.

**What we're looking for:**
- At least **two different causes** of \`<unk>\` across different models or situations
- For each case: what specifically triggered the fallback? Was it the normalizer, the pre-tokenizer, the training corpus, or a fundamental limit of the model type?
- Which model family handles unknown inputs most gracefully? Which is most fragile?
- One concrete suggestion to reduce UNK rate without retraining

*Try Devanagari on an English-only trained model. Try emoji. Try rare words. Observe the differences.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 7,
    title: "Task 7 — Does Encode → Decode Get You Back to Start?",
    description: `A tokenizer should ideally be lossless: encode text, decode it, and you get back exactly what you started with.

Test this across several multilingual examples.

**What we're looking for:**
- One case where the round-trip is **exact** — you get back the original string
- One case where the round-trip is **lossy or different** — explain precisely what changed and why
- Is the lossy case a bug, an acceptable trade-off, or intentional design?
- What does the \`round_trip_success_rate\` metric in \`eval/metrics.py\` actually measure — and what does it *not* measure?

*Tip: test with text in NFD Unicode form (decomposed) vs NFC form (composed). They look identical on screen.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 8,
    title: "Task 8 — What Does the Normalizer Actually Do?",
    description: `For these two Devanagari phrases, show precisely how the normalizer transforms the text before the model ever sees it:

**(i)** \`"आयो लाल, सभई चायो, झूलेलाल!"\` — a Sindhi folk phrase
**(ii)** \`"गणपती बप्पा मोरया, पुढच्या वर्षी लवकर या!"\` — a Marathi Ganesh festival chant

**What we're looking for:**
- The raw input vs the normalized output — are they identical? If not, what changed?
- What is the difference between NFC and NFKC normalization, and which does this library use for Devanagari? Why does that choice matter?
- What happens to the commas, exclamation mark, and spaces? Where do they end up after pre-tokenization?
- Why does this matter specifically for Hindi, Marathi, and Sindhi? (Think about ZWJ, ZWNJ, conjunct consonants.)

*The normalizer code is in \`src/abctokz/normalizers/\`. It's short. Read it.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 9,
    title: "Task 9 — Measuring Phrase Difficulty",
    description: `Using the same two phrases from Task 8, train a tokenizer on a Devanagari-rich corpus and measure the **fertility** of each phrase.

**What we're looking for:**
- Fertility score for each phrase (try both BPE and Unigram)
- Which phrase is harder to tokenize efficiently, and why?
- Does the fertility change meaningfully as you vary the vocabulary size (e.g., 100 vs 400 vs 800)? What does that tell you?

*This builds directly on Task 8 — you're now putting numbers on the observations you made there.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 10,
    title: "Task 10 — The Compression Trade-off",
    description: `Tokenizer "compression" means producing fewer tokens for the same text — lower fertility. Intuitively, that seems better. But is it always?

Find a configuration change that **improves one metric while making another worse**.

**What we're looking for:**
- What configuration did you change? (e.g., vocabulary size, minimum frequency, model type)
- What improved? What got worse?
- Is there a true trade-off here, or does one configuration just dominate the other?
- Would you make this change in a production system? Why or why not?

*There's no single right answer. The point is to find the tension and articulate it.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 11,
    title: "Task 11 — Can You Trust the Benchmark Numbers?",
    description: `Run the same benchmark twice on the same tokenizer and corpus. Compare the outputs.

**What we're looking for:**
- Which metrics are **perfectly stable** between runs? (Hint: some always will be.)
- Which metrics **vary** between runs, and why is that acceptable?
- Is there anything in the benchmark results you would *not* trust, even after running it many times?
- What would you change about the benchmark to make it more trustworthy?

*Look at \`src/abctokz/eval/benchmark.py\`. There's a subtle design choice in how it collects metrics across multiple timed runs. Is it the right choice?*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 12,
    title: "Task 12 — Where the Design Lies to You",
    description: `Find one place in the codebase where the **architecture looks clean and promises one thing**, but the **code actually does something subtly different**.

This isn't asking you to find an obvious bug (though there is one). It's asking you to find a gap between intent and reality.

**What we're looking for:**
- What was the intended design or abstraction?
- What does the code actually do?
- How would you demonstrate this difference with a concrete example?
- How serious is it? And what's the minimal fix?

*Start with \`tokenizer.py\` and read the \`decode()\` method carefully.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 13,
    title: "Task 13 — Predict, Then Verify",
    description: `Choose one small change to the normalization or pre-tokenization config (don't implement it yet — just choose it). Write down your predictions:

- Which tests would fail?
- Which metrics would change, and in which direction?
- Which parts of the codebase would be unaffected?

Then make the change and see how well your predictions held up.

**What we're looking for:**
- Your prediction, written before you run anything
- The actual result after making the change
- What surprised you? What did the outcome reveal about the codebase?

*A prediction that turns out to be wrong is not a bad answer — it's often the most interesting one.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 14,
    title: "Task 14 — How Hard Would It Be to Add a Fourth Model?",
    description: `The library has three model families: WordLevel, BPE, and Unigram. Imagine you wanted to add a fourth — say, **WordPiece** (used by BERT), a character n-gram model, or anything else.

Don't implement it. Just figure out what you *would* need to do.

**What we're looking for:**
- Which files would you need to create from scratch?
- Which files would you need to modify?
- Which files could you leave completely untouched?
- Where does the architecture make extension easy? Where does it get in the way?
- What's the single biggest obstacle you'd face?

*Read the base classes in \`src/abctokz/models/base.py\` and \`src/abctokz/trainers/base.py\`.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 15,
    title: "Task 15 — Find Something That Breaks",
    description: `Find an edge case where the library behaves in a way that feels wrong, surprising, or inconsistent. Reproduce it reliably.

Once you've found it, classify it:
- Is this a **bug** (incorrect behavior that violates the contract)?
- A **missing feature** (something reasonable that just isn't supported yet)?
- A **documentation gap** (the behavior is correct but undocumented)?
- Or an **acceptable limitation** (fine as-is, given the scope of the library)?

**What we're looking for:**
- Clear reproduction steps
- What you observed vs what you expected
- Your classification and reasoning
- A minimal fix or workaround, if one exists

*Try edge cases: empty strings, whitespace-only input, very long input, emoji, mixed scripts, punctuation-only text.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 16,
    title: "Task 16 — Is This Ready for Production?",
    description: `Imagine you had to deploy \`abctokz\` in a real system — say, as the tokenizer for a text preprocessing pipeline handling millions of Hindi and English documents per day.

Give an honest audit.

**What we're looking for:**
- Three specific reasons you'd feel **confident** deploying it
- Three specific reasons you'd be **hesitant** — concrete gaps, not vague concerns
- For each reason, cite the evidence (point to a file, a test, or a missing feature)
- If you had to rank the gaps by urgency, what's the most important thing to fix first?`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 17,
    title: "Task 17 — Make One Small Improvement",
    description: `Find one thing in the codebase that is clearly worth fixing, and fix it. It should be small enough to describe in a sentence, but meaningful enough to matter.

Good candidates: a misleading error message, a missing input validation, a Unicode edge case, a gap in the benchmark metrics, or a behavior that contradicts its own documentation.

**What we're looking for:**
- A clear description of the problem
- The actual code change (show a diff or the before/after) or provide link to a PR request
- Why this is the right fix — and why it's minimal enough to do safely
- Evidence that the fix works (a test, a before/after output, or a failing case that now passes)

*You don't need to add tests or refactor anything. The goal is one focused, correct improvement.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 18,
    title: "Task 18 — Why This Change and Not a Bigger One?",
    description: `Following on from Task 17: justify your choice.

It's tempting to "fix" a small issue by refactoring the surrounding code. Why didn't you? (Or if you did — why was that justified?)

**What we're looking for:**
- How localized is your change? (Which files does it touch, and which does it leave alone?)
- What's the risk of your change? Could it break something?
- What's the expected impact — who benefits and how?
- Is there a bigger refactor that would be *better* in principle but *wrong* to do here?

*Engineering is about tradeoffs. "I kept the change small because..." is a complete and valid answer.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 19,
    title: "Task 19 — BPE vs Unigram vs WordLevel: What's Actually Different?",
    description: `Train all three model families on **identical** corpora and vocabulary sizes. Then encode the same set of sentences with each.

**What we're looking for:**
- Side-by-side tokenization output for at least 5 different inputs (easy English, complex English, simple Hindi, complex Hindi, mixed script)
- What kinds of tokens dominate each model's vocabulary? (Characters? Subwords? Whole words?)
- Which model would you choose for: (a) a low-resource language, (b) an agglutinative language like Hindi or Finnish, (c) a task where you need consistent token boundaries across languages?
- What does each model's segmentation strategy reveal about its assumptions?

*The goal is not just to describe the models — it's to develop intuition for when each one is the right tool.*`,
    status: 'not-started',
    notes: ''
  },
  {
    id: 20,
    title: "Task 20 — Explain Tokenization to Someone Who Doesn't Know",
    description: `You've explored how this library works from the inside. Now explain tokenization to someone with a general tech background but no NLP knowledge — in under 300 words.

Your explanation should:
- Make clear why tokenization is a non-trivial problem (it's not just \`text.split()\`)
- Capture what makes multilingual tokenization especially interesting or difficult
- Use at least one concrete example — feel free to use anything you discovered while working through the other tasks

There's no code in this answer. The best response is one that would make someone genuinely curious to learn more.`,
    status: 'not-started',
    notes: ''
  }
];

// Store tasks in memory (in production, use a database)
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current tasks to new user
  socket.emit('loadTasks', tasks);

  // Handle task updates
  socket.on('updateTask', (updatedTask) => {
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      // Broadcast to all other clients
      socket.broadcast.emit('taskUpdated', updatedTask);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});