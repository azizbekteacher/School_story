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
    intel_math_why: {
      label: "Nega matematika kerak",
      usedFor: "Darsni «nega bu kerak» degan savoldan boshlash — fanni formuladan emas, foydasidan ochish."
    },
    intel_dilnoza_explains: {
      label: "Dilnoza tushuntirishni yaxshi ko'radi — hali o'zi yechmagan misolni ham boshqalarga tushuntiradi",
      usedFor: "Specific praise for Dilnoza; naming her strength out loud"
    },
    intel_timur_bread: {
      label: "Timur ertalab yakka non yeydi — oshxonaga erta keladi, keyin devorga suyanib turadi",
      usedFor: "Offering to go to the canteen with him; not putting him in a group"
    },
    intel_bekzod_new: {
      label: "Bekzod uch hafta oldin boshqa maktabdan kelgan — daftari yo'q, faqat bitta yirtilgan varaq",
      usedFor: "The notebook and the attention; seeing his 'new boy' position"
    },
    intel_jasur_joke: {
      label: "Jasur eng baland ovoz, lekin hukmni u yozmaydi — kulayotganlar unga qarab kuladi",
      usedFor: "Not punishing Jasur; recruiting him into the agreement"
    },
    intel_named_two: {
      label: "Eshikda ikkita ismni ishlatdingiz: Dilnoza va Bekzod",
      usedFor: "Tying the first impression to a name"
    },
    intel_names_method: {
      label: "Ismlar yodlanmaydi — to'g'ri ishlatiladi. Har bir o'quvchi o'zi haqida bitta gap aytdi",
      usedFor: "The method for learning names; tomorrow's preparation"
    },
    intel_bekzod_way: {
      label: "Bekzod misollarni boshqacha yechadi — o'z usuli bilan, va javob to'g'ri chiqadi",
      usedFor: "Putting 'Bekzod usuli' on the board; earning his trust"
    },
    intel_rule_reason: {
      label: "Kelishuvning sababi: bir vaqtda bitta ovoz, chunki o'ttiz daqiqani bo'lishish kerak",
      usedFor: "Anchoring the agreement in the pupils' own words"
    },
    intel_madrasa: {
      label: "Madrasada ustoz birinchi kundan hamma ismni bilardi — parta yo'q edi, hamma polda o'tirardi",
      usedFor: "Redirecting the credential story; connecting your own history to the lesson"
    },
    intel_compliment: {
      label: "Aniq maqtov: kim, nima, qachon — umumiy «barakalla» emas",
      usedFor: "Compliments delivered during the lesson; repeating them tomorrow"
    },
    intel_bekzod_named: {
      label: "Doskada «Bekzod usuli» yozilgan — sinfda o'quvchi nomi bilan atalgan usul bor",
      usedFor: "Not wiping the board at the end; naming others too"
    },
    intel_zarina_leader: {
      label: "Zarina sinfni boshqaradi — hatto Jasurni ham to'xtatadi. Hukmni u yozadi",
      usedFor: "Naming Zarina's strength; making her an ally"
    },
    intel_zarina_leads: {
      label: "Zarina kuzatib turdi va so'radi: «nega Jasur bilan gaplashmadingiz?»",
      usedFor: "An honest conversation with Zarina; recognising the room's real leader"
    },
    intel_jasur_leader: {
      label: "Jasur kelishuvni o'z so'zlari bilan aytdi: «hamma gapirsa, hech kim eshitmaydi»",
      usedFor: "Giving the agreement back to him; not punishing him"
    },
    intel_nafisa_quiet: {
      label: "Nafisa javobni biladi, lekin ovoz chiqarib aytmaydi — qo'shnisiga shivirlaydi",
      usedFor: "A safe channel for Nafisa: alone, quiet voice"
    },
    intel_bekzod_tomorrow: {
      label: "Bekzod agreed to show another method tomorrow",
      usedFor: "Planning tomorrow's lesson; making him a pupil with a reason to return"
    },
    intel_timur_alone: {
      label: "Timur «birga?» deb so'radi — unga birinchi marta nimadir taklif qilindi",
      usedFor: "Starting the morning-bread habit"
    }
  },

  // --------------------------------------------------------------------------
  // 3. CHOICE NOTES — one per option id and per minigame choice id.
  // --------------------------------------------------------------------------
  choiceNotes: {

    CH2_Q_DILNOZA: {
      principle: "C2-003",
      verdict: "good",
      title: "You asked before you performed",
      why: "Two minutes of asking bought the most useful fact in the room: Dilnoza explains things she has not solved herself, which means she teaches without being asked. The Dreamweaver's only job is to notice exactly this. You used the corridor as intelligence, not as waiting.",
      cost: "Twenty seconds.",
      alternative: "If you have no time to ask, watch instead: who is listened to without being loud is the same information."
    },

    CH2_Q_TIMUR: {
      principle: "C2-003",
      verdict: "good",
      title: "A small fact with a door on it",
      why: "Asking Timur about the canteen looked like a logistics question. It was not: it produced 'I come early, so I eat now', which tells you he arrives alone and knows his way around. One question, two facts.",
      cost: "Fifteen seconds.",
      alternative: "Ask any pupil one practical question on day one. Practical questions are answered honestly."
    },

    CH2_Q_BEKZOD: {
      principle: "C2-003",
      verdict: "good",
      title: "The one standing apart",
      why: "The pupil standing two steps away from everyone, holding a torn sheet instead of a notebook, is the single most useful thing to know before you walk in. New, three weeks in, no equipment. You learned it by looking and then asking.",
      cost: "Thirty seconds.",
      alternative: "If he will not talk, the torn sheet is still information."
    },

    CH2_Q_LISTEN: {
      principle: "C2-003",
      verdict: "good",
      title: "Listening is intel too",
      why: "You said nothing and learned the most important thing about the room: the loudest boy is not the leader. People laughed near him, not with him. Guidara's maitre d' reads a room the same way, before anyone speaks.",
      cost: "Twenty seconds, no risk.",
      alternative: "Stand where you can hear two conversations and let one finish."
    },

    CH2_DR_1: {
      principle: "C2-002",
      verdict: "good",
      title: "The name opens the door, not the credential",
      why: "You did not use the name as a weapon, you used it as an introduction — and you used his name first. That is not a display of authority, it is a door opening. A boy blocking a doorway is usually testing one thing: whether you will make him small.",
      cost: "One second of attention, in front of everyone.",
      alternative: "If you do not know the name, use your own name and ask his. The move still works."
    },

    CH2_DR_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "Correct, and it cost you",
      why: "'Maths. Sit down, we are losing time.' It works — he sits. But your first sentence to fourteen strangers was about the timetable. They filed that away, and the filing is permanent.",
      cost: "One second of stiltedness, and a colder room for the next forty minutes.",
      alternative: "Same content, one extra clause: 'Maths — sit down, and tell me your name first.'"
    },

    CH2_DR_3: {
      principle: "C2-001",
      verdict: "ok",
      title: "The verdict is reached before you speak",
      why: "You walked past him to the board without a word. You did not fight a boy for a doorway. But silence is not yet respect — it is a delay, and it can be spent either way.",
      cost: "Ten seconds of a room waiting.",
      alternative: "Break it deliberately: write your name, then turn and use one pupil's."
    },

    CH2_IN_1: {
      principle: "C2-003",
      verdict: "good",
      title: "A road, not a trophy",
      why: "'I started the same way' is the sentence that opens a room. You told them your own road to the subject instead of your trophy. Zarina then asked the only question that mattered — did that teacher know you — and you answered with what you would do today.",
      cost: "One true sentence about yourself.",
      alternative: "'I was not the fastest. I was the one who came back the next day.'"
    },

    CH2_IN_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "The certificate worked, and closed a door",
      why: "The room respects you; nobody is upset. But respect is not the same as being known, and now you are a competitor, not a companion. Enlightened hospitality is a welcome from the inside, not an exhibition to be admired.",
      cost: "The certificate is not a lie. It is a smaller number than it looks.",
      alternative: "Keep it for the minute someone doubts you are qualified, not for the first minute they are deciding who you are."
    },

    CH2_IN_3: {
      principle: "C2-001",
      verdict: "ok",
      title: "Efficient, not personal",
      why: "Name, subject, straight to the question. Nothing you said was wrong or rude. But they asked where you came from, and you did not answer. They are deciding whether you are a person; you offered a job title.",
      cost: "Fifteen seconds.",
      alternative: "Insert one clause: 'Name, subject, and one thing I would have wanted you to know about me.'"
    },

    CH2_HK_1: {
      principle: "C2-003",
      verdict: "good",
      title: "Names on the board, not answers",
      why: "You refused to give the method, and you wrote their guesses on the board with their names. That does two things at once: it makes each guess worth defending, and it makes the person who guessed it visible. 'Ask the shortest question you possibly can' and then be less helpful.",
      cost: "Five minutes, and you must resist answering.",
      alternative: "If nobody guesses, offer a wrong one of your own and let them correct it."
    },

    CH2_HK_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "You gave the formula and ended the argument",
      why: "n(n-1)/2 is correct. You are now the only person in the room who knows it, and they have stopped talking — not because they understand, but because a person who knows has arrived. A short question with no method beats a formula delivered on time.",
      cost: "One sentence, and the room goes quiet in the wrong way.",
      alternative: "Keep the formula until a pupil has put a wrong guess where people can see it."
    },

    CH2_HK_3: {
      principle: "C2-008",
      verdict: "ok",
      title: "Smaller numbers, same structure",
      why: "Three people, count it — a real move, and mathematically sane. But they are still computing what you set up rather than wondering. The difference looks small. It decides whether the last thirty minutes are spent with you or near you.",
      cost: "Three minutes.",
      alternative: "Let a pupil pick the size of the test case, even if they pick an awkward number."
    },

    CH2_NM_1: {
      principle: "C2-002",
      verdict: "good",
      title: "Not memory — responsibility",
      why: "Dilnoza asked a technical question and you answered a moral one: names are not about recall, they are about using them correctly. And 'one fact I can hold on to' turned you from a performer into a listener. They introduced themselves; you wrote. The lesson did not stop, it continued in a different direction.",
      cost: "Ten to fifteen seconds per pupil, three minutes for the class.",
      alternative: "If time is short, take the names now and collect facts by watching during the lesson."
    },

    CH2_NM_2: {
      principle: "C2-004",
      verdict: "good",
      title: "One size fits one, applied to the loudest boy",
      why: "You answered Dilnoza but spoke to Jasur, because he was the actual test. You gave him his name and his own joke back, with one condition. That is one-size-fits-one in practice: the same move, cut to the person in front of you.",
      cost: "Two sentences in front of the room.",
      alternative: "If the joke is too sharp to name, describe the role instead: 'you are the one who decides what the room sounds like'."
    },

    CH2_NM_3: {
      principle: "C2-008",
      verdict: "ok",
      title: "Honest, but it is a target not a move",
      why: "Six today, six tomorrow — true, and honest is always worth something. But the difference between 'I know' and 'I want to know' is small in words and large in rooms. Pupils watch what you do, not what you set out.",
      cost: "Ten seconds.",
      alternative: "Fix tomorrow to a name: 'tomorrow I will know Sardor and Kamola too'."
    },

    CH2_GF_1: {
      principle: "C2-006",
      verdict: "good",
      title: "The promise was kept out of your own pocket",
      why: "You kept the promise and absorbed the cost yourself — and, crucially, did not say so. They saw the gift; they did not see the sacrifice. A promise is only worth anything if the giver is dependable while it is inconvenient, and mentioning the inconvenience spends the gain.",
      cost: "One of your own pens.",
      alternative: "If it is not the first lesson, still do not narrate it. The room is trusted."
    },

    CH2_GF_2: {
      principle: "C2-006",
      verdict: "bad",
      title: "First promise, first hour, first failure",
      why: "You saved one gift and lost the promise. On the first day, at the first opportunity. Rafe Esquith is blunt: promising a reward is already a problem, but the unforgivable version is breaking it — that is the thing that sours children on school and adults in general, not on you specifically.",
      cost: "It cannot be bought back with forty minutes.",
      alternative: "Give something else immediately, name the failure, and keep the next one without being asked."
    },

    CH2_GF_3: {
      principle: "C2-004",
      verdict: "good",
      title: "Two promises kept at once",
      why: "Nafisa earned her gift; Bekzod had no notebook. You honoured both, and when someone asked 'why him?' the answer was visible without a lecture. One size fits one is not a slogan here — it is the observation that the same gift to the wrong person is worse than no gift.",
      cost: "One gift and one sentence.",
      alternative: "If you only have one thing, give it to the earned answer and fix Bekzod tomorrow — but fix it tomorrow."
    },

    CH2_WZR_1: {
      principle: "C2-003",
      verdict: "good",
      title: "Name the leadership instead of taking it",
      why: "Telling a child that you noticed they lead is not flattery, it is accuracy — and it is safer than the alternative, which is getting into a quiet contest with her. She asked a hard question and got a straight answer.",
      cost: "Two minutes at the door.",
      alternative: "If she does not ask, say it anyway. It costs one sentence."
    },

    CH2_WZR_2: {
      principle: "C2-008",
      verdict: "ok",
      title: "A promise about the next lesson instead of this one",
      why: "'Next time I will explain more' is honest and understandable, but it does not answer 'why were you silent'. Leaders notice a question being redirected, and they decide something when they notice.",
      cost: "One minute.",
      alternative: "Answer the question that was asked, even briefly, before promising anything."
    },

    CH2_WD_1: {
      principle: "C2-004",
      verdict: "good",
      title: "Reward the nerve, not the answer",
      why: "You did not ask whether she was right; you told her that a wrong answer gave with courage is the achievement. Most teachers praise correct answers and are left with children who already had confidence. This is one size fits one — for the girl who needs permission far more than a tick.",
      cost: "Two minutes, and someone in the room heard it.",
      alternative: "If it is wrong, fix it in front of the room, so courage is seen to be paid, not punished."
    },

    CH2_WD_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "The reasonable answer closed her",
      why: "'If you are sure, say it' sounds supportive and puts the risk back on the thirteen-year-old. She had already told you she was not sure; that was the courage. You answered it with a condition.",
      cost: "She will not open like that again this term.",
      alternative: "'Say it. I will take the hit if it is wrong — I am the one who asked.'"
    },

    CH2_WJ_1: {
      principle: "C2-004",
      verdict: "good",
      title: "Do not punish the test, and do not call it a joke",
      why: "He asked whether you were upset; the honest answer was no, with a reason — you had read the register twice. That neither humiliates him nor pretends the block was fine. The cheapest form of respect is telling someone that they were understandable.",
      cost: "Twenty seconds.",
      alternative: "If he does not ask, an opening: 'you tested me. That was fair — I was new.'"
    },

    CH2_WJ_2: {
      principle: "C2-008",
      verdict: "ok",
      title: "Fair, and it closes the boy",
      why: "The rule is reasonable and will hold. But you answered the test with a verdict. He will behave and will not trust you, and the loss is the one thing you cannot set a rule about.",
      cost: "One clean lesson, one closed door.",
      alternative: "State the rule for tomorrow and leave the door open for today."
    },

    CH2_WN_1: {
      principle: "C2-005",
      verdict: "good",
      title: "Praise privately for the pupil who fears the room",
      why: "You gave the compliment where nobody could hear it. For a quiet pupil who is afraid of being wrong in public, public praise is a threat, not a reward. Specific and private is the same principle as specific and public, cut to the person.",
      cost: "Ten seconds.",
      alternative: "If others are listening, name the work and not the person."
    },

    CH2_WN_2: {
      principle: "C2-005",
      verdict: "weak",
      title: "The right words to the wrong person",
      why: "Good intention, wrong instrument. You praised her in front of the room and gave her a weight the other fourteen cannot see. The praise was correct and the audience was wrong.",
      cost: "It may cost you her hand for weeks.",
      alternative: "Praise the model, not the pupil: 'this answer works because it starts with a guess.'"
    },

    CH2_WB_1: {
      principle: "C2-004",
      verdict: "good",
      title: "Do not help him — join him",
      why: "You did not give the new boy support, you gave him a partnership. Help preserves rank; partnership burns it. For a pupil three weeks into a new school, being someone who can give a teacher three names is worth more than being the one who needs three names.",
      cost: "Two minutes and a promise you have to keep tomorrow.",
      alternative: "If you cannot promise tomorrow, promise something smaller and keep it."
    },

    CH2_WB_2: {
      principle: "C2-008",
      verdict: "weak",
      title: "A true sentence that did nothing",
      why: "'You will get used to it' is a sentence about time, not about this child. It is not unkind and it is not useful; he asked a person for something and received a forecast.",
      cost: "He left alone again.",
      alternative: "Ask one question you cannot answer: 'which lesson do you hate most so far?'"
    },

    CH2_WT_1: {
      principle: "C2-003",
      verdict: "good",
      title: "Repeat his first sentence back to him",
      why: "You remembered the only thing he told you and made it an invitation. That is the cheapest hospitality on the list — proving you heard someone — and it is the one that costs most, because remembering is work.",
      cost: "Thirty seconds, tomorrow at 8:30.",
      alternative: "If he says no, still be there. The point is that you said it."
    },

    CH2_WT_2: {
      principle: "C2-008",
      verdict: "ok",
      title: "Reasonable, and he will remember it",
      why: "'We will talk tomorrow' is polite and true and probably will not happen, because tomorrow has its own problems. He offered you his one trust and it was postponed, unaddressed.",
      cost: "One minute of politeness.",
      alternative: "Put a time in it. 'Tomorrow after second period, right here.'"
    },

    CH2_HK_4: {
      principle: "C2-004",
      verdict: "good",
      title: "You dropped your own plan for their question",
      why: "Dilnoza told you in the corridor that the class already had an unsolved problem from their last teacher. You put your own question away and used theirs. That is one-size-fits-one applied to a lesson plan: the room already had a question, and a teacher who insists on his own is serving the plan, not the people.",
      cost: "Your prepared hook, and some control over where the lesson goes.",
      alternative: "If their problem is too big for the time you have, take the first step of it and set the rest as the next lesson."
    },
    CH2_EX_3: {
      principle: "C2-007",
      verdict: "good",
      title: "You left their sentence on the board",
      why: "Writing a pupil's answer on the board and refusing to erase it makes the last minute belong to them rather than to you. Tomorrow's first sentence is the one a pupil said, not the one you prepared. The closing exchange is weighted more heavily than anything in the middle of the service.",
      cost: "Ten seconds and your board.",
      alternative: "If you must clear it, photograph it and put it back up tomorrow."
    },
    CH2_EX_1: {
      principle: "C2-007",
      verdict: "good",
      title: "You waited, and the room spoke",
      why: "Ten uncomfortable seconds bought the most valuable section of the lesson: Bekzod, who had been silent all day, said the answer and Zarina said it was theirs, not yours. The closing minute is weighted more heavily than the middle of the service, and you did not spend it on your own summary.",
      cost: "Ten seconds of silence you had to hold.",
      alternative: "If nobody speaks, ask a smaller question rather than closing it yourself."
    },

    CH2_EX_2: {
      principle: "C2-007",
      verdict: "weak",
      title: "The right summary, delivered by the wrong person",
      why: "Your summary was accurate and became what they left with. That is the problem: the only part of a lesson a pupil rehearses is the ending, and they rehearsed yours instead of their own.",
      cost: "One minute of clean, comfortable teaching.",
      alternative: "Keep the summary, but make them say it first, even badly."
    },

    CH2_MG_NINETY_WIN: {
      principle: "C2-001",
      verdict: "good",
      title: "Warm and ordered at the same time",
      why: "The door-greeting package exists to do exactly this: greet each pupil by name, say the correction before the disruption, have the work already waiting. None of it is impressive. The measured effect on engaged time in the randomised trial is what is impressive.",
      cost: "Ninety seconds.",
      alternative: "If you only have one of these, take the greet-by-name."
    },

    CH2_MG_NINETY_LOSE: {
      principle: "C2-001",
      verdict: "weak",
      title: "You lost one of the two axes",
      why: "Warmth without order ends in chaos; order without warmth ends in compliance. A first impression is not a speech, it is a combination — and it is nearly impossible to correct once the room has decided.",
      cost: "The rest of the lesson carrying it.",
      alternative: "Recover one axis deliberately: choose order now, warmth at the exit."
    },

    CH2_MG_NAMES_WIN: {
      principle: "C2-003",
      verdict: "good",
      title: "Divided attention, not scattered attention",
      why: "Fourteen pupils, six cards. You cannot remember fourteen, so you chose which six to actually use. Divided attention is honest and it works: the pupil who was seen values it more than the ones who were counted.",
      cost: "Six cards.",
      alternative: "Write the six facts down. Memory is not the point; using them tomorrow is."
    },

    CH2_MG_NAMES_LOSE: {
      principle: "C2-004",
      verdict: "weak",
      title: "Guessing at fourteen people",
      why: "You tried the same fact on the wrong person. That is not a small error: one size fits one is the observation that the same gift, or the same sentence, becomes an insult when it is delivered to someone it does not fit. Admitting the error is worth more than the error costs.",
      cost: "Two wrong facts to undo.",
      alternative: "Use fewer pupils, but use them correctly."
    },

    CH2_MG_GIFT_BEST: {
      principle: "C2-004",
      verdict: "good",
      title: "The right thing to the right person",
      why: "Nothing about the gifts was expensive. The whole point is that they were fitted to the people — the boy without a notebook gets the notebook, the girl who has done every problem gets the pencil, the boy who eats alone gets something to give away.",
      cost: "Six cheap items.",
      alternative: "If you only have one, give it to the pupil nobody else would choose."
    },

    CH2_MG_GIFT_OK: {
      principle: "C2-004",
      verdict: "ok",
      title: "Mostly fitted",
      why: "Some pairs were right and some were a guess. Fitted gifts teach the room that you are paying attention; guessed gifts teach them you are being kind at random. Both feel good to give and only one of them is remembered.",
      cost: "One or two pairs you cannot defend.",
      alternative: "Keep one gift back for tomorrow, when you know more."
    },

    CH2_MG_GIFT_WRONG: {
      principle: "C2-004",
      verdict: "weak",
      title: "A gift, and a question",
      why: "A gift to the wrong person is not generous, it is confusing: the pupil asks 'why me?' and you have no answer, because there was no reason. The gift was real; the attention behind it was not.",
      cost: "The gifts you gave, and the doubt.",
      alternative: "Name the mistake out loud. That is the only thing that converts it into teaching."
    },
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
