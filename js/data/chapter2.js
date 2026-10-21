/* ============================================================================
   IKKINCHI BOB — "Birinchi dars: 5-B"
   Sulton School. Azizbek's first ever lesson, 9:00 to 9:45.

   One question runs through all of it:
     Fourteen strangers are deciding who you are, all at once, in the first
     ninety seconds — and you are deciding who they are. What do you do?

   Beats: before -> door -> open -> names -> rules -> task -> wobble -> exit -> done
   Zones: corridor (before the bell, after the bell) and classroom (the lesson).
   ============================================================================ */
window.G = window.G || {};
G.data = G.data || {};

(function () {
  var P = {
    FIRST: "C2-001",   // the room decides who you are before you speak
    MUTUAL: "C2-002",  // attention is mutual and children audit it
    NAME: "C2-003",    // a name is the smallest unit of hospitality
    RULES: "C2-004",   // expectations are service; the reason is colour
    WRONG: "C2-005",   // the moment it breaks is the impression
    EXIT: "C2-006"     // the last minute is what they carry out
  };

  G.data.chapter2 = {
    id: "ch2",
    title: "Birinchi dars: 5-B",
    subtitle: "Sulton School — 9:00, qirq besh daqiqa",
    startZone: "corridor",
    startAnchor: 0,
    opening: "intro",

    brief: [
      "5-B. O'n to'rt begona. Qirq besh daqiqa.",
      "Birinchi to'qson soniyada ular sizni tanlaydi.",
      "Hech narsa isbotlamaysiz — faqat ertaga qaytishlariga sabab yaratasiz."
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
        entry: { default: "bekzod_default", wobble: "wob_bekzod" }
      },
      {
        id: "pupil_timur", name: "Timur", role: "5-B o'quvchisi",
        zone: "classroom", at: 3, palette: "boy", facing: "down",
        entry: { default: "timur_default", wobble: "wob_timur" }
      }
    ],

    triggers: [
      { zone: "classroom", beat: "door", scene: "door", once: true },
      { zone: "corridor", beat: "exit", scene: "exit_start", once: true }
    ],

    objectives: {
      before: "Koridorda: ikki daqiqa",
      door: "5-B eshigini oching",
      open: "Birinchi 90 soniya",
      names: "Dilnoza savol bermoqda",
      rules: "Jasur sinab ko'rmoqda",
      task: "Birinchi misolni bering",
      wobble: "Kimning oldiga borasiz?",
      exit: "Koridorga chiqing",
      done: "Birinchi dars tugadi"
    },

    scenes: {

      /* ======================================================================
         BEFORE THE BELL — corridor. You are on stage before you speak.
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
            text: "Biri devorga suyanib non yemoqda. Ikkitasi bitta telefonga egilgan. Bir qiz boshqalarga nimadir tushuntirmoqda — va hamma unga qarab turadi.",
            next: "in_3"
          },
          in_3: {
            type: "say", speaker: "",
            text: "Qo'lingizda jurnal. O'n to'rt ism, hech qanday yuz. Hayotingizdagi birinchi dars — va u hali boshlanmadi.",
            next: "in_4"
          },
          in_4: {
            type: "say", speaker: "Jasur",
            text: "Ana, yangi o'qituvchi. Yaxshi bo'ldi — bugun matematika bo'lmaydi.",
            next: "in_5"
          },
          in_5: {
            type: "say", speaker: "",
            text: "Kimdir kuldi. Kimdir «jim bo'l» dedi. Siz hali bir og'iz gapirmadingiz — lekin ular siz haqingizda allaqachon bitta jumla yozib qo'yishdi.",
            next: "in_6"
          },
          in_6: {
            type: "say", speaker: "",
            text: "Qo'ng'iroqqa ikki daqiqa. Bu ikki daqiqada nima qilsangiz, u ham hikoyaga kiradi.",
            next: "in_q"
          },
          in_q: {
            type: "choice",
            prompt: "Qo'ng'iroqqacha ikki daqiqa. Nima qilasiz?",
            options: [
              {
                id: "CH2_BEFORE_1",
                text: "«Doskaga rejani yozib qo'yaman» — sinfga kirib, bugungi rejani bo'r bilan yozaman.",
                next: "in_a1",
                effects: [
                  { note: { principle: P.FIRST, verdict: "weak", text: "Doskada reja bor — bu keyin sizni qutqaradi. Lekin qo'ng'iroq oldidan ular ko'rgan narsa sizning orqangiz edi." } },
                  { flag: "c2_plan_ready" }
                ]
              },
              {
                id: "CH2_BEFORE_2",
                text: "«Kuzataman» — hech narsa demay, ularga qarab turaman: kim kim bilan, kim yolg'iz.",
                next: "in_b1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Siz ularni o'qidingiz — va buni hech kimga aytmadingiz. Birinchi taassurot ikki tomonlama ishlaydi." } },
                  { intel: "intel_zarina" },
                  { intel: "intel_bekzod" },
                  { flag: "c2_watched" }
                ]
              },
              {
                id: "CH2_BEFORE_3",
                text: "«Orttirib gaplashaman» — «Qani, kim bu yerda eng yaxshi to'p tepadi?»",
                next: "in_c1",
                effects: [
                  { note: { principle: P.FIRST, verdict: "ok", text: "Siz darsdan oldin odam bo'ldingiz — bu yaxshi. Lekin bir bola gapirayotgan odamga qarab, o'zini yana ko'rinmas qildi." } },
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Kulgini siz boshladingiz. Endi sinf sizdan har daqiqada kulgi kutadi — va bu qarz." } },
                  { intel: "intel_jasur" },
                  { flag: "c2_showed_off" }
                ]
              }
            ]
          },

          in_a1: {
            type: "say", speaker: "",
            text: "Sinf bo'sh. Stullar teskari emas, partalar qator. Doska sovuq, bo'r yangi. Siz to'rt qator yozasiz: tanishuv, kafel, mustaqil ish, xulosa.",
            next: "in_a2"
          },
          in_a2: {
            type: "say", speaker: "",
            text: "Eshik oynasidan kimdir qaraydi. Keyin yana biri. Orqada ovoz: «Qani, nima yozdi?» — va kimdir o'qib beradi: «Ka-fel. Kafel nima?»",
            next: "in_a3"
          },
          in_a3: {
            type: "say", speaker: "",
            text: "Siz tayyorsiz. Reja doskada, bo'r qo'lingizda. Faqat bu ikki daqiqada ular sizning yuzingizni emas, orqangizni ko'rdi.",
            next: "in_end"
          },

          in_b1: {
            type: "say", speaker: "",
            text: "Siz gapirmaysiz. Qo'lingizni cho'ntagingizga solib, eshikka suyanasiz. Ular buni «qo'rqyapti» deb o'ylashadi — bu ham ma'lumot.",
            next: "in_b2"
          },
          in_b2: {
            type: "say", speaker: "",
            text: "Bitta qiz atrofidagilarga qarab gapiradi, va bolalar unga qarab qaror qiladi. Demak hukm shu yerda tug'iladi — uning yonida.",
            next: "in_b3"
          },
          in_b3: {
            type: "say", speaker: "",
            text: "Radiator yonida bir bola yolg'iz. Krossovkasi toza, sumkasi yangi, hech kim u bilan gaplashmaydi. Uch hafta oldin kelgan — jurnalda shunday yozilgan.",
            next: "in_end"
          },

          in_c1: {
            type: "say", speaker: "Jasur",
            text: "Men! Men — eng zo'ri. O'qituvchi, siz o'ynaysizmi? Siz o'ynasangiz, men sizga bir sirlarini aytaman.",
            next: "in_c2"
          },
          in_c2: {
            type: "say", speaker: "",
            text: "Kulgi. Issiq, haqiqiy kulgi — va siz unga sabab bo'ldingiz. Orqa qatorda ingichka bir bola krossovkasiga qaradi va oyoqlarini parta ostiga yashirdi.",
            next: "in_c3"
          },
          in_c3: {
            type: "say", speaker: "",
            text: "Bitta qiz kulmadi. U sizni kuzatdi — Jasurni emas, sizni. Kim kuldiradi, kim hukm qiladi: u hozir shuni yozib qo'ydi.",
            next: "in_end"
          },

          in_end: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. Shovqin bir zumda o'zgaradi — hamma eshikka qaraydi. Eshik sizning qo'lingizda.",
            next: "in_end2"
          },
          in_end2: {
            type: "end",
            effects: [
              { journal: "Birinchi dars. Koridorda o'n to'rt begona va bitta jurnal." },
              { beat: "door" }
            ]
          }
        }
      },

      /* ======================================================================
         THE DOOR — the first thing they hear from you.
         ====================================================================== */
      door: {
        start: "dr_1",
        nodes: {
          dr_1: {
            type: "say", speaker: "",
            text: "Eshikni ochdingiz. Ular sizdan keyin kiradi: birinchi bo'lib Jasur, yelkasini silkitib; oxirida sekin, oyoq uchida — Timur.",
            next: "dr_2"
          },
          dr_2: {
            type: "say", speaker: "",
            text: "To'rt qator stul. Deraza ochiq, parda qimirlaydi. O'n to'rt juft ko'z sizga qaradi va bir zumda jim bo'ldi.",
            next: "dr_3"
          },
          dr_3: {
            type: "say", speaker: "",
            text: "Siz eshik yonida turibsiz. Ular yonidan o'tib ketmoqda. Bu yigirma soniya — sizning birinchi imkoniyatingiz, va u qaytmaydi.",
            next: "dr_q"
          },
          dr_q: {
            type: "choice",
            prompt: "Ular yonidan o'tmoqda. Nima qilasiz?",
            options: [
              {
                id: "CH2_DOOR_1",
                text: "Eshikda turaman va har biriga ko'zga qarab «salom» deyman.",
                next: "dr_r1",
                effects: [
                  { note: { principle: P.FIRST, verdict: "ok", text: "Bugun eshikda turgan odam bo'ldingiz — ertaga ham shu yerda turishingiz kerak. Bir marta emas, har kuni." } },
                  { flag: "c2_door_soft" }
                ]
              },
              {
                id: "CH2_DOOR_2",
                text: "«Zarina, salom. Bekzod, sen o'ng tomonda o'tirasan.»",
                next: "dr_r2",
                requires: { intel: "intel_zarina" },
                lockedText: "«Zarina, salom. Bekzod...» — lekin bu ismlarni qayerdan bilasiz? Siz ularni kuzatmadingiz.",
                effects: [
                  { note: { principle: P.FIRST, verdict: "good", text: "Eshikda ism aytdingiz, va ism to'g'ri chiqdi. Sinf bir zumda tushundi: bu odam bizni ko'rgan." } },
                  { note: { principle: P.NAME, verdict: "good", text: "Bitta ism — o'n to'rt kishilik xonada eng arzon va eng qimmat narsa." } },
                  { trust: 1 },
                  { flag: "c2_door_named" }
                ]
              },
              {
                id: "CH2_DOOR_3",
                text: "Doskaga o'tib, bugungi mavzuni yozaman. Gap — keyin.",
                next: "dr_r3",
                effects: [
                  { note: { principle: P.FIRST, verdict: "weak", text: "Birinchi eshitgan narsalari bo'rning ovozi bo'ldi. Sinf tartibli, lekin siz hali ham notanish odamsiz." } },
                  { flag: "c2_door_cold" }
                ]
              },
              {
                id: "CH2_DOOR_4",
                text: "«Men Azizbek. Bu mening birinchi darsim — sizning ham birinchi darsingiz men bilan.»",
                next: "dr_r4",
                effects: [
                  { note: { principle: P.FIRST, verdict: "good", text: "Rost gapirdingiz, va rost gap birinchi daqiqada ishlaydi. Lekin endi ular «yangi» so'zini har darsda eslab qoladi." } },
                  { trust: 1 },
                  { flag: "c2_door_honest" }
                ]
              },
              {
                id: "CH2_DOOR_5",
                text: "Faqat Timurga: «Salom, Timur. Qaytganing yaxshi bo'ldi.»",
                next: "dr_r5",
                effects: [
                  { note: { principle: P.NAME, verdict: "ok", text: "Siz bilgan yagona ismni ishlatdingiz — va u sizga qaradi. Lekin o'n uch bola ham buni ko'rdi va sanab qo'ydi." } },
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Bir bolaga alohida salom: mehr ko'rsatishning eng tez yo'li va eng qimmat yo'li — chunki u qarzga aylanadi." } },
                  { trust: 1 },
                  { flag: "c2_door_timur" }
                ]
              }
            ]
          },

          dr_r1: {
            type: "say", speaker: "",
            text: "Ba'zilari javob berdi, ba'zilari ko'zini yerga qaratdi. Hech kim ismini so'ramadi. Sinf iliqroq bo'ldi — bir daraja.",
            next: "dr_r1b"
          },
          dr_r1b: {
            type: "say", speaker: "",
            text: "Besh daqiqadan keyin Jasur: «O'qituvchi, siz juda yumshoq ekansiz», — dedi. Va bu hazil emas edi.",
            next: "dr_90"
          },

          dr_r2: {
            type: "say", speaker: "Zarina",
            text: "Siz mening ismimni bilasizmi?",
            next: "dr_r2b"
          },
          dr_r2b: {
            type: "say", speaker: "",
            text: "«Bilaman. Sen boshqalarga tushuntirib turarding — hamma sen tomonga qarab turadi.» U bir zum to'xtadi. Keyin o'tirdi, va bu safar qo'llari bog'lanmagan edi.",
            next: "dr_r2c"
          },
          dr_r2c: {
            type: "say", speaker: "",
            text: "Bekzod ham eshitdi. Uch haftadan beri hech kim uni ismi bilan chaqirmagan. Ko'zlarida ikkita narsa: hayron va ehtiyot.",
            next: "dr_90"
          },

          dr_r3: {
            type: "say", speaker: "",
            text: "Bo'r. Doska. Orqangiz ularga qaragan. Beshta qator yozildi, chiroyli va aniq — siz gapirmadingiz.",
            next: "dr_r3b"
          },
          dr_r3b: {
            type: "say", speaker: "",
            text: "Orqada kimdir pichirladi, keyin yana jim. Sinf tartibli. Lekin havo kutubxonadagidek — va siz hali odam emassiz.",
            next: "dr_90"
          },

          dr_r4: {
            type: "say", speaker: "Jasur",
            text: "Nega birinchi? Sizni haydab yuborishdimi?",
            next: "dr_r4b"
          },
          dr_r4b: {
            type: "say", speaker: "",
            text: "Siz kuldingiz. Sinfning yarmi ham kuldi. Lekin Zarina kulmadi — u sizni tekshirdi: bu odam o'zini aytib qo'ydi, endi nima qiladi?",
            next: "dr_90"
          },

          dr_r5: {
            type: "say", speaker: "",
            text: "Timur boshini ko'tardi. Bir soniya — va yana tushirdi. Lekin ko'tardi.",
            next: "dr_r5b"
          },
          dr_r5b: {
            type: "say", speaker: "Jasur",
            text: "Nega unga salom berdingiz? Ular sizni tanimaydi-ku.",
            next: "dr_r5c"
          },
          dr_r5c: {
            type: "say", speaker: "",
            text: "Siz javob bermadingiz. O'n uch bola bir narsani o'rgandi: bu o'qituvchi kimnidir allaqachon biladi. Yaxshimi, yomonmi — hali bilinmaydi.",
            next: "dr_90"
          },

          dr_90: {
            type: "say", speaker: "",
            text: "Eshik yopildi. O'n to'rt juft ko'z. Sizda to'qson soniya bor — va bu to'qson soniya butun yilni belgilaydi.",
            effects: [{ beat: "open" }],
            next: "dr_91"
          },
          dr_91: {
            type: "say", speaker: "",
            text: "Telefon emas, daftar emas, reja emas. Hozir faqat siz va ular. Uchta harakatga joy bor — uchtadan ko'p emas.",
            next: "dr_mg"
          },
          dr_mg: {
            type: "minigame",
            game: "firstNinety",
            config: {},
            onWin: "dr_win",
            onLose: "dr_lose"
          },
          dr_win: {
            type: "say", speaker: "",
            text: "Sinf o'rniga o'tirdi. Kimdir sizga qarab kulimsirab qo'ydi — o'zi ham kutmagan holda.",
            effects: [
              { note: { principle: P.FIRST, verdict: "good", text: "Birinchi to'qson soniya ishladi: xona ham iliq, ham tartibli. Bu kombinatsiya tasodifan chiqmaydi." } },
              { trust: 1 },
              { flag: "c2_room_warm" }
            ],
            next: "dr_win2"
          },
          dr_win2: {
            type: "say", speaker: "",
            text: "Zarina qo'lini stol ustidan oldi. Jasur gapirayotgan edi — to'xtadi. Bu hali hurmat emas. Lekin uning boshlanishi.",
            next: "dr_end"
          },
          dr_lose: {
            type: "say", speaker: "",
            text: "Sinf jim — lekin noto'g'ri jimlik. O'qituvchi gapiradi, sinf kutadi: hali nima bo'lishini bilmaydi.",
            effects: [
              { note: { principle: P.FIRST, verdict: "weak", text: "Birinchi taassurot siz o'ylagandan boshqacha chiqdi. Ular hukm qildi — va hukm hali ochiq." } },
              { flag: "c2_room_cold" }
            ],
            next: "dr_lose2"
          },
          dr_lose2: {
            type: "say", speaker: "",
            text: "Orqada kimdir pichirladi: «Oqil aka ham shunday boshlagan edi.» Siz eshitdingiz. Ular buni siz eshitishingizni xohladi.",
            next: "dr_end"
          },
          dr_end: {
            type: "say", speaker: "",
            text: "Endi jurnal. O'n to'rt ism — va ular sizdan buni kutmoqda. Birinchi qatorda qo'l ko'tarildi.",
            next: "dr_end2"
          },
          dr_end2: {
            type: "end",
            effects: [
              { journal: "Eshik. Birinchi to'qson soniya. Ular meni sinab ko'rishdi — men o'zimni ko'rsatdim." },
              { beat: "names" }
            ]
          }
        }
      },

      /* ======================================================================
         NAMES — Dilnoza asks the question everyone is thinking.
         ====================================================================== */
      names_start: {
        start: "nm_1",
        nodes: {
          nm_1: {
            type: "say", speaker: "",
            text: "Birinchi qatorda bir qiz qo'lini ko'targan — qalami bilan birga, xuddi javob aytmoqchi bo'lgandek. Daftari ochiq, hamma beti bir xil yozuv bilan to'la.",
            next: "nm_2"
          },
          nm_2: {
            type: "say", speaker: "Dilnoza",
            text: "O'qituvchi, siz bizni eslab qoldingizmi? Ismlarimizni?",
            next: "nm_3"
          },
          nm_3: {
            type: "say", speaker: "",
            text: "Sinf jim. Bu hazil emas. Jurnal qo'lingizda — o'n to'rt ism, va hali bitta ham yuz.",
            next: "nm_4"
          },
          nm_4: {
            type: "say", speaker: "",
            text: "Yolg'on gapirish mumkin. Ular bir hafta ichida bilib olishadi — va o'sha kuni sizdan hech narsa so'ramay qo'yishadi.",
            next: "nm_q"
          },
          nm_q: {
            type: "choice",
            prompt: "Nima deysiz?",
            options: [
              {
                id: "CH2_NAMES_1",
                text: "«Ha. Boshlaymiz — men aytaman, xato qilsam to'g'rilaysiz.»",
                next: "nm_r1",
                effects: [
                  { note: { principle: P.NAME, verdict: "ok", text: "O'yin taklif qildingiz: xato qilish huquqini o'zingizga oldingiz. Bu jasorat, lekin ular hali sizni tanimaydi." } },
                  { flag: "c2_names_game" }
                ]
              },
              {
                id: "CH2_NAMES_2",
                text: "«Yo'q. Hali bilmayman. Bugun o'rganaman — xato qilsam, to'g'rilang.»",
                next: "nm_r2",
                effects: [
                  { note: { principle: P.NAME, verdict: "good", text: "«Bilmayman» — birinchi darsda aytiladigan eng kuchli gap. U ishonch qozonmaydi, lekin yolg'onni oldini oladi." } },
                  { trust: 1 },
                  { flag: "c2_names_honest" }
                ]
              },
              {
                id: "CH2_NAMES_3",
                text: "«Ismlar keyin. Avval dars.»",
                next: "nm_r3",
                effects: [
                  { note: { principle: P.NAME, verdict: "bad", text: "Savolni eshitdingiz va uni keyinga qoldirdingiz. Ular buni «u bizni bilmaydi va bilishni xohlamaydi» deb o'qidi." } },
                  { trust: -1 },
                  { flag: "c2_names_skipped" }
                ]
              }
            ]
          },

          nm_r1: {
            type: "say", speaker: "",
            text: "Kimdir kuldi, kimdir «voy» dedi. Lekin hamma boshini ko'tardi — bu o'yin bo'ldi, va o'yin yaxshi boshlanadi.",
            next: "nm_mg_try"
          },
          nm_mg_try: {
            type: "minigame",
            game: "registerRun",
            config: { seconds: 70 },
            onWin: "nm_win",
            onLose: "nm_lose"
          },

          nm_r2: {
            type: "say", speaker: "Dilnoza",
            text: "Hech bo'lmasa rost gapirdingiz.",
            next: "nm_r2b"
          },
          nm_r2b: {
            type: "say", speaker: "",
            text: "U qo'lini tushirdi. Bu maqtov edi — va sinf eshitdi: bu odam yolg'on gapirmaydi. Endi xato qilish siz uchun xavfliroq, lekin kechiriladigan bo'ldi.",
            next: "nm_mg_honest"
          },
          nm_mg_honest: {
            type: "minigame",
            game: "registerRun",
            config: { seconds: 70, forgiving: true },
            onWin: "nm_win",
            onLose: "nm_lose"
          },

          nm_r3: {
            type: "say", speaker: "",
            text: "Dilnoza qo'lini tushirdi. Biror narsa yozdi — daftariga, chetiga. Sinfda o'sha sovuqlik qoldi.",
            next: "nm_r3b"
          },
          nm_r3b: {
            type: "say", speaker: "",
            text: "Siz darsni boshladingiz va hech kim sizni to'xtatmadi. Bu — oson yo'l. Va u bugun o'n to'rt marta eslab qolinadi.",
            next: "nm_skipped"
          },
          nm_skipped: {
            type: "say", speaker: "",
            text: "Orqa qatorda kimdir jimgina: «U bizni tanimaydi», — dedi. Yonidagi bola: «Biladi. Ismlar keyin, degan.»",
            next: "nm_end"
          },

          nm_win: {
            type: "say", speaker: "",
            text: "Ba'zilarini topdingiz. Kimdir «ha, men shuman» deb kuldi. Sinf yumshadi: siz endi faqat o'qituvchi emassiz — siz odamsiz.",
            effects: [
              { note: { principle: P.NAME, verdict: "good", text: "Besh-olti ism yetarli bo'ldi. Siz hammasini bilmadingiz — lekin bilganlaringizni to'g'ri aytdingiz, va bu ishonch." } },
              { intel: "intel_dilnoza" },
              { trust: 1 },
              { flag: "c2_names_known" }
            ],
            next: "nm_win2"
          },
          nm_win2: {
            type: "say", speaker: "Dilnoza",
            text: "Meni ham esladingiz. Yaxshi. Ertaga tekshiraman — hammasini eslaysizmi.",
            next: "nm_win3"
          },
          nm_win3: {
            type: "say", speaker: "",
            text: "U kulimsirab qo'ydi va daftariga nimadir yozdi. Siz endi bilasiz: bu qiz hamma narsani yozib boradi. Bu yaxshi ham, qo'rqinchli ham.",
            next: "nm_end"
          },

          nm_lose: {
            type: "say", speaker: "Bekzod",
            text: "Men Bekzod emasman. Bekzod — ana u.",
            next: "nm_lose2"
          },
          nm_lose2: {
            type: "say", speaker: "",
            text: "Sinf kuldi — lekin sizga qarshi emas, siz bilan birga. Kulgining o'zi yomon emas. Yomoni — siz hali ham o'n to'rt ismni bilmaysiz.",
            effects: [
              { note: { principle: P.NAME, verdict: "weak", text: "Xato qildingiz va ular kechirdi. Lekin kechirim — ishonch emas. Ertaga o'sha ismni to'g'ri aytish sizning vazifangiz." } },
              { intel: "intel_bekzod" },
              { flag: "c2_names_partial" }
            ],
            next: "nm_end"
          },

          nm_end: {
            type: "say", speaker: "",
            text: "Jasur qo'lini ko'tardi — bu safar haqiqatan savol bilan. Va siz bilasiz: keyingi javob butun darsni belgilaydi.",
            next: "nm_end2"
          },
          nm_end2: {
            type: "end",
            effects: [
              { journal: "Jurnal bilan sinov. O'n to'rt ismdan bir nechtasini oldim — qolganini ertaga olaman." },
              { beat: "rules" }
            ]
          }
        }
      },

      /* ======================================================================
         RULES + THE FIRST MATHS — Jasur tests you.
         ====================================================================== */
      rules_start: {
        start: "ru_1",
        nodes: {
          ru_1: {
            type: "say", speaker: "",
            text: "Jasur qo'lini ko'tarmadi — shunchaki gapirdi, ovozini butun sinf eshitadigan qilib.",
            effects: [{ beat: "rules" }],
            next: "ru_2"
          },
          ru_2: {
            type: "say", speaker: "Jasur",
            text: "O'qituvchi, uy vazifasini tekshirmaysizmi? Oqil aka har darsda tekshirardi. Kim qilmagan bo'lsa — jurnalga yozardi.",
            next: "ru_3"
          },
          ru_3: {
            type: "say", speaker: "",
            text: "O'n to'rt qo'l ostida o'n to'rt daftar. Uchtasida vazifa yo'q. Jasur buni biladi, va hamma buni biladi. U sizni sinab ko'rmoqda: siz Oqilmisiz yoki boshqa narsami?",
            next: "ru_4"
          },
          ru_4: {
            type: "say", speaker: "",
            text: "Bu oddiy savol emas. Bu — sizning birinchi qoidangiz. Va uni hozir, hamma eshitadigan joyda aytasiz.",
            next: "ru_q"
          },
          ru_q: {
            type: "choice",
            prompt: "Birinchi qoidangizni qanday aytasiz?",
            options: [
              {
                id: "CH2_RULES_1",
                text: "«Tekshiraman. Hamma daftarini ochsin — hozir.»",
                next: "ru_r1",
                effects: [
                  { note: { principle: P.RULES, verdict: "weak", text: "Tartib o'rnatdingiz — bu xizmat va u haqiqiy. Lekin tartibni odamlarning ustiga qo'ydingiz: uchta bola endi himoyada o'tiradi." } },
                  { trust: -1 },
                  { flag: "c2_public_check" }
                ]
              },
              {
                id: "CH2_RULES_2",
                text: "«Bugun tekshirmayman. Bitta qoida: xato qilish mumkin — xatoni yashirish mumkin emas.»",
                next: "ru_r2",
                effects: [
                  { note: { principle: P.RULES, verdict: "good", text: "Qoida aytdingiz, va uning sababini ham aytdingiz. Bu tartib emas — bu shartnoma, va ular shartnomani eslab qoladi." } },
                  { trust: 1 },
                  { flag: "c2_one_rule" }
                ]
              },
              {
                id: "CH2_RULES_3",
                text: "«Tekshiraman — lekin avval bitta savol: kimda qiyin bo'ldi?»",
                next: "ru_r3",
                effects: [
                  { note: { principle: P.RULES, verdict: "good", text: "Talabni saqlab qoldingiz va eshikni ochdingiz. Bu besh daqiqaga tushadi — va besh daqiqa sizda yo'q edi." } },
                  { intel: "intel_dilnoza" },
                  { flag: "c2_trade" },
                  { flag: "c2_lost_time" }
                ]
              },
              {
                id: "CH2_RULES_4",
                text: "«Jasur, avval o'zingni tekshir. Qo'shningning daftarini ko'rsat.»",
                next: "ru_r4",
                effects: [
                  { note: { principle: P.RULES, verdict: "bad", text: "Kulgi bilan tartib o'rnatdingiz. Xona sizni oldi. Va bir bola keyingi qirq daqiqada bir marta ham gapirmadi." } },
                  { note: { principle: P.MUTUAL, verdict: "bad", text: "Hazilning nishoni bola bo'ldi. Sinf o'rgandi: bu yerda kulgi qurol." } },
                  { trust: -1 },
                  { flag: "c2_laugh_at_jasur" }
                ]
              }
            ]
          },

          ru_r1: {
            type: "say", speaker: "",
            text: "Daftarlar ochildi. Uchta bo'sh varaq yonida uchta egilgan bosh. Siz ismlarni aytmadingiz — lekin hamma ko'rdi, va o'sha uchtasi buni biladi.",
            next: "ru_r1b"
          },
          ru_r1b: {
            type: "say", speaker: "",
            text: "Tartib o'rnatildi. Va sinf bir narsani o'rgandi: bu xonada xato qilgan odam ko'rinadi.",
            next: "ru_5"
          },

          ru_r2: {
            type: "say", speaker: "Jasur",
            text: "Ya'ni vazifa qilmasa ham bo'ladimi?",
            next: "ru_r2b"
          },
          ru_r2b: {
            type: "say", speaker: "",
            text: "«Bugun — ha. Ertaga ko'ramiz.» Kimdir yengil nafas oldi. Bu bir daqiqalik yengillik — va u sizga qimmatga tushdi: Jasur buni «yumshoqlik» deb yozib qo'ydi.",
            next: "ru_5"
          },

          ru_r3: {
            type: "say", speaker: "Dilnoza",
            text: "Kechagi misolda... men tushunmadim. Va qo'rqdim, so'rashga.",
            next: "ru_r3b"
          },
          ru_r3b: {
            type: "say", speaker: "",
            text: "Yana ikkita qo'l ko'tarildi. Siz besh daqiqa yo'qotdingiz — qirq beshdan besh. Lekin uchta bola sizga bir narsa aytdi, va o'sha narsa kerak edi.",
            next: "ru_5"
          },

          ru_r4: {
            type: "say", speaker: "",
            text: "Sinf kuldi. Jasur ham kuldi — lekin sekinroq, va ko'zlari kulmadi. U daftarini ochdi va boshini egdi.",
            next: "ru_r4b"
          },
          ru_r4b: {
            type: "say", speaker: "",
            text: "Siz bir zumda xonani oldingiz. Va bir bolani yo'qotdingiz. U keyingi qirq daqiqada bir marta ham gapirmadi.",
            next: "ru_5"
          },

          ru_5: {
            type: "say", speaker: "",
            text: "Endi dars. Qo'lingizda bo'r, yonida sinf, va ular haqida hech qanday ma'lumot — Oqilning «orqada» degan gapidan boshqa.",
            next: "ru_6"
          },
          ru_6: {
            type: "say", speaker: "",
            text: "Birinchi misol. U qanday bo'lsa, dars shunday bo'ladi.",
            effects: [{ beat: "task" }],
            next: "ru_7"
          },
          ru_7: {
            type: "say", speaker: "",
            text: "Doskaga qarabsiz. Orqada o'n to'rt bola, oldda bo'sh doska, va qirq daqiqa.",
            next: "ru_tq"
          },
          ru_tq: {
            type: "choice",
            prompt: "Birinchi misolni qanday berasiz?",
            options: [
              {
                id: "CH2_TASK_1",
                text: "«24-bet, 3-mashq. 48 ni 25 ga ko'paytiring.»",
                next: "ru_t1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Siz sinfga emas, sahifaga qaradingiz. Ular bir xil misolni o'tgan yili ham yechmagan — va bugun ham yechmaydi." } },
                  { flag: "c2_task_textbook" }
                ]
              },
              {
                id: "CH2_TASK_2",
                text: "«Bugun o'z sinfimizni o'lchaymiz: polga nechta kafel kerak?»",
                next: "ru_t2",
                effects: [
                  { note: { principle: P.RULES, verdict: "good", text: "Misol ularning xonasidan boshlandi. Bir xil matematika, boshqa eshik — va hech kim «buni nima uchun o'rganamiz» deb so'ramadi." } },
                  { trust: 1 },
                  { flag: "c2_task_life" }
                ]
              },
              {
                id: "CH2_TASK_3",
                text: "«Bitta qiyin masala: yig'indisi 15, ko'paytmasi 56 bo'lgan ikki son.»",
                next: "ru_t3",
                effects: [
                  { note: { principle: P.RULES, verdict: "ok", text: "Talab baland — bu yaxshi. Lekin zinapoya yo'q edi: to'rt kishi ko'tarildi, o'n kishi qog'ozga qarab qoldi." } },
                  { flag: "c2_task_hard" }
                ]
              },
              {
                id: "CH2_TASK_4",
                text: "«Doskadagi reja bo'yicha: avval o'lchaymiz, keyin hisoblaymiz.»",
                next: "ru_t4",
                requires: { flag: "c2_plan_ready" },
                lockedText: "«Doskadagi reja bo'yicha...» — lekin doskada reja yo'q. Siz uni yozmadingiz.",
                effects: [
                  { note: { principle: P.RULES, verdict: "good", text: "Reja doskada turgani uchun dars o'z shaklini saqladi. Tayyorgarlik ko'rinmaydi — lekin u aynan shunday paytlarda ishlaydi." } },
                  { note: { principle: P.FIRST, verdict: "ok", text: "Qo'ng'iroqdan oldin orqangizni ko'rsatgan edingiz. Endi o'sha ikki daqiqa o'zini qaytardi." } },
                  { trust: 1 },
                  { flag: "c2_task_plan" }
                ]
              }
            ]
          },

          ru_t1: {
            type: "say", speaker: "",
            text: "Qalamlar yurdi. Ba'zilari darhol hisobladi. Ko'pchiligi qog'ozga qarab o'tirdi — bu misolni ular o'tgan yili ham yechmagan.",
            next: "ru_t1b"
          },
          ru_t1b: {
            type: "say", speaker: "",
            text: "Ikki daqiqada sinf ikki qismga bo'lindi: hisoblayotganlar va kutayotganlar. Va kutayotganlar jim.",
            next: "ru_work"
          },

          ru_t2: {
            type: "say", speaker: "Jasur",
            text: "Nega kafel? Biz kafel sotmaymiz-ku.",
            next: "ru_t2b"
          },
          ru_t2b: {
            type: "say", speaker: "",
            text: "«Chunki siz shu pol ustida o'tiribsiz. Va bizda qirq daqiqa bor.» Jasur birinchi bo'lib partasining chetini qalami bilan belgiladi. Zarina derazadan polga qaradi.",
            next: "ru_t2c"
          },
          ru_t2c: {
            type: "say", speaker: "",
            text: "Sinf ishladi. Haqiqatan ishladi — va siz hech kimga «jim bo'ling» demadingiz.",
            next: "ru_work"
          },

          ru_t3: {
            type: "say", speaker: "",
            text: "Jimlik. Keyin Dilnoza qo'lini ko'tardi. Yana uch kishi. Qolgan o'n bir kishi qog'ozga qarab qoldi.",
            next: "ru_t3b"
          },
          ru_t3b: {
            type: "say", speaker: "",
            text: "Siz bugun qanchalik kuchli ekanligingizni ko'rsatdingiz. Va kim ishlamayotganini ham ko'rdingiz — bir vaqtda.",
            next: "ru_work"
          },

          ru_t4: {
            type: "say", speaker: "",
            text: "Bola barmog'i bilan doskadagi ikkinchi qatorni ko'rsatdi: «Ana, shu yerda yozilgan.» Reja bor edi — va sinf unga tayandi.",
            next: "ru_t4b"
          },
          ru_t4b: {
            type: "say", speaker: "",
            text: "Siz qo'rqib ketgan paytingizda ham darsning shakli bor edi. Bu sizni qutqardi. Ertaga ham yozib qo'ying — o'zingiz uchun emas, ular uchun.",
            next: "ru_work"
          },

          ru_work: {
            type: "say", speaker: "",
            text: "Besh daqiqa. Qalamlar yurdi. Kimdir qo'l ko'tardi, kimdir partadoshiga egildi, kimdir derazaga qaradi.",
            next: "ru_work2"
          },
          ru_work2: {
            type: "say", speaker: "",
            text: "Va keyin siz bosh ko'tardingiz. Sinf bir xil emas edi. Hech qachon bir xil bo'lmaydi — va ayni damda uch xil narsa sodir bo'lmoqda.",
            effects: [{ beat: "wobble" }],
            next: "ru_end"
          },
          ru_end: {
            type: "end",
            effects: [
              { journal: "Birinchi qoida aytildi. Birinchi misol berildi. Sinf ishlayapti — lekin hammasi emas." }
            ]
          }
        }
      },

      /* ======================================================================
         THE WOBBLE — six pupils, six different four minutes. You can only
         reach one. Each scene ends the same beat, so the other five stay
         unresolved, exactly like a real lesson.
         ====================================================================== */
      wob_zarina: {
        start: "wz_1",
        nodes: {
          wz_1: {
            type: "say", speaker: "",
            text: "Orqa qatorda Zarina yozmayapti. Daftari ochiq, qalami yonida, qo'llari bog'langan. U sizga qaramoqda — va kutmoqda.",
            next: "wz_2"
          },
          wz_2: {
            type: "say", speaker: "Zarina",
            text: "O'qituvchi, men buni qila olaman. Lekin aytingchi — bu nima uchun kerak? Rostini ayting. «Imtihon uchun» demang.",
            next: "wz_3"
          },
          wz_3: {
            type: "say", speaker: "",
            text: "Sinf bir zum jim qoldi. Bu savolni hamma o'ylaydi. Baland aytadigan bola kam — va u aytdi, chunki javobni haqiqatan xohlaydi.",
            next: "wz_q"
          },
          wz_q: {
            type: "choice",
            prompt: "Nima deysiz?",
            options: [
              {
                id: "CH2_WZ_1",
                text: "«Imtihon uchun ham. Lekin asosiy sabab boshqa: matematika sizni aldanmaydigan qiladi.»",
                next: "wz_r1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Sizga haqiqiy savol berildi va siz haqiqiy javob berdingiz. «Seni aldamaydigan qiladi» — bu shior emas, bu ish." } },
                  { trust: 1 },
                  { flag: "c2_why_answered" }
                ]
              },
              {
                id: "CH2_WZ_2",
                text: "«Imtihon uchun. Hayotda kerak bo'ladi. Yozing.»",
                next: "wz_r2",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "bad", text: "Savol eshitildi va javobsiz qoldi. U yozdi — lekin boshini bir marta ham ko'tarmadi. Bu darsdan keyin u savol bermaydi." } }
                ]
              },
              {
                id: "CH2_WZ_3",
                text: "«Sen nima deb o'ylaysan?»",
                next: "wz_r3",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "ok", text: "Savolni qaytardingiz — bu hurmat, lekin javob ham kerak edi. Omadingiz keldi: u o'ynashga tayyor edi." } },
                  { trust: 1 }
                ]
              }
            ]
          },
          wz_r1: {
            type: "say", speaker: "Zarina",
            text: "Qanday qilib aldamaydi?",
            next: "wz_r1b"
          },
          wz_r1b: {
            type: "say", speaker: "",
            text: "«Bu yerda «men shunday deb o'ylayman» ishlamaydi. Tekshirish mumkin. Va sen ham tekshira olasan — o'qituvchini ham.»",
            next: "wz_r1c"
          },
          wz_r1c: {
            type: "say", speaker: "",
            text: "U bir zum jim qoldi. Keyin qalamini oldi. «Yaxshi», — dedi. Va yozdi, tez va aniq.",
            next: "wz_end"
          },
          wz_r2: {
            type: "say", speaker: "",
            text: "U qalamini oldi va yozdi. Yozayotganda bir marta ham boshini ko'tarmadi.",
            next: "wz_end"
          },
          wz_r3: {
            type: "say", speaker: "Zarina",
            text: "Menimcha, siz ham bilmaysiz.",
            next: "wz_r3b"
          },
          wz_r3b: {
            type: "say", speaker: "",
            text: "Jimlik. Keyin siz: «Balki. Lekin bir narsani bilaman — bugun qiyin bo'lgan narsa ertaga osonlashadi. Sababi bor, va u miyada.»",
            next: "wz_r3c"
          },
          wz_r3c: {
            type: "say", speaker: "",
            text: "U kuldi — va bu kulgida hurmat bor edi. Keyin yozdi.",
            next: "wz_end"
          },
          wz_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_zarina" },
              { journal: "Zarina: «bu nima uchun kerak?» — savolga javob berdim." },
              { beat: "exit" }
            ]
          }
        }
      },

      wob_jasur: {
        start: "wj_1",
        nodes: {
          wj_1: {
            type: "say", speaker: "",
            text: "Jasur partasida futbol maydonchasi chizmoqda — qalam bilan, daftar chetiga. Yonidagi ikki bola kulmoqda. Dars uning atrofida to'xtagan.",
            next: "wj_2"
          },
          wj_2: {
            type: "say", speaker: "Jasur",
            text: "Mana, darvozabon shu yerda turadi, lekin hujumchi noto'g'ri joyda... O'qituvchi, siz futbol o'ynaysizmi?",
            next: "wj_3"
          },
          wj_3: {
            type: "say", speaker: "",
            text: "Sinf sizga qaradi. Bu hazil. Va ayni paytda bu sinov: siz uning ustidan kuladigan odammisiz, yo'qmi.",
            next: "wj_q"
          },
          wj_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_WJ_1",
                text: "«Daftaringni ber. Dars paytida chizmaymiz.»",
                next: "wj_r1",
                effects: [
                  { note: { principle: P.RULES, verdict: "weak", text: "Qoida bor edi va siz uni qo'lladingiz. Lekin eshik yo'q edi: u daftarini berdi va boshqa daftarga o'tdi." } },
                  { trust: -1 },
                  { flag: "c2_jasur_closed" }
                ]
              },
              {
                id: "CH2_WJ_2",
                text: "«Maydonni menga ko'rsat. Bo'yi va eni qancha? Yuzini hisoblaymiz.»",
                next: "wj_r2",
                effects: [
                  { note: { principle: P.WRONG, verdict: "good", text: "Buzilishni darsga aylantirdingiz. Sinf ko'rdi: bu odamni to'xtatib bo'lmaydi, lekin u bilan ishlash mumkin." } },
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Siz uning chizgan narsasini jazolamadingiz, ishlatdingiz. Bu — e'tiborning eng qimmat shakli." } },
                  { intel: "intel_jasur_pitch" },
                  { trust: 1 },
                  { flag: "c2_pitch_lesson" }
                ]
              },
              {
                id: "CH2_WJ_3",
                text: "«Chiroyli chizasan. Darsdan keyin menga ko'rsat. Hozir — misolga qayt.»",
                next: "wj_r3",
                effects: [
                  { note: { principle: P.WRONG, verdict: "ok", text: "Hurmat bilan to'xtatdingiz — bu yomon emas. Lekin sinf bir narsani o'rgandi: hamma narsani keyin qilish mumkin." } }
                ]
              }
            ]
          },
          wj_r1: {
            type: "say", speaker: "",
            text: "U daftarini berdi. Sinf jim qoldi. Keyin u boshqa daftar oldi va chizishda davom etdi — sekinroq, lekin davom etdi.",
            next: "wj_end"
          },
          wj_r2: {
            type: "say", speaker: "",
            text: "Jasur qotib qoldi. «Nega?» — «Chunki sen uni chizibsan. Endi hisoblaymiz.» U o'lchadi: qadam bilan, parta chetini belgilab.",
            next: "wj_r2b"
          },
          wj_r2b: {
            type: "say", speaker: "",
            text: "Sinf unga qo'shildi. Besh daqiqada sizning misolingiz uning maydoniga aylandi — va siz o'z rejangizni tashlab ketdingiz.",
            next: "wj_r2c"
          },
          wj_r2c: {
            type: "say", speaker: "",
            text: "Bu dars rejasida yo'q edi. Lekin doskada hozir haqiqiy maydon turibdi, va o'n to'rt bola unga qarab hisoblayapti.",
            next: "wj_end"
          },
          wj_r3: {
            type: "say", speaker: "",
            text: "U chizishni to'xtatdi va yozdi. Lekin yonidagi ikki bola hali ham kulmoqda — va endi kulgi darsga emas, sizga qaratilgan.",
            next: "wj_end"
          },
          wj_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_jasur" },
              { journal: "Jasur daftar chetiga maydon chizayotgan edi. Nima qildim — eslayman." },
              { beat: "exit" }
            ]
          }
        }
      },

      wob_timur: {
        start: "wt_1",
        nodes: {
          wt_1: {
            type: "say", speaker: "",
            text: "Orqa qator, deraza yonida, Timur. Daftari ochiq — lekin o'rtasida emas, chetida. U koptok chizayotgan: maydon, o'yinchi, burchak. Misolga qaramagan.",
            next: "wt_2"
          },
          wt_2: {
            type: "say", speaker: "",
            text: "Ikki hafta kasal bo'lgan. Qaytganda sinf ancha oldinga ketgan. Buni onasi aytgan edi — sizga, darvozada, ikki daqiqada.",
            next: "wt_3"
          },
          wt_3: {
            type: "say", speaker: "",
            text: "U sizni ko'rmayotgandek qiladi. Aslida esa hozir bu sinfdagi eng ko'p sizga qarab turgan bola — shu.",
            next: "wt_q"
          },
          wt_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_WT_1",
                text: "Yoniga borib, partasiga engashaman: «Bu burchak nima uchun shunday?»",
                next: "wt_r1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Siz uning ishini so'radingiz, holatini emas. Bola o'z tilida gapira boshladi — va bu tilda gapirish unga hech kimga qarzdor bo'lmagan yagona yo'l." } },
                  { intel: "intel_timur_margin" },
                  { trust: 2 },
                  { flag: "c2_timur_opened" }
                ]
              },
              {
                id: "CH2_WT_2",
                text: "Baland ovoz bilan: «Timur, sen ham yoz! Hamma bilan birga.»",
                next: "wt_r2",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "bad", text: "Sinf oldida chaqirdingiz. U bitta raqam yozdi va siz ketganingizdan keyin yana chetiga qaytdi. Endi u yaxshiroq yashirinadi." } },
                  { trust: -1 }
                ]
              },
              {
                id: "CH2_WT_3",
                text: "Qo'l ko'targanlarga boraman. U o'zi qo'l ko'tarsa — kelaman.",
                next: "wt_r3",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Adolatli qaror. Lekin adolat — e'tibor emas: qo'l ko'tarmaydigan bola aynan shu sababdan qo'l ko'tarmaydi." } },
                  { flag: "c2_timur_unseen" }
                ]
              }
            ]
          },
          wt_r1: {
            type: "say", speaker: "Timur",
            text: "Bu yerga to'p kelmaydi. Shuning uchun himoyachi shu yerda turadi.",
            next: "wt_r1b"
          },
          wt_r1b: {
            type: "say", speaker: "",
            text: "Siz hech narsa demadingiz. U yana gapirdi — o'zi, hech kim so'ramasdan. Bugungi eng uzun gapi shu edi.",
            next: "wt_r1c"
          },
          wt_r1c: {
            type: "say", speaker: "",
            text: "Dars oxirida u daftarini yopganda chetidagi chizmalarni o'chirmadi. Bu kichik narsa. Birinchi kunda katta narsalar shunday kichik narsalardan yasaladi.",
            next: "wt_end"
          },
          wt_r2: {
            type: "say", speaker: "",
            text: "U qalamini oldi. Daftarning o'rtasiga bitta raqam yozdi. Va siz ketganingizdan keyin yana chetiga qaytdi.",
            next: "wt_end"
          },
          wt_r3: {
            type: "say", speaker: "",
            text: "Uch kishi qo'l ko'targan edi, va siz ularga bordingiz.",
            next: "wt_r3b"
          },
          wt_r3b: {
            type: "say", speaker: "",
            text: "Dars tugaguncha Timur bir marta ham qo'l ko'tarmadi. Siz buni payqadingiz — kech, lekin payqadingiz.",
            next: "wt_end"
          },
          wt_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_timur" },
              { journal: "Timur deraza yonida, daftar chetida koptok chizadi. Unga engashib qaradim." },
              { beat: "exit" }
            ]
          }
        }
      },

      wob_dilnoza: {
        start: "wd_1",
        nodes: {
          wd_1: {
            type: "say", speaker: "",
            text: "Birinchi qatorda Dilnoza. U yozmayapti: ikki qo'li bilan yuzini berkitgan, yelkalari qimirlab turadi. Partasida ochiq daftar — yarim yechilgan misol, keyin chizilgan.",
            next: "wd_2"
          },
          wd_2: {
            type: "say", speaker: "",
            text: "U sinfning eng yaxshi o'quvchisi. Shuning uchun hech kim unga yaqinlashmaydi — u hech qachon yordam so'ramaydi.",
            next: "wd_q"
          },
          wd_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_WD_1",
                text: "Yoniga o'tiraman va jimgina: «Men ham birinchi marta hisoblay olmaganman. Daftaringni yopamiz.»",
                next: "wd_r1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Siz uning yig'isini ko'rdi va ovoz chiqarmadi. «Bilmaslik mumkin» degan gapni sinf eshitmadi — faqat u eshitdi." } },
                  { intel: "intel_dilnoza" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WD_2",
                text: "«Dilnoza, sen eng yaxshisan — buni ham yechasan. Urin.»",
                next: "wd_r2",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Maqtadingiz. Va unga «sen eng yaxshisan» degan yukni yana bir marta ortib qo'ydingiz — bu yuk uni yig'latyapti." } }
                ]
              }
            ]
          },
          wd_r1: {
            type: "say", speaker: "Dilnoza",
            text: "Men hamma narsani bilishim kerak. Bilmaganimni hamma ko'radi.",
            next: "wd_r1b"
          },
          wd_r1b: {
            type: "say", speaker: "",
            text: "«Ko'radi. Va hech narsa bo'lmaydi. Men ham bilmaydigan narsalarim bor — aytsam, ko'rasiz.»",
            next: "wd_r1c"
          },
          wd_r1c: {
            type: "say", speaker: "",
            text: "U daftarini qayta ochdi. Bu safar o'chirmadi.",
            next: "wd_end"
          },
          wd_r2: {
            type: "say", speaker: "",
            text: "U bosh irg'adi. Yana urindi. Va yana o'chirdi.",
            next: "wd_end"
          },
          wd_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_dilnoza" },
              { journal: "Dilnoza yig'layotgan edi. Hech kim ko'rmadi — men ko'rdim." },
              { beat: "exit" }
            ]
          }
        }
      },

      wob_nafisa: {
        start: "wn_1",
        nodes: {
          wn_1: {
            type: "say", speaker: "",
            text: "Nafisa — ikkinchi qatorda, eng chetda. Yozmayapti ham, chizmayapti ham. Labi qimirlayapti: o'zi bilan gaplashyapti.",
            next: "wn_2"
          },
          wn_2: {
            type: "say", speaker: "",
            text: "Yonidagi qiz unga egildi. Nafisa uning qulog'iga nimadir dedi. Qiz bosh irg'adi va yozdi. Javob to'g'ri.",
            next: "wn_3"
          },
          wn_3: {
            type: "say", speaker: "",
            text: "U biladi. Faqat baland aytmaydi. Va sizda bunday bola yana uchta — ularning hammasi bir xil jim.",
            next: "wn_q"
          },
          wn_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_WN_1",
                text: "Yoniga borib, past ovozda: «Menga ayta olasanmi? Faqat menga.»",
                next: "wn_r1",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "good", text: "Unga ovoz berish uchun xavfsiz kanal yasadiz: bitta odam, past ovoz, o'z partasi. Jim bola jimligi uchun emas, xonasi uchun jim." } },
                  { intel: "intel_nafisa" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WN_2",
                text: "Baland: «Nafisa, qani, javobingizni hamma eshitsin!»",
                next: "wn_r2",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "bad", text: "U o'z ovozini bir marta eshitdi va o'ziga yoqmadi. Endi u keyingi safar yana partadoshiga shivirlaydi — chunki bu ishlaydi." } },
                  { trust: -1 }
                ]
              },
              {
                id: "CH2_WN_3",
                text: "Tegmayman — u partadoshiga aytmoqda, demak javob sinfda yuribdi.",
                next: "wn_r3",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Javob yurdi, dars bo'ldi. Lekin Nafisa butun dars sizga bir marta ham qaramadi — va u bugun ko'rinmasligi yana tasdiqlandi." } }
                ]
              }
            ]
          },
          wn_r1: {
            type: "say", speaker: "",
            text: "Nafisa qo'lini ko'tardi — sekin, yarim yo'lda to'xtab. Keyin ko'tardi va aytdi. Javob to'g'ri edi.",
            next: "wn_r1b"
          },
          wn_r1b: {
            type: "say", speaker: "",
            text: "Siz uni sinfga e'lon qilmadingiz. U o'zi xohlamadi, va siz so'radingiz. Kichik narsa: bir ovoz, bir marta, xavfsiz.",
            next: "wn_end"
          },
          wn_r2: {
            type: "say", speaker: "",
            text: "Nafisa qizarib ketdi. Ovozini ko'tardi — lekin eshitilmadi. Kimdir kuldi. U boshqa gapirmadi.",
            next: "wn_end"
          },
          wn_r3: {
            type: "say", speaker: "",
            text: "Javob partadan partaga yurdi, sekin va to'g'ri. Dars ishladi. Nafisa esa bugun hech kimning ko'ziga qaramadi.",
            next: "wn_end"
          },
          wn_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_nafisa" },
              { journal: "Nafisa javobni biladi, lekin baland aytmaydi. Unga boshqa yo'l kerak." },
              { beat: "exit" }
            ]
          }
        }
      },

      wob_bekzod: {
        start: "wb_1",
        nodes: {
          wb_1: {
            type: "say", speaker: "",
            text: "Orqa burchakda Bekzod. Uch hafta oldin boshqa maktabdan kelgan. Partasida daftar yo'q — yirtilgan varaq, va ustida juda tartibli yozuv.",
            next: "wb_2"
          },
          wb_2: {
            type: "say", speaker: "",
            text: "U misolni boshqacha yechmoqda. Sizning usulingiz emas. Ammo raqamlar to'g'ri chiqmoqda — va chiqishda davom etmoqda.",
            next: "wb_3"
          },
          wb_3: {
            type: "say", speaker: "",
            text: "Yangi bola. Hech kim u bilan o'tirmaydi. Va hozir u sizning darsingizda o'z yo'lini topgan — siz esa buni birinchi marta ko'ryapsiz.",
            next: "wb_q"
          },
          wb_q: {
            type: "choice",
            prompt: "Nima qilasiz?",
            options: [
              {
                id: "CH2_WB_1",
                text: "«Bekzod, doskaga chiq. O'z usuling bilan ko'rsat — men ham o'rganaman.»",
                next: "wb_r1",
                effects: [
                  { note: { principle: P.WRONG, verdict: "good", text: "Siz o'qituvchi bo'lib qola olmadingiz va bu darsga foyda keltirdi. Yangi bola birinchi marta sinfga tegishli bo'ldi." } },
                  { note: { principle: P.NAME, verdict: "good", text: "«Men ham o'rganaman» — hokimiyatni bir zumga bo'lishish. Birinchi darsda bu jasorat, keyin odat bo'ladi." } },
                  { intel: "intel_bekzod_way" },
                  { trust: 1 }
                ]
              },
              {
                id: "CH2_WB_2",
                text: "«Bekzod, daftaring yo'qmi? Mana varaqlarim. Va bizning usulda yoz.»",
                next: "wb_r2",
                effects: [
                  { note: { principle: P.MUTUAL, verdict: "weak", text: "Qog'oz berdingiz — yaxshi. Lekin uning usulini yashirishni so'radingiz. U sizga o'zini ko'rsatish imkonini bergan edi." } },
                  { flag: "c2_bekzod_erased" }
                ]
              },
              {
                id: "CH2_WB_3",
                text: "«Bekzod, keyin qol. Sening usulingni ko'rsatasan — hozir darsni davom ettiramiz.»",
                next: "wb_r3",
                effects: [
                  { note: { principle: P.WRONG, verdict: "ok", text: "Darsni to'xtatmaslik oqilona. Lekin «keyin» — birinchi kunda eng ko'p aytiladigan va eng kam bajariladigan va'da." } }
                ]
              }
            ]
          },
          wb_r1: {
            type: "say", speaker: "",
            text: "Sinf jim qoldi. Yangi bola doskaga chiqdi. Qo'li titrayapti, lekin chizdi va tushuntirdi.",
            next: "wb_r1b"
          },
          wb_r1b: {
            type: "say", speaker: "Jasur",
            text: "Bu qanday usul?",
            next: "wb_r1c"
          },
          wb_r1c: {
            type: "say", speaker: "Bekzod",
            text: "Boshqa maktabda shunday o'rgatishgan. Va bu tezroq chiqadi.",
            next: "wb_r1d"
          },
          wb_r1d: {
            type: "say", speaker: "",
            text: "Ovozida birinchi marta g'urur bor edi. Sinf yangi usulni ko'rdi. Va yangi bola bugun birinchi marta o'n to'rt kishilik xonaga tegishli bo'ldi.",
            next: "wb_end"
          },
          wb_r2: {
            type: "say", speaker: "Bekzod",
            text: "Rahmat.",
            next: "wb_r2b"
          },
          wb_r2b: {
            type: "say", speaker: "",
            text: "U varaq oldi va o'z usulini yashirdi. Dars o'tdi. Hech kim bilmadi — na siz, na sinf — bu bolada nima bor edi.",
            next: "wb_end"
          },
          wb_r3: {
            type: "say", speaker: "",
            text: "U bosh irg'adi. Varaqni buklab, sumkasiga soldi. Darsdan keyin u qolmadi — eshikda uni kutib turgan onasi bor edi. Siz buni bilmasdingiz.",
            next: "wb_end"
          },
          wb_end: {
            type: "end",
            effects: [
              { flag: "c2_wob_bekzod" },
              { journal: "Bekzod boshqa usulda yechadi. U orqada emas — u boshqacha." },
              { beat: "exit" }
            ]
          }
        }
      },

      /* ======================================================================
         THE EXIT — the last minute, in the corridor.
         ====================================================================== */
      exit_start: {
        start: "ex_1",
        nodes: {
          ex_1: {
            type: "say", speaker: "",
            text: "Qo'ng'iroq. O'n to'rt stul bir vaqtda qimirladi. Siz eshikni ochdingiz va koridorga chiqdingiz — ular yoningizdan oqib chiqmoqda.",
            next: "ex_2"
          },
          ex_2: {
            type: "say", speaker: "",
            text: "Qirq besh daqiqa tugadi. Ular darsni o'rtacha hisob bilan eslab qolmaydi. Oxirgi daqiqani eslab qolishadi.",
            next: "ex_3"
          },
          ex_3: {
            type: "say", speaker: "",
            text: "Va sizda o'ttiz soniya bor. Keyin koridor bo'shaydi va bugun qaytarib bo'lmaydi.",
            next: "ex_q"
          },
          ex_q: {
            type: "choice",
            prompt: "Ular chiqib ketmoqda. Nima qilasiz?",
            options: [
              {
                id: "CH2_EXIT_1",
                text: "Har biriga ismini aytib, bitta o'z gapimni qo'shib qo'yaman.",
                next: "ex_r1",
                requires: { flag: "c2_names_known" },
                lockedText: "Har biriga ismi bilan... — lekin siz ismlarni o'rganmadingiz. Faqat bir nechtasini bilasiz.",
                effects: [
                  { note: { principle: P.EXIT, verdict: "good", text: "Oxirgi daqiqada ism aytdingiz. Sinf koridorga chiqdi va o'zi bilan bir narsa olib chiqdi: bu odam meni biladi." } },
                  { note: { principle: P.NAME, verdict: "good", text: "Birinchi darsni ism bilan yopdingiz. Ertaga bu ism yana ishlaydi — va yana o'sha ism." } },
                  { trust: 2 },
                  { flag: "c2_exit_names" }
                ]
              },
              {
                id: "CH2_EXIT_2",
                text: "«Ertaga shu misol bilan boshlaymiz. Kafel masalasi tugamagan.»",
                next: "ex_r2",
                effects: [
                  { note: { principle: P.EXIT, verdict: "ok", text: "Aniq va halol: ertangi darsning birinchi soniyasi bugun aytildi. Bu xizmat, lekin hali rang emas." } },
                  { flag: "c2_exit_homework" }
                ]
              },
              {
                id: "CH2_EXIT_3",
                text: "Hech narsa demay, yon tomonda turaman va ularni o'tkazaman.",
                next: "ex_r3",
                effects: [
                  { note: { principle: P.EXIT, verdict: "bad", text: "Oxirgi taassurot — sizning yo'qligingiz bo'ldi. Ular chiqdi va eshikda hech kim yo'q edi. Ertaga ular buni eslaydi." } },
                  { trust: -1 },
                  { flag: "c2_exit_silent" }
                ]
              },
              {
                id: "CH2_EXIT_4",
                text: "Timurni bir zum to'xtataman: «Ertaga daftaringning chetini ko'rsat — menga qiziq.»",
                next: "ex_r4",
                requires: { intel: "intel_timur_margin" },
                lockedText: "«Daftaringning chetini ko'rsat...» — lekin siz u chetda nima borligini bilmaysiz.",
                effects: [
                  { note: { principle: P.EXIT, verdict: "good", text: "Oxirgi daqiqada bitta bolaga aniq bir narsa aytdingiz. Bu sovg'a emas, va'da emas — keyingi uchrashuvning sanasi." } },
                  { note: { principle: P.NAME, verdict: "ok", text: "O'n uch bola eshikdan chiqib ketdi, bittasi to'xtadi. Ular buni sanaydi — shuning uchun ertaga ikkinchisini to'xtating." } },
                  { trust: 2 },
                  { flag: "c2_exit_timur" }
                ]
              },
              {
                id: "CH2_EXIT_5",
                text: "«Kimning savoli bo'lsa — eshik ochiq. Tanaffusda shu yerdaman.»",
                next: "ex_r5",
                effects: [
                  { note: { principle: P.EXIT, verdict: "good", text: "Eshikni ochiq qoldirdingiz. Bu hech kimni majburlamaydi — va aynan shuning uchun jim bolalar keladi." } },
                  { trust: 1 },
                  { flag: "c2_exit_open" }
                ]
              }
            ]
          },

          ex_r1: {
            type: "say", speaker: "",
            text: "«Zarina — sen bugun savol berding, rahmat.» «Jasur — maydoningni ertaga ko'ramiz.» «Nafisa — sekin gapirsang ham eshitaman.»",
            next: "ex_r1b"
          },
          ex_r1b: {
            type: "say", speaker: "",
            text: "Ular kulishdi, kimdir «xo'p» dedi, kimdir hech narsa demadi. Lekin eshikdan chiqayotganda ikkitasi ortiga qaradi.",
            next: "ex_r1c"
          },
          ex_r1c: {
            type: "say", speaker: "",
            text: "Ertaga ular keladi. Va ertaga siz allaqachon ularni bilasiz — bu bir kechada yo'qolmaydigan yagona narsa.",
            next: "ex_final"
          },

          ex_r2: {
            type: "say", speaker: "",
            text: "Kimdir «xo'p» dedi. Ko'pchilik eshitmadi — ular allaqachon koridorda edi.",
            next: "ex_r2b"
          },
          ex_r2b: {
            type: "say", speaker: "",
            text: "Ertaga bu vazifani birinchi bo'lib so'raysiz. Uch kishi qo'l ko'taradi, yetti kishi ko'tarmaydi. Bu ham bir boshlanish — lekin u sizning gapingizga emas, jurnalga tayanadi.",
            next: "ex_final"
          },

          ex_r3: {
            type: "say", speaker: "",
            text: "Ular o'tib ketdi. Kimdir «xayr» dedi, siz «xayr» dedingiz. Koridor bo'shadi.",
            next: "ex_r3b"
          },
          ex_r3b: {
            type: "say", speaker: "",
            text: "Siz eshik yonida bir daqiqa tik turdingiz. Ertaga ular keladi — chunki jadvalda shunday yozilgan. Hozircha bu yetarli emas, lekin bu bor.",
            next: "ex_final"
          },

          ex_r4: {
            type: "say", speaker: "Timur",
            text: "Nima uchun?",
            next: "ex_r4b"
          },
          ex_r4b: {
            type: "say", speaker: "",
            text: "«Chunki sen u yerda o'zingni chizasan. Menga qiziq — nima chizayotganingni bilmoqchiman.»",
            next: "ex_r4c"
          },
          ex_r4c: {
            type: "say", speaker: "",
            text: "U hech narsa demadi. Lekin sekin yurdi — va eshikdan chiqishdan oldin ortiga qaradi.",
            next: "ex_final"
          },

          ex_r5: {
            type: "say", speaker: "",
            text: "Ular ketdi. Keyin Dilnoza qaytdi: «O'qituvchi, kechagi misolni...» Ortidan Bekzod keldi. Keyin Jasur — hazil qilib, lekin keldi.",
            next: "ex_r5b"
          },
          ex_r5b: {
            type: "say", speaker: "",
            text: "Tanaffusingiz tugadi. Siz choy ichmadingiz, daftar tekshirmadingiz, o'tirchaga o'tirmadingiz. Va bugun birinchi marta kimdir sizdan o'zi yordam so'radi.",
            next: "ex_final"
          },

          ex_final: {
            type: "say", speaker: "",
            text: "Koridor bo'shadi. Eshik yopildi. Qirq besh daqiqa — va endi siz bilasiz: birinchi dars dars emas edi. Uchrashuv edi.",
            next: "ex_final2"
          },
          ex_final2: {
            type: "say", speaker: "",
            text: "Ertaga ular qaytadimi? Bugun siz buni to'liq bilmaysiz. Lekin bilgan narsangiz bor: kim qaytishini xohlayotganini, va nega.",
            next: "ex_end"
          },
          ex_end: {
            type: "end",
            effects: [
              { journal: "Birinchi dars tugadi. O'n to'rt begona emas — o'n to'rt o'quvchi." },
              { beat: "done" },
              { endMission: true }
            ]
          }
        }
      },

      /* ======================================================================
         COLOUR — each pupil, mid-lesson, when you have no reason to talk to
         them except that you can.
         ====================================================================== */
      zarina_default: {
        start: "zd_1",
        nodes: {
          zd_1: { type: "say", speaker: "", text: "Zarina sizga qarab turadi. Uning daftarida hamma narsa yozilgan — lekin chetida savol belgilari ko'p.", next: "zd_2" },
          zd_2: { type: "say", speaker: "Zarina", text: "O'qituvchi, siz Oqil akani taniysizmi? U bizga «keyin tushuntiraman» derdi. Har darsda.", next: "zd_3" },
          zd_3: { type: "say", speaker: "", text: "Bu savol emas. Bu tekshiruv: siz ham «keyin» deydigan odammisiz.", next: null }
        }
      },
      dilnoza_default: {
        start: "dd_1",
        nodes: {
          dd_1: { type: "say", speaker: "", text: "Dilnoza daftarini ko'rsatadi — misol yechilgan, hamma qadam yozilgan, hamma joyda qalam bilan tuzatilgan.", next: "dd_2" },
          dd_2: { type: "say", speaker: "Dilnoza", text: "To'g'rimi? Iltimos, ayting — to'g'rimi? Men uch marta tekshirdim.", next: "dd_3" },
          dd_3: { type: "say", speaker: "", text: "Uchinchi marta tekshirgan bola uchun eng qimmat gap «to'g'ri» emas. «Tekshirish shart emas» — qimmatroq.", next: null }
        }
      },
      jasur_default: {
        start: "jd_1",
        nodes: {
          jd_1: { type: "say", speaker: "", text: "Jasur partasida qalam bilan nog'ora chalmoqda. Ritm to'g'ri — va u buni biladi.", next: "jd_2" },
          jd_2: { type: "say", speaker: "Jasur", text: "O'qituvchi, siz qayerda o'qigansiz? Sizni ham shunday partada o'tirgansizmi?", next: "jd_3" },
          jd_3: { type: "say", speaker: "", text: "U hazil qilmoqda. Lekin javobni haqiqatan xohlaydi — va siz buni ovozidan eshityapsiz.", next: null }
        }
      },
      nafisa_default: {
        start: "nd_1",
        nodes: {
          nd_1: { type: "say", speaker: "", text: "Nafisa partasiga qarab o'tiribdi. Qalami qo'lida, lekin yozmayapti. Yonidagi qiz unga egilib nimadir dedi.", next: "nd_2" },
          nd_2: { type: "say", speaker: "Nafisa", text: "...", next: "nd_3" },
          nd_3: { type: "say", speaker: "", text: "Ovoz chiqmadi. Lablari qimirladi — o'sha. U hali tayyor emas, va buni majburlash uni yana bir yilga yopadi.", next: null }
        }
      },
      bekzod_default: {
        start: "bd_1",
        nodes: {
          bd_1: { type: "say", speaker: "", text: "Bekzod yozmoqda. Varaq yirtilgan, lekin yozuv tekis — daftardagidan ham tekis.", next: "bd_2" },
          bd_2: { type: "say", speaker: "Bekzod", text: "Sizda daftar bormi? Men o'zimnikini uyda qoldirdim. Ertaga olib kelaman.", next: "bd_3" },
          bd_3: { type: "say", speaker: "", text: "Uch hafta ichida hech kim bu savolni bermagan. U so'rashdan uyalgani uchun emas — so'raydigan odam yo'qligi uchun jim o'tirgan.", next: null }
        }
      },
      timur_default: {
        start: "td_1",
        nodes: {
          td_1: { type: "say", speaker: "", text: "Timur derazaga qaraydi. Daftari ochiq, qalami qo'lida — lekin yozmayapti.", next: "td_2" },
          td_2: { type: "say", speaker: "Timur", text: "Men qilaman. Keyin.", next: "td_3" },
          td_3: { type: "say", speaker: "", text: "«Keyin» — bu javob emas, bu eshik. Uni ochish uchun savol kerak, buyruq emas.", next: null }
        }
      }
    }
  };
})();
