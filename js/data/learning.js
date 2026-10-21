window.G = window.G || {};
G.data = G.data || {};

// ============================================================================
// learning.js — the teaching payload. Principles, notebook labels, verdicts
// for every choice id in SPEC §2, debrief archetypes, cheap Sulton-specific
// implementations, and the honest obstacles.
//
// Everything here is written to be read by a teacher on a Sunday night,
// not to decorate a screen. Uzbek where a teacher would actually say it.
// ============================================================================

G.data.learning = {

  // --------------------------------------------------------------------------
  // 1. PRINCIPLES
  // --------------------------------------------------------------------------
  principles: {

    "I-001": {
      id: "I-001",
      name: "Service is black and white. Hospitality is colour.",
      source: "Unreasonable Hospitality, Ch. 1 — the hospitality economy",
      gist: "Service is the right answer delivered to the right child on time: accurate, fast, checkable. Hospitality is how that child feels while you do it. Black and white gets you onto the field; colour is the only reason anyone remembers the match.",
      atSulton: [
        "Checking 14 homework books is service. Noticing that Timur's handwriting has got smaller since he came back from being ill is colour.",
        "A lesson that starts on the bell and ends on the bell is service. Standing at the door and saying 'Salom, Timur' before the bell is colour.",
        "The Friday test is service. How you hand the papers back — face down for one kid, read aloud for another — is colour.",
        "Tarbiya is the school's built-in slot for colour, and most of us fill it with rules. Rules are black and white."
      ],
      spotIt: [
        "You can describe what you taught today but not one thing about any of the 14 children. That was a service day.",
        "Nobody is late, nobody asks a question, nobody speaks to you on the way out.",
        "You feel a small relief when the quiet boy doesn't raise his hand.",
        "Parents leave the gate saying 'hammasi joyida' and nothing else."
      ]
    },

    "I-002": {
      id: "I-002",
      name: "Enlightened hospitality: employees first",
      source: "Unreasonable Hospitality, Ch. 3-4 — USHG, Tabla",
      gist: "People cannot hand out warmth they never receive. Danny Meyer ranked employees above guests, investors and vendors, because the guest experience is the output, not the input. In a school: the teacher's first customer is the colleague beside him, and the manager's first customer is the teacher.",
      atSulton: [
        "Oqil teaches 7 classes a day plus 3 hours of extra lessons. No hospitality programme survives that schedule — the schedule is the first hospitality problem.",
        "If Abu Bakr asks how 5-B went before he asks for the test average, you will ask Timur how he is before you ask for his homework.",
        "The kettle that works, the chair that isn't broken, the 20 minutes without duty — that is the school's hospitality to teachers, and it is cheaper than any training.",
        "When you want to change something as the new teacher, bring Oqil in as a co-author, not as an audience."
      ],
      spotIt: [
        "Staff talk about classes as a category ('5-B is weak') and never as names.",
        "You hear yourself say 'I don't have time for this' about a child. That is a staffing signal, not a character flaw.",
        "The first item in a staff meeting is results; workload is never an item at all.",
        "A colleague who is warm to every child and is never asked a single warm question himself."
      ]
    },

    "I-028": {
      id: "I-028",
      name: "Being present beats being attentive",
      source: "Unreasonable Hospitality, Ch. 16 — two kinds of server at Tribeca Grill",
      gist: "Attentive staff complete tasks around you. Present staff are actually with you. Guidara's present servers took fewer tables and earned more, because people come back for the feeling of being seen, not for the speed of the plate. Presence is a decision about where your attention is, not about how long you stay.",
      atSulton: [
        "Forty minutes with 5-B where you never once look at the clock or the door.",
        "In the parents' meeting, phone face down on the table. Nodira opa will notice in four seconds.",
        "One real conversation at the gate instead of three conversations over somebody's shoulder.",
        "During a test, sit at the back and watch them work instead of marking at the desk. Ten minutes of watching teaches you more than a week of marks."
      ],
      spotIt: [
        "You are already composing your next sentence while the child is still talking.",
        "You ask a question and then answer it yourself.",
        "You remember the mark but not the face that received it.",
        "Children have stopped starting sentences with 'O'qituvchi, men...' because they know you will cut in."
      ]
    },

    "I-043": {
      id: "I-043",
      name: "Thoughtfulness, not luxury",
      source: "Unreasonable Hospitality, Ch. 18 — the two-dollar hot dog",
      gist: "A two-dollar street hot dog, plated and timed to the guest's own words, beat caviar. Luxury says 'look what we can afford'; hospitality says 'look what I remembered about you'. Cost is not the variable. Specificity is.",
      atSulton: [
        "A 45 000 so'm ball for a boy who plays every break beats 480 000 so'm boots he'd be afraid to wear.",
        "An empty box with one sentence written inside costs 0 so'm and outranks both.",
        "A handwritten line about one real thing ('sen chizgan burchaklar to'g'ri edi') beats a printed certificate with a gold seal.",
        "The 8 March envelopes: identical for all 14 staff is luxury logic. One true sentence per person is hospitality logic."
      ],
      spotIt: [
        "The gift is generic enough to give to anyone — mug, pen, calendar, notebook with the school logo.",
        "You feel the need to mention what it cost.",
        "The gesture happens on the official date rather than at the moment it was needed.",
        "You bought it before you knew the person."
      ]
    },

    "I-044": {
      id: "I-044",
      name: "Systemize what is unique",
      source: "Unreasonable Hospitality, Ch. 18 — pre-built toolkits",
      gist: "Waiting for inspiration every single time is a machine for burnout. Guidara watched which surprises kept recurring, then pre-built the assets so any staff member could deliver one in seconds. The unique thing stays unique because the boring part has already been done.",
      atSulton: [
        "A drawer in the staffroom: cheap notebooks, a spare ball, shoelaces, plasters, tea, blank cards. A gesture then takes twenty seconds instead of a trip to the bazaar.",
        "A 'qaytgan kun' folder for a pupil back after two weeks away: one-page summary, three problems, one handwritten line. Made once, reused forever.",
        "A birthday routine that isn't a song: one maths fact about their birth date plus a card signed by three classmates.",
        "Rewrite your three best lessons as a one-page checklist so a new branch in Almazz can run them without you in the room."
      ],
      spotIt: [
        "You did something lovely once and cannot remember how you did it.",
        "The same boy needs the same reassurance every week and you reinvent it every week.",
        "Everything good in the school depends on one person's mood that day.",
        "You have said 'keyingi safar shunday qilaman' three times this term."
      ]
    },

    "F-013": {
      id: "F-013",
      name: "The execution engine: listen, classify, execute, retain",
      source: "Unreasonable Hospitality, Ch. 17-18 — F-013, the Dreamweaver",
      gist: "Four steps, repeatable. Listen for the detail nobody acted on. Classify it: is this a one-off or will it recur? Execute now, cheaply, while the moment is still warm. Retain the story so the next person can repeat it. One-offs get a bespoke gesture; patterns get a toolkit.",
      atSulton: [
        "Listen: Nodira opa mentions in passing that Timur stopped playing football. Nobody wrote it down. One-off or pattern? A boy who stops playing usually stopped for a reason, and the reason is still running.",
        "Classify: a birthday is a pattern — build a routine. A first day back after illness is a pattern — build the folder. A grandmother's funeral is a one-off — you go yourself.",
        "Execute: a 0 so'm box, this week. Not at the end of term, when the detail has gone cold.",
        "Retain: one line in the notebook, not for the file — for whoever teaches him in 6-A next year."
      ],
      spotIt: [
        "A parent tells you something real and you say 'xo'p, rahmat' and move on.",
        "You hear the same detail twice from two different people and still do nothing with it.",
        "You remember the story but never wrote it down, so it dies with the term.",
        "You spent your energy on the one-off and had nothing left for the pattern."
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 2. INTEL LABELS (notebook)
  // --------------------------------------------------------------------------
  intel: {
    intel_sick: {
      label: "Timur kasallikdan keyin 3 hafta darsda bo'lmagan",
      usedFor: "report, return-kit, lesson pacing — explains the gap without excusing it"
    },
    intel_football: {
      label: "Timur futbolni yaxshi ko'radi, har tanaffusda o'ynaydi",
      usedFor: "gift (ball), lesson hook, walk conversation, yard play"
    },
    intel_quiet: {
      label: "Timur fevraldan keyin jim bo'lib qolgan, daftar chetiga yozadi",
      usedFor: "gift (notebook), noticing, the walk's hardest moment"
    },
    intel_home: {
      label: "Uyda nimadir o'zgargan — onasi aytishga shoshilmaydi",
      usedFor: "how gently you ask anything, what you never say at the gate"
    },
    intel_oqil: {
      label: "Oqil: 'u doskaga chiqishdan qochadi, lekin chizishni yaxshi ko'radi'",
      usedFor: "the lesson hook, and the one thing Oqil got right"
    },
    intel_budget: {
      label: "Maktabda sovg'a uchun pul yo'q — onasi buni ochiq aytdi",
      usedFor: "gift (box), every future 'let's just buy something' idea"
    }
  },

  // --------------------------------------------------------------------------
  // 3. CHOICE NOTES — one per id in SPEC §2 (44 entries)
  // --------------------------------------------------------------------------
  choiceNotes: {

    // -- Abu Bakr, the manager ------------------------------------------------
    ABQ_1: {
      principle: "I-001", verdict: "weak",
      title: "You signed the timetable, not the welcome",
      why: "Agreeing is not stupid — the timetable is real and he is protecting a fragile thing. But you left the room having discussed hours and not one child. Service was handled; nothing coloured it.",
      cost: "He now files you as a reliable replacement, not as the person to give innovation time to.",
      alternative: "Take the timetable, then ask one question: 'Bu maktabda o'quvchi qaytib keladigan narsa nima?'"
    },
    ABQ_2: {
      principle: "I-001", verdict: "good",
      title: "You asked what the school is for",
      why: "One question turns a staffing chat into a conversation about children, and it costs him nothing to answer. He managed 14 branches — he has an answer, and now you know what he is actually protecting.",
      cost: null,
      alternative: "If he deflects back to hours, ask it smaller: 'Sizningcha 5-B bizni nima uchun eslab qoladi?'"
    },
    ABQ_3: {
      principle: "I-002", verdict: "weak",
      title: "Right idea, wrong day, wrong room",
      why: "You arrived with the book and left with a reputation. Correcting your manager in hour one, in front of the staffroom, makes the idea a threat. Nobody can adopt an idea that costs them face in public.",
      cost: "The innovation time you wanted is now something he has to defend himself against.",
      alternative: "Ask, don't verdict: 'Bir hafta kuzatsam bo'ladimi? Keyin sizga bitta taklif bilan kelaman.'"
    },

    // -- Oqil, the colleague --------------------------------------------------
    OQ_1: {
      principle: "I-028", verdict: "weak",
      title: "'Yaxshi, tekshiraman' — the cheapest agreement",
      why: "Oqil handed you a label and you filed it as a briefing. Checking homework is attentive; you never asked what he had actually seen with his own eyes. The boy is now a category before he is a person.",
      cost: "The label becomes your lens. Every blank page after today confirms it.",
      alternative: "'Nima ko'rdingiz o'zi? Bitta misol ayting.' One example usually contradicts the label."
    },
    OQ_2: {
      principle: "F-013", verdict: "good",
      title: "You asked for evidence, not opinion",
      why: "Oqil doesn't have a theory, he has three years of Tuesdays. Asking for one observed instance gets you usable intel and gives an exhausted man the rare experience of being taken seriously. Both are the job.",
      cost: null,
      alternative: "Sharpen it: 'U qachon ishlaydi? Qaysi mashqda ko'zlarida nur bor?'"
    },
    OQ_3: {
      principle: "I-002", verdict: "bad",
      title: "You turned an ally into an obstacle",
      why: "He recruited you. He teaches seven classes a day. Being told on day one that he is part of the problem guarantees he never gives you another observation — and staffroom cynicism travels faster than any method you bring.",
      cost: "You will need him in November. He will remember this in November.",
      alternative: "Assume the charitable reading out loud: 'Siz charchagansiz. Shuning uchun bitta bolani sinab ko'rmoqchiman.'"
    },

    // -- Nodira opa, the mother (pick 2 of 4) ---------------------------------
    MOM_Q1: {
      principle: "I-043", verdict: "ok",
      title: "'Qancha vaqt kasal bo'ldi?'",
      why: "You spent one of your two questions on a fact the school already has in a folder. It is still the fact that explains the gap, and it stops you reading absence as laziness — but it bought you information, not her.",
      cost: null,
      alternative: "Push one centimetre further: 'Kasallikdan keyin qanday qaytdi? Uyda kim o'qishga yordam beradi?'"
    },
    MOM_Q2: {
      principle: "F-013", verdict: "good",
      title: "You asked what he loves, not what he scores",
      why: "The highest-yield question of the four. A subject he loves gives you a hook into the lesson and a language for the walk home. It also lets his mother say something proud for once, which is why she answers it fully.",
      cost: null,
      alternative: "Make it concrete: 'Hozir ham o'ynaydimi? Kim bilan?' The tense is where the information is."
    },
    MOM_Q3: {
      principle: "I-028", verdict: "good",
      title: "You asked when, not why",
      why: "'When' is answerable in a hurry and more useful than 'why'. A date gives you a before and an after, and a silent boy usually has a date. It also respects her time, which is the only reason she keeps talking.",
      cost: null,
      alternative: "Name the date back to her once: 'Demak fevraldan keyin.' She will correct you if you're wrong."
    },
    MOM_Q4: {
      principle: "I-043", verdict: "ok",
      title: "The question she wasn't ready for",
      why: "The most valuable intel and the one most likely to close a hurried mother. Asking what changed at home can sound like an investigation, and this is a woman with a bus to catch and a son she is already worried about.",
      cost: null,
      alternative: "Offer an exit before you ask: 'Uyda biron narsa o'zgargan bo'lsa ayting — men buni hech kimga aytmayman.'"
    },

    // -- The lesson -----------------------------------------------------------
    LES_1: {
      principle: "I-001", verdict: "weak",
      title: "Page 1, because it is page 1",
      why: "Defensible and completely standard. Every child in that room has seen this opening four times and two of them have already failed it. Service delivered on time; nobody in the room was met. The lesson existed before the students did.",
      cost: "Timur's first impression of you is a page he already lost to.",
      alternative: "Same material, different door: 'Bugun to'pning burchagini hisoblaymiz.'"
    },
    LES_2: {
      principle: "I-043", verdict: "good",
      title: "You opened with his world and taught the same maths",
      why: "The content did not change; the door did. A football angle costs ninety seconds of prep and buys the attention of a boy who had decided to be invisible in maths. That is what colour looks like in a lesson plan.",
      cost: null,
      alternative: "Keep one rule: the hook is about his world, never about him. Otherwise he becomes the exhibit."
    },
    LES_3: {
      principle: "I-002", verdict: "bad",
      title: "You used him to keep the room",
      why: "Calling Timur out buys four minutes of order and sells his dignity. A boy already hiding will now hide better — and thirteen other children just learned that being visible is dangerous in your lesson.",
      cost: "He will not ask you a question this year. Possibly not any year.",
      alternative: "Ask the room, not the boy: 'Kim tushuntirib bera oladi?' Then stand quietly beside his desk."
    },

    // -- Noticing -------------------------------------------------------------
    NOT_1: {
      principle: "F-013", verdict: "good",
      title: "You noticed the socks",
      why: "Ten seconds of attention on the way to the register. Naming a detail he chose himself tells him he is visible for something other than his mark, and it costs no money and no authority. This is where intel comes from.",
      cost: null,
      alternative: "Don't compliment the item, ask about it: 'Qayerda o'ynaysan?' A question leaves him in charge."
    },
    NOT_2: {
      principle: "I-043", verdict: "good",
      title: "You noticed he came back",
      why: "The register marked him absent and then marked him present; nobody marked the fact that coming back took courage. Saying it once, quietly, at his desk is worth more than a week of encouragement in front of the class.",
      cost: null,
      alternative: "Give him the return folder instead of a speech: summary, three problems, 'savol bo'lsa men shu yerdaman.'"
    },
    NOT_3: {
      principle: "F-013", verdict: "good",
      title: "You read the margins",
      why: "A boy who writes in the margins has thoughts he doesn't dare put in the middle of the page. Noticing the habit is free intel about how he thinks, and it is the single best hook for a notebook-shaped gift later today.",
      cost: null,
      alternative: "Mention the margins to his mother, not to the class. Never read one aloud unless he offers it."
    },
    NOT_4: {
      principle: "I-028", verdict: "bad",
      title: "You were attentive to the test",
      why: "You said the correct thing in the correct tone to nobody in particular. Mentioning the test is the one move that returns him to the exact category he is trying to climb out of. Attentive, not present.",
      cost: "The socks, the return, the margins — all unused. Every later gesture will look random.",
      alternative: "Person first, task second: 'Qaytganing yaxshi bo'ldi. Endi testga qaraymiz.'"
    },

    // -- The report at the gate -----------------------------------------------
    REP_1: {
      principle: "I-028", verdict: "bad",
      title: "'Dangasa' is a verdict, not a report",
      why: "One word that ends the conversation and follows the boy into every staffroom for a year. It also tells Nodira opa the school has already decided — the exact moment a parent stops cooperating and starts defending.",
      cost: "Any future improvement will be filed as an exception, not as him.",
      alternative: "Describe behaviour, not character: 'Oxirgi ikki haftada uy vazifasi 4 martadan 1 marta qilindi.'"
    },
    REP_2: {
      principle: "I-043", verdict: "good",
      title: "One true observation, one next step",
      why: "This is the whole job in two sentences: what you actually saw, and what happens next week. Short enough for a mother in a hurry, specific enough to be believed, and it gives her something to do instead of something to fear.",
      cost: null,
      alternative: "Add a date and a channel: 'Juma kuni sizga bitta xabar yozaman.' A promise with a date is a system."
    },
    REP_3: {
      principle: "I-001", verdict: "weak",
      title: "You reported the score, not the boy",
      why: "Numbers are auditable and safe, and black and white is still necessary. But a mark with no observation tells a mother what her son is worth to the school and nothing about what happened in the room.",
      cost: "The conversation ends at the gate and restarts at the next test.",
      alternative: "Keep the mark, add one sentence of context: 'Bu baho kasallikdan keyingi birinchi hafta uchun.'"
    },
    REP_4: {
      principle: "I-001", verdict: "bad",
      title: "You sold her a feeling you can't deliver",
      why: "She will remember the sentence, and in March she will hold you to it. Over-promising converts one honest win into a large future failure, and it teaches Timur that your words are decoration rather than commitments.",
      cost: "One parent who stops believing you, permanently. She talks to the other mothers.",
      alternative: "Promise the process, not the outcome: 'Har hafta yozaman. Bahoga kafolat yo'q, e'tiborga kafolat bor.'"
    },

    // -- The gift shop --------------------------------------------------------
    GIFT_boots: {
      principle: "I-043", verdict: "bad",
      title: "480 000 so'm of not listening",
      why: "The most expensive item is the least thoughtful. It ignores what his mother said about money, ignores everything you know about him, and puts a boy in boots he will either be mocked for or be afraid to wear on a dusty yard.",
      cost: "You broke her one instruction on day one. Every mother at that gate will hear about the boots.",
      alternative: "Same intention, 0 so'm: a box with a line about the boots he already owns and already plays in."
    },
    GIFT_ball: {
      principle: "I-043", verdict: "ok",
      title: "Cheap and right — if you did the listening",
      why: "45 000 so'm is not the point. It is right because he plays every break, and you only know that if you asked. Bought without the intel it is a guess that happens to be affordable, and he can tell the difference.",
      cost: null,
      alternative: "Don't hand it over at the shop. Give it on the yard at break and ask him to show you a trick."
    },
    GIFT_notebook: {
      principle: "F-013", verdict: "ok",
      title: "A notebook for a boy who writes in margins",
      why: "Good if you noticed the margins; generic if you didn't. A notebook is also a slightly school-shaped present — it says 'work' as loudly as it says 'I saw you'. The margin detail is the only thing that redeems it.",
      cost: null,
      alternative: "Write one line on the first page before you hand it over. The line is the gift; the notebook is packaging."
    },
    GIFT_box: {
      principle: "I-043", verdict: "good",
      title: "An empty box, filled with one specific sentence",
      why: "Zero so'm and full attention. It respects his mother's rule, it cannot be bought by anyone else in the building, and it makes the lesson of the whole day visible: what you put inside is the hospitality. This is the hot dog.",
      cost: null,
      alternative: "If you freeze, fold a paper ball into the box and write 'burchak' on it. A maths joke he will keep."
    },

    // -- The walk home (same object) ------------------------------------------
    // Moment 1: leaving the gate. 2: the ball on the street. 3: he mentions
    // the 2. 4: the silence at the bus stop. 5: at his own gate.
    TRAVEL_1_a: {
      principle: "I-028", verdict: "weak",
      title: "First corner, first questionnaire",
      why: "He has been talked at for six hours. 'How was maths?' is a form to fill in and he answers it with one syllable. You had eight minutes of walking and spent them administering a survey.",
      cost: null,
      alternative: "Walk one block in silence. Say one thing about the street. Let him choose the first word."
    },
    TRAVEL_1_b: {
      principle: "I-028", verdict: "good",
      title: "You walked beside him, not at him",
      why: "Silence next to a person is not nothing — it is company without a price. He tested it for half a block and then he spoke. That is the whole of presence in one move, and it cannot be rushed or scheduled.",
      cost: null,
      alternative: "If silence makes you nervous, narrate the street, never his life: 'Bu ko'cha har kuni shunday shovqinmi?'"
    },
    TRAVEL_1_c: {
      principle: "I-043", verdict: "ok",
      title: "Care, one beat too early",
      why: "You used the intel out loud and reminded him that adults discuss him when he isn't in the room. Not unkind — but it hands him a reason to be careful with you. Trust prefers a door to a question.",
      cost: null,
      alternative: "Hold the illness until he raises it. Then say only: 'Bilaman. Shoshma.'"
    },
    TRAVEL_2_a: {
      principle: "F-013", verdict: "good",
      title: "You followed his lead into his own field",
      why: "The first time he talks without being pulled, he is talking about position. Asking him to teach you something flips the relationship: for twenty metres the teacher is the student, and he is the expert in something real.",
      cost: null,
      alternative: "Don't fake knowledge. 'Men futbolni bilmayman — tushuntirib ber.' Ignorance is an invitation."
    },
    TRAVEL_2_b: {
      principle: "I-028", verdict: "bad",
      title: "You turned the walk into a lesson plan",
      why: "He let you in and you invoiced him. The moment he is most open is the worst moment for a rule, because it makes the opening feel like a trap. He will walk the rest of the way half a step ahead of you.",
      cost: "You spent the only silence like that one. He will not offer a second this week.",
      alternative: "Say it at his door, once, as a fact not a demand: 'Ertaga uy vazifasini birga ko'ramiz.'"
    },
    TRAVEL_2_c: {
      principle: "I-028", verdict: "ok",
      title: "Your own story, well meant",
      why: "Sharing yourself is generous and it does build a bridge — but it makes you the subject of his walk. He listened politely. The point was to find out what he would say if nobody was saying anything at him.",
      cost: null,
      alternative: "Tell the story, then hand it back with a question: 'Sen ham o'ynaganmisan? Qachon?'"
    },
    TRAVEL_3_a: {
      principle: "I-001", verdict: "bad",
      title: "You graded him on the street",
      why: "The school already delivered that mark. He did not need it again, outdoors, from the one adult who had not yet mentioned it. This is service logic applied to a boy's self-respect: technically correct, timed terribly, impossible to take back.",
      cost: "He now knows exactly what you are for. You will be a maths teacher to him, nothing else.",
      alternative: "'Ikkilik nima bo'ldi o'zi?' Let him describe the mark before you judge it."
    },
    TRAVEL_3_b: {
      principle: "I-028", verdict: "good",
      title: "You asked what it felt like, not what it meant",
      why: "Marks are public; feelings are not. Asking about the feeling gives him something to hand you that nobody has ever asked him for, and it tells you whether the problem is knowledge, shame, or both at once.",
      cost: null,
      alternative: "If he shrugs, offer yours first: 'Men ham ikkilik olganman. Xafa bo'lgandim.' Then wait."
    },
    TRAVEL_3_c: {
      principle: "I-001", verdict: "weak",
      title: "True, and useless",
      why: "It is the sentence adults say to make themselves feel better. He already knows marks are not everything; he also knows his mother does not agree. Comfort with no next step is just noise on a cold street.",
      cost: null,
      alternative: "'Baholar hamma narsa emas. Lekin bu hafta bitta narsani tuzatsak bo'ladi — qaysi biri?'"
    },
    TRAVEL_4_a: {
      principle: "I-028", verdict: "weak",
      title: "You filled the silence",
      why: "He went quiet because something needed thinking about, and you covered it with questions. Presence is the discipline of not rescuing a silence. You got answers instead of the one thing he was about to say on his own.",
      cost: null,
      alternative: "Count to twenty. If it is still quiet, say 'Shoshmaymiz.' Then nothing."
    },
    TRAVEL_4_b: {
      principle: "I-028", verdict: "good",
      title: "You sat down and let him start",
      why: "Two people on a bench saying nothing is a different category of relationship from teacher and pupil. He chose the subject, which means the subject was real. This is the moment he decided you were safe to talk to.",
      cost: null,
      alternative: "If you can't sit, slow down. Walking pace is a signal; rushing is a verdict."
    },
    TRAVEL_4_c: {
      principle: "I-001", verdict: "ok",
      title: "You offered to fix it for him",
      why: "Solving is faster than sitting, and it takes his agency out of his own life. He may even say yes — and then the conversation with his mother becomes about what a good teacher you are, not about him being a person.",
      cost: null,
      alternative: "'Onang bilan gaplashishimni xohlasang, ayt. Xohlamasang, gaplashmayman.' Then honour it."
    },
    TRAVEL_5_a: {
      principle: "I-043", verdict: "weak",
      title: "Warmth with a condition attached",
      why: "Making your return a reward turns the relationship into a transaction. He will do the homework and learn that being worth a visit depends on performance — the exact lesson the whole walk was undoing.",
      cost: null,
      alternative: "'Ertaga kelaman. Vazifa bo'lmasa ham kelaman.' Then come."
    },
    TRAVEL_5_b: {
      principle: "F-013", verdict: "good",
      title: "You said yes and asked about the margins",
      why: "A promise kept small and specific, plus one detail you noticed yourself. The notebook question proves the intel came from looking at him rather than from his mother's briefing — which is the difference between surveillance and attention.",
      cost: null,
      alternative: "If you never saw the margins, ask about the drawings. Only ever ask about something you actually saw."
    },
    TRAVEL_5_c: {
      principle: "I-002", verdict: "bad",
      title: "The honest excuse that sounds like a no",
      why: "Your six classes are real and Oqil's seven are worse. But he asked one question at his own gate, and 'ko'ramiz' is the answer that teaches him not to ask again. Real constraints can still be said honestly.",
      cost: "He will not ask an adult for anything again soon. That is the whole cost.",
      alternative: "'Bugun ha, ertaga bilmayman. Kelolmasam, o'zim yozaman.'"
    },
    TRAVEL_win: {
      principle: "F-013", verdict: "good",
      title: "He let you in before he let you help",
      why: "You spent the walk on him, not on the subject, and the meter moved because he chose to move it. Write down what worked — silence, his field, feelings before marks — because that is now a routine, not a lucky afternoon.",
      cost: null,
      alternative: "Next time hand the lead over earlier. Twenty minutes is a lot of silence to carry alone."
    },
    TRAVEL_lose: {
      principle: "I-028", verdict: "weak",
      title: "You got him home, not close",
      why: "He reached his gate and that matters — the walk happened. But it stayed an escort: you asked, he answered, nobody sat down. Low trust is not failure; it is a map of where you were still performing the teacher.",
      cost: null,
      alternative: "Try one moment of pure presence: no question for two full minutes, then follow whatever he says."
    },

    // -- The yard -------------------------------------------------------------
    BALL_win: {
      principle: "I-043", verdict: "good",
      title: "You played, you didn't coach",
      why: "Keeping a ball up for a boy is not PE and not a reward for homework. For ten minutes you were a person in a yard, which is the only version of you he can talk to at the gate tomorrow. Relationship, not incentive.",
      cost: null,
      alternative: "Let him win once at the end. Not as a lesson — because it is his yard."
    },
    BALL_lose: {
      principle: "I-028", verdict: "ok",
      title: "Football, or a drill with a ball",
      why: "You counted hits and he felt marked. The moment the game had a pass or fail it became school with better scenery. Losing at keepy-uppy costs nothing; turning it into an assessment is what closes him.",
      cost: null,
      alternative: "Stop counting. Ask him to teach you the trick — he becomes the expert in thirty seconds."
      }
  },

  // --------------------------------------------------------------------------
  // 5. ARCHETYPES — ordered most-specific first; the engine takes the first
  // matching `when`. Bands are contiguous so every score lands somewhere.
  // --------------------------------------------------------------------------
  archetypes: [
    {
      id: "arch-listener",
      when: { minAvg: 1.75, requiresIntel: [], requiresFlags: [] },
      title: "The listener — siz bolani ko'rdingiz",
      text: "You asked before you acted, and you kept asking after you had enough to act. The intel you gathered changed what you did with it — the gift, the opening line, the sentence at the gate — which is the only test of listening that matters. Today you were not a maths teacher who was kind; you were a person who happened to teach maths, and Timur could tell the difference. Bu oson ish emas va siz bugun qildingiz.",
      watchOut: "Listening this well makes people expect it every day. If you spend this much attention on one boy, the other thirteen will notice the absence before they notice the effort — and you will burn out by November trying to do it fourteen times a day."
    },
    {
      id: "arch-bridge",
      when: { minAvg: 1.4, maxAvg: 1.75, requiresIntel: [], requiresFlags: [] },
      title: "The bridge — yaxshi boshladingiz, oxirigacha bormadingiz",
      text: "You found the door into his world and used it — a football, a margin, a date on a calendar — but you did not always walk all the way through it. Some of today was genuine connection and some of it was good technique. That is further than most first days get, and it is also why the day feels slightly unfinished to you now.",
      watchOut: "The bridge is a comfortable place to stand. It is easy to keep being the teacher who 'gets' the difficult boy without ever doing the small, unglamorous follow-up that turns being understood into being helped."
    },
    {
      id: "arch-performer",
      when: { minAvg: 1.05, maxAvg: 1.4, requiresIntel: ["intel_football"], requiresFlags: [] },
      title: "The performer — sahnada edingiz, lekin yoningizda emas",
      text: "You gathered intel and you used it, and the moments landed — but you were watching them land. The gift was chosen to be a good gift, the question was asked to be a good question. Children are unusually good at spotting the difference between being cared for and being handled well, and Timur is better at it than most.",
      watchOut: "Performance is not a sin; it is the apprentice version of hospitality, and the fix is small. Do one thing today that nobody sees: a note he never mentions, a follow-up on Thursday, a sentence with no audience."
    },
    {
      id: "arch-promiser",
      when: { minAvg: 1.05, maxAvg: 1.4, requiresIntel: [], requiresFlags: [] },
      title: "The over-promiser — ko'p gapirdingiz, oz eshitdingiz",
      text: "You meant every word and you said too many of them. Warmth arrived as volume: reassurance, encouragement, promises about what would change. Timur left today with a lot of sentences about himself and not much evidence. Intentions were good; the day was loud.",
      watchOut: "Promises are the cheapest form of care and the most expensive to break. You now owe him something, and the only way to pay is smaller and quieter than anything you said."
    },
    {
      id: "arch-technician",
      when: { maxAvg: 1.05, requiresIntel: [], requiresFlags: [] },
      title: "The technician — dars bo'ldi, uchrashuv bo'lmadi",
      text: "Everything you did today was correct. The lesson started on time, the test was mentioned, the report was factual, the gift was bought. And a boy came back after three weeks away and nobody in the building said his name in a way he would remember. Black and white, delivered well, with no colour in it.",
      watchOut: "Competence is a real achievement and it will be rewarded by the timetable. That is the trap: the school will keep giving you more classes because you handle them, and nobody will ever ask you to handle the child."
    }
  ],

  // --------------------------------------------------------------------------
  // 6. IDEAS — cheap enough to start on Monday, with the real friction named
  // --------------------------------------------------------------------------
  ideas: [
    {
      id: "idea-door-name",
      title: "Eshikda besh daqiqa",
      what: "Stand at the door and greet all 14 by name with one detail that is theirs.",
      how: [
        "Come three minutes early and stand outside the door, not at the board.",
        "One sentence each: 'Salom, Timur — bugun o'sha ko'k krossovkada keldingmi?' Nothing about homework.",
        "Write down the two you got wrong. Next week get those two right."
      ],
      effort: "low",
      cost: "none",
      difficulty: "Fourteen children arrive in one ninety-second wave and the corridor is loud. You will manage eight before the bell and the last six will get a nod — which is exactly how the quiet ones get missed again.",
      principle: "I-028",
      firstWeek: true
    },
    {
      id: "idea-margin-sentence",
      title: "Bir varaq, bir jumla",
      what: "One specific handwritten sentence in the margin of every notebook, once a week.",
      how: [
        "Take five notebooks a day, not fourteen in one sitting. Monday 5-B, Tuesday 5-A.",
        "Write about something you actually saw: 'Shu masalada qadamlar to'g'ri, javobni tekshir.'",
        "Never write a mark in the margin. The mark already exists; this is the other channel."
      ],
      effort: "medium",
      cost: "none",
      difficulty: "Forty minutes you do not have, in a week with three classes and 70 notebooks. The predictable failure is that the quietest children get skipped first — the ones who need the margin most.",
      principle: "I-043",
      firstWeek: true
    },
    {
      id: "idea-yard-twenty",
      title: "Tanaffusda yigirma daqiqa",
      what: "Play football on the yard at Wednesday break. Play, don't coach, don't assess.",
      how: [
        "Pick one break a week and put it in your phone as a real appointment.",
        "Join a game that already exists. Do not organise one.",
        "Say nothing about maths for the whole twenty minutes. This is the entire rule."
      ],
      effort: "low",
      cost: "0 — or 45 000 so'm for a spare ball kept in the staffroom",
      difficulty: "A male teacher alone on a yard with boys at break will be looked at, and one comment from a colleague can end it. Keep it in the open, in the yard, at break, and mention it in the staffroom before anyone asks.",
      principle: "F-013",
      firstWeek: true
    },
    {
      id: "idea-gate-ninety",
      title: "Darvozada 90 soniya",
      what: "Three parents a week at the gate: one true observation, one next step, with a date.",
      how: [
        "Choose the three whose children you can say something specific about. Not the easiest three.",
        "Ninety seconds: what you saw, what happens next week, when you will write again.",
        "Write the date in your notebook immediately. Then keep it."
      ],
      effort: "medium",
      cost: "none",
      difficulty: "Parents arrive at 16:30 in a hurry and some hear any feedback as an accusation. The temptation is to say only pleasant things, which makes the whole exercise worthless and teaches them to distrust the next teacher who is honest.",
      principle: "I-043",
      firstWeek: true
    },
    {
      id: "idea-drawer",
      title: "Tortmaning ichidagi tortma",
      what: "A pre-stocked hospitality drawer in the staffroom so a gesture takes 20 seconds, not a trip to the bazaar.",
      how: [
        "One drawer, five items: cheap notebooks, a spare ball, shoelaces, plasters, blank cards. Plus tea.",
        "Tape the list inside the lid and write your name as the owner.",
        "Restock the first Monday of the month, five minutes, no discussion."
      ],
      effort: "low",
      cost: "about 150 000 so'm, once",
      difficulty: "Staffroom drawers become everyone's drawer within a fortnight. Without a named owner and a list taped inside, it turns into a general supply cupboard and the whole point — a gesture you can make instantly — quietly disappears.",
      principle: "I-044",
      firstWeek: true
    },
    {
      id: "idea-birthday-fact",
      title: "Tug'ilgan kun: formula, qo'shiq emas",
      what: "No song, no certificate. One maths fact about their birth date and a card signed by three classmates.",
      how: [
        "In September, copy all 14 birth dates out of the register into one page in your notebook.",
        "On the day, two minutes: one fact about their number, one card, three signatures collected quietly beforehand.",
        "Hand it over at the door, not in front of the class. The class does not need to watch."
      ],
      effort: "low",
      cost: "0-10 000 so'm per card",
      difficulty: "Nobody maintains the list. The register has the dates but no reminder exists, so by late October you have missed four and the fifth looks like favouritism. The list is the whole system; build it once and it survives.",
      principle: "I-044",
      firstWeek: true
    },
    {
      id: "idea-return-folder",
      title: "Qaytgan kun papkasi",
      what: "A ready folder for a pupil back after two weeks away: one-page summary, three problems, one handwritten line.",
      how: [
        "Make one template on a single A4 and photocopy ten. This is a one-hour job, once.",
        "Monday morning, check the register for anyone absent more than five days. That is the trigger.",
        "Hand it over with five minutes at the door: 'Bu yerda hamma narsa bor. Savol bo'lsa men shu yerdaman.'"
      ],
      effort: "low",
      cost: "none",
      difficulty: "You find out a child is back when they walk through the door, which is already too late to be ready. The fix is a Monday register check — and nothing in the school day will remind you to do it, so it has to go in the same place as the timetable.",
      principle: "I-044",
      firstWeek: false
    },
    {
      id: "idea-exit-question",
      title: "Chiqishda bitta savol",
      what: "A Friday exit slip with one question that is not about maths. Read it properly.",
      how: [
        "One slip: 'Bu hafta darsda seni nima xafa qildi? Nima yaxshi bo'ldi?' Two lines.",
        "Give it to two groups a week, not all four. Fifty-six slips is a dead system by week three.",
        "Read them Sunday. Pick one thing to change on Monday and tell the class you changed it."
      ],
      effort: "medium",
      cost: "none",
      difficulty: "Honest answers create obligations. A boy writes that he cannot see the board from the back and now you have to move him, which means a conversation with someone about seating, which is exactly the kind of thing that gets postponed forever.",
      principle: "F-013",
      firstWeek: true
    },
    {
      id: "idea-oqil-tea",
      title: "Oqilga bir piyola choy",
      what: "Hospitality to the colleague who teaches seven classes a day, asking for nothing.",
      how: [
        "Bring two cups to his desk once a week, at the break when he is marking.",
        "Ask about his class, not about Timur. The first three times, ask for nothing at all.",
        "If he complains about the timetable, write it down. That is intel about the school, not gossip."
      ],
      effort: "low",
      cost: "none",
      difficulty: "He will read it as a tactic, because in most schools it is one. If you ask for a favour in the first month, the tea was a transaction and he was right — and he told you so before you proved it.",
      principle: "I-002",
      firstWeek: true
    },
    {
      id: "idea-branch-page",
      title: "Bitta varaq: yangi filial uchun",
      what: "Turn whatever worked into a one-page checklist another teacher can run without you.",
      how: [
        "After a month, write the three routines that survived: door, margin, return folder.",
        "Each one gets: when, what, how long, what to say, what to do if it fails.",
        "Give it to Abu Bakr for the next branch. Offer it as a draft, not as a standard."
      ],
      effort: "medium",
      cost: "none",
      difficulty: "The first draft will be a brag list — what you did — rather than a checklist someone else can follow. Writing it so a stranger can run it takes a second pass you will not want to do, and a document nobody can use is worse than no document.",
      principle: "I-044",
      firstWeek: false
    }
  ],

  // --------------------------------------------------------------------------
  // 7. DIFFICULTIES — the honest obstacles, not the motivational ones
  // --------------------------------------------------------------------------
  difficulties: [
    {
      id: "d-time",
      title: "Vaqt yo'q, va bu bahona emas",
      why: "Three classes, 70 notebooks, a test every week, and a timetable that does not contain the word 'relationship'. Every hour spent on Timur is an hour visibly not spent on marking, and marking is the thing anyone can check.",
      mitigation: "Do not add time, replace it. Two minutes at the door replaces five minutes of telling the class off for noise. One margin sentence replaces a paragraph of marking comments nobody reads. If a habit needs new time, it is not a habit yet.",
      principle: "I-028"
    },
    {
      id: "d-colleagues",
      title: "Hamkasblar buni o'zini ko'rsatish deb o'ylaydi",
      why: "You are new, you are reading a restaurant book, and you are doing extra things in public. Oqil has taught seven classes a day for years without applause. Your visible care can read as an implied criticism of his invisible exhaustion.",
      mitigation: "Do the first month's work where it cannot be seen as a performance — margins, folders, the drawer. When you do something visible, say out loud that you are copying something Oqil already does, and mean it.",
      principle: "I-002"
    },
    {
      id: "d-boundaries",
      title: "Chegara yo'q — va charchoq haqiqiy",
      why: "Hospitality has no natural stopping point. Fourteen children, each with a real story, is more than one person can hold at the depth Timur got today. The work is designed to expand until it breaks you, and it will do it quietly.",
      mitigation: "Pick a number and defend it: one deep case at a time, per group, per term. Everyone else gets the system — the door, the margins, the folder. Deep attention is a rotating slot, not a permanent assignment.",
      principle: "I-044"
    },
    {
      id: "d-every-child",
      title: "Har bir bolaga yetib bo'lmaydi",
      why: "Timur got the gift, the walk, and the sentence at the gate. Thirteen others got a lesson. Children count, precisely and without mercy, and the ones who count loudest are usually the ones who need it least.",
      mitigation: "Make the visible specialness rotate: this week Timur, next week Dilnoza, and say the rotation out loud so it looks like a system rather than a favourite. The base layer — names at the door, one true sentence — must be for all 14 or none.",
      principle: "I-043"
    },
    {
      id: "d-parents",
      title: "Ota-onalarning ishonchsizligi",
      why: "A new male teacher walks a boy home and gives him a present. Nodira opa is polite, and underneath she is calculating. In this town, one misread gesture travels faster than ten good lessons, and it is not paranoia — it is her job.",
      mitigation: "Nothing private, nothing behind a door. Tell her beforehand what you are doing and why. Give the gift in front of the child and the mother, or on the yard in front of other children. Keep the walk to the public route.",
      principle: "F-013"
    },
    {
      id: "d-budget",
      title: "Pul yo'q — va bu aslida yaxshi",
      why: "There is no gift budget and the mother said not to spend. The instinct is to solve this with money, which converts a hospitality problem into a purchasing problem and makes it depend on a budget line you will never get approved.",
      mitigation: "Treat zero as a design constraint, not an obstacle. The box, the margin, the return folder and the twenty minutes on the yard all cost nothing. Anything that requires a budget is a project for Abu Bakr, not a gesture for Monday.",
      principle: "I-043"
    },
    {
      id: "d-measure",
      title: "O'lchab bo'lmaydigan narsani o'lchash",
      why: "You cannot put 'he looked at me differently at the gate' into a report. The things that can be measured — marks, attendance, test averages — are the black and white, and the school will keep asking for them in exactly that language.",
      mitigation: "Measure the proxy honestly and say so: how many parents you spoke to, how many names you used, how many returning pupils got a folder, how many margin sentences were written. Count the inputs, describe the outcomes, never fake the second as the first.",
      principle: "I-001"
    },
    {
      id: "d-performance",
      title: "Buni o'zini ko'rsatish uchun qilish vasvasasi",
      why: "Hospitality makes a beautiful story, and stories get told in staffrooms. The moment you notice yourself choosing the gesture that photographs well over the one he actually needs, the work has changed into marketing — and children can smell it.",
      mitigation: "Keep one thing a week that nobody will ever know about. If everything good you did today is tellable, you were not doing hospitality, you were collecting material.",
      principle: "I-028"
    }
  ]
};
