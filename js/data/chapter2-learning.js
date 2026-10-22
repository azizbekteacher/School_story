window.G = window.G || {};
G.data = G.data || {};

// ============================================================================
// chapter2-learning.js — the teaching payload for "Birinchi dars: 5-B".
//
// Eight principles, one for each turn of the lesson. Written the way Chapter 1
// is written: English for the analysis, because that is the register a maths
// teacher reads Guidara in, and the register the debrief panels are laid out for.
//
// PROVENANCE — every principle cites a real chapter of the real book:
//   C2-001 before the bell / the arrival   Ch. 1 (the hospitality economy)
//   C2-002 names                           Ch. 1 (the maître d' who confirmed
//                                          the reservation himself so he could
//                                          say "Good evening, Ms. Sun")
//   C2-003 somebody's job is to notice      Ch. 18 (the Dreamweaver, the $2 hot dog)
//   C2-004 one size fits one               Ch. 16 (earning informality), Ch. 3
//   C2-005 specific beats generic          Ch. 18, Ch. 17 (customisation)
//   C2-006 the gesture nobody asked for    Ch. 18, Ch. 5 (95/5)
//   C2-007 the last minute                 Ch. 17 (the closing exchange)
//   C2-008 the enemy is "reasonable"       Ch. 4-5 (reasonable is the enemy)
//
// TWO THINGS NOT TO GET WRONG (they have been wrong in this repo before):
//   1. "Service is black and white, hospitality is colour" is a distillation
//      of the book's thesis, not a verbatim Guidara sentence. It is this
//      project's theme line — fine — but do not attribute it as a quotation.
//   2. The sled / granola / umbrella / birthday-cake stories that circulate
//      online are not all in this book, and the birthday cake appears only
//      negatively. Teach the four verified stories: the hot dog, the
//      Dreamweaver role, earning informality, and 95/5.
//
// DESIGN RULE: every principle must be doable by one teacher, in one classroom,
// without money, on a Monday. Anything needing a budget, a colleague's
// permission or a whole term belongs in `difficulties`, not in `principles`.
// ============================================================================

G.data.chapter2Learning = {

  // --------------------------------------------------------------------------
  // 1. PRINCIPLES
  // --------------------------------------------------------------------------
  principles: {

    "C2-001": {
      id: "C2-001",
      name: "The verdict is reached before you speak",
      source: "Unreasonable Hospitality, Ch. 1 — the hospitality economy; the arrival",
      gist: "You do not get to announce who you are. Fourteen children assemble you out of what they can see before your first sentence: whether you were in the corridor, whether you were facing them or the board, whether your hands were holding a register or nothing. The first impression is not a speech you give; it is a verdict they reach. Your only leverage is the two minutes before the bell.",
      atSulton: [
        "Being at the door when 5-B arrives is the same move as being at the door when a guest arrives: it says you were expecting them, not interrupted by them.",
        "Standing at the board with your back turned for the first forty seconds hands the room a story you did not choose: 'he came to write, not to meet us.'",
        "The register in the crook of your arm instead of open in your hands is not a detail. It says you came for the people, and the paperwork is waiting."
      ],
      spotIt: [
        "If a pupil smiles at you as you come in, the verdict is already being written, and in your favour.",
        "If the room is silent after your first sentence, that is not respect yet — it is waiting. They have not finished reading you.",
        "If somebody speaks first — even to joke — that is trust, and it is worth more than a tidy opening."
      ]
    },

    "C2-002": {
      id: "C2-002",
      name: "A name is the smallest unit of hospitality",
      source: "Unreasonable Hospitality, Ch. 1 — the maître d' who confirmed the reservation himself so he could greet the guest by name",
      gist: "A name costs nothing and does everything. A person hearing their own name has, for one second, the proof that they are in the room. But a name used wrongly takes the kindness back: a mispronounced or forgotten name makes someone invisible. So the work is not memorising names. It is getting them right, out loud, in front of others.",
      atSulton: [
        "Learn six names a day, not fourteen a week. Six fit in your head over three days; fourteen do not fit at all, and a half-learned list is worse than no list.",
        "Write the name down with one fact beside it: 'Dilnoza — likes to explain.' Name plus fact equals a person. Name alone equals a register.",
        "If you get one wrong, correct it immediately and without ceremony: 'Kechirasiz — Dilorom.' Not correcting it is what makes it an insult."
      ],
      spotIt: [
        "When a pupil calls you by your name, that is the trust returning. They have made you a person too.",
        "When a pupil corrects their own name for you, the name matters to them — and you have just been told so.",
        "When one pupil tells you another's name, they have decided you belong to the class."
      ]
    },

    "C2-003": {
      id: "C2-003",
      name: "Somebody's job is to notice",
      source: "Unreasonable Hospitality, Ch. 18 — the Dreamweaver, a role whose only purpose was to notice, and the $2 street hot dog served as a gift",
      gist: "Guidara invented a position whose entire job was to watch the room and turn something small into a gift. The point was never the budget: a two-dollar hot dog from a street cart, plated and presented, became the most-remembered course of the night. In a classroom you hold that job yourself. Nobody will ever ask you to notice, and noticing is the cheapest instrument you own.",
      atSulton: [
        "Write three things down in a lesson: who arrived first, who spoke to nobody, who hid something. Tomorrow, use one of them.",
        "Run one 'hot dog' a week: a notebook, a written note, a chair moved. Small, cheap — and specific to one child.",
        "Ask yourself the same question at the end of every lesson: 'Who did I not see today?' The unseen pupil is the loudest data in the room."
      ],
      spotIt: [
        "A pupil who comes up to you and leaves without asking for anything is looking for attention but has not found the courage to ask.",
        "A pupil who packs up slowly after the bell is waiting for a sentence from you, not a favour.",
        "A pupil showing you their own work unprompted is offering the largest gift available in a classroom. Do not spend it on a correction."
      ]
    },

    "C2-004": {
      id: "C2-004",
      name: "One size fits one",
      source: "Unreasonable Hospitality, Ch. 16 — earning informality; Ch. 3 — enlightened hospitality is not one recipe",
      gist: "Serve the person in front of you, not the average of the room. Guidara's rule is to be formal first and then earn the informality by reading the guest. The same applies here: forcing the quiet pupil to speak aloud makes them quieter. Choosing how to address each child is not favouritism. It is attention.",
      atSulton: [
        "Do not call on a quiet pupil in front of the class. Go and stand beside them and ask quietly: 'Can you tell me?' Once they answer safely, they will answer in the room.",
        "Do not fight the loud, funny pupil for the rule. Hand them the rule: 'You tell the class why we take turns.' A rule a pupil authors is a rule a pupil keeps.",
        "Start formal — names, agreement, order — and then spend your first joke or first personal sentence to relax it. The order matters: frame first, warmth second."
      ],
      spotIt: [
        "A pupil who only talks to their neighbour is not silent. They are talking, and they need a safe channel.",
        "A pupil who jokes and then goes quiet fast has run a test and got an answer.",
        "A pupil explaining something to another pupil is showing a teaching instinct. Name it and it becomes a role."
      ]
    },

    "C2-005": {
      id: "C2-005",
      name: "Specific beats generic",
      source: "Unreasonable Hospitality, Ch. 18 — the guest remembers the specific gesture, not the correct one; Ch. 17 — customisation over standard",
      gist: "'Well done' is not praise. It is a habit, addressed to nobody, and it is forgotten within a minute. Specific praise is a gift: it can only belong to one person, which is exactly what makes it expensive. Guidara's test is not what the gesture cost you but what it made the other person feel. All it costs here is one hour of watching.",
      atSulton: [
        "Write the praise down before you say it: 'Jasur raised his hand first today.' Then say it with the evidence in it — 'first today' — so it is not your opinion but a fact.",
        "Three specific compliments a day, each to a different pupil. Three is not many; sustained, it is twenty-one pupils in a week.",
        "Praise the action, never the aptitude: 'you solved it a different way today' instead of 'you are a good student.'"
      ],
      spotIt: [
        "After generic praise a pupil looks away. They have worked out that the sentence was not about them.",
        "After specific praise the same pupil does the thing again. That is the receipt.",
        "If a pupil glances at a neighbour after being praised, they heard a comparison. Say the next one privately."
      ]
    },

    "C2-006": {
      id: "C2-006",
      name: "The gesture nobody asked for",
      source: "Unreasonable Hospitality, Ch. 18 — the hot dog systemised; Ch. 5 — 'manage 95% down to the penny and the other 5% foolishly'",
      gist: "Guidara runs the business to the penny for 95% of the budget and then spends the other 5% deliberately, unreasonably, on things no spreadsheet would justify. That 5% is what people remember. In a classroom the currency is not money but time and attention: a notebook, a written note, ten minutes in the canteen. What matters is that the gesture is repeatable and specific — a small thing every week beats one large thing once.",
      atSulton: [
        "Pick one repeatable ritual and never skip it: greet every pupil by name at the door every Monday. A repeated small thing outperforms a one-off big one.",
        "Make naming a habit: when a pupil invents a method, put their name on it and leave it on the board. It costs nothing and lasts for years.",
        "Decide the gesture in advance, not in the moment. One line in your notebook: 'this week, who and what.'"
      ],
      spotIt: [
        "A pupil repeating a small thing you once said about them means the gesture landed.",
        "A pupil asking 'will it be like this tomorrow?' wants the ritual repeated — which means the ritual is working.",
        "A pupil you gave something to sits differently the next lesson. That is the 5% paying back."
      ]
    },

    "C2-007": {
      id: "C2-007",
      name: "The last minute is the impression they keep",
      source: "Unreasonable Hospitality, Ch. 17 — the closing exchange is weighted more heavily than the middle of the service",
      gist: "Guidara keeps returning to one asymmetry: the end of a service matters more than the beginning. What a guest hears and sees on the way out is the only part they carry. A stumble at the end can undo three good hours, and a single gracious gesture at the end can undo the stumble. In a lesson, that minute is the bell.",
      atSulton: [
        "Finish the way you started: stand at the door and say goodbye to each of them. Close the frame you opened.",
        "Do not wipe the most important thing off the board. Tomorrow they come back to look at it.",
        "Never end with 'we will continue tomorrow.' Say exactly what continues: 'tomorrow, the second half of this problem.' Precision is the promise."
      ],
      spotIt: [
        "A pupil looking back on the way out has not finished leaving. The last minute worked.",
        "A pupil saying 'rahmat' at the door is rare, and it is about your ending, not your lesson.",
        "If you wipe the board and nobody mentions it the next day, the last minute was spent on the wrong thing."
      ]
    },

    "C2-008": {
      id: "C2-008",
      name: "The enemy is 'reasonable'",
      source: "Unreasonable Hospitality, Ch. 4-5 — reasonable is the enemy; competence is not the goal",
      gist: "The hardest idea in the book: the enemy of hospitality is not bad service, it is reasonable service. A lesson that is correct, orderly and offends nobody is service — and it is not hospitality. You can show your credentials, solve the problem beautifully and keep perfect order, and be a good teacher, and still have not one child in that room feel seen. Reasonable does not mean bad. Reasonable means stopping.",
      atSulton: [
        "After every lesson ask one question: 'What did I do today that nobody asked for?' If the answer is 'nothing', the lesson was fine and forgettable.",
        "Count the minutes you spent being a good teacher — the elegant solution, the clear explanation. Then move 5% of those minutes to something no syllabus justifies: writing one child's name on the board.",
        "Do not compare yourself to colleagues who are reasonable. They are allowed to be; it is a legitimate way to teach. Your job this year is different: one lesson, one child who felt seen."
      ],
      spotIt: [
        "The lesson went well, nobody complained, and you are tired and flat. That is the signature of a reasonable lesson.",
        "A pupil asked you a question at the end. You crossed the line out of reasonable and into the 5%.",
        "If the room is calm and nobody comes near you afterwards, you probably served them and did not host them."
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 2. INTEL — every fact the script can grant needs a label here.
  // --------------------------------------------------------------------------
  intel: {
    intel_dilnoza_explains: {
      label: "Dilnoza likes to explain — she will teach a problem she has not solved herself yet",
      usedFor: "Specific praise for Dilnoza; naming her strength out loud"
    },
    intel_timur_bread: {
      label: "Timur eats bread alone in the morning — he arrives early for the canteen",
      usedFor: "Offering to go to the canteen with him; not putting him in a group"
    },
    intel_bekzod_new: {
      label: "Bekzod arrived from another school three weeks ago — no notebook, only a torn sheet",
      usedFor: "The notebook and the attention; seeing his 'new boy' position"
    },
    intel_jasur_joke: {
      label: "Jasur is the loudest voice, but he does not write the verdict — the ones who laugh look to him",
      usedFor: "Not punishing Jasur; recruiting him into the agreement"
    },
    intel_named_two: {
      label: "You used two names at the door: Dilnoza and Bekzod",
      usedFor: "Tying the first impression to a name"
    },
    intel_names_method: {
      label: "Names are not memorised but used correctly — each pupil gave one fact about themselves",
      usedFor: "The method for learning names; tomorrow's preparation"
    },
    intel_bekzod_way: {
      label: "Bekzod solves problems a different way — his own method, and it comes out right",
      usedFor: "Putting 'Bekzod usuli' on the board; earning his trust"
    },
    intel_rule_reason: {
      label: "The reason for the agreement: one voice at a time, because thirty minutes must be shared",
      usedFor: "Anchoring the agreement in the pupils' own words"
    },
    intel_madrasa: {
      label: "In the madrasa the teacher knew every name from the first day — no desks, everyone on the floor",
      usedFor: "Redirecting the credential story; connecting your own history to the lesson"
    },
    intel_compliment: {
      label: "Specific praise: who, what, when — not a general 'well done'",
      usedFor: "Compliments delivered during the lesson; repeating them tomorrow"
    },
    intel_bekzod_named: {
      label: "'Bekzod usuli' is written on the board — the class has a method named after one of them",
      usedFor: "Not wiping the board at the end; naming others too"
    },
    intel_zarina_leader: {
      label: "Zarina manages the class — she even stops Jasur. She writes verdicts",
      usedFor: "Naming Zarina's strength; making her an ally"
    },
    intel_zarina_leads: {
      label: "Zarina watched you and asked 'why didn't you talk to Jasur?'",
      usedFor: "An honest conversation with Zarina; recognising the room's real leader"
    },
    intel_jasur_leader: {
      label: "Jasur authored the agreement in his own words — 'if everyone talks, nobody hears'",
      usedFor: "Giving the agreement back to him; not punishing him"
    },
    intel_nafisa_quiet: {
      label: "Nafisa knows the answer but will not say it aloud — she whispers to her neighbour",
      usedFor: "A safe channel for Nafisa: alone, quiet voice"
    },
    intel_bekzod_tomorrow: {
      label: "Bekzod agreed to show another method tomorrow",
      usedFor: "Planning tomorrow's lesson; making him a pupil with a reason to return"
    },
    intel_timur_alone: {
      label: "Timur asked 'together?' — the first time he has been offered anything",
      usedFor: "Starting the morning-bread habit"
    }
  },

  // --------------------------------------------------------------------------
  // 3. CHOICE NOTES — one per option id and per minigame choice id.
  // --------------------------------------------------------------------------
  choiceNotes: {

    // --- before the bell: the two minutes of intel --------------------------
    CH2_Q_DILNOZA: {
      principle: "C2-003",
      verdict: "good",
      title: "You asked before you performed",
      why: "Two minutes of asking bought you the most useful fact in the room: Dilnoza explains things she has not solved herself, which means she teaches without being asked. Guidara's Dreamweaver exists to notice exactly this. You used the corridor as intelligence, not as waiting.",
      cost: "Twenty seconds.",
      alternative: "If you have no time to ask, watch instead: who is being listened to without being loud is the same information."
    },
    CH2_Q_TIMUR: {
      principle: "C2-003",
      verdict: "good",
      title: "The pupil eating alone",
      why: "He told you he comes early to eat alone — a small fact with a large door behind it. That is the whole point of noticing: not that you learned about bread, but that you now know which pupil spends the morning unaccompanied. Use it, and he learns that being seen is not dangerous.",
      cost: "One question.",
      alternative: "If you had asked something more 'useful' instead, you would have had less than this."
    },
    CH2_Q_BEKZOD: {
      principle: "C2-003",
      verdict: "good",
      title: "You went to the one standing apart",
      why: "Every room has someone at the edge, and every teacher sees them and moves on. You crossed the space. He answered looking at his hands, with a torn sheet and neat writing — that is the profile of a pupil who will not ask for help and will remember who offered.",
      cost: "Thirty seconds and a walk.",
      alternative: "A pupil at the edge can also be there on purpose. Watch first whether they accept your approach before deciding."
    },
    CH2_Q_LISTEN: {
      principle: "C2-001",
      verdict: "ok",
      title: "Listening is intelligence, but it was passive",
      why: "You learned that Jasur is the loudest voice and that the ones who laugh look to him — which is real and useful. But listening told you about the loudest pupil, and the first lesson's problem is usually the quietest. Sound is easier to gather than silence.",
      cost: "One of your two minutes went to the pupil who needs it least.",
      alternative: "Listen, then spend the second minute on whoever did not speak at all."
    },

    // --- the door -----------------------------------------------------------
    CH2_DR_1: {
      principle: "C2-002",
      verdict: "good",
      title: "Two names and one promise",
      why: "You used two names and then said the honest thing to the other twelve: 'I don't know your names yet, I will by today.' The pupils who heard their names felt seen; the promise gave the rest a reason to expect something. A promise made on day one is still small enough to keep.",
      cost: "Nothing. The sentence costs one second.",
      alternative: "If you know no names yet, keep the shape: 'I don't know your names yet — I will by the end of today. Who wants to go first?'"
    },
    CH2_DR_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "Correct, orderly, and addressed to nobody",
      why: "'Good morning, 5-B, sit down, open your notebooks' is the cleanest form of service. Nobody is offended. But fourteen children heard the same sentence, which means not one of them was addressed. That is reasonable — and reasonable is the thing the book is arguing against.",
      cost: "You spent the first impression on administration. It can be recovered in the lesson, but not undone.",
      alternative: "Keep the sentence and add one name to the end of it: '...Bekzod, you were first in today.' One name changes the whole sentence."
    },
    CH2_DR_3: {
      principle: "C2-001",
      verdict: "ok",
      title: "Silence is also a sentence",
      why: "Holding the door is itself a gesture. But you did not choose what the silence said, so the room chose for you — generous, or nervous. You had the leverage and did not use it.",
      cost: "The room wrote the first impression by itself. You were not in control of it.",
      alternative: "Hold the door and add four words: 'Come in. I'm expecting you.'"
    },

    // --- names --------------------------------------------------------------
    CH2_NM_1: {
      principle: "C2-002",
      verdict: "good",
      title: "Not memory — responsibility",
      why: "Dilnoza asked a technical question and you answered a moral one: names are not about recall, they are about using them correctly. And the offer — 'one fact I can hold on to' — turned you from a performer into a listener. They introduced themselves; you wrote. The lesson did not stop, it continued in a different direction.",
      cost: "10-15 seconds per pupil, so three minutes for the class. That is the cheapest three minutes in the lesson.",
      alternative: "If time is short, take just the names now and collect the facts by watching during the lesson."
    },
    CH2_NM_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "The sentence was about you",
      why: "'I can memorise thirty names in a day' may even be true, and it is still useless here: Dilnoza asked for trust, not for technique. And you made yourself a promise in public. Now they are waiting for it.",
      cost: "Waiting is the most expensive form of a promise. If you do not deliver, the first impression reverses.",
      alternative: "If you say it at all, hand it to somebody else: 'I can memorise them, but one teacher taught me to — she knew every name on day one.'"
    },
    CH2_NM_3: {
      principle: "C2-008",
      verdict: "ok",
      title: "Honest, and it stopped",
      why: "'I can't learn them all today, but I'll learn six' is honest, and honesty is always worth something. But 'I know' is a target and 'I want to know' is a movement. Pupils see the movement, not the target.",
      cost: "The class is still waiting. A target was announced; nothing moved.",
      alternative: "Add the movement to the same sentence: '...so we start now. Who's first?'"
    },

    // --- the agreement ------------------------------------------------------
    CH2_RL_1: {
      principle: "C2-004",
      verdict: "good",
      title: "One rule and its reason",
      why: "Fourteen rules is service; one rule plus its reason is colour. And the strongest part is the handover — 'you tell me why' — because Jasur said it himself, in his own words, out loud to the room. The rule stopped being yours. That is why it will hold when you are not in the room.",
      cost: "You give away part of the authority, on day one, which feels reckless. It is the most durable foundation available.",
      alternative: "If there is no time, give the reason yourself — but still keep it to one rule."
    },
    CH2_RL_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "The wall keeps the rule and loses the reason",
      why: "'The rules are on the wall' is correct and it works. They will follow the rule even when you are not there — out of fear rather than out of respect. Fear functions. It also turns the lesson into homework.",
      cost: "Order without contact. Nobody asks you a question.",
      alternative: "Read the wall rule aloud, then pick one: 'Why do you think this one exists?'"
    },
    CH2_RL_3: {
      principle: "C2-004",
      verdict: "ok",
      title: "Warm, and unbounded",
      why: "'Don't upset each other' is a good intention and a genuinely warm sentence. The problem is that every pupil draws the boundary differently. Warmth is right on day one — but warmth without a boundary becomes disorder, and you lose the lesson that same hour.",
      cost: "You will have to install order later, and at that point it will read as coldness.",
      alternative: "Add one precise edge to the warm sentence: '...and if someone does upset you, tell me.'"
    },

    // --- the credential -----------------------------------------------------
    CH2_TK_1: {
      principle: "C2-001",
      verdict: "good",
      title: "A credential cannot answer the question that is actually open",
      why: "The credential is service: it proves your competence. What is needed on the first day is not competence but trust. Thirty seconds spent proving yourself are thirty seconds taken out of the room. And not solving the problem yourself is the harder half — the easiest thing available was to walk up and be brilliant.",
      cost: "They do not know how good you are at maths. Some of them wanted to.",
      alternative: "Do not hide it forever — drop it once, casually, at the end of the lesson, after they know you."
    },
    CH2_TK_2: {
      principle: "C2-003",
      verdict: "good",
      title: "You showed the credential and redirected it",
      why: "The hardest option, and the best. You did not hide yourself — and then you changed the address: 'this gave me nothing; one teacher gave me something, and she knew every name on day one.' The class did not hear 'how strong is he.' They heard 'who does he look at.'",
      cost: "None. The sentence does not diminish you; it makes you a person.",
      alternative: "If you would rather not mention the olympiad, keep the same shape with another origin: 'when I chose this job, one teacher was the reason.'"
    },
    CH2_TK_3: {
      principle: "C2-008",
      verdict: "weak",
      title: "You solved it; they watched",
      why: "Nobody is saying you cannot solve it — you solved it beautifully. The problem is that after a problem solved by you on the board, the class has done nothing and feels nothing. Spectating is good service and poor teaching.",
      cost: "The room respects you and stays passive. Tomorrow they wait for you again.",
      alternative: "If you start solving it, stop halfway: 'Who can finish it?'"
    },

    // --- the gift -----------------------------------------------------------
    CH2_GF_1: {
      principle: "C2-006",
      verdict: "ok",
      title: "The right thing, but only the need",
      why: "He needed a notebook and you gave him one. That is good. But he received paper from you, not attention — and on the first day the difference is large. Paper can be bought; 'I saw you' cannot.",
      cost: "He thinks you are kind and will not remember the day.",
      alternative: "Give the notebook and add one sentence: 'Bekzod, you showed me your own method today. We continue tomorrow.'"
    },
    CH2_GF_2: {
      principle: "C2-006",
      verdict: "good",
      title: "Bekzod usuli",
      why: "This is the hot dog. The cost is one notebook; the effect lasts a year. Guidara took a two-dollar street hot dog, plated it, and made it the most-remembered course of the night — because it was specific to that guest. You took Bekzod's method, gave it his name, and put it in front of the class. He is no longer 'the new boy': the room now contains one thing named after him.",
      cost: "One notebook and one piece of chalk. That is all.",
      alternative: "With no notebook it still works: write the method on a sheet, stick it to the board, put his name on it. The name and the board are the mechanism."
    },
    CH2_GF_3: {
      principle: "C2-007",
      verdict: "weak",
      title: "'Later' is the promise that does not get kept",
      why: "'Later' is the most-said and least-kept sentence in a first lesson. This boy has been waiting three weeks already. Another 'later' tells him nothing, however sincerely you mean it.",
      cost: "He waits one more day — and this time he may stop waiting.",
      alternative: "If you have no time, give an exact time: 'Five minutes after the bell. Will you wait?'"
    },

    // --- the last ten minutes ------------------------------------------------
    CH2_WZ_1: {
      principle: "C2-005",
      verdict: "good",
      title: "Precise evidence: 'twice'",
      why: "A precise sentence with evidence in it: 'twice today.' She heard a description of something she did, not a title. Telling the pupil who runs the room that she is a good student means nothing — she already knows. She needed a different role, and you named it.",
      cost: "Nothing. Two sentences.",
      alternative: "Pupils like this often see themselves as enforcers. Say: 'You manage this room. I need that. Let's do it together.'"
    },
    CH2_WZ_2: {
      principle: "C2-005",
      verdict: "weak",
      title: "A title, not a gift",
      why: "'You are a very good student' is something she hears every day. Generic praise is a bonus, not a gift. And she had not asked you a question — she was looking for an answer. You gave her a label instead.",
      cost: "She tested you and you did not pass. She will remember that.",
      alternative: "Convert the label into an observation: 'You stopped the class twice today. I saw it.'"
    },
    CH2_WZ_3: {
      principle: "C2-003",
      verdict: "good",
      title: "You gave her question back",
      why: "'What did you see?' is a brave move: handing authority to a twelve-year-old an hour into your first day. It treats her not as your watcher but as your interlocutor, and that is the thing she was asking for without asking.",
      cost: "She may answer, and you may not like the answer. That is data too.",
      alternative: "If you are not ready to hear it, ask in writing and answer tomorrow."
    },
    CH2_WD_1: {
      principle: "C2-005",
      verdict: "good",
      title: "You named what she was doing",
      why: "You called her explaining 'teaching' — probably something she has never thought about herself. And you brought evidence: 'this morning too.' Naming one pupil's strength out loud on day one tells the whole room what is valued here, which is worth more than any rule on the wall.",
      cost: "Nothing.",
      alternative: "Use her next lesson: 'Dilnoza, you explain today. I'll watch.'"
    },
    CH2_WD_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "You saw the gap, not the strength",
      why: "She had not solved it, and saying so is accurate. But she was explaining — she was teaching. You missed the strength and reported the shortfall. She came to you for help and got a verdict.",
      cost: "Tomorrow she will still explain, and she will not tell you.",
      alternative: "Say both, in that order: 'You haven't got the answer yet, and your explaining is excellent. Let's do both.'"
    },
    CH2_WJ_1: {
      principle: "C2-004",
      verdict: "good",
      title: "You gave him his own sentence back",
      why: "'Tomorrow you say it' is almost a transfer of authority, and it hardens the boundary by making it his rather than yours. Punishing the funny pupil is easy. The hard thing — and the useful thing — is putting that energy to work in the room.",
      cost: "He may abuse it. In the first week the risk is worth taking.",
      alternative: "If he oversteps, take it back without making it personal: 'Remember the agreement? You wrote it.'"
    },
    CH2_WJ_2: {
      principle: "C2-001",
      verdict: "weak",
      title: "A win, with him behind you",
      why: "You put him down and he will sit quietly. But now he laughs behind your back rather than in front of you, and the room measures who is strong by that laugh.",
      cost: "The room is quiet, and the quiet is working against you. Tomorrow brings another test.",
      alternative: "Instead of the put-down, hand him the question: 'Jasur, you tell me — why should we take turns?'"
    },
    CH2_WN_1: {
      principle: "C2-004",
      verdict: "good",
      title: "A safe channel",
      why: "One approach does not fit everyone. For Nafisa, 'in front of the class' is frightening and 'to you' is safe. You read her and chose the form of service that fit. That is how trust starts: small, protected, once.",
      cost: "A minute and a bend of the knee. That is all.",
      alternative: "Next step: 'Tell your neighbour, then tell me' — widening the channel gradually."
    },
    CH2_WN_2: {
      principle: "C2-004",
      verdict: "bad",
      title: "You put her fear on display",
      why: "She heard her own voice once and did not like it. Next time she will whisper to her neighbour again, because that works. You showed the class her largest fear and called it participation.",
      cost: "It cannot be taken back. Next lesson she will be invisible again.",
      alternative: "Do not compel. Go and stand beside her and ask quietly — same result, no exposure."
    },
    CH2_WN_3: {
      principle: "C2-003",
      verdict: "weak",
      title: "The answer moved; the pupil did not",
      why: "The answer travelled through the class and the lesson worked. But Nafisa did not look at you once in forty-five minutes, and her invisibility was confirmed again. Invisible in the first week becomes a habit for the year.",
      cost: "One pupil can spend a whole year unseen.",
      alternative: "At minimum use her name without demanding an answer: 'Nafisa, do you agree?'"
    },
    CH2_WB_1: {
      principle: "C2-003",
      verdict: "good",
      title: "'I actually want to learn it'",
      why: "The strongest sentence a teacher can say on day one is that they are still learning. It shares authority, and it gives the pupil the one thing he actually needs: a reason to come back tomorrow.",
      cost: "You are no longer 'the teacher who knows everything'. That is an improvement.",
      alternative: "Scale it to the class: 'Every week, one of you shows us your method.'"
    },
    CH2_WB_2: {
      principle: "C2-006",
      verdict: "ok",
      title: "Care, aimed at the object",
      why: "'Do you have a notebook now?' is care, aimed at the object. He does not want to talk about the notebook — he wants to talk about himself. The question puts him back in the role of 'the boy who needed paper'.",
      cost: "He says 'rahmat' and leaves. The thing he wanted to say stays unsaid.",
      alternative: "Settle the object once, then move on: 'Notebook's handled. Now tell me — what was your old school like?'"
    },
    CH2_WT_1: {
      principle: "C2-006",
      verdict: "good",
      title: "You remembered a sentence from the morning",
      why: "The offer costs nothing, and it proves you heard him — one sentence at 8:52, remembered at 9:40. No praise does that. And you did not invite him into the group; you went with him. That is different: he was not selected, he was recognised.",
      cost: "Ten minutes in the morning, five days a week.",
      alternative: "If daily is impossible, fix one day: 'Thursday — bread together.'"
    },
    CH2_WT_2: {
      principle: "C2-004",
      verdict: "bad",
      title: "You put his shame in front of the class",
      why: "Perhaps the shoes are old. Perhaps he is ashamed of his feet. 'Take them off' shows the class his shame. The notebook question and this one are the same mistake: you saw the need and missed the person.",
      cost: "He will never tell you anything about the canteen again.",
      alternative: "Say nothing. Wear the same kind of shoes yourself — that says more than a sentence."
    },

    // --- the exit -----------------------------------------------------------
    CH2_EX_1: {
      principle: "C2-007",
      verdict: "good",
      title: "The frame closed",
      why: "A first day ends the way the year will begin. 'See you tomorrow' is not a goodbye, it is an invitation. And standing at the door mirrors how you started — you opened the frame and you closed it.",
      cost: "Two minutes, for fourteen pupils.",
      alternative: "If you cannot manage every name, use eye contact for the ones you do not know yet. It still works."
    },
    CH2_EX_2: {
      principle: "C2-007",
      verdict: "weak",
      title: "You wiped his name off the board",
      why: "Tidiness is service. But 'Bekzod usuli' was wiped, so the most important thing that happened today left no trace. The last impression was cleanliness, not you.",
      cost: "Tomorrow the board is empty — and the pupil has no reason to come back and look.",
      alternative: "Clean everything except one line: 'Bekzod usuli — continues tomorrow.'"
    },
    CH2_EX_3: {
      principle: "C2-007",
      verdict: "ok",
      title: "Honest, but incomplete",
      why: "The tiredness is real and does not need hiding. But 'we will continue tomorrow' promises nothing yet — they do not know who will be there or what will happen. A more precise sentence costs no extra time.",
      cost: "They come back tomorrow with no reason. The reason is your sentence.",
      alternative: "'I'm tired, and tomorrow we finish this problem. Look at the board before you go.' — both honest and promising."
    },

    // --- minigame choice ids -------------------------------------------------
    CH2_MG_NINETY_WIN: {
      principle: "C2-001",
      verdict: "good",
      title: "The first ninety seconds worked",
      why: "The room came out both warm and orderly. That combination is not accidental: warmth slides into disorder and order slides into coldness very easily. Holding both at once is the whole job of the first ninety seconds.",
      cost: "Three moves were chosen and the rest were not used. On day one that is correct.",
      alternative: "Try one of the unused moves next lesson — the self-deprecating joke, for instance."
    },
    CH2_MG_NINETY_LOSE: {
      principle: "C2-001",
      verdict: "weak",
      title: "The room read you; you did not read the room",
      why: "The first impression came out differently from what you intended. The good news is that it can be repaired in the remaining forty minutes — if you name it. The worst option is to keep going as if nothing happened.",
      cost: "Ninety seconds are gone. The lesson is not.",
      alternative: "Name it and ask: 'I think I started that badly. How should I have started?' It costs you nothing."
    },
    CH2_MG_NAMES_WIN: {
      principle: "C2-003",
      verdict: "good",
      title: "One real thing beside each name",
      why: "Collecting names takes time; collecting one true thing about each pupil takes longer and is what gets remembered. You came out with both, which is a store you will spend all week.",
      cost: "An extra ten seconds per pupil.",
      alternative: "If you run out of time, collect the facts during the lesson by watching, and write them down after."
    },
    CH2_MG_NAMES_LOSE: {
      principle: "C2-002",
      verdict: "weak",
      title: "The names stayed a list",
      why: "The names were collected but did not become people. A name plus a fact equals a person; a name alone equals a register, and nobody on a register is visible.",
      cost: "You have fourteen names and fourteen strangers.",
      alternative: "Next lesson, one question per pupil and write the answer down — fourteen questions, five minutes."
    },
    CH2_MG_COMPLIMENT_BEST: {
      principle: "C2-005",
      verdict: "good",
      title: "Specific, owned, with evidence",
      why: "The compliment had three parts: who, what they did, and when. That is what turned it into a gift — a sentence that could only belong to that one pupil. Guidara's measure is not what it cost you but what it made them feel.",
      cost: "One observation. Nothing else.",
      alternative: "Make it a habit: three a day, each to a different pupil."
    },
    CH2_MG_COMPLIMENT_OK: {
      principle: "C2-005",
      verdict: "ok",
      title: "Some specific, some generic",
      why: "The specific compliments landed; the generic ones became habit and did nothing. The difference looks small and is not: pupils know within a second whether a sentence is about them or about everyone.",
      cost: "The generic compliments cost time and returned nothing.",
      alternative: "One test before every compliment: 'Could this sentence be about anyone else?' If yes, do not say it."
    },
    CH2_MG_COMPLIMENT_WRONG: {
      principle: "C2-005",
      verdict: "weak",
      title: "The praise was the same for everyone",
      why: "The same sentence to three different pupils belongs to none of them, and they see that immediately. The repair is cheap: it takes one observation, not a different personality.",
      cost: "Praise was spent and had no effect.",
      alternative: "Pick one pupil today and watch only them. Say the specific sentence tomorrow."
    }
  },

  // --------------------------------------------------------------------------
  // 4. ARCHETYPES — bands must not overlap, and must stay inside -1..2.
  // Chapter 1 ships its own array; never merge the two (AGENTS.md §6.2).
  // --------------------------------------------------------------------------
  archetypes: [
    {
      id: "arch-showman",
      when: { minAvg: 0.35, maxAvg: 2 },
      title: "The Showman",
      text: "You ran a beautiful lesson. Problems were solved, order held, nobody was upset. You showed them what you can do — and fourteen children watched you do it. They respect you. They do not yet know you, and you do not yet know them.",
      watchOut: "The showman wins the first day and wears out by the second month, because the show has to be renewed every morning and there is only one of you. One small specific gesture — a name on the board, a goodbye at the door — changes it completely."
    },
    {
      id: "arch-host",
      when: { minAvg: -0.1, maxAvg: 0.35 },
      title: "The Host",
      text: "You opened the lesson with hospitality and did not lose the order. Names were used, somebody felt seen, somebody found a reason to come back tomorrow. That is the hardest balance in a first lesson, and you held it.",
      watchOut: "Hosting runs out. Warm in week one, worn down by week three. Guidara's answer is to systemise it: a greeting at the door every Monday, one small 'hot dog' a week. A repeatable small thing outlasts a mood."
    },
    {
      id: "arch-gatekeeper",
      when: { minAvg: -1, maxAvg: -0.1 },
      title: "The Gatekeeper",
      text: "You put order first. The room was quiet, the lesson ran, nobody complained. And nobody felt seen. That is service, not hospitality: you opened the door and then closed it.",
      watchOut: "The hardest thing for a gatekeeper is giving away a little authority. Start small: write one pupil's name on the board, answer one question with 'what do you think?' Order does not break from that."
    }
  ],

  // --------------------------------------------------------------------------
  // 5. IDEAS — concrete, Monday-doable, no budget.
  // --------------------------------------------------------------------------
  ideas: [
    {
      id: "idea-name-week",
      title: "Fourteen names in one week",
      what: "Learn six names a day and write one fact beside each. Within a week you know the whole class — and you know fourteen people, not a list.",
      how: [
        "Write the class list in your notebook with an empty space after every name.",
        "In each lesson, take six pupils: say the name, ask one question, write down the answer.",
        "The next day, use one of those facts in a sentence — 'Dilnoza, you like explaining. Show us.'"
      ],
      effort: "3 minutes per lesson",
      cost: "Nothing",
      difficulty: "Easy, but needs consistency",
      principle: "C2-002",
      firstWeek: "Cover the whole class in week one. Start using the facts in week two."
    },
    {
      id: "idea-hotdog",
      title: "One 'hot dog' a week",
      what: "Guidara turned a two-dollar hot dog into a gift. In a classroom the cheapest version is a notebook, a written note, or ten minutes in the canteen. What matters is that it is specific and repeatable.",
      how: [
        "On Monday, pick one pupil — the one who needs attention most.",
        "Do one small thing that belongs to them: a notebook, their name on the board, bread together.",
        "Next Monday pick somebody else. Never the same pupil two weeks running — the rotation has to be visible."
      ],
      effort: "10 minutes a week",
      cost: "Nothing, or a few thousand so'm a term",
      difficulty: "Easy, but the choosing is hard",
      principle: "C2-006",
      firstWeek: "Start with the most invisible pupil. That is where the difference is largest."
    },
    {
      id: "idea-specific-praise",
      title: "Three specific compliments a day",
      what: "Instead of 'well done': who, what they did, when. Three is not many — sustained, it is twenty-one pupils a week.",
      how: [
        "At the start of a lesson, pick three pupils and watch them.",
        "At the end, give each one precise sentence: 'Jasur, you raised your hand first today.'",
        "Write down who was praised and who was not. Nobody should go two weeks unseen."
      ],
      effort: "2 minutes per lesson",
      cost: "Nothing",
      difficulty: "Easy, but requires watching",
      principle: "C2-005",
      firstWeek: "Spend week one only watching and writing. Start speaking in week two."
    },
    {
      id: "idea-door-ritual",
      title: "The door ritual",
      what: "Every lesson, stand at the door and greet each pupil by name. Twenty seconds, every day, all year. The cheapest and strongest repeatable gesture available to you.",
      how: [
        "Go to the door a minute before the bell — register under your arm, phone in your pocket.",
        "Look at each pupil and use their name. If you do not know it, ask and write it down.",
        "Stand in the same place at the end and say goodbye. Open the frame and close it."
      ],
      effort: "2 minutes a day",
      cost: "Nothing",
      difficulty: "Easy, but every single day",
      principle: "C2-001",
      firstWeek: "Morning only in week one. Add the goodbye in week two."
    },
    {
      id: "idea-read-the-room",
      title: "Three pupils, three approaches",
      what: "Ask the quiet pupil privately, give the funny pupil the rule, name the explaining pupil's skill. One approach does not fit everyone.",
      how: [
        "In week one, sort every pupil into three rough groups: quiet, active, explaining.",
        "Choose one approach for each group and try it for a week.",
        "Write down who changed and who did not. Swap the approach next week."
      ],
      effort: "20 minutes of watching a week",
      cost: "Nothing",
      difficulty: "Medium — it means reading people",
      principle: "C2-004",
      firstWeek: "Watch only in week one. Resist drawing conclusions early."
    },
    {
      id: "idea-name-the-method",
      title: "'Bekzod usuli' — put a pupil's name on their method",
      what: "When a pupil invents their own method, give it their name and leave it on the board. It costs nothing, it lasts for years, and the rest of the class wants one too.",
      how: [
        "Notice the different solution during the lesson: 'That came out another way. Whose method is that?'",
        "Write it up: '[Name] usuli' — and do not wipe it off.",
        "Give another pupil the same chance next lesson: 'Who has a method?'"
      ],
      effort: "1 minute during a lesson",
      cost: "Nothing",
      difficulty: "Easy",
      principle: "C2-006",
      firstWeek: "Find one method in week one. After that it becomes a habit in the room."
    },
    {
      id: "idea-last-minute",
      title: "Plan the last minute",
      what: "The end of the lesson should not be left to chance. Standing at the door, one name in the goodbye, one thing left on the board — three moves, two minutes.",
      how: [
        "Write the last two minutes into your lesson plan as its own item, like the topic.",
        "Choose the one thing you leave on the board: tomorrow's question, one name, one diagram.",
        "Stand at the door and say goodbye to each of them. By name where you can."
      ],
      effort: "2 minutes a day",
      cost: "Nothing",
      difficulty: "Easy",
      principle: "C2-007",
      firstWeek: "Leave one question on the board in week one — they will arrive with it."
    },
    {
      id: "idea-five-percent",
      title: "Spend 5% unreasonably",
      what: "Guidara runs 95% of the budget to the penny and spends 5% deliberately foolishly. In a classroom the currency is time: give 5% of the lesson to something no syllabus justifies.",
      how: [
        "Give the last two minutes of one lesson to something 'useless': a story, a question, a game.",
        "Write that time into the plan — useless, but planned.",
        "Try a different thing each week and note which one wakes the room up."
      ],
      effort: "10 minutes a week",
      cost: "Nothing",
      difficulty: "Medium — protecting 'useless' time is hard",
      principle: "C2-008",
      firstWeek: "Try it in one lesson in week one and write down what happened."
    }
  ],

  // --------------------------------------------------------------------------
  // 6. DIFFICULTIES — the honest obstacles. No inspiration without them.
  // --------------------------------------------------------------------------
  difficulties: [
    {
      id: "diff-time",
      title: "There is no time — the syllabus is waiting",
      why: "The scheme of work is dense. Every lesson has the pressure of 'move on to the next topic', and a minute spent on hospitality looks like a minute lost.",
      mitigation: "It does not take many minutes: twenty seconds at the door, two minutes of specific praise, two minutes at the end. Five minutes a lesson does not break the syllabus — and those five minutes make the other forty easier, because the room listens.",
      principle: "C2-006"
    },
    {
      id: "diff-showoff",
      title: "Colleagues read warmth as showing off",
      why: "A new teacher who is warm gets read by some colleagues as soft, or as drawing attention. For a young male teacher the suspicion arrives faster.",
      mitigation: "Do not present it as a personal project — present the result. After a month, report it in numbers: attendance, homework completion, fewer incidents. Warmth does not break order; it is what holds order up.",
      principle: "C2-008"
    },
    {
      id: "diff-parents",
      title: "Parents are wary of a new male teacher",
      why: "In the first year parents do not know you. If you are suddenly warm and personal, some of them will misread it.",
      mitigation: "Transparency: one short message a month — what we did, who did well. Do not hide the warmth, document it. A parent who sees their child's name mentioned becomes an ally quickly.",
      principle: "C2-002"
    },
    {
      id: "diff-energy",
      title: "Being warm every day is exhausting",
      why: "Warmth is easy in week one, when everything is new. By week three the tiredness arrives and warmth is the first thing to go.",
      mitigation: "Guidara's answer is to systemise it. Warmth that depends on your mood runs out; a repeatable small ritual does not. The door ritual and one weekly 'hot dog' cost under five minutes and become habit rather than effort.",
      principle: "C2-007"
    },
    {
      id: "diff-attention",
      title: "You cannot attend to fourteen pupils at once",
      why: "Talking to everyone individually in one lesson is physically impossible, and it feels unfair: why Bekzod today and someone else tomorrow?",
      mitigation: "Equal attention given to nobody is the most polite form of ignoring everybody. Run a rotation: pick three or four pupils a week and give them full attention. The pupils can see the rotation, and waiting your turn is itself a lesson.",
      principle: "C2-004"
    },
    {
      id: "diff-program",
      title: "The syllabus does not reward this",
      why: "There is no line in the official curriculum called 'attention to the child'. Assessment measures knowledge only. So this work never comes back to you as a grade.",
      mitigation: "The return is elsewhere: the room listens, attendance improves, incidents fall. After a month, write down what changed. That note will be the most valuable document you have next year.",
      principle: "C2-008"
    },
    {
      id: "diff-one-size",
      title: "Treating each pupil individually sounds like too much work",
      why: "Fourteen pupils, fourteen approaches looks impossible at first glance, which is exactly why most teachers settle for one — and then the individual children disappear.",
      mitigation: "Three categories are enough: quiet, active, explaining. One approach per category is three rules, not fourteen. And knowing each pupil individually arrives on its own, if you keep writing names and facts down.",
      principle: "C2-004"
    }
  ]
};
