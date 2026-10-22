/* ============================================================================
   IKKINCHI BOB — "Birinchi dars: 5-B"
   Sulton School. Azizbek's first ever lesson, 8:52 to 9:45.

   THE QUESTION THIS CHAPTER ASKS
     You have one credential you could use: you were the regional olympiad
     champion in Bukhara — the strongest maths region in Uzbekistan. You
     studied in a madrasa, where the teacher knew every name before the first
     lesson. You could walk in and impress them in ten seconds.

     Or you could spend the forty-five minutes making them feel seen.

     The chapter is built so the impressive move and the hospitable move are
     never the same move. Every beat is a place where you can be excellent at
     maths or excellent at people, and the game makes you choose.

   THE EIGHT IDEAS (see chapter2-learning.js)
     C2-001  the verdict is reached before you speak
     C2-002  a name is the smallest unit of hospitality
     C2-003  somebody's job is to notice        (the Dreamweaver)
     C2-004  one size fits one                 (read the person)
     C2-005  specific beats generic            (compliments)
     C2-006  the gesture nobody asked for      (the $2 hot dog, systemised)
     C2-007  the last minute is the impression they keep
     C2-008  the enemy is "reasonable"         (competence is not the goal)

   Beats:
     before -> door -> open -> names -> rules -> task -> gift -> wobble
            -> exit -> done

   Zones: corridor (before the bell, and after it) and classroom (the lesson).

   PROVENANCE: the techniques are from Will Guidara, *Unreasonable Hospitality*
   (2022) — greeted-by-name reservations (Ch. 1), Enlightened Hospitality
   (Ch. 3), "earning informality" (Ch. 16), the Dreamweaver role and the $2
   street hot dog (Ch. 18), "manage 95% down to the penny and the other 5%
   foolishly" (Ch. 5), and the closing-gesture asymmetry (Ch. 17). The
   biography is Azizbek's own. Nothing in here is a quote put in a child's
   mouth; the book is taught by staging it.
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
      "Sizda bitta guvohnoma bor — Buxoro viloyat olimpiadasi.",
      "Uni ko'rsatish oson. Ishlatmaslik qiyin."
    ],

    npcs: [
      {
        id: "pupil_zarina", name: "Zarina", role: "5-B o'quvchisi",
        zone: "classroom", at: 5, palette: "teacher_female", facing: "down",
        entry: { default: "zarina_default", wobble: "wob_zarina" }
      },
      {
        id: "pupil_dilnoza", name: "Dilnoza", role: "5-B o'quvchisi",
        zone: "classroom", at: 2, palette: "adult_female", facing: "down",
        entry: { default: "dilnoza_default", names: "names_start", wobble: "wob_dilnoza" }
      },
      {
        id: "pupil_jasur", name: "Jasur", role: "5-B o'quvchisi",
        zone: "classroom", at: 4, palette: "boy", facing: "down",
        entry: { default: "jasur_default", rules: "rules_start", wobble: "wob_jasur" }
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
      { zone: "classroom", beat: "task", scene: "task_start", once: true },
      { zone: "classroom", beat: "gift", scene: "gift_start", once: true },
      { zone: "classroom", beat: "wobble", scene: "wobble_start", once: true },
      { zone: "corridor", beat: "exit", scene: "exit_start", once: true }    ],

    objectives: {
      before: "Koridorda: ikki daqiqa",
      door: "Eshikni oching",
      open: "Birinchi 90 soniya",
      names: "Ismlar: Dilnoza savol bermoqda",
      rules: "Kelishuv: Jasur sinab ko'rmoqda",
      task: "Birinchi misol va maqtovlar",
      gift: "Bekzodning yirtilgan varag'i",
      wobble: "Kimning oldiga borasiz?",
      exit: "Koridorga chiqing",
      done: "Birinchi dars tugadi"
    },

    scenes: {

      /* ======================================================================
         BEFORE THE BELL — corridor, 8:52. You are on stage before you speak.
         The book calls this the two minutes you get to gather intel.
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

          // ---- the intel gathering (multi, budget 2) ----------------------
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
            text: "Kimdir kuldi. Kimdir «jim bo'l» dedi. Jasur eng baland ovoz — lekin kulganlar unga qarab turishdi, demak hukmni u yozmaydi.",
            next: "in_q"
          },

          in_after: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. Shovqin bir zumda o'zgaradi — hamma eshikka qaraydi. O'n to'rt juft ko'z sizda, va siz hali bir og'iz gapirmadingiz.",
            next: "in_after2"
          },
          in_after2: {
            type: "say", speaker: "",
            text: "Ular siz haqingizda allaqachon bitta jumla yozib qo'yishdi. Siz faqat uning qanday tugashini tanlaysiz.",
            next: "in_end"
          },
          in_end: {
            type: "end",
            effects: [
              { journal: "Birinchi dars. Koridorda o'n to'rt begona — va ikki daqiqa." },
              { beat: "door" }
            ]
          }
        }
      },

      /* ======================================================================
         THE DOOR — the first thing they hear from you.
         Guidara's maître d' confirmed the reservation himself so he could say
         "Good evening, Ms. Sun — we spoke on the phone." You have two names.
         ====================================================================== */
      door: {
        start: "dr_1",
        nodes: {
          dr_1: {
            type: "say", speaker: "",
            text: "Siz jurnalni qo'ltig'ingizga qisdingiz — qo'lingizda emas. Doskaga emas, eshikka qarabsiz. Bu ikki soniyada sinf bitta narsani o'qidi: u bizni kutgan.",
            next: "dr_2"
          },
          dr_2: {
            type: "say", speaker: "",
            text: "Eshikni ochdingiz. Ular kirmoqda. Sizda ikkita ism bor — Dilnoza va Bekzod. Qolgan o'n ikkitasini bilmaysiz.",
            next: "dr_q"
          },
          dr_q: {
            type: "choice",
            prompt: "Eshikda nima deysiz?",
            options: [
              {
                id: "CH2_DR_1",
                text: "«Dilnoza, xush kelibsiz. Bekzod, siz ham.» Qolganlariga: «Sizlarning ismlaringizni hali bilmayman — bugun bilib olaman.»",
                next: "dr_r1",
                effects: [
                  { note: { principle: P.NAME, verdict: "good", text: "Ikkita ism va bitta rost gap. Ism eshitgan bola o'zini ko'rgan his qiladi; «bugun bilib olaman» degan gap esa qolgan o'n ikkitasiga va'da beradi — va birinchi kunda va'da bergandan keyin uni bajarish mumkin." } },
                  { note: { principle: P.FIRST, verdict: "good", text: "Birinchi taassurotni guvohnoma bilan emas, diqqat bilan boshladingiz. Bu eshikdan kirgan odam o'zini ko'rsatish uchun kelmagan — u sizni ko'rish uchun kelgan." } },
                  { trust: 1 },
                  { intel: "intel_named_two" }
                ]
              },
              {
                id: "CH2_DR_2",
                text: "«Assalomu alaykum, 5-B. O'tiringlar, daftarlaringizni ochinglar.»",
                next: "dr_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Bu — xizmat. To'g'ri, tartibli, hech kim xafa bo'lmaydi. Lekin o'n to'rt bola bir xil gap eshitdi, ya'ni hech biri alohida eshitmadi. Mehmonxonaga kirgan odam ham shuni eshitadi: «xush kelibsiz» — lekin ismi aytilmaydi." } },
                  { flag: "c2_door_flat" }
                ]
              },
              {
                id: "CH2_DR_3",
                text: "Hech narsa demang. Faqat eshikni ushlab turing va ular o'tishini kuting.",
                next: "dr_r3",
                effects: [
                  { note: { principle: P.FIRST, verdict: "ok", text: "Eshikni ushlab turish — o'zi gap. Lekin jimlik ham gap, va siz u nima deyishini tanlamadingiz. Ular o'zlari yozdi: yo «xushmuomala», yo «qo'rqadi»." } },
                  { trust: -1 },
                  { flag: "c2_door_silent" }
                ]
              }
            ]
          },

          dr_r1: {
            type: "say", speaker: "",
            text: "Dilnoza ko'zini bir zum kattalashtirdi. Bekzod esa qo'lidagi yirtilgan varaqni yashirishga urindi — keyin yashirmadi. Orqa qatorda kimdir shivirladi: «ismini biladi-ku».",
            next: "dr_r1b"
          },
          dr_r1b: {
            type: "say", speaker: "",
            text: "Ismni bilish kichik narsa. Lekin o'n to'rt bola hozir bitta gapni ko'rdi: bu odam bizga alohida qaraydi. Va ular hali birorta misol ko'rmadi.",
            next: "dr_r1c"
          },
          dr_r1c: {
            type: "say", speaker: "",
            text: "Eshik yopildi. O'n to'rt juft ko'z. Sizda to'qson soniya bor — va bu to'qson soniya butun yilni belgilaydi.",
            effects: [{ beat: "open" }],
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
            effects: [{ beat: "open" }],
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
            effects: [{ beat: "open" }],
            next: "dr_r3c"
          },
          dr_r3c: { type: "end" }
        }
      },

      /* ======================================================================
         THE FIRST NINETY SECONDS — minigame firstNinety.
         ====================================================================== */
      ninety_start: {
        start: "ns_1",
        nodes: {
          ns_1: {
            type: "minigame",
            game: "firstNinety",
            config: {},
            onWin: "ns_win",
            onLose: "ns_lose"
          },
          ns_win: {
            type: "say", speaker: "",
            text: "Sinf o'rniga o'tirdi. Kimdir sizga qarab kulimsirab qo'ydi — o'zi ham kutmagan holda.",
            effects: [
              { note: { principle: P.FIRST, verdict: "good", text: "Birinchi to'qson soniya ishladi: xona ham iliq, ham tartibli. Bu kombinatsiya tasodifan chiqmaydi — iliqlik tartibsizlikka, tartib esa sovuqlikka oson aylanadi." } },
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
            effects: [{ beat: "names" }],
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
              { journal: "Birinchi to'qson soniya o'ylaganimdek chiqmadi. Zarina buni yuzimga aytdi — va bu sovg'a." },
              { beat: "names" }
            ]
          }
        }
      },

      /* ======================================================================
         NAMES — Dilnoza tests you.
         Names are the smallest unit of hospitality; and the method matters
         more than the memory.
         ====================================================================== */
      names_start: {
        start: "nm_1",
        nodes: {
          nm_1: {
            type: "say", speaker: "",
            text: "Jurnal ochildi. O'n to'rt ism. Siz ularni ovoz chiqarib o'qishingiz mumkin — bu davomat, bu xizmat, va bu to'g'ri.",
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
                text: "«Albatta yodlayman. Men o'ttiz ismni bir kunda yodlay olaman — o'zim ham shunday o'rganganman.»",
                next: "nm_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Bu gap o'zingiz haqingizda. Dilnoza sizdan texnika so'ramadi — u ishonch so'radi. Va sizda haqiqatan ham shunday qobiliyat bor; shuning uchun bu gap shunchalik oson va shunchalik foydasiz." } },
                  { flag: "c2_names_boast" }
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
          nm_r1b: {
            type: "say", speaker: "",
            text: "Keyin ikkinchisi. Keyin uchinchisi. Siz yozdingiz. Kimdir shoshib gapirdi, kimdir bitta so'z dedi, kimdir hech narsa topolmadi va bu ham ma'lumot.",
            next: "nm_r1c"
          },
          nm_r1c: {
            type: "say", speaker: "",
            text: "Bekzod navbati kelganda qisqa dedi: «Bekzod. Men misolni boshqacha yechaman.» Keyin darhol qo'lidagi varaqqa qaradi.",
            effects: [{ intel: "intel_bekzod_way" }],
            next: "nm_r1d"
          },
          nm_r1d: {
            type: "say", speaker: "Jasur",
            text: "Boshqacha qanday? Xato degani?",
            next: "nm_r1e"
          },
          nm_r1e: {
            type: "say", speaker: "",
            text: "Zarina Jasurga qarab nimanidir dedi — eshitilmadi. Lekin hamma ko'rdi: sinf javob berdi, siz emas. Bu yaxshi belgi. Yoki hali emas.",
            next: "nm_r1f"
          },
          nm_r1f: {
            type: "end",
            effects: [
              { journal: "Bekzod: «men misolni boshqacha yechaman». Uni birinchi kun sinab ko'rishdi. Men javob bermadim — Zarina berdi." },
              { beat: "rules" }
            ]
          },

          nm_r2: {
            type: "say", speaker: "",
            text: "Dilnoza bosh irg'adi. Lekin orqada kimdir shivirladi: «qani, aytib ko'ring». Siz o'zingizga va'da berdingiz va hozir o'sha va'da sinovda.",
            next: "nm_r2b"
          },
          nm_r2b: {
            type: "say", speaker: "",
            text: "Jurnal varaqlanadi. Ismlar ovoz chiqarib o'qiladi — tartib bilan, to'g'ri, xatosiz. Va o'n to'rt bola bir xil gap eshitadi: ismi. Faqat ismi.",
            next: "nm_r2c"
          },
          nm_r2c: {
            type: "end",
            effects: [
              { journal: "Men «o'ttiz ismni yodlayman» dedim. Ular endi buni kutishadi. Kutish — va'da berishning eng qimmat shakli." },
              { beat: "rules" }
            ]
          },

          nm_r3: {
            type: "say", speaker: "",
            text: "Dilnoza: «Unday bo'lsa, bugun oltitasini ayting-chi». Unday qiyin savol bermadi — oson savol berdi. Oson savol ham sinov.",
            next: "nm_r3b"
          },
          nm_r3b: {
            type: "say", speaker: "",
            text: "Dilnoza, Jasur, Nafisa, Timur, Bekzod, Zarina. Oltitasi. Sinf jim — va bu jimlik yaxshi. Sizda bitta qadam bor: qolgan sakkiztasini birinchi bo'lib chaqirish.",
            next: "nm_r3c"
          },
          nm_r3c: {
            type: "end",
            effects: [
              { journal: "Oltita ism. Qolgan sakkiztasi ertaga — lekin ular bugun bilishdi." },
              { beat: "rules" }
            ]
          }
        }
      },

      /* ======================================================================
         THE AGREEMENT — Jasur tests you.
         Expectations are service; the reason behind them is colour.
         ====================================================================== */
      rules_start: {
        start: "rl_1",
        nodes: {
          rl_1: {
            type: "say", speaker: "",
            text: "Jasur eng orqa qatordan, oyog'ini parta ostiga qo'yib: «Ustoz, qoidalar bormi? Hammasi shu — nima qilsak bo'ladi, nima bo'lmaydi?»",
            next: "rl_2"
          },
          rl_2: {
            type: "say", speaker: "",
            text: "Bu sinov. U biladi qoidalar bo'lishini. U bilmoqchi — siz qoidalarni o'zingiz uchun aytasizmi, yoki ular uchun.",
            next: "rl_q"
          },
          rl_q: {
            type: "choice",
            prompt: "Kelishuvni qanday aytasiz?",
            options: [
              {
                id: "CH2_RL_1",
                text: "«Bitta kelishuv. Darsda bitta odam gapiradi — men yoki siz. Qolganlar tinglaydi. Sababi: bu xonada o'ttiz daqiqa bor, va uni bo'lishish kerak. Xohlasangiz, sababini o'zingiz aytib bering.»",
                next: "rl_r1",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "good", text: "Bitta qoida va uning sababi. O'n to'rt qoida — xizmat; bitta qoida va sabab — rang. Ular endi qoidaga emas, kelishuvga bo'ysunishadi, va kelishuvni o'zlari aytdi." } },
                  { note: { principle: P.FIRST, verdict: "good", text: "«Sababini o'zingiz aytib bering» — bu hokimiyatni bo'lishish. Birinchi kunda bu xavfli ko'rinadi, lekin aynan shu gap Jasurning sinovini to'xtatdi." } },
                  { trust: 1 },
                  { intel: "intel_rule_reason" }
                ]
              },
              {
                id: "CH2_RL_2",
                text: "«Qoidalar devorda yozilgan. O'qing.»",
                next: "rl_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Devor qoidani saqlaydi, sababni saqlamaydi. Ular qoidani bajarishadi — siz yo'q bo'lganda ham, chunki qo'rqishadi, nafratlanmaydi. Qo'rquv ishlaydi. Faqat u darsni uy vazifasiga aylantiradi." } },
                  { flag: "c2_rules_wall" }
                ]
              },
              {
                id: "CH2_RL_3",
                text: "«Qoidalar yo'q. Faqat bitta narsa: bir-biringizni xafa qilmang.»",
                next: "rl_r3",
                effects: [
                  { note: { principle: P.ONE, verdict: "ok", text: "Bu yaxshi niyat va juda iliq gap. Muammo: «xafa qilma» chegarasini har kim o'zi chizadi. Birinchi kunda iliqlik kerak — lekin iliqlik chegarasiz bo'lsa, u tartibsizlikka aylanadi va o'sha kuni sizning darsingiz yo'qoladi." } },
                  { trust: 1 }
                ]
              }
            ]
          },

          rl_r1: {
            type: "say", speaker: "Jasur",
            text: "«Chunki... agar hamma gapirsa, hech kim eshitmaydi.»",
            next: "rl_r1b"
          },
          rl_r1b: {
            type: "say", speaker: "",
            text: "U o'zi aytdi. O'z gapi bilan. Endi bu sizning qoidangiz emas — uning gapi. Sinfdagi hamma eshitdi: Jasur kelishuvni tuzdi, va u eng baland ovoz edi.",
            next: "rl_r1c"
          },
          rl_r1c: {
            type: "say", speaker: "",
            text: "O'ndan keyin misol va'da qilingan edi. Sinf kutmoqda. Va sizda birinchi misol uchun tanlov bor: uni o'zingiz yechasizmi, yoki ularga berasizmi.",
            next: "rl_r1d"
          },
          rl_r1d: { type: "end", effects: [{ beat: "task" }] },

          rl_r2: {
            type: "say", speaker: "",
            text: "Ular devorga qarashdi. Kimdir o'qidi, kimdir o'qimagandek ko'rsatdi. Jasur o'qidi va oyog'ini parta ostidan oldi — bu taslim bo'lish yoki tayyorlanish, hali bilinmaydi.",
            next: "rl_r2b"
          },
          rl_r2b: {
            type: "say", speaker: "",
            text: "Siz misolga o'tdingiz. Xona jim, tartibli, ishlaydi. Faqat bitta narsa yo'q: hech kim sizga savol bermaydi. Tartib bor, aloqa yo'q.",
            next: "rl_r2c"
          },
          rl_r2c: { type: "end", effects: [{ beat: "task" }] },

          rl_r3: {
            type: "say", speaker: "Jasur",
            text: "«Yaxshi. Unda men savol beraman — ko'p.»",
            next: "rl_r3b"
          },
          rl_r3b: {
            type: "say", speaker: "",
            text: "U rostdan ham savol beradi. Bu yaxshi. Lekin chegara yo'qligi birinchi kunda emas, uchinchi haftada muammo bo'ladi — va o'sha paytda siz qoida o'rnatgan odam bo'lasiz, va bu sovuq ko'rinadi.",
            next: "rl_r3c"
          },
          rl_r3c: { type: "end", effects: [{ beat: "task" }] }
        }
      },

      /* ======================================================================
         THE FIRST PROBLEM — the credential, and what you do with it.
         This is Azizbek's real temptation: Bukhara, the regional olympiad,
         the strongest maths region in the country, and a madrasa classroom
         where the teacher knew every name.
         ====================================================================== */
      task_start: {
        start: "tk_1",
        nodes: {
          tk_1: {
            type: "say", speaker: "",
            text: "Doskaga bo'r oldingiz. Orqangizda o'n to'rt bola va butun bir yil. Sizda bitta guvohnoma bor: Buxoro viloyat olimpiadasi g'olibi. Buxoro — respublikada matematika bo'yicha eng kuchli viloyat.",
            next: "tk_2"
          },
          tk_2: {
            type: "say", speaker: "",
            text: "Buni bir gapda aytish mumkin. O'n soniya. Va ular sizni darhol boshqacha ko'rishadi — balandroq, uzoqroq, ehtimol qiziqroq. Bu ishlaydi.",
            next: "tk_3"
          },
          tk_3: {
            type: "say", speaker: "",
            text: "Shuningdek: madrasada o'qiganman. U yerda parta yo'q edi, hamma polga o'tirardi, va ustoz birinchi darsdan hamma ismni bilardi. Buxoroda matematikani o'rgatishgan — lekin madrasada odamni tanishtirishgan.",
            next: "tk_q"
          },
          tk_q: {
            type: "choice",
            prompt: "Guvohnomani nima qilasiz?",
            options: [
              {
                id: "CH2_TK_1",
                text: "Aytmayman. Doskaga misolni yozaman va ularga beraman — o'zim yechmasdan.",
                next: "tk_r1",
                effects: [
                  { note: { principle: P.FIRST, verdict: "good", text: "Guvohnoma — xizmat: u sizning malakangizni isbotlaydi. Lekin birinchi darsda kerak bo'lgan narsa malaka emas, ishonch. Ishonch guvohnoma bilan sotilmaydi, va o'zingizni ko'rsatishga sarflangan o'ttiz soniya xonadan olinadi." } },
                  { note: { principle: P.REASONABLE, verdict: "good", text: "Misolni o'zingiz yechmaslik — qiyin tanlov. O'qituvchining eng oson yo'li — doskaga chiqib, chiroyli yechish. Siz o'sha oson yo'lni rad etdingiz va sinfni sahnaga chiqardingiz." } },
                  { trust: 1 },
                  { flag: "c2_credential_withheld" }
                ]
              },
              {
                id: "CH2_TK_2",
                text: "Aytaman — va darhol qo'shaman: «Bu menga hech narsa bermadi. Menga bitta ustoz berdi — u mening ismimni birinchi kundan bilardi.»",
                next: "tk_r2",
                effects: [
                  { note: { principle: P.NAME, verdict: "good", text: "Bu — eng qiyin variant va eng yaxshisi. Siz guvohnomani ko'rsatdingiz, ya'ni o'zingizni yashirmadingiz; keyin uni boshqa odamga o'girdingiz. Bu kamtarlik emas — bu manzilni o'zgartirish. Bolalar «u qanchalik kuchli» emas, «u kimga qaraydi» degan savolni eshitdi." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "Madrasadagi ustoz haqidagi gap — haqiqiy gap. U o'zingizning tarixingizdan kelgan, va u aynan shu darsning mavzusi: ismni bilish o'qitishning bir qismi." } },
                  { trust: 2 },
                  { intel: "intel_madrasa" },
                  { flag: "c2_credential_redirected" }
                ]
              },
              {
                id: "CH2_TK_3",
                text: "Aytaman va doskaga eng qiyin misolni yozaman — o'zim yechib beraman.",
                next: "tk_r3",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "weak", text: "Hech kim sizni yecholmaysiz demayapti — siz yechasiz. Muammo shundaki, doskada siz yechgan misoldan keyin ular o'zlarini hech narsa qilgan his qilmaydi. Ular sizni tomosha qildi. Tomosha — yaxshi xizmat, yomon dars." } },
                  { note: { principle: P.ONE, verdict: "weak", text: "Bitta misol hamma uchun bir xil. Kimdir allaqachon biladi va zerikadi, kimdir hali yetmaydi va qo'rqadi. Bir xil — adolatli ko'rinadi, lekin hech kimga to'g'ri kelmaydi." } },
                  { trust: 1 },
                  { flag: "c2_credential_shown" }
                ]
              }
            ]
          },

          tk_r1: {
            type: "say", speaker: "",
            text: "Misol doskada. Uch qator. Siz hech narsa demadingiz — faqat yozdingiz va chetga chiqdingiz. Sinf bir zum jim qoldi, keyin qalamlar ishladi.",
            next: "tk_r1b"
          },
          tk_r1b: {
            type: "say", speaker: "",
            text: "Va siz xona bo'ylab yura boshladingiz. Bu — eng muhim qism. Yoningizda o'tib ketish oson. To'xtash qiyin.",
            next: "tk_mg"
          },
          tk_mg: {
            type: "minigame",
            game: "complimentRun",
            config: {},
            onWin: "tk_mg_win",
            onLose: "tk_mg_lose"
          },
          tk_mg_win: {
            type: "say", speaker: "",
            text: "Siz to'xtadingiz va ko'rgan narsangizni aytdingiz — aniq, kichik, o'sha bolaga tegishli. Hech kim «yaxshi ishlading» demadi. Har kim o'zi qilgan ishni eshitdi.",
            effects: [
              { note: { principle: P.SPECIFIC, verdict: "good", text: "«Barakalla» — maqtov emas, odat. Aniq maqtov esa sovg'a: u faqat shu bolaga tegishli bo'lgani uchun qimmat. Guidara: sovg'aning qiymati unga nima sarflaganingizda emas, qabul qilgan odam o'zini qanday his qilishida." } },
              { note: { principle: P.NOTICE, verdict: "good", text: "Siz faqat yaxshi ishlaganlarni emas, boshqacha ishlaganlarni ham ko'rdingiz. Bu — «kim yaxshi» degan savoldan voz kechish. Sinfdagi eng kuchli signal: u meni kuzatmoqda." } },
              { trust: 1 },
              { intel: "intel_compliment" }
            ],
            next: "tk_after"
          },
          tk_mg_lose: {
            type: "say", speaker: "",
            text: "Siz «barakalla» dedingiz. Uch marta. Uch xil bolaga. Va uchinchisida o'zingiz ham eshitdingiz: bu gap hech kimga tegishli emas.",
            effects: [
              { note: { principle: P.SPECIFIC, verdict: "weak", text: "Umumiy maqtov — umumiy ovqat kabi: hech kim och qolmaydi, hech kim eslab qolmaydi. «Barakalla» ni almashtirish uchun bitta soat kuzatish kerak. Boshqa hech narsa kerak emas." } },
              { flag: "c2_compliment_generic" }
            ],
            next: "tk_after"
          },

          tk_r2: {
            type: "say", speaker: "",
            text: "Sinf jim qoldi. «Buxoro viloyati» degan gap havoda osilib turdi — keyin siz uni boshqa odamga o'girdingiz: madrasadagi ustoz, ismni birinchi kundan bilgan odam.",
            next: "tk_r2b"
          },
          tk_r2b: {
            type: "say", speaker: "Zarina",
            text: "«Ustoz, madrasada qanday o'qiganlar? Partalar bormi?»",
            next: "tk_r2c"
          },
          tk_r2c: {
            type: "say", speaker: "",
            text: "Birinchi savol. Va u matematika haqida emas — u siz haqingizda. Sinf oldinga egildi. Sizda uch o'n soniya bor: hikoya, keyin misol.",
            next: "tk_r2d"
          },
          tk_r2d: {
            type: "say", speaker: "",
            text: "«Pola o'tirardik. Yigirma kishi, bitta kitob, va ustoz hammamizni ism bilan chaqirardi. Matematika qiyin edi — lekin hech kim o'zini notanish his qilmadi.»",
            next: "tk_r2e"
          },
          tk_r2e: {
            type: "say", speaker: "",
            text: "Kimdir «voy» dedi. Nafisa birinchi marta oldinga qaradi. Siz gapirganda xona sizga qarab turdi — va bu birinchi marta emas, lekin birinchi marta o'n to'rt kishi birga.",
            next: "tk_r2f"
          },
          tk_r2f: {
            type: "say", speaker: "",
            text: "Endi misol. Doskaga yozdingiz va chetga chiqdingiz — o'zim yechmasdan.",
            next: "tk_mg"
          },

          tk_r3: {
            type: "say", speaker: "",
            text: "Guvohnoma aytildi. Keyin eng qiyin misol. Siz uni chiroyli yechdingiz — haqiqatan chiroyli. Kimdir qalamini qo'ydi va tomosha qildi.",
            next: "tk_r3b"
          },
          tk_r3b: {
            type: "say", speaker: "Jasur",
            text: "«Ustoz, siz buni qanday bilasiz?»",
            next: "tk_r3c"
          },
          tk_r3c: {
            type: "say", speaker: "",
            text: "«O'qiganman» dedingiz. Va bu rost. Lekin bu gap hech kimni o'zgartirmadi: siz qanchalik yaxshi ekaningizni bilishdi, o'zingizni qanday his qilishlarini emas.",
            next: "tk_r3d"
          },
          tk_r3d: {
            type: "say", speaker: "",
            text: "Va endi eng muhim qismi: xona bo'ylab yurish. Siz yaxshi o'qituvchi ekaningizni isbotladingiz. Endi — odam ekaningizni ko'rsatish navbati.",
            next: "tk_mg"
          },

          tk_after: {
            type: "say", speaker: "",
            text: "Yigirma daqiqa qoldi. Misol doskada, ba'zilar yechdi, ba'zilar hali. Va bitta bola — eng orqada, yirtilgan varaq bilan — hech narsa so'ramadi.",
            next: "tk_after2"
          },
          tk_after2: {
            type: "say", speaker: "",
            text: "Bekzod. Uch hafta oldin kelgan. Daftari yo'q. Va u misolni boshqacha yechayapti — bugun ertalab o'zi aytdi: «men misolni boshqacha yechaman».",
            next: "tk_after3"
          },
          tk_after3: {
            type: "say", speaker: "",
            text: "Sizda qirq daqiqadan yigirma besh qoldi. Bitta harakatga joy bor.",
            next: "tk_after4"
          },
          tk_after4: { type: "end", effects: [{ beat: "gift" }] }
        }
      },

      /* ======================================================================
         THE GESTURE — Bekzod's torn page. The $2 hot dog, in a classroom.
         The expensive move and the unreasonable move are different moves,
         and only one of them costs nothing.
         ====================================================================== */
      gift_start: {
        start: "gf_1",
        nodes: {
          gf_1: {
            type: "say", speaker: "",
            text: "Bekzodning partasi. Oldida yirtilgan bitta varaq — ustida juda tartibli yozuv. Daftar yo'q. Uch hafta davomida hech kim so'ramagan.",
            next: "gf_2"
          },
          gf_2: {
            type: "say", speaker: "",
            text: "Sizda sumkada yangi daftar bor. Uni berish oson: bu yaxshi ish, va hech kim sizni yomon demaydi. Lekin bu — xizmat. O'qituvchi qog'oz beradi, chunki qog'oz kerak.",
            next: "gf_3"
          },
          gf_3: {
            type: "say", speaker: "",
            text: "Va sizda yana bitta narsa bor: siz uning yozuvini ko'rdingiz. U misolni boshqacha yechayapti — o'z usulida, to'g'ri chiqadi. Siz buni bugun ertalab o'zingiz eshitdingiz.",
            next: "gf_q"
          },
          gf_q: {
            type: "choice",
            prompt: "Bekzodga nima qilasiz?",
            options: [
              {
                id: "CH2_GF_1",
                text: "Yangi daftar beraman. Bu to'g'ri ish — va tez.",
                next: "gf_r1",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "Daftar kerak edi va siz berdingiz. Bu yaxshi. Lekin u sizdan qog'oz oldi, e'tibor emas — va birinchi kunda farqi katta. Qog'oz sotib olinadi; «men seni ko'rdim» sotib olinmaydi." } },
                  { trust: 1 },
                  { flag: "c2_gift_notebook" }
                ]
              },
              {
                id: "CH2_GF_2",
                text: "Daftar beraman, ustiga: «Bekzod, sen bugun o'z usulingni aytding. Uni doskaga chiqarib, nomini qo'yamiz: Bekzod usuli. Qani, ko'rsat.»",
                next: "gf_r2",
                effects: [
                  { note: { principle: P.GESTURE, verdict: "good", text: "Bu — hot-dog: qiymati bir daftar, ta'siri butun bir yil. Guidara ikki dollarlik hot-dog'ni idishga chiqarib, mehmonlarga safarning eng yaxshi taomi bo'lib qoldi. Gap narxda emas — aniqlikda. Siz uning usulini oldingiz va uni sinfning oldiga qo'ydingiz." } },
                  { note: { principle: P.SPECIFIC, verdict: "good", text: "Usulga uning ismini qo'yish — eng arzon va eng qimmat sovg'a. U endi «yangi bola» emas: sinfda o'z nomi bilan ataladigan bitta narsa bor. Buni hech kim sotib olmaydi." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz unga universal yordam bermadingiz — o'sha bolaga tegishli yordam berdingiz. Bir xil hamma uchun yaxshi, lekin hech kim o'zini ko'rmaydi." } },
                  { trust: 2 },
                  { intel: "intel_bekzod_named" },
                  { flag: "c2_gift_legend" }
                ]
              },
              {
                id: "CH2_GF_3",
                text: "Hech narsa demayman. Dars tugagach, keyin qolishini so'rayman.",
                next: "gf_r3",
                effects: [
                  { note: { principle: P.LAST, verdict: "weak", text: "«Keyin» — birinchi kunda eng ko'p aytiladigan va eng kam bajariladigan va'da. Va bu bola uch haftadan beri kutmoqda. Yana bir «keyin» unga hech narsa demaydi, garchi siz rostdan ham xohlasangiz." } },
                  { flag: "c2_gift_later" }
                ]
              }
            ]
          },

          gf_r1: {
            type: "say", speaker: "Bekzod",
            text: "«Rahmat.»",
            next: "gf_r1b"
          },
          gf_r1b: {
            type: "say", speaker: "",
            text: "Bitta so'z. Va u yana o'z ishiga qaytdi. Daftar qo'lda, lekin hikoya o'zgarmadi: yangi bola, uch hafta, hech kim so'ramagan.",
            next: "gf_r1c"
          },
          gf_r1c: {
            type: "say", speaker: "",
            text: "Siz yaxshi ish qildingiz. Faqat bu kunni u eslab qoladimi — bilinmaydi. Va sizda hali yigirma daqiqa bor.",
            next: "gf_end"
          },

          gf_r2: {
            type: "say", speaker: "Bekzod",
            text: "«Men... doskaga?»",
            next: "gf_r2b"
          },
          gf_r2b: {
            type: "say", speaker: "",
            text: "U chiqdi. Qo'li titrayapti. Varaqni oldiga qo'ydi va yozdi — o'z usulida, sekin, tartib bilan. Oxirida raqam to'g'ri chiqdi.",
            next: "gf_r2c"
          },
          gf_r2c: {
            type: "say", speaker: "Jasur",
            text: "«Bu nima usul? Bizga bunday o'rgatmaganlar.»",
            next: "gf_r2d"
          },
          gf_r2d: {
            type: "say", speaker: "Bekzod",
            text: "«Boshqa maktabda shunday o'rgatishgan. Va bu tezroq chiqadi.»",
            next: "gf_r2e"
          },
          gf_r2e: {
            type: "say", speaker: "",
            text: "Ovozida birinchi marta g'urur bor edi. Siz esa «Bekzod usuli» deb yozdingiz — bo'r bilan, doskaning chetiga, o'chirmasdan.",
            next: "gf_r2f"
          },
          gf_r2f: {
            type: "say", speaker: "",
            text: "Zarina qo'lini ko'tardi: «Ustoz, men ham bitta usul bilaman. Uning nomi bo'lishi mumkinmi?»",
            next: "gf_r2g"
          },
          gf_r2g: {
            type: "say", speaker: "",
            text: "Va xona o'zgardi. O'n to'rt bola birdan bir narsani tushundi: bu doskada ularning nomi bo'lishi mumkin. Siz bitta gap aytdingiz — va dars o'quvchilarnikiga aylandi.",
            next: "gf_r2h"
          },
          gf_r2h: {
            type: "end",
            effects: [
              { journal: "«Bekzod usuli.» U doskada turibdi va o'chirilmaydi. Bir daftar — va bir ism. Bugun nima qimmatroq ekanini bilib oldim." },
              { trust: 1 },
              { beat: "wobble" }
            ]
          },

          gf_r3: {
            type: "say", speaker: "",
            text: "Dars davom etdi. Bekzod varaqqa yozdi, yana yozdi. U kutdi — bu odam qolishini so'raydimi.",
            next: "gf_r3b"
          },
          gf_r3b: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq chalganda u sekin yig'a boshladi. Siz hali ham bitta gap aytmagansiz. Va dars tugadi.",
            next: "gf_r3c"
          },
          gf_r3c: {
            type: "end",
            effects: [
              { journal: "Bekzodni keyin qoldirmoqchi edim. Qo'ng'iroq chaldi va men hech narsa demadim." },
              { beat: "wobble" }
            ]
          },

          gf_end: { type: "end", effects: [{ beat: "wobble" }] }
        }
      },

      /* ======================================================================
         THE LAST TEN MINUTES — you can go to one of them.
         Only one. That scarcity is the lesson: attention is not divisible.
         ====================================================================== */
      wobble_start: {
        start: "wb_0",
        nodes: {
          wb_0: {
            type: "say", speaker: "",
            text: "Qo'ng'iroqqa o'n daqiqa. Sinfda o'n to'rt bola va har birining o'z hikoyasi bor. Siz hammasining oldiga bormaysiz — vaqt yo'q.",
            next: "wb_1"
          },
          wb_1: {
            type: "say", speaker: "",
            text: "Bu adolatsiz ko'rinadi. Lekin birinchi kunda hamma bilan teng gaplashish — hech kim bilan gaplashmaslikning eng xushmuomala shakli. Bittasini tanlang va u bilan rostdan gaplashing.",
            next: "wb_2"
          },
          wb_2: {
            type: "say", speaker: "",
            text: "Kimning oldiga borasiz? Oldingizda olti imkoniyat. Har biri bitta savol beradi — va sizning javobingiz o'sha bolaning yilini o'zgartiradi.",
            next: "wb_3"
          },
          wb_3: { type: "end" }
        }
      },

      wob_zarina: {
        start: "wz_1",
        nodes: {
          wz_1: {
            type: "say", speaker: "",
            text: "Zarina deraza yonida. Bugun u ikki marta sinfni to'xtatdi — Jasurga, keyin sizga. U gapirmaydi, u tartibga soladi.",
            next: "wz_2"
          },
          wz_2: {
            type: "say", speaker: "",
            text: "U sizga qaradi. Bugun ertalab koridorda u sizni kuzatdi — Jasurni emas. U hukm yozadi va siz uning hukmini hali bilmaysiz.",
            next: "wz_q"
          },
          wz_q: {
            type: "choice",
            prompt: "Zarinaga nima deysiz?",
            options: [
              {
                id: "CH2_WZ_1",
                text: "«Bugun ikki marta sinfni to'xtatdingiz. Men buni ko'rdim — va bu yaxshi edi. Rahmat.»",
                next: "wz_r1",
                effects: [
                  { note: { principle: P.SPECIFIC, verdict: "good", text: "Aniq gap, aniq dalil: «ikki marta». U o'zi qilgan ishni eshitdi. Sinfni boshqaradigan bolaga «yaxshi o'quvchi» deyish hech narsa demaydi — u allaqachon yaxshi o'quvchi. Unga boshqa roli kerak edi, va siz uni ko'rdingiz." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "U sizni sinab ko'rdi va siz sinovni ko'rganingizni aytdingiz. Bu birinchi kunda juda kam qilinadigan narsa: kuchli bolani tan olish unga hokimiyat bermaydi — u siz bilan bir tomonda bo'ladi." } },
                  { trust: 1 },
                  { intel: "intel_zarina_leader" }
                ]
              },
              {
                id: "CH2_WZ_2",
                text: "«Zarina, sen juda yaxshi o'quvchisan.»",
                next: "wz_r2",
                effects: [
                  { note: { principle: P.SPECIFIC, verdict: "weak", text: "U buni har kuni eshitadi. Umumiy maqtov — bonus, sovg'a emas. Va u sizga savol bermagan edi: u javob izlayotgan edi. Siz esa unga unvon berdingiz." } },
                  { flag: "c2_zarina_generic" }
                ]
              },
              {
                id: "CH2_WZ_3",
                text: "«Zarina, bugun ertalab koridorda sen meni kuzatding. Nima ko'rding?»",
                next: "wz_r3",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "Siz uning savolini qaytardingiz — va bu jasorat. Hokimiyatni bolaga bermoqdasiz, birinchi darsda, sendan beri bir soat bo'lgan bo'lsa. U bu savolni yodda saqlaydi." } },
                  { trust: 1 },
                  { intel: "intel_zarina_leads" }
                ]
              }
            ]
          },
          wz_r1: {
            type: "say", speaker: "Zarina",
            text: "«Ular... keyin charchashadi. Men to'xtatmasam dars tugamaydi.»",
            next: "wz_r1b"
          },
          wz_r1b: {
            type: "say", speaker: "",
            text: "Keyin qo'shib qo'ydi: «Sizda osonroq chiqadi. Ertaga ham shundaymi?» Bu savol emas — u o'z shartini qo'yapti: ertaga ham shunday bo'lsin.",
            next: "wz_r1c"
          },
          wz_r1c: {
            type: "end",
            effects: [{ journal: "Zarina sinfni boshqaradi. U buni bilmaydi shekilli — yoki biladi va sinab ko'rdi. Ertaga ham shunday bo'lishi kerak." }, { beat: "exit" }]
          },
          wz_r2: {
            type: "say", speaker: "",
            text: "«Rahmat» dedi va orqaga qaradi. Bosh irg'adi. Bu javob emas — bu xushmuomalalik. U sizni sinagan edi va siz yaxshi javob bermadingiz.",
            next: "wz_r2b"
          },
          wz_r2b: {
            type: "end",
            effects: [{ journal: "Zarinaga «yaxshi o'quvchi» dedim. U buni allaqachon biladi. Men unga hozir kerak bo'lgan gapni topa olmadim." }, { beat: "exit" }]
          },
          wz_r3: {
            type: "say", speaker: "Zarina",
            text: "«Siz...» — u to'xtadi. Keyin: «Siz ertalab eshikda turganingizda, Jasur bilan gaplashmadingiz. Men kuzatdim. Nima uchun?»",
            next: "wz_r3b"
          },
          wz_r3b: {
            type: "say", speaker: "",
            text: "Siz nima deysiz? U sizning javobingizni emas, javob berishingizni kutmoqda. Va u bugun birinchi marta odam bilan odam kabi gaplashdi.",
            next: "wz_r3c"
          },
          wz_r3c: {
            type: "say", speaker: "Zarina",
            text: "«Chunki u sinov. Siz sinovga javob bermayapsiz — siz unga aylanmoqchi emassiz.»",
            next: "wz_r3d"
          },
          wz_r3d: {
            type: "say", speaker: "",
            text: "O'n ikki yoshda. U sizning darsingizdagi eng muhim gapni o'zi aytdi — va siz uni tuzatishingiz shart emas edi.",
            next: "wz_r3e"
          },
          wz_r3e: {
            type: "end",
            effects: [
              { journal: "Zarina: «siz sinovga javob bermayapsiz, unga aylanmoqchi emassiz». U men o'ylagan gapni aytdi. Unga shu gapni qaytarish kerak." },
              { trust: 1 }
            ]
          }
        }
      },

      wob_dilnoza: {
        start: "wd_1",
        nodes: {
          wd_1: {
            type: "say", speaker: "",
            text: "Dilnoza yonidagi qizga nimanidir tushuntirmoqda. Hali ham. Dars tugadi, u tugamadi.",
            next: "wd_q"
          },
          wd_q: {
            type: "choice",
            prompt: "Dilnozaga nima deysiz?",
            options: [
              {
                id: "CH2_WD_1",
                text: "«Dilnoza, sen hozir nima qilding? Men bugun ertalab ham shuni ko'rdim. Bu o'qituvchining eng qiyin ishi.»",
                next: "wd_r1",
                effects: [
                  { note: { principle: P.SPECIFIC, verdict: "good", text: "Siz uning qilganini nomladingiz — «tushuntirishni» o'qituvchilik deb atadingiz. Bu uning o'zi haqida hech o'ylamagan narsasi bo'lishi mumkin. Va siz dalil keltirdingiz: «bugun ertalab ham»." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "Birinchi darsda bitta bolaning kuchini ovoz chiqarib aytish — butun sinfga nima qadrlanishini aytadi. Bundan yaxshiroq qoida yo'q." } },
                  { intel: "intel_dilnoza_explains" }, { beat: "exit" }
                ]
              },
              {
                id: "CH2_WD_2",
                text: "«Dilnoza, sen misolni topmading. Ertaga men tushuntiraman.»",
                next: "wd_r2",
                effects: [
                  { note: { principle: P.ONE, verdict: "weak", text: "U misolni topmagan edi, va siz buni aytdingiz — to'g'ri gap. Lekin u tushuntirayotgan edi. Siz uning kuchini sezmadingiz va orqada qolganini ta'kidladingiz. U sizdan yordam kutgan edi, hukm emas." } },
                  { trust: -1 }
                ]
              }
            ]
          },
          wd_r1: {
            type: "say", speaker: "Dilnoza",
            text: "«Men... men faqat tushuntiryapman. Bu o'qituvchilikmi?»",
            next: "wd_r1b"
          },
          wd_r1b: {
            type: "say", speaker: "",
            text: "«Ha, — deysiz. — Va sen tugatmaguningcha tushuntirasan. Men buni ko'rdim.» U kuldi — birinchi marta, o'zi uchun emas.",
            next: "wd_r1c"
          },
          wd_r1c: {
            type: "end",
            effects: [{ journal: "Dilnoza tushuntiradi. Uni har kuni «gapirasan» deyishgan shekilli. Bugun unga aniq gap aytdim: sen tushuntirasan." }, { beat: "exit" }]
          },
          wd_r2: {
            type: "say", speaker: "",
            text: "U bosh irg'adi va partadoshiga qaytdi. Ertaga u yana tushuntiradi — lekin sizga aytmaydi.",
            next: "wd_r2b"
          },
          wd_r2b: {
            type: "end",
            effects: [{ journal: "Dilnozaga misolni topmaganini aytdim. Bugun uning tushuntirayotganini ko'rmadim. Ertaga ko'raman." }]
          }
        }
      },

      wob_jasur: {
        start: "wj_1",
        nodes: {
          wj_1: {
            type: "say", speaker: "",
            text: "Jasur oyog'ini parta ostidan oldi. Bugun u sizni sinadi — va kelishuvni o'zi tuzdi. Lekin u hali kuladi.",
            next: "wj_q"
          },
          wj_q: {
            type: "choice",
            prompt: "Jasurga nima deysiz?",
            options: [
              {
                id: "CH2_WJ_1",
                text: "«Jasur, bugun kelishuvni sen aytding — «hamma gapirsa, hech kim eshitmaydi». Men o'sha gapni eslab qoldim. Ertaga ham sen aytaсан.»",
                next: "wj_r1",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Siz uning o'z gapini qaytardingiz va deyarli hokimiyat berdingiz: «ertaga ham sen aytasan». Bu chegarani mustahkamlaydi — va uni sizning qoidangiz emas, o'z kelishuvi qilib qo'yadi." } },
                  { note: { principle: P.NAME, verdict: "good", text: "Hazilkash bolani jazolash oson: u sinov qiladi. Boshqa yo'l bor — uni jazolamay, o'sha kuchni xonaga ishlatish. Bu sizning eng katta yutug'ingiz bo'lishi mumkin." } },
                  { trust: 1 },
                  { intel: "intel_jasur_leader" }, { beat: "exit" }
                ]
              },
              {
                id: "CH2_WJ_2",
                text: "«Jasur, bugun ko'p gapirdingiz. Ertaga bu bo'lmasin.»",
                next: "wj_r2",
                effects: [
                  { note: { principle: P.FIRST, verdict: "weak", text: "Bu g'alaba. Siz uni bosdingiz va u jim o'tiradi. Lekin u endi sizning oldingizda emas, orqangizda kuladi — va sinf kim kuchli ekanini o'sha kulgi bilan o'lchaydi." } },
                  { trust: -1 }
                ]
              }
            ]
          },
          wj_r1: {
            type: "say", speaker: "Jasur",
            text: "«Men aytamanmi?»",
            next: "wj_r1b"
          },
          wj_r1b: {
            type: "say", speaker: "",
            text: "«Ha. Sen.» — u bosh irg'adi. Va keyin, ko'zga qaramay: «Ustoz, bugun ertalab siz haqingizda gapirdim. Siz eshitdingizmi?»",
            next: "wj_r1c"
          },
          wj_r1c: {
            type: "say", speaker: "",
            text: "Eshitdingizmi? Bu savol tan olish. Siz ertalab eshitgansiz — va baribir eshikda unga xushmuomala bo'lgansiz.",
            next: "wj_r1d"
          },
          wj_r1d: {
            type: "end",
            effects: [
              { journal: "Jasur: «siz haqingizda gapirdim, eshitdingizmi?» Eshitdim. Va baribir eshikda iliq bo'ldim. Bu ishladi." },
              { trust: 1 },
              { flag: "c2_jasur_allied" }, { beat: "exit" }
            ]
          },
          wj_r2: {
            type: "say", speaker: "",
            text: "U jim qoldi. Butun sinf jim qoldi. Bu tartib — va u sovuq ishlaydi.",
            next: "wj_r2b"
          },
          wj_r2b: {
            type: "end",
            effects: [{ journal: "Jasurni bosdim. Sinf jim. Ertaga bu jimlik menga kerak bo'ladi — yoki menga qarshi ishlaydi." }]
          }
        }
      },

      wob_nafisa: {
        start: "wn_1",
        nodes: {
          wn_1: {
            type: "say", speaker: "",
            text: "Nafisa partadoshiga shivirlayapti. Javobni biladi — bugun sinfda ko'rindi. Lekin baland aytmaydi.",
            next: "wn_2"
          },
          wn_2: {
            type: "say", speaker: "",
            text: "Unga «qani, balandroq gapir» deyish oson. Va bu eng yomon variant: u bir marta baland gapiradi, o'z ovozini eshitadi, va boshqa hech qachon aytmaydi.",
            next: "wn_q"
          },
          wn_q: {
            type: "choice",
            prompt: "Nafisaga nima deysiz?",
            options: [
              {
                id: "CH2_WN_1",
                text: "Yoniga borib, past ovozda: «Sen javobni bilasan. Menga ayta olasanmi — faqat menga?»",
                next: "wn_r1",
                effects: [
                  { note: { principle: P.ONE, verdict: "good", text: "Bir xil yondashuv hammaga ishlamaydi. Nafisa uchun «sinf oldida» — qo'rqinchli, «sizga» — xavfsiz. Guidara: o'qituvchi mehmonni o'qiydi va qanday xizmat qilishni o'zi tanlaydi. Siz uni o'qidingiz." } },
                  { note: { principle: P.MUTUAL ? P.MUTUAL : P.NOTICE, verdict: "good", text: "Siz unga o'z ovozini bermadingiz — unga xavfsiz kanal yasadiz. Bitta odam, past ovoz, o'z sharti. Ishonch shunday boshlanadi: kichik, himoyalangan, bir marta." } },
                  { trust: 1 },
                  { intel: "intel_nafisa_quiet" }, { beat: "exit" }
                ]
              },
              {
                id: "CH2_WN_2",
                text: "Baland: «Nafisa, qani, javobingizni hamma eshitsin!»",
                next: "wn_r2",
                effects: [
                  { note: { principle: P.ONE, verdict: "bad", text: "U o'z ovozini bir marta eshitdi va o'ziga yoqmadi. Endi u keyingi safar yana partadoshiga shivirlaydi — chunki bu ishlaydi. Siz uning eng katta qo'rquvini sinfga ko'rsatdingiz, va buni «ishtirok» deb atadingiz." } },
                  { trust: -2 }
                ]
              },
              {
                id: "CH2_WN_3",
                text: "Tegmayman — u partadoshiga aytmoqda, demak javob sinfda yuribdi.",
                next: "wn_r3",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "weak", text: "Javob yurdi, dars bo'ldi. Lekin Nafisa butun dars sizga bir marta ham qaramadi — va u bugun ko'rinmasligi yana tasdiqlandi. Birinchi darsda ko'rinmaslik odat bo'lib qoladi." } }
                ]
              }
            ]
          },
          wn_r1: {
            type: "say", speaker: "Nafisa",
            text: "U sekin aytdi. To'g'ri. Faqat siz eshittingiz.",
            next: "wn_r1b"
          },
          wn_r1b: {
            type: "say", speaker: "",
            text: "«Rahmat, — deysiz. — Ertaga yana shunday qilamiz. Xohlaganingda kattaroq aytasan — o'zing xohlaganda.» U bosh irg'adi. Bu va'da emas, kelishuv.",
            next: "wn_r1c"
          },
          wn_r1c: {
            type: "end",
            effects: [{ journal: "Nafisa javobni biladi, lekin baland aytmaydi. Unga boshqa yo'l kerak — va u o'zi tanlaydi, qachon." }, { beat: "exit" }]
          },
          wn_r2: {
            type: "say", speaker: "",
            text: "Nafisa qizarib ketdi. Ovozini ko'tardi — lekin eshitilmadi. Kimdir kuldi. U boshqa gapirmadi.",
            next: "wn_r2b"
          },
          wn_r2b: {
            type: "end",
            effects: [{ journal: "Nafisani baland gapirishga majbur qildim. U kuldi. Men buni qaytarib olmayman — lekin ertaga boshqacha qilishim mumkin." }, { beat: "exit" }]
          },
          wn_r3: {
            type: "end",
            effects: [{ journal: "Nafisa javobni partadoshiga aytdi. Dars ishladi. Nafisa ko'rinmadi." }]
          }
        }
      },

      wob_bekzod: {
        start: "wbz_1",
        nodes: {
          wbz_1: {
            type: "say", speaker: "",
            text: "Bekzod orqa burchakda. Uch hafta oldin boshqa maktabdan kelgan. Varag'i hali ham yirtilgan — yoki endi daftari bor.",
            next: "wbz_q"
          },
          wbz_q: {
            type: "choice",
            prompt: "Bekzodga nima deysiz?",
            options: [
              {
                id: "CH2_WB_1",
                text: "«Bekzod, sen bugun o'z usulingni ko'rsatding. Ertaga yana bitta usul ko'rsatasanmi? Men rostdan o'rganmoqchiman.»",
                next: "wbz_r1",
                effects: [
                  { note: { principle: P.NOTICE, verdict: "good", text: "«Men rostidan o'rganmoqchiman» — birinchi darsda o'qituvchining eng kuchli gapi. U hokimiyatni bo'lishadi. Va bu gap bolaga aynan kerak bo'lgan narsani beradi: ertaga qaytish uchun sabab." } },
                  { note: { principle: P.GESTURE, verdict: "good", text: "Bitta gap — va bola ertaga kelish uchun sabab topdi. Guidara: sovg'a qimmat bo'lishi shart emas, u faqat o'sha odamga tegishli bo'lishi kerak." } },
                  { trust: 1 },
                  { intel: "intel_bekzod_tomorrow" }, { beat: "exit" }
                ]
              },
              {
                id: "CH2_WB_2",
                text: "«Bekzod, daftaring bormi endi? Bo'lmasa yana beraman.»",
                next: "wbz_r2",
                effects: [
                  { note: { principle: P.REASONABLE, verdict: "ok", text: "G'amxo'rlik, lekin u materialga qaratilgan. Bola daftar haqida emas — o'zi haqida gapirishni xohlaydi. «Daftaring bormi» degan savol uni yana «qog'oz kerak bo'lgan bola»ga aylantiradi." } },
                  { trust: 1 }
                ]
              }
            ]
          },
          wbz_r1: {
            type: "say", speaker: "Bekzod",
            text: "«Ha. Men ertaga ko'rsataman.»",
            next: "wbz_r1b"
          },
          wbz_r1b: {
            type: "say", speaker: "",
            text: "U birinchi marta ko'zingizga qaradi. Va keyin qo'shib qo'ydi: «Ustoz, men bu maktabda hech kimga kerak emasman deb o'ylagandim.»",
            next: "wbz_r1c"
          },
          wbz_r1c: {
            type: "say", speaker: "",
            text: "Buni u shunchaki aytdi. Bir jumla, jim ovozda. Va bu sizning birinchi kuningiz — bitta dars, qirq besh daqiqa, va bir bola endi ertaga kelish uchun sabab topdi.",
            next: "wbz_r1d"
          },
          wbz_r1d: {
            type: "end",
            effects: [
              { journal: "Bekzod: «men bu maktabda hech kimga kerak emasman deb o'ylagandim.» Bitta gap. Qirq besh daqiqa." },
              { trust: 1 },
              { flag: "c2_bekzod_belongs" }, { beat: "exit" }
            ]
          },
          wbz_r2: {
            type: "say", speaker: "",
            text: "«Bor. Rahmat» dedi. Va ketdi. Mehribonlik qildingiz — lekin u sizga aytmoqchi bo'lgan gapni aytmadi.",
            next: "wbz_r2b"
          },
          wbz_r2b: {
            type: "end",
            effects: [{ journal: "Bekzodga daftar haqida gapirdim. U «rahmat» dedi. Ertaga boshqa savol beraman." }]
          }
        }
      },

      wob_timur: {
        start: "wt_1",
        nodes: {
          wt_1: {
            type: "say", speaker: "",
            text: "Timur eng orqada, krossovkasini parta ostiga yashirib. Bugun ertalab u devorda non yegan edi — va sizga oshxonani aytdi.",
            next: "wt_q"
          },
          wt_q: {
            type: "choice",
            prompt: "Timurga nima deysiz?",
            options: [
              {
                id: "CH2_WT_1",
                text: "«Timur, bugun ertalab aytgan eding — erta kelasan. Ertaga birga oshxonaga boramizmi? Nonni birga yeymiz.»",
                next: "wt_r1",
                effects: [
                  { note: { principle: P.GESTURE, verdict: "good", text: "Bu taklifning narxi nol. Lekin u Timurning gapini eshitganingizni isbotlaydi — ertalab aytilgan bitta gap, kechqurun eslab qolingan. Hech qanday maqtov bunday ishlamaydi." } },
                  { note: { principle: P.NOTICE, verdict: "good", text: "U yolg'iz ovqatlanadi. Siz uni guruhga chaqirmadingiz — o'zingiz u bilan bordingiz. Bu boshqa narsa: u tanlanmagan, u tan olingan." } },
                  { trust: 1 },
                  { intel: "intel_timur_alone" }, { beat: "exit" }
                ]
              },
              {
                id: "CH2_WT_2",
                text: "«Timur, nega krossovkangni yashirding? Yechib tashla.»",
                next: "wt_r2",
                effects: [
                  { note: { principle: P.ONE, verdict: "bad", text: "Ehtimol krossovkasi eski. Ehtimol u oyog'idan uyaladi. Siz «tashla» dedingiz — ya'ni uning sharmandaligini sinfga ko'rsatdingiz. Daftar haqidagi savol ham, bu ham bir xil: ehtiyojni ko'rdingiz, odamni emas." } },
                  { trust: -2 }
                ]
              }
            ]
          },
          wt_r1: {
            type: "say", speaker: "Timur",
            text: "«...Birga?»",
            next: "wt_r1b"
          },
          wt_r1b: {
            type: "say", speaker: "",
            text: "«Ha. Sakkizda. Men ham erta kelaman.» U bosh irg'adi va krossovkasini parta ostidan oldi. Yashirmadi. Shunchaki oldi.",
            next: "wt_r1c"
          },
          wt_r1c: {
            type: "end",
            effects: [
              { journal: "Timur ertalab yolg'iz non yeydi. Ertaga sakkizda birga. Hech qanday maxsus narsa kerak emas edi." },
              { trust: 1 }, { beat: "exit" }
            ]
          },
          wt_r2: {
            type: "say", speaker: "",
            text: "U oyog'ini yanada chuqurroq yashirdi. Hech narsa demadi. Va siz endi bilasiz: bu bola sizga hech qachon oshxona haqida o'zi gapirmaydi.",
            next: "wt_r2b"
          },
          wt_r2b: {
            type: "end",
            effects: [{ journal: "Timurga krossovkasi haqida gapirdim. Xato. U oyog'ini yashirdi." }]
          }
        }
      },

      /* ======================================================================
         THE EXIT — the last minute is the impression they keep.
         Guidara: a stumble at the end can undo three hours; a gracious gesture
         at the end can do the opposite. This is true in every service industry.
         ====================================================================== */
      exit_start: {
        start: "ex_1",
        nodes: {
          ex_1: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. Sinf shovqin bilan ko'tarildi — qirq besh daqiqa tugadi. Ular eshik tomon yurishdi.",
            effects: [{ beat: "exit" }],
            next: "ex_2"
          },
          ex_2: {
            type: "say", speaker: "",
            text: "Va mana shu daqiqa eng muhim. Guidara aytadi: oxiridagi bitta g'ildirak uch soatlik yaxshilikni yo'q qilishi mumkin. Va oxiridagi bitta imo-ishora buning aksini qiladi.",
            next: "ex_3"
          },
          ex_3: {
            type: "say", speaker: "",
            text: "Ular eshikdan chiqmoqda. Siz charchagansiz. Eng oson narsa — doskani o'chirish va ketish.",
            next: "ex_q"
          },
          ex_q: {
            type: "choice",
            prompt: "Oxirgi daqiqada nima qilasiz?",
            options: [
              {
                id: "CH2_EX_1",
                text: "Eshik oldida turaman va har biriga qarab: «Ertaga ko'rishguncha». Ismlarini ayta olsam — aytaman.",
                next: "ex_r1",
                effects: [
                  { note: { principle: P.LAST, verdict: "good", text: "Birinchi kun qanday tugasa, butun yil shunday boshlanadi. «Ertaga ko'rishguncha» — bu xayrlashuv emas, taklif. Va eshikda turish — siz ertalab ham shunday boshlagansiz: ramka yopildi." } },
                  { note: { principle: P.NAME, verdict: "good", text: "Ism bilan xayrlashish — ism bilan kutib olishning ikkinchi yarmi. Ikkisi birga ishlaydi: u sizni eslab qolganini ko'radi." } },
                  { trust: 1 },
                  { flag: "c2_exit_warm" }
                ]
              },
              {
                id: "CH2_EX_2",
                text: "Doskani o'chiraman, stullarni tuzataman, keyin ketaman.",
                next: "ex_r2",
                effects: [
                  { note: { principle: P.LAST, verdict: "weak", text: "Doskadagi «Bekzod usuli» o'chirildi. Ertaga u doskada bo'lmaydi — va bugun sodir bo'lgan eng muhim narsa izsiz qoldi. Tozalik — xizmat. Lekin oxirgi taassurot tozalik emas, siz edingiz." } },
                  { flag: "c2_exit_cleaned" }
                ]
              },
              {
                id: "CH2_EX_3",
                text: "Charchadim. «Ertaga davom etamiz» deb qo'ya qo'ydim va xonadan chiqdim.",
                next: "ex_r3",
                effects: [
                  { note: { principle: P.LAST, verdict: "ok", text: "Rost gap — va charchoq haqiqiy. Lekin birinchi kunda «ertaga davom etamiz» degan gap hali hech narsani va'da qilmaydi. Ular bilmaydi: ertaga kim keladi. Siz buni aytib qo'yishingiz mumkin edi." } }
                ]
              }
            ]
          },

          ex_r1: {
            type: "say", speaker: "",
            text: "Dilnoza. Jasur. Nafisa. Timur. Bekzod. Zarina. Beshtasini ism bilan, bittasini ko'z bilan. Va o'n to'rt bola eshikdan chiqdi — orqalariga qaramay, lekin sekinroq.",
            next: "ex_r1b"
          },
          ex_r1b: {
            type: "say", speaker: "",
            text: "Bekzod eng oxirida chiqdi. To'xtadi. «Ustoz, ertaga ham shu dars bo'ladimi?»",
            next: "ex_r1c"
          },
          ex_r1c: {
            type: "say", speaker: "",
            text: "«Ha. Ertaga ham.» Va u — birinchi marta — kulimsirab chiqdi.",
            next: "ex_r1d"
          },
          ex_r1d: {
            type: "say", speaker: "",
            text: "Koridorda Nodira opa kutib turibdi. «Xo'p bo'ldi?» — deb so'raydi. Va sizda bir soniya bor: nima deb javob berishni tanlash.",
            next: "ex_r1e"
          },
          ex_r1e: {
            type: "say", speaker: "Nodira opa",
            text: "«Bilasanmi, — deydi u. — O'n to'rt bola darsdan keyin koridorda sening ismingni aytib gaplashyapti. Bu birinchi kunda har doim ham bo'lavermaydi.»",
            next: "ex_r1f"
          },
          ex_r1f: {
            type: "say", speaker: "",
            text: "Siz doskaga qaytdingiz. «Bekzod usuli» hali u yerda. Uni o'chirmadingiz — chunki ertaga ular yana shu xonaga qaytadi, va doskada o'z ismini ko'rish uchun qaytadi.",
            next: "ex_r1g"
          },
          ex_r1g: {
            type: "say", speaker: "",
            text: "Ertaga ular yana shu xonaga qaytadi. Va qaytishlarining sababi bugun boshlangan — qo'ng'iroqdan keyin emas, eshikda.",
            effects: [
              { journal: "Birinchi dars tugadi. Doskada «Bekzod usuli» turibdi. Ertaga ularni nima kutayotganini endi bilaman." }
            ],
            next: "ex_done"
          },

          ex_r2: {
            type: "say", speaker: "",
            text: "Doska toza. Stullar tuzatilgan. Xona siz ketganingizdan keyin tozaroq ko'rinadi — va bugungi eng muhim gap o'chirildi.",
            next: "ex_r2b"
          },
          ex_r2b: {
            type: "say", speaker: "",
            text: "Koridorda Nodira opa: «Xo'p bo'ldi?» — «Bo'ldi», deysiz. Va bu rost: dars bo'ldi. Faqat ular nima eslab qolishini bilmaysiz.",
            next: "ex_r2c"
          },
          ex_r2c: {
            type: "say", speaker: "",
            text: "Bekzod koridorda o'tib ketdi. «Ustoz» dedi. Va hech narsa qo'shmadi. U ham bilmaydi — ertaga keladimi.",
            next: "ex_r2d"
          },
          ex_r2d: {
            type: "say", speaker: "",
            text: "Ertaga doskada hech narsa bo'lmaydi. Faqat ular keladimi — bilinmaydi.",
            effects: [
              { journal: "Dars tugadi. Xona toza. Lekin doskada bir ism bor edi — va men uni o'chirdim." }
            ],
            next: "ex_done"
          },

          ex_r3: {
            type: "say", speaker: "",
            text: "Eshikdan chiqdingiz. Orqangizda o'n to'rt bola — ular hali ham xonada, kimdir kulmoqda, kimdir daftar yig'moqda.",
            next: "ex_r3b"
          },
          ex_r3b: {
            type: "say", speaker: "",
            text: "Nodira opa koridorda: «Xo'p bo'ldi?» Siz bosh irg'adingiz. Charchoq — haqiqiy javob, lekin u to'liq javob emas.",
            next: "ex_r3c"
          },
          ex_r3c: {
            type: "say", speaker: "",
            text: "Nima qilib bo'lsa ham birinchi dars tugadi. Endi savol boshqa: ertaga ular qanday kelishadi.",
            next: "ex_r3d"
          },
          ex_r3d: {
            type: "say", speaker: "",
            text: "Eshikni yopdingiz. Va o'sha yerda, koridorda, o'zingizga bitta savol berdingiz — bu savol ertangi darsning boshlanishi.",
            effects: [
              { journal: "Birinchi dars tugadi. Charchadim. Ertaga ular qanday keladi — bilmayman." }
            ],
            next: "ex_done"
          },

          /* Every exit branch converges here: one mission end, one beat, one
             place where the debrief is handed over. Three separate `endMission`
             nodes would mean three endings to keep in sync; one shared node
             means the ending cannot drift. */
          ex_done: {
            type: "end",
            effects: [
              { beat: "done" },
              { endMission: true }
            ]
          }
        }
      },

      /* ======================================================================
         DEFAULT SCENES — talking to a pupil outside their beat.
         ====================================================================== */
      zarina_default: {
        start: "zd_1",
        nodes: {
          zd_1: { type: "say", speaker: "Zarina", text: "Ustoz, biz hozir nima qilamiz?", next: "zd_2" },
          zd_2: { type: "say", speaker: "", text: "U savol beradi, chunki boshqalar ham bilmoqchi. U sinfning og'zi. Ayting — keyin u qolganlariga aytadi.", next: "zd_3" },
          zd_3: { type: "end" }
        }
      },
      dilnoza_default: {
        start: "dd_1",
        nodes: {
          dd_1: { type: "say", speaker: "Dilnoza", text: "Ustoz, men buni tushunmadim. Yana bir marta ayta olasizmi?", next: "dd_2" },
          dd_2: { type: "say", speaker: "", text: "U tushunmaganini birinchi bo'lib aytadi. Shuning uchun u o'n to'rt kishining ichida birinchi bo'lib o'sadi.", next: "dd_3" },
          dd_3: { type: "end" }
        }
      },
      jasur_default: {
        start: "jd_1",
        nodes: {
          jd_1: { type: "say", speaker: "Jasur", text: "Ustoz, bu misol nima uchun kerak? Hayotda qayerda ishlataman?", next: "jd_2" },
          jd_2: { type: "say", speaker: "", text: "Bu sinov emas, savol. Va yaxshi savol. Agar o'zingiz ham ishonmasangiz, javob bermang — yolg'on ular darhol sezadi.", next: "jd_3" },
          jd_3: { type: "end" }
        }
      },
      nafisa_default: {
        start: "nd_1",
        nodes: {
          nd_1: { type: "say", speaker: "", text: "Nafisa sizga qaradi, keyin partadoshiga qaytdi. U gapirmaydi — lekin sizni ko'rdi.", next: "nd_2" },
          nd_2: { type: "say", speaker: "", text: "Unga savol bering — lekin javobni talab qilmang. Birinchi darsda u faqat bir marta aytadi, va qachon aytishini o'zi tanlaydi.", next: "nd_3" },
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
