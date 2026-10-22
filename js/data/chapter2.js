/* ============================================================================
   IKKINCHI BOB — "Birinchi dars: 5-B"   (recreated)
   Sulton School. Azizbek's first ever lesson, 8:52 to 9:45.

   WHAT CHANGED AND WHY
     The first version rushed. He walked in, called two names, and was handing
     out exercises before the room knew who he was. The lesson started at
     minute one and never earned the right to.

     This version spends the first half of the lesson on the things a real
     teacher does before formal work: he sets the room up, he introduces
     himself, he shows why the subject is worth an hour of their life, he
     learns one true thing about each of them, and he tells them what the
     lesson is worth to them. Exercises come last, and only one.

   THE SHAPE OF THE STORY (bad start, clever turn, rise)
     bad beginning   the corridor is chaos; the door is blocked; the room
                     has already decided he is a supply teacher
     the turn        he does not fight the room. He writes one question on the
                     board and refuses to answer it. The room starts arguing
                     with itself.
     the rise        names, one fact per pupil, a promise, and a shortage that
                     makes keeping the promise cost him something
     the close       they say what they learned, not him

   THE EVIDENCE (see _ch2-research/class-turnarounds.md)
     The moves are not invented. The door greeting by name, the structured
     task already waiting, the pre-corrective sentence and behaviour-specific
     praise are the "Positive Greetings at the Door" package (Cook et al.,
     2018, Journal of Positive Behavior Interventions 20(3), 149-159 — a
     randomised trial on classes chosen BECAUSE they were disruptive:
     engaged time 58.75% -> 79.70%, disruption 13.68% -> 4.13%).
     The one-question-no-method hook is Dan Meyer's "ask the shortest question
     you possibly can ... and finally, in total, just be less helpful" (TED,
     Math Curriculum Makeover). The index-card beat is Marcus Luther's
     five-question card (Edutopia). The promise/cost beat is Rafe Esquith,
     *Teach Like Your Hair's on Fire*: promising a reward is already a
     problem, but the unforgivable version is breaking the promise.
     NOTE HONESTLY: no documented case exists of a class turning around in one
     45-minute lesson. What is documented is a sequence of small cheap moves
     compounding. This chapter stages the sequence, not a miracle.

   THE TEACHING (book: Will Guidara, *Unreasonable Hospitality*, 2022)
     C2-001 the verdict is reached before you speak
     C2-002 a name is the smallest unit of hospitality
     C2-003 somebody's job is to notice
     C2-004 one size fits one          (Richard Coraine's phrase, quoted by Guidara)
     C2-005 specific beats generic
     C2-006 the gesture nobody asked for
     C2-007 the last minute is the impression they keep
     C2-008 the enemy is "reasonable"

   Beats:
     before -> door -> open -> intro -> hook -> names -> gift -> wobble
            -> exit -> done
   ============================================================================ */
window.G = window.G || {};
G.data = G.data || {};

(function () {
  var P = {
    FIRST: "C2-001",
    NAME: "C2-002",
    NOTICE: "C2-003",
    ONE: "C2-004",
    SPECIFIC: "C2-005",
    GESTURE: "C2-006",
    LAST: "C2-007",
    REASONABLE: "C2-008"
  };

  G.data.chapter2 = {
    id: "ch2",
    title: "Birinchi dars: 5-B",
    subtitle: "Sulton School — 8:52, qirq besh daqiqa",
    startZone: "corridor",
    startAnchor: 0,
    opening: "intro",

    brief: [
      "5-B. O'n to'rt begona. Qirq besh daqiqa.",
      "Sizda bitta guvohnoma bor — Buxoro viloyati olimpiadasi.",
      "Uni ko'rsatish oson. Ishlatmaslik qiyin."
    ],

    npcs: [
      {
        id: "pupil_zarina", name: "Zarina", role: "5-B o'quvchisi",
        zone: "classroom", at: 5, palette: "teacher_female", facing: "down",
        entry: { default: "zarina_default", hook: "hook_start", wobble: "wob_zarina" }
      },
      {
        id: "pupil_dilnoza", name: "Dilnoza", role: "5-B o'quvchisi",
        zone: "classroom", at: 2, palette: "adult_female", facing: "down",
        entry: { default: "dilnoza_default", names: "names_start", wobble: "wob_dilnoza" }
      },
      {
        id: "pupil_jasur", name: "Jasur", role: "5-B o'quvchisi",
        zone: "classroom", at: 4, palette: "boy", facing: "down",
        entry: { default: "jasur_default", intro: "intro_start", wobble: "wob_jasur" }
      },
      {
        id: "pupil_nafisa", name: "Nafisa", role: "5-B o'quvchisi",
        zone: "classroom", at: 1, palette: "mother", facing: "down",
        entry: { default: "nafisa_default", wobble: "wob_nafisa" }
      },
      {
        id: "pupil_bekzod", name: "Bekzod", role: "5-B o'quvchisi — yangi kelgan",
        zone: "classroom", at: 0, palette: "teacher_male", facing: "down",
        entry: { default: "bekzod_default", gift: "gift_start", wobble: "wob_bekzod" }
      },
      {
        id: "pupil_timur", name: "Timur", role: "5-B o'quvchisi",
        zone: "classroom", at: 3, palette: "boy", facing: "down",
        entry: { default: "timur_default", wobble: "wob_timur" }
      }
    ],

    triggers: [
      { zone: "classroom", beat: "door", scene: "door", once: true },
      { zone: "classroom", beat: "open", scene: "ninety_start", once: true },
      { zone: "classroom", beat: "intro", scene: "intro_start", once: true },
      { zone: "classroom", beat: "hook", scene: "hook_start", once: true },
      { zone: "classroom", beat: "names", scene: "names_start", once: true },
      { zone: "classroom", beat: "gift", scene: "gift_start", once: true },
      { zone: "classroom", beat: "wobble", scene: "wobble_start", once: true },
      { zone: "corridor", beat: "exit", scene: "exit_start", once: true }
    ],

    objectives: {
      before: "Koridorda: ikki daqiqa",
      door: "Eshikni oching",
      open: "Birinchi 90 soniya",
      intro: "O'zingizni tanishtiring",
      hook: "Bitta savol, javobsiz",
      names: "Ismlar: Dilnoza savol bermoqda",
      gift: "Bekzodning yirtilgan varag'i",
      wobble: "Kimning oldiga borasiz?",
      exit: "Koridorga chiqing",
      done: "Birinchi dars tugadi"
    },

    scenes: {

      /* ======================================================================
         BEFORE THE BELL — corridor, 8:52. You are on stage before you speak.
         ====================================================================== */
      intro: {
        start: "in_1",
        nodes: {
          in_1: {
            type: "say", speaker: "",
            text: "8:52. Koridor. Devorda «5-B» yozuvi, eshik yopiq, ichkaridan stullar shovqini. Yonida o'n to'rt bola — hali saf tortmagan, hali jim emas.",
            effects: [{ beat: "before" }],
            next: "in_2"
          },
          in_2: {
            type: "say", speaker: "",
            text: "Biri devorga suyanib non yemoqda. Ikkitasi bitta telefonga egilgan va kula boshlashdi. Bir qiz to'rt kishiga nimadir tushuntirmoqda — va ular jim tinglab turishibdi.",
            next: "in_3"
          },
          in_3: {
            type: "say", speaker: "",
            text: "Orqaroqda bitta bola yakka turadi. Ikki qadam narida — go'yo o'zi shu masofani tanlagan. Qo'lida daftar yo'q.",
            next: "in_4"
          },
          in_4: {
            type: "say", speaker: "",
            text: "Qo'lingizda jurnal. O'n to'rt ism, hech qanday yuz. Ikki daqiqangiz bor — va bu ikki daqiqa hikoyaga kiradi.",
            next: "in_q"
          },
          in_q: {
            type: "multi",
            prompt: "Ikki daqiqada nimani o'rganasiz?",
            max: 2,
            next: "in_after",
            options: [
              {
                id: "CH2_Q_DILNOZA",
                text: "Tushuntirayotgan qizdan so'rang: nima ustida ishlayapsizlar?",
                intel: "intel_dilnoza_explains",
                next: "in_a_dilnoza"
              },
              {
                id: "CH2_Q_TIMUR",
                text: "Non yeb turgan boladan so'rang: oshxona qayerda?",
                intel: "intel_timur_bread",
                next: "in_a_timur"
              },
              {
                id: "CH2_Q_BEKZOD",
                text: "Yakka turgan bolaning oldiga boring.",
                intel: "intel_bekzod_new",
                next: "in_a_bekzod"
              },
              {
                id: "CH2_Q_LISTEN",
                text: "Hech narsa so'ramang. Telefonga egilganlarni tinglang.",
                intel: "intel_jasur_joke",
                next: "in_a_listen"
              }
            ]
          },
          in_a_dilnoza: {
            type: "say", speaker: "Dilnoza",
            text: "Bitta misol ustida. Ustozimiz bergan edi — «kim topa olsa, doskaga chiqadi». Biz hali topolmadik.",
            next: "in_a_dilnoza2"
          },
          in_a_dilnoza2: {
            type: "say", speaker: "",
            text: "U to'rt kishiga tushuntiryapti — hali o'zi topmagan misolni. Buni qanday qilib bilasiz: u hech narsani yashirmaydi. U tushuntirishni yaxshi ko'radi.",
            next: "in_q"
          },
          in_a_timur: {
            type: "say", speaker: "Timur",
            text: "Oshxonada non har doim bor. Faqat katta tanaffusda. Men erta kelaman — shuning uchun hozir yeyapman.",
            next: "in_a_timur2"
          },
          in_a_timur2: {
            type: "say", speaker: "",
            text: "U kulib javob berdi va darhol devorga qaytdi. Erta keladi. Oshxonaga yolg'iz boradi. Buni yodda tuting.",
            next: "in_q"
          },
          in_a_bekzod: {
            type: "say", speaker: "Bekzod",
            text: "Men yangi kelganman. Uch hafta oldin. Boshqa maktabdan.",
            next: "in_a_bekzod2"
          },
          in_a_bekzod2: {
            type: "say", speaker: "",
            text: "U javob berdi — va gapirayotganda sizga emas, o'z qo'llariga qaradi. Qo'lida daftar yo'q, faqat yirtilgan bitta varaq. Ustida juda tartibli yozuv.",
            next: "in_q"
          },
          in_a_listen: {
            type: "say", speaker: "Jasur",
            text: "Ana, yangi o'qituvchi. Yaxshi bo'ldi — bugun matematika bo'lmaydi.",
            next: "in_a_listen2"
          },
          in_a_listen2: {
            type: "say", speaker: "",
            text: "Kimdir kuldi. Kimdir «jim bo'l» dedi. Jasur eng baland ovoz — lekin kulganlar unga qarab kuldi, u bilan emas. Farqni sezasiz.",
            next: "in_q"
          },
          in_after: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. Ular eshikka qarab burilishdi. Ikki daqiqa tugadi.",
            effects: [
              { beat: "door" },
              { journal: "Eshik oldida turib, o'n to'rt begona haqida bir-ikki narsa bilib oldim." }
            ],
            next: "in_after2"
          },
          in_after2: { type: "end" }
        }
      },

      /* ======================================================================
         DOOR — Jasur blocks it. The room has already decided.
         ====================================================================== */
      door: {
        start: "dr_1",
        nodes: {
          dr_1: {
            type: "say", speaker: "",
            text: "Eshikni ochdingiz. Jasur yo'lni to'sib turibdi — qo'llarini cho'ntagiga tiqib, orqasi bilan eshikka suyanib. Sinf ichida besh kishi kuldi.",
            next: "dr_2"
          },
          dr_2: {
            type: "say", speaker: "Jasur",
            text: "Ustoz, siz bugun qaysi sinfga? Bizda matematika bor. Siz matematikamisiz?",
            next: "dr_3"
          },
          dr_3: {
            type: "say", speaker: "",
            text: "Bu savol emas. Bu sinov. Uning ortida butun sinfning o'sha bugungi hukmi turibdi: hali hech nima qilmaganingiz uchun ular allaqachon bir narsani hal qilishgan.",
            next: "dr_q"
          },
          dr_q: {
            type: "choice",
            prompt: "Jasurni qanday chetga o'tkazasiz?",
            options: [
              {
                id: "CH2_DR_1",
                text: "«Ha, matematikaman. Ismim Azizbek. Sen Jasur bo'lsan shekilli — jurnalda sendan keyingi ismni ikki marta o'qib qoldim.»",
                next: "dr_r1",
                effects: [
                  { note: { principle: P.NAME, verdict: "good", text: "Ismni qurol sifatida ishlatmadingiz — tanishtirdingiz. Va uni birinchi bo'lib o'z ismi bilan chaqirdingiz. Bu hokimiyatni ko'rsatish emas, eshikni ochish." } },
                  { intel: "intel_jasur_joke" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_DR_2",
                text: "«Matematika. Endi o'tiring, vaqt ketmoqda.»",
                next: "dr_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "To'g'ri javob, va u ishlaydi — Jasur o'tiradi. Lekin siz nima qilganingizni bilasiz: birinchi jumlangiz «vaqt ketmoqda» bo'ldi. Ular eshitdi." } },
                  { flag: "c2_door_cold" }
                ]
              },
              {
                id: "CH2_DR_3",
                text: "Hech narsa demaysiz. Uning yonidan o'tib, doskaga borasiz va bo'r olasiz.",
                next: "dr_r3",
                effects: [
                  { note: { principle: P.FIRST, verdict: "ok", text: "Bu ham javob: hokimiyatni baholashsiz ko'rsatish. Sinf jim bo'ladi. Lekin jimlik hurmat emas — u hali faqat kutish." } }
                ]
              }
            ]
          },
          dr_r1: {
            type: "say", speaker: "",
            text: "Jasur bir soniya qotib qoldi. Keyin chetga surildi — sekin, o'z ixtiyori bilan. Kimdir «voy» dedi. Kimdir kuldi, va bu safar u bilan.",
            next: "dr_r1b"
          },
          dr_r1b: {
            type: "say", speaker: "",
            text: "Bir ism. Bir soniya. Lekin o'n to'rt bola bitta gapni ko'rdi: bu odam ularni birinchi daqiqada ko'radi. Va ular hali birorta misol ko'rmadi.",
            next: "dr_r1c"
          },
          dr_r1c: {
            type: "say", speaker: "",
            text: "Eshik yopildi. O'n to'rt juft ko'z. Sizda to'qson soniya bor — va bu to'qson soniya butun yilni belgilaydi.",
            effects: [{ beat: "open" }, { intel: "intel_named_two" }],
            next: "dr_r1d"
          },
          dr_r1d: {
            type: "say", speaker: "",
            text: "Telefon emas, daftar emas, reja emas. Hozir faqat siz va ular. Uchta harakatga joy bor — uchtadan ko'p emas.",
            next: "dr_r1e"
          },
          dr_r1e: { type: "end" },

          dr_r2: {
            type: "say", speaker: "",
            text: "Ular o'tirishdi. Eshikdan kirgan odam ular uchun hali hech kim emas — bir jumla: «o'qituvchi keldi». Bu jumla to'g'ri. Faqat juda kam.",
            next: "dr_r2b"
          },
          dr_r2b: {
            type: "say", speaker: "",
            text: "Eshik yopildi. O'n to'rt juft ko'z. To'qson soniya boshlandi — va siz uni noldan boshladingiz.",
            effects: [{ beat: "open" }, { intel: "intel_named_two" }],
            next: "dr_r2c"
          },
          dr_r2c: { type: "end" },

          dr_r3: {
            type: "say", speaker: "",
            text: "Ular kirib o'tishdi. Kimdir «rahmat» dedi. Kimdir hech narsa demadi. Siz hali bir og'iz ham gapirmadingiz — va bu jimlik endi sizning birinchi gapingiz.",
            next: "dr_r3b"
          },
          dr_r3b: {
            type: "say", speaker: "",
            text: "Eshik yopildi. O'n to'rt juft ko'z. To'qson soniya boshlandi.",
            effects: [{ beat: "open" }, { intel: "intel_named_two" }],
            next: "dr_r3c"
          },
          dr_r3c: { type: "end" }
        }
      },

      /* ======================================================================
         THE FIRST NINETY SECONDS — minigame firstNinety.
         The five components of the door-greeting package, as playable moves.
         ====================================================================== */
      ninety_start: {
        start: "ns_1",
        nodes: {
          ns_1: {
            type: "say", speaker: "",
            text: "Doskada bo'r bilan yozilgan bitta savol turibdi. Siz uni darsdan oldin yozib kelgansiz — chunki birinchi vazifa tushuntirish talab qilmasligi kerak.",
            next: "ns_2"
          },
          ns_2: {
            type: "minigame",
            game: "firstNinety",
            config: {},
            onWin: "ns_win",
            onLose: "ns_lose"
          },
          ns_win: {
            type: "say", speaker: "",
            text: "Sinf o'rniga o'tirdi. Kimdir sizga qarab kulimsirab qo'ydi — o'zi ham kutmagan holda. Xona ham iliq, ham tartibli; bu kombinatsiya tasodifan chiqmaydi.",
            effects: [
              { note: { principle: P.FIRST, verdict: "good", text: "Birinchi to'qson soniya ishladi. Iliqlik tartibsizlikka, tartib esa sovuqlikka oson aylanadi — siz ikkalasini birga ushlab turdingiz. Bu hali dars emas. Bu darsga ruxsat." } },
              { trust: 1 },
              { flag: "c2_room_warm" }
            ],
            next: "ns_win2"
          },
          ns_win2: {
            type: "say", speaker: "",
            text: "Zarina qo'lini stol ustidan oldi. Jasur gapirayotgan edi — to'xtadi. Bu hali hurmat emas. Lekin uning boshlanishi.",
            next: "ns_win3"
          },
          ns_win3: {
            type: "say", speaker: "",
            text: "Endi eng qiyin qismi. Ular sizni tinglashga tayyor — va sizda qirq daqiqa bor. Tinglashga tayyor xonani yo'qotish oson: bitta noto'g'ri jumla yetadi.",
            effects: [{ beat: "intro" }],
            next: "ns_win4"
          },
          ns_win4: { type: "end" },

          ns_lose: {
            type: "say", speaker: "",
            text: "Sinf jim — lekin noto'g'ri jimlik. O'qituvchi gapiradi, sinf kutadi: hali nima bo'lishini bilmaydi.",
            effects: [
              { note: { principle: P.FIRST, verdict: "weak", text: "Birinchi taassurot siz o'ylagandan boshqacha chiqdi. Ular hukm qildi — va hukm hali ochiq. Yaxshi xabar: birinchi taassurotni qirq daqiqada tuzatish mumkin, agar uni tan olsangiz." } },
              { flag: "c2_room_cold" }
            ],
            next: "ns_lose2"
          },
          ns_lose2: {
            type: "say", speaker: "",
            text: "Bitta qiz qo'lini ko'tardi. «Ustoz, biz sizni tanimaymiz», dedi. Bu tanqid emas — taklif. U sizga tuzatish imkonini berdi.",
            next: "ns_lose3"
          },
          ns_lose3: {
            type: "end",
            effects: [
              { journal: "Birinchi to'qson soniya o'ylaganimdek chiqmadi. Dilnoza buni yuzimga aytdi — va bu sovg'a." },
              { beat: "intro" }
            ]
          }
        }
      },

      /* ======================================================================
         INTRO — he introduces himself. The certificate is the temptation.
         ====================================================================== */
      intro_start: {
        start: "is_1",
        nodes: {
          is_1: {
            type: "say", speaker: "",
            text: "O'n to'rt juft ko'z. Siz hali bir og'iz gapirmadingiz. Doskada savol turibdi, lekin hozir savol haqida gapirish — qochish bo'ladi. Avval siz kimligingizni aytishingiz kerak.",
            effects: [{ beat: "intro" }],
            next: "is_2"
          },
          is_2: {
            type: "say", speaker: "Jasur",
            text: "Ustoz, sizni tanimaymiz. Qayerdan kelgansiz?",
            next: "is_3"
          },
          is_3: {
            type: "say", speaker: "",
            text: "O'n to'rt bola bir xil narsani kutmoqda: siz o'zingizni qanday sotishingizni. Va sizda sotadigan narsa bor — Buxoro viloyati olimpiadasi guvohnomasi. U o'nta so'zda gapirishi mumkin.",
            next: "is_q"
          },
          is_q: {
            type: "choice",
            prompt: "O'zingizni qanday tanishtirasiz?",
            options: [
              {
                id: "CH2_IN_1",
                text: "Ismingizni aytib, bitta rost gap qo'shasiz: «Madrasada o'qiganman. U yerda biz ko'p narsani yoddan bilardik — lekin sababini keyin tushunardik. Men ham xuddi shunday boshlaganman.»",
                next: "is_r1",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz o'zingiz haqingizda gapirdingiz — lekin maqtov emas, yo'l aytdingiz. «Men ham shunday boshlaganman» degan gap o'n to'rt bolaga eshikni ochdi: ular ham shu yerda boshlashlari mumkin." } },
                  { intel: "intel_madrasa" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_IN_2",
                text: "Guvohnomani ko'tarasiz: «Buxoro viloyati olimpiadasi. To'qqizinchi sinfda. Men bu maktabda matematikani eng yuqori darajada o'qitaman.»",
                next: "is_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Bu ishlaydi. Sinf hurmat qiladi, kimdir qo'l urishga tayyor. Lekin siz hozir o'n to'rt bolaga bitta gap aytdingiz: eng muhimi — siz kimsiz. Ular tanildi, deb o'ylamadi." } },
                  { flag: "c2_intro_boast" }
                ]
              },
              {
                id: "CH2_IN_3",
                text: "«Ismim Azizbek. Bu yil sizga matematikadan dars beraman.» — va darhol doskadagi savolga o'tasiz.",
                next: "is_r3",
                effects: [
                  { note: { principle: P.FIRST, verdict: "ok", text: "Qisqa, aniq, hurmatli. Lekin birinchi savolingizga javob bermadingiz: «qayerdan kelgansiz». Ular sizdan fakt emas, odam kutgan edi." } },
                  { flag: "c2_intro_short" }
                ]
              }
            ]
          },
          is_r1: {
            type: "say", speaker: "",
            text: "Kimdir boshini ko'tardi. Daqiqada bir marta bo'ladigan narsa yuz berdi: sinf sizni odam sifatida ko'rdi. Madrasa eslatildi va bu hech kimni qo'rqitmadi — uni yutuq sifatida emas, fakt sifatida aytdingiz.",
            next: "is_r1b"
          },
          is_r1b: {
            type: "say", speaker: "Zarina",
            text: "Ustoz, u yerda o'qituvchi sizni tanirdimi? Ismingiz bilan?",
            next: "is_r1c"
          },
          is_r1c: {
            type: "say", speaker: "",
            text: "Bu savol oson emas. U sinfning eng sezgir qizidan kelmoqda va u bir narsani sinab ko'rmoqda: bu odam o'z o'quvchilarini tanidimi, yoki faqat o'zini ko'rsatdimi.",
            next: "is_r1d"
          },
          is_r1d: {
            type: "say", speaker: "",
            text: "«Ha», deb javob berasiz. «Va men shu narsani bugun siz bilan qilaman.» O'n to'rt bola bir gapni eshitdi — keyingi qirq daqiqada nima bo'lishini.",
            next: "is_why_1"
          },

          is_why_1: {
            type: "say", speaker: "",
            text: "Endi eng muhim gap. Ular kutmoqda: «nega matematika?» Bu savolga formulalar bilan javob berish — eng oson va eng foydasiz yo'l. Siz boshqacha boshlaysiz.",
            next: "is_why_2"
          },
          is_why_2: {
            type: "say", speaker: "",
            text: "«Matematika raqamlar haqida emas», deysiz. «U tekshirish usuli. Kimdir «shunday» desa — sizda uni tekshirish imkoni bo'ladi. Hayotda bu har kuni kerak: xarid qilganda, bahslashganda, qaror qabul qilganda.»",
            next: "is_why_3"
          },
          is_why_3: {
            type: "say", speaker: "Jasur",
            text: "«Ya'ni biz bu yerda bahslashishni o'rganamizmi?» — «Ha. Faqat bir qoida bilan: kim haq bo'lsa, o'sha yutadi. Ovoz balandligi hisobga olinmaydi.» Jasur atrofga qaradi. Kimdir kuldi.",
            next: "is_why_4"
          },
          is_why_4: {
            type: "say", speaker: "",
            text: "«Va bu qiziqarli», deysiz, «chunki bir marta ko'rgan naqshni boshqa joyda ko'rasiz. Bugun bitta narsani sanaymiz — ertaga shu usul bilan boshqa narsani sanaysiz.» Sinf jim. Nafisa qo'lini sekin ko'tardi.",
            effects: [
              { note: { principle: P.FIRST, verdict: "good", text: "Siz darsni «nega bu kerak» degan savol bilan ochdingiz — va javobni formulada emas, foydasida berdingiz: tekshirish usuli, bahslashish qoidasi. O'quvchi fanni yoddan emas, sababdan boshlab oladi." } },
              { intel: "intel_math_why" },
              { trust: 1 }
            ],
            next: "is_why_5"
          },
          is_why_5: {
            type: "say", speaker: "",
            text: "Nafisa: «Ustoz, demak matematika — bu to'g'ri javobni topish emas, to'g'ri ekanini isbotlash?» Siz bosh irgasiz. U o'zi uchun eng qiyin savolni o'zi aytdi. Va bu gapni butun sinf eshitdi.",
            effects: [{ beat: "hook" }],
            next: "is_why_6"
          },
          is_why_6: { type: "end" },

          is_r2: {
            type: "say", speaker: "",
            text: "Sinf hurmat bilan jim bo'ldi. Kimdir qo'l urishga tayyor edi — Jasur to'xtatdi. Guvohnoma ishladi. Lekin xona sovuqroq bo'ldi: endi siz raqobatchisiz, va raqobatchi bilan gaplashish qiyin.",
            next: "is_r2b"
          },
          is_r2b: {
            type: "say", speaker: "",
            text: "Zarina yelkasini qisib qo'ydi. U sizni tanimaydi — u faqat guvohnomani taniydi. Bu ham boshlanish, lekin siz uni tanlagansiz.",
            next: "is_why_1"
          },

          is_r3: {
            type: "say", speaker: "",
            text: "Ular kutdi — siz davom etasiz deb o'ylashdi. Siz davom etmadingiz. Jimlik cho'zildi va u sizning foydangizga ishladi: sinf diqqatini doskadagi savolga qaratdi.",
            next: "is_why_1"
          },
        }
      },

      /* ======================================================================
         HOOK — one question, no method. The room argues.
         ====================================================================== */
      hook_start: {
        start: "hk_1",
        nodes: {
          hk_1: {
            type: "say", speaker: "",
            text: "Doskada bitta savol: «Sinfda 14 kishi bor. Har biri har biri bilan bir marta qo'l berib so'zlashadi. Jami nechta qo'l berish bo'ladi?» Boshqa hech narsa yozilmagan.",
            effects: [{ beat: "hook" }],
            next: "hk_2"
          },
          hk_2: {
            type: "say", speaker: "Jasur",
            text: "O'n to'rt. Har kim bittadan.",
            next: "hk_3"
          },
          hk_3: {
            type: "say", speaker: "Nafisa",
            text: "Ko'p. Bir odam o'n uchtasi bilan so'zlashadi.",
            next: "hk_4"
          },
          hk_4: {
            type: "say", speaker: "",
            text: "Ikki javob. Ikkalasi ham noto'g'ri, ikkalasi ham fikrlash. Sinf endi sizga qarab turibdi: endi nima qilasiz — aytasizmi yoki ularni qo'yib berasizmi.",
            next: "hk_q"
          },
          hk_q: {
            type: "choice",
            prompt: "Sinfni qanday yurgizasiz?",
            options: [
              {
                id: "CH2_HK_1",
                text: "«Taxminlaringizni ayting — men ismingiz bilan doskaga yozaman. Keyin tekshiramiz.»",
                next: "hk_r1",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz javobni bermadingiz — joy bo'shatdingiz. Ism bilan doskaga yozilgan taxmin ikki narsa qiladi: u odamni ko'radi va u odamni javobga bog'laydi. Endi ular o'z fikrlarini himoya qiladi." } },
                  { intel: "intel_zarina_leader" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_HK_2",
                text: "Darhol formulani aytasiz: «n(n-1)/2. O'n to'rt karra o'n uch, bo'lingan ikkiga. To'qson bir.»",
                next: "hk_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "To'g'ri javob. Va siz endi yagona odamsiz, kim biladi. Sinf jim bo'ldi — chunki endi gapirishning ma'nosi yo'q. Siz matematikani ko'rsatdingiz, qiziqishni o'chirdingiz." } },
                  { flag: "c2_hook_gave_answer" }
                ]
              },
              {
                id: "CH2_HK_4",
                text: "Doskani o'chirib, ularning o'z misolini yozasiz: «Dilnoza aytdiki, o'tgan ustoz bergan misolni hali hech kim topmagan. Ana shu misol bilan boshlaymiz.»",
                next: "hk_r4",
                requires: { intel: "intel_dilnoza_explains" },
                lockedText: "«Boshlaymiz. Lekin avval bitta savol — javobsiz.»",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz o'z misolingizni olib tashlab, ularning misolini oldingiz. Bu eng qimmat harakat: o'qituvchi o'z rejasidan voz kechdi, chunki sinfning allaqachon bir savoli bor edi. Bir o'lcham hammaga to'g'ri keladi — hatto dars rejasi ham." } },
                  { intel: "intel_rule_reason" },
                  { trust: 2 }
                ]
              },
              {
                id: "CH2_HK_3",
                text: "Uchtadan boshlaysiz: «Uch kishi bo'lsa nechta? Sanang-chi.»",
                next: "hk_r3",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Bu yaxshi harakat — kichik holatdan boshlash. Lekin siz hali ham javobni siz beryapsiz. Ular hisoblaydi, o'ylamaydi. Farqi kichik ko'rinadi; u butun darsni belgilaydi." } },
                  { intel: "intel_dilnoza_explains" }
                ]
              }
            ]
          },
          hk_r1: {
            type: "say", speaker: "",
            text: "Doskada ismlar paydo bo'ldi: Jasur — 14. Nafisa — 91. Zarina — 182. Bekzod jim o'tirdi, keyin sekin: «Men 91 ga ishonmayman. Lekin 14 ham emas.»",
            next: "hk_r1b"
          },
          hk_r1b: {
            type: "say", speaker: "",
            text: "Sinf kuldi. Kimdir «hisobla-chi» dedi. Va keyin o'n to'rt bola o'z-o'zidan hisoblay boshladi — ruxsat so'ramasdan. Siz hech narsa qilmadingiz. Bu eng yaxshi natija.",
            next: "hk_r1c"
          },
          hk_r1c: {
            type: "say", speaker: "",
            text: "Zarina qo'lni ko'tardi: «Uch kishi bilan sinab ko'rsak bo'ladimi?» Sinf unga qarab burildi — sizga emas. Ular endi bir-birlarini boshqarishni boshlashdi.",
            next: "hk_r1d"
          },
          hk_r1d: {
            type: "say", speaker: "",
            text: "Ular uch kishida uchtani, to'rt kishida oltitani topdi. Kimdir qonuniyatni ko'rdi va ovoz chiqarib aytdi — g'alaba qozongandek. Bu hali matematika emas edi. Lekin bu matematikani xohlagan payt edi.",
            effects: [
              { intel: "intel_rule_reason" },
              { trust: 1 },
              { beat: "names" }
            ],
            next: "hk_r1e"
          },
          hk_r1e: { type: "end" },

          hk_r2: {
            type: "say", speaker: "",
            text: "Sinf jim. Nafisa qo'lini tushirdi. Jasur orqasiga suyandi. Javob to'g'ri edi — va bu bilan hamma narsa tugadi. Bilmaganlar endi so'ramaydi, chunki biladigan odam bor.",
            effects: [
              { flag: "c2_hook_cold" },
              { beat: "names" }
            ],
            next: "hk_r2b"
          },
          hk_r2b: { type: "end" },

          hk_r4: {
            type: "say", speaker: "Dilnoza",
            text: "Dilnoza doskaga chiqib, o'sha misolni yozdi. U buni bir marta ko'rgan — o'tgan ustoz yozganini eslab qolgan. Sinf jim bo'ldi va bu safar jimlik boshqa jimlik edi.",
            next: "hk_r4b"
          },
          hk_r4b: {
            type: "say", speaker: "",
            text: "Ular endi o'z savollari ustida ishlashmoqda, sizning savolingiz ustida emas. Kimdir «buni hech kim topmagan» dedi — va bu gap xonada elektr kabi tarqaldi. Topishmagan misol — taklif, majburiyat emas.",
            next: "hk_r4c"
          },
          hk_r4c: {
            type: "say", speaker: "",
            text: "Bekzod qo'lini ko'tardi. Uch hafta ichida birinchi marta. «Men bir joyini ko'rdim», dedi. Sinf unga qaradi — va hech kim kulmadi.",
            effects: [
              { intel: "intel_bekzod_named" },
              { trust: 1 },
              { beat: "names" }
            ],
            next: "hk_r4d"
          },
          hk_r4d: { type: "end" },

          hk_r3: {
            type: "say", speaker: "",
            text: "Ular uch kishida uchtani topdi — oson. To'rt kishida beshtani topdi. Keyin siz to'xtadingiz va o'n to'rtga qaytdingiz. Ular hali ham hisoblamoqda, lekin endi sizning usulingiz bilan.",
            effects: [
              { flag: "c2_hook_guided" },
              { beat: "names" }
            ],
            next: "hk_r3b"
          },
          hk_r3b: { type: "end" }
        }
      },

      /* ======================================================================
         NAMES — Dilnoza tests you; then one fact per pupil (minigame cardRun).
         ====================================================================== */
      names_start: {
        start: "nm_1",
        nodes: {
          nm_1: {
            type: "say", speaker: "",
            text: "Jurnal ochildi. O'n to'rt ism. Siz ularni ovoz chiqarib o'qishingiz mumkin — bu davomat, bu xizmat, va bu to'g'ri.",
            effects: [{ beat: "names" }],
            next: "nm_2"
          },
          nm_2: {
            type: "say", speaker: "Dilnoza",
            text: "Ustoz, siz bizni bir kunda yodlay olasizmi? O'ttiz kishi bo'lsa-chi?",
            next: "nm_3"
          },
          nm_3: {
            type: "say", speaker: "",
            text: "Savol oddiy ko'rinadi. Aslida u boshqa narsani so'rayapti: men siz uchun ism bilan odammi, yoki ro'yxatdagi qatormi?",
            next: "nm_q"
          },
          nm_q: {
            type: "choice",
            prompt: "Dilnozaga nima deysiz?",
            options: [
              {
                id: "CH2_NM_1",
                text: "«Yodlash oson. Qiyini — noto'g'ri ishlatmaslik. Bir marta xato aytilgan ism odamni ko'rinmas qiladi. Shuning uchun bugun bittadan so'rayman: ismingizni ayting va bitta gap — men eslab qoladigan narsa.»",
                next: "nm_r1",
                effects: [
                  { note: { principle: P.NAME, verdict: "good", text: "Bu javob texnikani emas, mas'uliyatni tanladi. Ism — eng kichik mehmondo'stlik birligi: u hech narsa turmaydi va hamma narsani qiladi. Lekin noto'g'ri ishlatilgan ism yaxshilikni qaytarib oladi." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "«Bitta gap — men eslab qoladigan narsa» degan taklif sizni tinglovchiga aylantirdi. Endi ular o'zlarini tanishtirmoqda, siz esa yozib olmoqdasiz — hokimiyat bir zumda almashdi va dars boshlanmadi, davom etdi." } },
                  { trust: 1 },
                  { intel: "intel_names_method" }
                ]
              },
              {
                id: "CH2_NM_2",
                text: "«Jasurning hazillarini eshitdim. Sinfda eng baland ovoz — sen. Men buni yomon deb o'ylamayman. Faqat bir shart: hazil meni ham, o'rtoqlaringni ham kamsitmasin.»",
                next: "nm_r2",
                requires: { intel: "intel_jasur_joke" },
                lockedText: "«Albatta yodlayman. Men o'ttiz ismni bir kunda yodlay olaman.»",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz Dilnozaga emas, Jasurga javob berdingiz — va bu to'g'ri edi. Sinovni u boshlagan. Unga ismini va o'z hazilini qaytardingiz, lekin shart qo'ydingiz. Bu «bir o'lcham hammaga to'g'ri keladi» degan gapning teskarisi." } },
                  { intel: "intel_jasur_leader" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_NM_3",
                text: "«Bugun hammasini yodlay olmayman. Lekin bugun oltitasini bilib olaman — va ertaga yana oltitasini.»",
                next: "nm_r3",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Rost gap, va rost gap har doim yaxshi. Lekin u to'xtadi: «bilaman» — maqsad, «bilmoqchiman» — harakat. Bolalar maqsadni emas, harakatni ko'radilar." } },
                  { trust: 1 }
                ]
              }
            ]
          },
          nm_r1: {
            type: "say", speaker: "",
            text: "Dilnoza birinchi bo'ldi. «Dilnoza. Men uchtagacha sanashni yaxshi ko'raman, chunki hamma narsani uchga bo'lish mumkin.» Sinf kuldida — va bu safar kulgi yaxshi tomonga.",
            next: "nm_r1b"
          },
          nm_r2: {
            type: "say", speaker: "Jasur",
            text: "Jasur bir soniya qotib qoldi. Keyin kuldi — o'zi ham kutmagan holda. «Mayli, ustoz», dedi. «Sinfda eng baland ovoz menman. Lekin men hech kimni xafa qilmayman — shu shart.»",
            next: "nm_r2b"
          },
          nm_r2b: {
            type: "say", speaker: "",
            text: "Butun sinf eshitdi. Baland ovozli bola ochiq shart oldi — va bu shartni u qabul qildi, chunki uni so'ragan odam uni kamsitmadi. Bu sizga bir daqiqada nima bermadi: u sizni hali sinab ko'rmoqda.",
            next: "nm_r1b"
          },
          nm_r3: {
            type: "say", speaker: "",
            text: "«Ertaga yana oltitasini», deysiz. Dilnoza boshini chayqadi — u javobni qabul qildi, chunki u rost edi. Sinfda kimdir «ya'ni hammasini bilmaysizmi?» deb so'radi.",
            next: "nm_r3b"
          },
          nm_r3b: {
            type: "say", speaker: "",
            text: "«Bilmayman. Lekin bilishni boshladim — bugun oltitasini.» Bu gap sizni kuchsiz ko'rsatmaydi. U sizni odam qiladi, va o'n to'rt bola odamni kuzatadi.",
            next: "nm_r1b"
          },
          nm_r1b: {
            type: "say", speaker: "",
            text: "Keyingi olti kishi gapirdi. Kimdir akasini aytdi, kimdir futbolni, kimdir «men hech narsani yaxshi ko'rmayman» dedi — va bu ham javob edi. Siz yozdingiz. O'n to'rt karta. Oltitasini bugun o'qiy olasiz.",
            next: "nm_mg"
          },
          nm_mg: {
            type: "minigame",
            game: "cardRun",
            config: {},
            onWin: "nm_win",
            onLose: "nm_lose"
          },
          nm_win: {
            type: "say", speaker: "",
            text: "Siz oltita kartani o'qib chiqdingiz va uchtasini ishlatdingiz. Kimdir hayron bo'ldi: «Ustoz, buni qayerdan bildingiz?» — «Siz aytdingiz. Men eshitdim.»",
            effects: [
              { note: { principle: P.NOTICE, verdict: "good", text: "Diqqat — bu eng kam uchraydigan sovg'a. Siz o'n to'rt kishidan oltitasini tanladingiz, chunki o'n to'rtini birdan eslab qolish yolg'on bo'lardi. Tanlaganingizni ishlatdingiz. Bu taqsimlangan diqqat, tarqoq diqqat emas." } },
              { intel: "intel_bekzod_named" },
              { intel: "intel_nafisa_quiet" },
              { trust: 1 }
            ],
            next: "nm_end"
          },
          nm_lose: {
            type: "say", speaker: "",
            text: "Siz uchtasini taxmin qildingiz. Ikkitasi xato chiqdi. Kimdir «yo'q, men bunday demaganman» dedi — va siz buni tan olishingiz kerak.",
            effects: [
              { note: { principle: P.ONE, verdict: "weak", text: "O'n to'rt odamga bir xil gap aytish oson. Ularning har biriga boshqacha gap aytish qiyin, chunki buning uchun har birini eshitish kerak. Siz bugun oltitasini eshitdingiz. Bu yetarli emas, lekin u boshlanish." } }
            ],
            next: "nm_lose2"
          },
          nm_lose2: {
            type: "say", speaker: "",
            text: "«Xato qildim. Menga ayting — men yozib olaman.» Sinf jim. Keyin kimdir aytdi. Va bu kichik mag'lubiyat sizni yutqazmadi: xatoni tan olgan odam ishonchliroq.",
            effects: [
              { intel: "intel_bekzod_named" },
              { trust: 1 }
            ],
            next: "nm_end"
          },
          nm_end: {
            type: "say", speaker: "",
            text: "Daftar yopildi. Endi sizda ismlar bor, va ularda siz haqingizda bitta fakt bor: bu odam eshitadi.",
            effects: [{ beat: "gift" }],
            next: "nm_end2"
          },
          nm_end2: { type: "end" }
        }
      },

      /* ======================================================================
         GIFT — the promise, then the shortage. Tension: keeping it costs him.
         ====================================================================== */
      gift_start: {
        start: "gf_1",
        nodes: {
          gf_1: {
            type: "say", speaker: "",
            text: "Sumkangizdan oltita kichik narsa chiqardingiz: qalam, daftar, qizil qalam, bo'r, qog'oz yulduz, kichik kitob. Hammasi arzon. Hammasi o'zingiz sotib olgansiz.",
            effects: [{ beat: "gift" }],
            next: "gf_2"
          },
          gf_2: {
            type: "say", speaker: "",
            text: "«Bugundan boshlab har to'g'ri javob uchun shu sovg'alardan biri. Va'da beraman: kim bugun birinchi bo'lib to'g'ri javob bersa, sovg'ani bugun oladi. Ertaga emas — bugun.»",
            next: "gf_3"
          },
          gf_3: {
            type: "say", speaker: "",
            text: "Sinf jonlandi. Kimdir «rostmi?» dedi. Jasur oldinga surildi. Nafisa qo'lini ko'tardi — u allaqachon javobni biladi va bu birinchi imkoniyat.",
            next: "gf_4"
          },
          gf_4: {
            type: "say", speaker: "",
            text: "Nafisa javob berdi. To'g'ri. Va siz qo'lingizni sumkaga solganingizda — oltita emas, beshta narsa borligini his qildingiz. Bittasi uyda qolgan.",
            next: "gf_5"
          },
          gf_5: {
            type: "say", speaker: "",
            text: "Nafisa kutmoqda. Butun sinf kutmoqda. Va siz hozir bir narsani tanlaysiz: va'dani buzishni, yoki o'zingizdan nimadir berishni.",
            next: "gf_q"
          },
          gf_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_GF_1",
                text: "O'z qalamingizni qo'shasiz — yaxshi qalam, o'zingiz ishlatadigan. «Mana. Va'damni bugun bajo keltirdim.» Hech kim bilmaydi u sizniki edi.",
                next: "gf_r1",
                effects: [
                  { note: { principle: P.GESTURE, verdict: "good", text: "Siz va'dani saqladingiz va buning narxini o'zingiz ko'tardingiz. Eng muhimi — aytmadingiz. Bolalar sovg'ani ko'rdi, qurbonlikni ko'rmadi. Esquithning gapi shu: bolalarga va'dani qanday bajo keltirganingizni o'qib o'qitish kerak emas. Ular ishonch mumkinligini o'zlari tushunadi." } },
                  { intel: "intel_compliment" },
                  { trust: 2 }
                ]
              },
              {
                id: "CH2_GF_2",
                text: "«Bugun sovg'a yo'q. Bittasi yetishmayapti — ertaga olasan.»",
                next: "gf_r2",
                effects: [
                  { note: { principle: P.GESTURE, verdict: "bad", text: "Bitta sovg'a tejadingiz va butun va'dani yo'qotdingiz. Birinchi darsda, birinchi imkoniyatda. Ular endi biladi: bu odamning va'dasi shartli. Esquith aytadi: sovg'a va'da qilishning o'zi muammo, lekin uni buzish — kechirilmaydigan xato." } },
                  { flag: "c2_gift_broken" },
                  { trust: -1 }
                ]
              },
              {
                id: "CH2_GF_3",
                text: "Bekzodga qaraysiz. Uning daftari yo'q — faqat yirtilgan varaq. «Nafisa, senga sovg'a. Lekin bugungi eng qimmatli sovg'a boshqa odamga: Bekzod, mana daftar.»",
                next: "gf_r3",
                requires: { intel: "intel_bekzod_new" },
                lockedText: "«Nafisa, mana sovg'ang.» — va qo'lingizdagi ikkinchi narsani Bekzodga uzatasiz.",
                effects: [
                  { note: { principle: P.GESTURE, verdict: "good", text: "Siz ikkita va'dani bir vaqtda saqladingiz: Nafisa sovg'asini oldi, va daftarsiz bola ham. Bu «bir o'lcham hammaga to'g'ri keladi» degan gapning amaliy isboti — sovg'a sovg'a emas, agar u odamga mos kelmasa." } },
                  { intel: "intel_bekzod_way" },
                  { trust: 2 }
                ]
              }
            ]
          },
          gf_r1: {
            type: "say", speaker: "",
            text: "Nafisa qalamni oldi va unga uzoq qaradi. Keyin yonidagi qizga ko'rsatdi. Sinfda eng katta ovoz Jasurning edi: «Ustoz, va'dasini saqladi.» Bu gapni kim aytgani muhim emas. Muhimi — u aytildi.",
            next: "gf_r1b"
          },
          gf_r1b: {
            type: "say", speaker: "",
            text: "Bekzod o'z yirtilgan varag'ini stol ustiga qo'ydi va qo'llarini tizzasiga qo'ydi. U sizga qaramadi. Lekin u birinchi marta stolga suyandi, devorga emas.",
            effects: [{ intel: "intel_timur_alone" }],
            next: "gf_r1c"
          },
          gf_r1c: {
            type: "say", speaker: "",
            text: "Endi sovg'alarni tarqatish vaqti. Oltita odam, beshta narsa — va bittasi sizning qalamingiz edi. Qolganlarini qanday taqsimlaysiz: bu ham savol.",
            next: "gf_mg_gate"
          },
          gf_r2: {
            type: "say", speaker: "",
            text: "Nafisa qo'lini tushirdi. Hech narsa demadi. Jasur kuldi — lekin bu kulgi boshqacha edi. Kimdir «voy» dedi, va bu safar maqtov emas, achinish edi.",
            next: "gf_r2b"
          },
          gf_r2b: {
            type: "say", speaker: "",
            text: "Siz bugun bir narsani o'rgatdingiz. Faqat siz o'ylaganingiz emas: va'da shartli bo'lishi mumkin. Bu darsni qaytarib olish qirq daqiqada mumkin emas.",
            next: "gf_mg_gate"
          },
          gf_r3: {
            type: "say", speaker: "",
            text: "Bekzod daftarni ikkala qo'li bilan oldi. U hech narsa demadi. Lekin u birinchi marta sizga qaradi — to'g'ri ko'ziga.",
            next: "gf_r3b"
          },
          gf_r3b: {
            type: "say", speaker: "",
            text: "Nafisa qizil qalamni oldi va darhol yozishni boshladi. Kimdir «nega unga?» deb so'radi. «Chunki uning daftari yo'q edi», deb javob berasiz. Sinf bu gapni o'ylab qoldi.",
            effects: [{ intel: "intel_timur_alone" }],
            next: "gf_r3c"
          },
          gf_r3c: {
            type: "say", speaker: "",
            text: "Endi qolgan sovg'alarni tarqatish vaqti. Va qaysi odamga qaysi narsa — bu savol siz o'ylagandan muhimroq.",
            next: "gf_mg_gate"
          },
          gf_mg_gate: {
            type: "say", speaker: "",
            text: "Sovg'alarni tarqatishdan oldin bitta narsa aniq: sizda beshta narsa va olti kishi bor. Kim nimani olishi — bugungi eng katta qaror.",
            next: "gf_mg"
          },
          gf_mg: {
            type: "minigame",
            game: "giftRun",
            config: {},
            onWin: "gf_mg_win",
            onLose: "gf_mg_lose"
          },
          gf_mg_win: {
            type: "say", speaker: "",
            text: "Har kim o'ziga mos narsani oldi. Kimdir kuldi, kimdir jim qoldi, kimdir «rahmat» dedi. Hech kim «nega men?» deb so'ramadi — chunki javob ko'rinib turardi.",
            effects: [
              { note: { principle: P.ONE, verdict: "good", text: "Bir xil sovg'a hammaga — bu tarqatish. Mos sovg'a har biriga — bu mehmondo'stlik. Guidara buni bir o'lcham hammaga to'g'ri keladi deb ataydi, va bu gap Richard Coraine'ning, u o'z xodimlariga aytgan." } },
              { beat: "wobble" }
            ],
            next: "gf_mg_win2"
          },
          gf_mg_win2: { type: "end" },
          gf_mg_lose: {
            type: "say", speaker: "",
            text: "Ikkita sovg'a noto'g'ri odamga tushdi. Kimdir «bu nima uchun?» dedi. Siz javob bering: «Chunki men sizni yaxshi tanimayman. Ertaga o'rganaman.»",
            effects: [
              { note: { principle: P.ONE, verdict: "weak", text: "Noto'g'ri odamga berilgan sovg'a sovg'a emas — u savol. «Nega menga bu?» — va sizda javob yo'q. Bu xato emas, bu ma'lumot: siz hali ularni bilmaysiz. Muhimi, buni tan oldingiz." } },
              { beat: "wobble" }
            ],
            next: "gf_mg_lose2"
          },
          gf_mg_lose2: { type: "end" }
        }
      },

      /* ======================================================================
         WOBBLE — pick one pupil before the bell.
         ====================================================================== */
      wobble_start: {
        start: "wb_1",
        nodes: {
          wb_1: {
            type: "say", speaker: "",
            text: "Qo'ng'iroqqa besh daqiqa. Sinf shovqinlasha boshladi — daftarlar yopilmoqda. Sizda oxirgi bir imkoniyat bor.",
            effects: [{ beat: "wobble" }],
            next: "wb_2"
          },
          wb_2: {
            type: "say", speaker: "",
            text: "Olti kishi hali sinfda. Har biriga borish mumkin — lekin faqat bittasiga vaqt yetadi. Bittasini tanlang va u bilan rostdan gaplashing.",
            next: "wb_3"
          },
          wb_3: {
            type: "say", speaker: "",
            text: "Kimning oldiga borish — oyoq bilan qilinadigan tanlov. Yoningizda olti bola turibdi.",
            next: "wb_4"
          },
          wb_4: { type: "end" }
        }
      },
      wob_zarina: {
        start: "wz_1",
        nodes: {
          wz_1: {
            type: "say", speaker: "",
            text: "Zarina oldingizda to'xtadi — u ketayotgan edi. U sinfning yetakchisi, buni bugun hamma ko'rsatdi. Lekin u yetakchilikni tanlamagan: uni tanlashgan.",
            next: "wz_2"
          },
          wz_2: {
            type: "say", speaker: "Zarina",
            text: "Ustoz, siz bugun dars o'tmadingiz. Savol berdingiz, keyin jim turdingiz. Nega?",
            next: "wz_3"
          },
          wz_3: {
            type: "say", speaker: "",
            text: "Bu eng halol savol. Va javob oddiy emas: chunki siz ularga aytish o'rniga, ularning o'zlariga aytishga yo'l berdingiz.",
            next: "wz_q"
          },
          wz_q: {
            type: "choice",
            prompt: "Zarinaga nima deysiz?",
            options: [
              {
                id: "CH2_WZR_1",
                text: "«Chunki siz javobni mendan ko'ra tezroq topdingiz. Men buni ko'rdim va aralashmadim.»",
                next: "wz_r1",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz uni tanidingiz. Yetakchiga aytilgan eng yaxshi gap — u yetakchi ekanini tan olish, uni boshqarish emas. Va bu gap boshqa hech kim gaplashmaydigan joyda aytildi." } },
                  { intel: "intel_zarina_leads" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WZR_2",
                text: "«Keyingi darsda men ko'proq tushuntiraman. Bugun sinov kuni edi.»",
                next: "wz_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Halol va tushunarli. Lekin u savolga javob bermadi. U «nega jim turdingiz» deb so'radi — siz «keyingi safar boshqacha bo'ladi» dedingiz. Yetakchilar buni sezadi." } }
                ]
              }
            ]
          },
          wz_r1: {
            type: "say", speaker: "",
            text: "Zarina bir soniya qaradi, keyin boshini chayqadi. «Boshqa o'qituvchilar bunday demaydi», dedi. Va ketdi. Eshik oldida yana bir marta qaytib qaradi.",
            effects: [{ intel: "intel_zarina_leader" }],
            next: "wz_end"
          },
          wz_r2: {
            type: "say", speaker: "",
            text: "U boshini chayqadi va ketdi. Xafa emas. Lekin u eshikdan chiqqanda sizga qaramadi.",
            next: "wz_end"
          },
          wz_end: {
            type: "say", speaker: "",
            text: "Zarina eshikdan chiqdi. Sinf uning orqasidan chiqmoqda — u hali boshlamagan, lekin hamma unga ergashmoqda.",
            effects: [{ beat: "exit" }],
            next: "wz_end2"
          },
          wz_end2: { type: "end" }
        }
      },

      wob_dilnoza: {
        start: "wd_1",
        nodes: {
          wd_1: {
            type: "say", speaker: "",
            text: "Dilnoza daftarini yopmadi. U hali ham o'sha misol ustida ishlayapti — bugun ertalab o'zi topolmagan misol. Kechqurun ham uni qo'yib yubormagan.",
            next: "wd_2"
          },
          wd_2: {
            type: "say", speaker: "Dilnoza",
            text: "Ustoz, men topdim. Lekin men ishonchim komil emas. Agar aytsam, xato bo'lsa — uyat.",
            next: "wd_3"
          },
          wd_3: {
            type: "say", speaker: "",
            text: "Bu sinfning eng muhim lahzasi. U o'zini ochishga tayyor — va siz hozir nima deishingiz uning keyingi yilini belgilaydi.",
            next: "wd_q"
          },
          wd_q: {
            type: "choice",
            prompt: "Dilnozaga nima deysiz?",
            options: [
              {
                id: "CH2_WD_1",
                text: "«Ayting. Xato bo'lsa, biz birga topamiz — va bu sizning bugungi eng katta yutug'ingiz bo'ladi, chunki siz jur'at qildingiz.»",
                next: "wd_r1",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz uning javobini emas, jur'atini mukofotladingiz. Bu juda kam uchraydigan narsa: ko'pchilik o'qituvchilar to'g'ri javobni maqtaydi va shu bilan faqat ishonchi komil bolalarni rag'batlantiradi." } },
                  { intel: "intel_dilnoza_explains" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WD_2",
                text: "«Ishonching komil bo'lsa, ayt. Bo'lmasa — uyda yana ishlab kel.»",
                next: "wd_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Bu gap uning savoliga javob bo'ldi — va javob «o'zing hal qil» edi. U o'zini ochmoqchi bo'lgandi. Siz uni yopdingiz, va keyingi safar u ochilmaydi." } }
                ]
              }
            ]
          },
          wd_r1: {
            type: "say", speaker: "",
            text: "U aytdi. Xato edi. Va siz birga tuzatdingiz — sinf qolganlari ham quloq soldi. U oxirida kulib: «Endi tushundim», dedi. Bu tuyulgan gap emas edi.",
            effects: [{ intel: "intel_dilnoza_explains" }],
            next: "wd_end"
          },
          wd_r2: {
            type: "say", speaker: "",
            text: "«Xo'p», dedi. Va daftarini yopdi. Bugun uni boshqa hech kim topmadi.",
            next: "wd_end"
          },
          wd_end: {
            type: "say", speaker: "",
            text: "Dilnoza daftarini sumkasiga soldi va ketdi. U bugun sinfda birinchi bo'lib o'z ishonchsizligini aytdi.",
            effects: [{ beat: "exit" }],
            next: "wd_end2"
          },
          wd_end2: { type: "end" }
        }
      },

      wob_jasur: {
        start: "wj_1",
        nodes: {
          wj_1: {
            type: "say", speaker: "",
            text: "Jasur eng oxirgi bo'lib chiqmoqda. U yonidan o'tayotib to'xtadi — o'zi to'xtadi, siz chaqirmadingiz. Bu belgi.",
            next: "wj_2"
          },
          wj_2: {
            type: "say", speaker: "Jasur",
            text: "Ustoz, men sizni sinab ko'rdim. Xafa bo'lmadingizmi?",
            next: "wj_3"
          },
          wj_3: {
            type: "say", speaker: "",
            text: "Bu ham sinov emas — bu halol savol. U o'zini himoya qilishga odatlangan, va endi u himoyani tushirdi.",
            next: "wj_q"
          },
          wj_q: {
            type: "choice",
            prompt: "Jasurga nima deysiz?",
            options: [
              {
                id: "CH2_WJ_1",
                text: "«Xafa bo'lmadim. Sizning ismingizni bilardim, chunki jurnalni ikki marta o'qidim. Sinab ko'rishingiz mantiqiy edi.»",
                next: "wj_r1",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz uning sinovini jazolamadingiz va uni ahmoq ham qilmadingiz. «Mantiqiy edi» degan gap uni yutqazmadi — u hurmat bildirishning eng arzon yo'li: odamni tushunganingizni aytish." } },
                  { intel: "intel_jasur_leader" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WJ_2",
                text: "«Eshikni to'sish — yaxshi hazil emas. Keyingi safar bunday bo'lmasin.»",
                next: "wj_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Adolatli. Va u buzilmaydi — u o'tiradi, hech narsa demaydi. Lekin siz eshikdagi odamni yopdingiz. U sinov o'tkazdi, siz hukm o'qidingiz." } }
                ]
              }
            ]
          },
          wj_r1: {
            type: "say", speaker: "",
            text: "Jasur kutilmaganda kuldi — haqiqiy kulgi. «Ustoz, sizni hech kim bunday javob bermaydi», dedi. U qo'lini cho'zdi. Siz qo'l berdingiz va u ertaga ham shu yerda bo'ladi.",
            effects: [{ intel: "intel_jasur_leader" }],
            next: "wj_end"
          },
          wj_r2: {
            type: "say", speaker: "",
            text: "U yelkasini qisdi va ketdi. Siz eshikni ushlab turgansiz; u hech narsa demadi.",
            next: "wj_end"
          },
          wj_end: {
            type: "say", speaker: "",
            text: "Jasur koridorga chiqdi. Sinfdagi eng baland ovoz bugun bir marta ham sizni kamsitmadi.",
            effects: [{ beat: "exit" }],
            next: "wj_end2"
          },
          wj_end2: { type: "end" }
        }
      },

      wob_nafisa: {
        start: "wn_1",
        nodes: {
          wn_1: {
            type: "say", speaker: "",
            text: "Nafisa kitobini yig'moqda. U bugun birinchi bo'lib javob berdi — va keyin butun dars jim o'tirdi. Sizning sovg'angiz uning qo'lida.",
            next: "wn_2"
          },
          wn_2: {
            type: "say", speaker: "",
            text: "Yonidagi qizlar kulib chiqishdi. Nafisa hech narsa demadi. U kitobni sumkasiga solib, sizga qarab turibdi — lekin gapirishga qo'rqadi.",
            next: "wn_q"
          },
          wn_q: {
            type: "choice",
            prompt: "Nafisaga nima deysiz?",
            options: [
              {
                id: "CH2_WN_1",
                text: "Boshqa hech kim eshitmaydigan ovozda: «Bugun eng yaxshi javob sizniki edi. Va men buni hech kimga aytmayman — bu siz bilan men orasida.»",
                next: "wn_r1",
                effects: [
                  { note: { principle: P.SPECIFIC, verdict: "good", text: "Maqtovni hamma eshitadigan joyda emas, hech kim eshitmaydigan joyda berdingiz. Jim bolalar uchun bu farq juda katta: ular yutqazishdan qo'rqadi, yutqazmaslikdan emas. Yaqinlik — e'tiborni yashirin berish orqali." } },
                  { intel: "intel_nafisa_quiet" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WN_2",
                text: "Ovoz chiqarib, butun sinfga: «Nafisa bugun eng yaxshi javob berdi!»",
                next: "wn_r2",
                effects: [
                  { note: { principle: P.SPECIFIC, verdict: "weak", text: "Siz yaxshi niyat qildingiz. Lekin jim bolani sinfning oldiga chiqardingiz — u og'irlikni ko'tara olmadi. Maqtov ham sovg'a kabi: bir o'lcham hammaga to'g'ri keladi deb o'ylash xato." } },
                  { flag: "c2_nafisa_public" }
                ]
              }
            ]
          },
          wn_r1: {
            type: "say", speaker: "",
            text: "Nafisa qog'ozni bukib, yonidagi qizga ko'rsatdi — qiz kuldi. Bu ularning o'rtasida biror narsa bo'ldi degani. Nafisa bugun birinchi marta o'rtoqlari bilan gaplashdi.",
            effects: [{ intel: "intel_nafisa_quiet" }],
            next: "wn_end"
          },
          wn_r2: {
            type: "say", speaker: "",
            text: "Nafisa qizab ketdi. Yonidagilar kulishdi. Ertaga u yana javob bermaydi — buni siz hozir bilasiz.",
            next: "wn_end"
          },
          wn_end: {
            type: "say", speaker: "",
            text: "Nafisa kitobini ko'tarib chiqdi. Bugun u birinchi bo'lib javob berdi va keyin jim o'tirdi.",
            effects: [{ beat: "exit" }],
            next: "wn_end2"
          },
          wn_end2: { type: "end" }
        }
      },

      wob_bekzod: {
        start: "wbb_1",
        nodes: {
          wbb_1: {
            type: "say", speaker: "",
            text: "Bekzod eng oxirgi bo'lib chiqmoqda. U bugun deyarli gapirmadi. Daftari bor — yangi, sovg'a. Va u uni oxiriga yetkazib to'ldirib qo'ymoqda.",
            next: "wbb_2"
          },
          wbb_2: {
            type: "say", speaker: "Bekzod",
            text: "Ustoz, men bu maktabda yangiman. Uch hafta. O'rtog'im yo'q. Va men hali hech kishining ismini bilmayman.",
            next: "wbb_3"
          },
          wbb_3: {
            type: "say", speaker: "",
            text: "U buni aytish uchun juda ko'p jur'at sarfladi. Va u sizga aytdi — sinfdagi eng yangi odam, eng yangi odamga.",
            next: "wbb_q"
          },
          wbb_q: {
            type: "choice",
            prompt: "Bekzodga nima deysiz?",
            options: [
              {
                id: "CH2_WB_1",
                text: "«Men ham. Bu maktabda bugun birinchi kunim. Keling birgalikda o'rganamiz: ertaga men senga uchta ismni aytaman, sen menga uchtani.»",
                next: "wbb_r1",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz unga yordam bermadingiz — sherik bo'ldingiz. Bu katta farq: yordam hokimiyatni saqlaydi, sheriklik uni yo'qotadi. Yangi bola uchun bugungi eng katta sovg'a — o'zini yakka bo'lmagan odam sifatida ko'rish." } },
                  { intel: "intel_bekzod_tomorrow" },
                  { trust: 2 }
                ]
              },
              {
                id: "CH2_WB_2",
                text: "«Xavotir olma, ko'nikib ketasan. Keyingi darslarda o'rtoqlaring bilan tanishasan.»",
                next: "wbb_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Siz to'g'ri gap aytdingiz va u hech narsa qilmadi. «Ko'nikib ketasan» — bu vaqt haqidagi gap, odam haqidagi emas. U sizdan bir daqiqa kutgandi, maslahat emas." } }
                ]
              }
            ]
          },
          wbb_r1: {
            type: "say", speaker: "",
            text: "Bekzod kuldi — birinchi marta. «Kelishdik», dedi. Va u sumkasini yig'ishni boshladi: bu safar u shoshilmadi.",
            effects: [{ intel: "intel_bekzod_tomorrow" }],
            next: "wbb_end"
          },
          wbb_r2: {
            type: "say", speaker: "",
            text: "U boshini chayqadi. «Xo'p.» Sumkasini yig'ib, eshikka qarab ketdi. U bugun ham yakka ketdi.",
            next: "wbb_end"
          },
          wbb_end: {
            type: "say", speaker: "",
            text: "Bekzod sumkasini yelkasiga oshtdi. Bugun u sizga o'zi haqida bitta gap aytdi — bu boshlanish.",
            effects: [{ beat: "exit" }],
            next: "wbb_end2"
          },
          wbb_end2: { type: "end" }
        }
      },

      wob_timur: {
        start: "wt_1",
        nodes: {
          wt_1: {
            type: "say", speaker: "",
            text: "Timur eshikka qarab ketmoqda, qo'lida yana non. U bugun faqat bir marta gapirdi — oshxona haqida. U boshqa hech narsa so'ramadi.",
            next: "wt_2"
          },
          wt_2: {
            type: "say", speaker: "",
            text: "Siz uning oldiga borasiz. U to'xtaydi, lekin qochmaydi. U sizdan nimadir kutmoqda — ehtimol savol, ehtimol hech narsa.",
            next: "wt_q"
          },
          wt_q: {
            type: "choice",
            prompt: "Timurga nima deysiz?",
            options: [
              {
                id: "CH2_WT_1",
                text: "«Bugun darsdan oldin oshxona haqida so'rading. Ertaga erta kelasizmi? Men ham erta kelaman — birga choy ichsak bo'ladi.»",
                next: "wt_r1",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz uning birinchi gapini eslab qoldingiz va undan taklif yasadingiz. Bu eng arzon mehmondo'stlik: kimgadir «sizni eshitdim» deb ko'rsatish. U bugun sizga bir marta ishonch bildirgandi — siz uni qaytardingiz." } },
                  { intel: "intel_timur_alone" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WT_2",
                text: "«Ertaga darsdan keyin gaplashamiz. Hozir uyga bor.»",
                next: "wt_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Hurmatli va to'g'ri. Lekin u sizga bir marta ishonch bildirgandi — ertalab, oshxona haqida. Siz uni keyinga qoldirdingiz. «Ertaga» degan gap ko'p marta aytiladi va kam marta bajariladi." } }
                ]
              }
            ]
          },
          wt_r1: {
            type: "say", speaker: "",
            text: "Timur bir soniya o'yladi. «Ertaga erta kelaman», dedi. Va nonni yarmini sizga uzatdi — bu uning tilida eng katta ishonch.",
            effects: [{ intel: "intel_timur_alone" }],
            next: "wt_end"
          },
          wt_r2: {
            type: "say", speaker: "",
            text: "«Xo'p», dedi. Va ketdi. Ertaga u yana erta keladi — lekin sizga aytmaydi.",
            next: "wt_end"
          },
          wt_end: {
            type: "say", speaker: "",
            text: "Timur nonni cho'ntagiga soldi va chiqdi. Ertaga u yana erta keladi — bu safar siz ham.",
            effects: [{ beat: "exit" }],
            next: "wt_end2"
          },
          wt_end2: { type: "end" }
        }
      },

      /* ======================================================================
         EXIT — the last five minutes. They say it, not him.
         ====================================================================== */
      exit_start: {
        start: "ex_1",
        nodes: {
          ex_1: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. Sinf qo'zg'aldi. Va aynan shu daqiqada hamma narsa yo'qolishi mumkin — chunki eng esda qoladigan qismi oxirgi daqiqa.",
            effects: [{ beat: "exit" }],
            next: "ex_2"
          },
          ex_2: {
            type: "say", speaker: "",
            text: "Siz doskaga qo'lingizni qo'yasiz. «Ketishdan oldin bitta narsa. Bugun nima o'rgandingiz — o'zingiz ayting. Men aytmayman.»",
            next: "ex_3"
          },
          ex_3: {
            type: "say", speaker: "",
            text: "Jimlik. Hech kim gapirmaydi. Bu odatiy: o'qituvchi xulosa qiladi, ular eshitadi va chiqib ketadi. Siz buni buzmoqchisiz.",
            next: "ex_q"
          },
          ex_q: {
            type: "choice",
            prompt: "Oxirgi daqiqani qanday o'tkazasiz?",
            options: [
              {
                id: "CH2_EX_1",
                text: "Kutasiz. Jim turing — hatto noqulay bo'lsa ham. Kimdir birinchi bo'lib gapiradigan paytgacha.",
                next: "ex_r1",
                effects: [
                  { note: { principle: P.LAST, verdict: "good", text: "Siz o'n soniya jim turdingiz va bu o'n soniya darsning eng qimmat qismi bo'ldi. O'zingiz aytganda ular eshitardi. Ular aytganda esa — eslab qoldi. Oxirgi daqiqa eng og'ir daqiqa, va siz uni bermadingiz." } },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_EX_3",
                text: "Bekzodning gapini doskaga yozasiz: «Har bir qo'l berish ikki kishiniki.» Keyin uni o'chirmaysiz — ertaga kirganda birinchi ko'radigan narsa shu bo'lsin.",
                next: "ex_r3",
                requires: { intel: "intel_rule_reason" },
                lockedText: "Doskadagi taxminlarga qarab, xulosa qilasiz.",
                effects: [
                  { note: { principle: P.LAST, verdict: "good", text: "Siz ularning gapini doskaga yozdingiz va o'chirmadingiz. Bu ertangi darsning birinchi jumlasi bo'ladi — o'qituvchi yozgan emas, o'quvchi topgan. Sinfdan chiqqanda ularda o'z fikrlari qoldi." } },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_EX_2",
                text: "O'zingiz xulosa qilasiz: «Bugun biz qo'l berish masalasini o'rgandik. Ertaga davom etamiz.»",
                next: "ex_r2",
                effects: [
                  { note: { principle: P.LAST, verdict: "weak", text: "To'g'ri xulosa, yaxshi aytilgan. Va ular eshitdi — o'z so'zlaringizni. Sinfdan chiqqanda ularda sizning gapingiz qoldi, o'z fikrlari emas. Eng muhim daqiqani o'zingizga oldingiz." } }
                ]
              }
            ]
          },
          ex_r1: {
            type: "say", speaker: "",
            text: "Birinchi bo'lib Bekzod gapiradi — bugun deyarli jim o'tirgan bola. «Qo'l berish — har kim hamma bilan. Demak har bir qo'l berish ikki kishiniki. Shuning uchun ikki baravar ko'p sanamaslik kerak.»",
            next: "ex_r1b"
          },
          ex_r1b: {
            type: "say", speaker: "",
            text: "Sinf unga qaradi. Kimdir «ha, to'g'ri» dedi. Zarina qo'shdi: «Va biz uni o'zimiz topdik, ustoz aytmadi.» O'n to'rt bola bir narsani aytdi va u ularniki edi.",
            effects: [{ intel: "intel_rule_reason" }],
            next: "ex_r1c"
          },
          ex_r1c: {
            type: "say", speaker: "",
            text: "Doskada hali ham savol turibdi va uning yonida ismlar bilan yozilgan taxminlar. Siz o'chirmaysiz. Kimdir ertaga kirganda ularni ko'radi.",
            next: "ex_r1d"
          },
          ex_r1d: {
            type: "say", speaker: "",
            text: "Kimdir eshikdan chiqayotib: «Ustoz, ertaga ham shundaymi?» — «Ha», deysiz. Va bu safar bu va'da edi, va siz uni saqlaysiz.",
            effects: [{ beat: "done" }],
            next: "ex_r1e"
          },
          ex_r1e: {
            type: "say", speaker: "",
            text: "Koridorda siz bir daqiqa to'xtab qolasiz. Ichkarida stullar shovqini, o'sha o'n to'rt ovoz. Bugun ular matematika o'rgandi. Ammo siz bugun boshqa narsa qildingiz: siz ularni ko'rdingiz.",
            next: "ex_end"
          },

          ex_r3: {
            type: "say", speaker: "",
            text: "Bekzodning gapini doskaga yozasiz va bo'rni qo'yasiz. Sinf unga qaradi — o'z gapi doskada turibdi. Bu kichik narsa emas: u bugun birinchi marta gapirdi va gapi qoldi.",
            next: "ex_r3b"
          },
          ex_r3b: {
            type: "say", speaker: "",
            text: "«Ertaga shu yerdan boshlaymiz», deysiz. Kimdir «ustoz, o'chirmaysizmi?» deb so'raydi. «Yo'q», deysiz. Va o'n to'rt bola eshikdan chiqadi — doskada ularning o'z so'zlari qolgan.",
            effects: [{ beat: "done" }],
            next: "ex_r3c"
          },
          ex_r3c: {
            type: "say", speaker: "",
            text: "Koridorda bir daqiqa to'xtab qolasiz. Bugun ular matematika o'rgandi. Lekin siz bugun boshqa narsa qildingiz: ularni ko'rdingiz va ular buni bildi.",
            next: "ex_end"
          },

          ex_r2: {
            type: "say", speaker: "",
            text: "«Bugun biz qo'l berish masalasini o'rgandik», deysiz. Ular boshini chayqaydi. Kimdir yozib oladi. Va ular chiqib ketadi — sizning so'zlaringiz bilan.",
            next: "ex_r2b"
          },
          ex_r2b: {
            type: "say", speaker: "",
            text: "Bekzod eshikdan chiqayotib orqasiga qaramadi. Bugun u hech kim bilan gaplashmadi. Ertaga ham shunday bo'lishi mumkin — va buning sababi bugun siz aytgan xulosa emas, aytmagan daqiqalar.",
            effects: [{ beat: "done" }],
            next: "ex_r2c"
          },
          ex_r2c: {
            type: "say", speaker: "",
            text: "Koridorda stullar shovqini. Siz bugun dars o'tdingiz. Savol shu: ular ertaga qaytadimi — dars uchun, yoki siz uchun?",
            next: "ex_end"
          },

          ex_end: {
            type: "say", speaker: "",
            text: "Birinchi dars tugadi.",
            effects: [{ endMission: true, beat: "done" }],
            next: "ex_end2"
          },
          ex_end2: { type: "end" }
        }
      },

      /* ======================================================================
         NPC default scenes — short, no beat change.
         ====================================================================== */
      zarina_default: {
        start: "zd_1",
        nodes: {
          zd_1: { type: "say", speaker: "Zarina", text: "Ustoz, siz darsni boshqacha boshladingiz. Boshqalar birinchi kuni qoidalarni aytadi.", next: "zd_2" },
          zd_2: { type: "say", speaker: "", text: "U buni sinov sifatida aytmayapti. U shunchaki qiziqmoqda — va bu birinchi yaxshi belgi.", next: "zd_3" },
          zd_3: { type: "end" }
        }
      },
      dilnoza_default: {
        start: "dd_1",
        nodes: {
          dd_1: { type: "say", speaker: "Dilnoza", text: "Ustoz, men savol berishni yaxshi ko'raman. Ba'zilar buni chalg'itish deb o'ylaydi.", next: "dd_2" },
          dd_2: { type: "say", speaker: "", text: "U savol beradi, chunki javobsiz qolishdan qo'rqadi. Bu zaiflik emas — bu sinfdagi eng kam uchraydigan jasorat.", next: "dd_3" },
          dd_3: { type: "end" }
        }
      },
      jasur_default: {
        start: "jd_1",
        nodes: {
          jd_1: { type: "say", speaker: "Jasur", text: "Ustoz, men darsni yaxshi ko'rmayman. Lekin sizni hali bilmayman.", next: "jd_2" },
          jd_2: { type: "say", speaker: "", text: "Eng halol gap shu. U sizni sinab ko'rmoqda — va u buni yashirmayapti. Bu sizga imkoniyat beradi.", next: "jd_3" },
          jd_3: { type: "end" }
        }
      },
      nafisa_default: {
        start: "nd_1",
        nodes: {
          nd_1: { type: "say", speaker: "Nafisa", text: "Ustoz, men hamma misollarni yechib bo'lgandim. Siz bergan savol yangi edi.", next: "nd_2" },
          nd_2: { type: "say", speaker: "", text: "U hamma narsani biladi va shuning uchun jim o'tiradi: bilgan odam so'ramaydi. Unga qiyinroq savol bering — bu unga hurmat.", next: "nd_3" },
          nd_3: { type: "end" }
        }
      },
      bekzod_default: {
        start: "bd_1",
        nodes: {
          bd_1: { type: "say", speaker: "Bekzod", text: "Ustoz, men bu misolni boshqacha yechdim. Xato bo'lsa ham — shunday chiqdi.", next: "bd_2" },
          bd_2: { type: "say", speaker: "", text: "U o'z ishini ko'rsatishga jur'at qildi. Birinchi darsda bu — sovg'a. Xato bo'lsa ham, avval usulini tan oling, keyin tuzating.", next: "bd_3" },
          bd_3: { type: "end" }
        }
      },
      timur_default: {
        start: "td_1",
        nodes: {
          td_1: { type: "say", speaker: "Timur", text: "Ustoz, oshxona qayerda? Faqat ayting — men o'zim topaman.", next: "td_2" },
          td_2: { type: "say", speaker: "", text: "U yordam so'rayapti, deb o'yladingizmi? Yo'q. U sizni sinab ko'ryapti: aytasizmi yoki birga boramizmi. Birga borsangiz — bu birinchi kuningizning eng arzon sovg'asi bo'ladi.", next: "td_3" },
          td_3: { type: "end" }
        }
      }
    }
  };
})();
