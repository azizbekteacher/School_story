/* ============================================================================
   BIRINCHI KUN — mission 1 script
   Sulton School. Azizbek's first day as a mathematics teacher.

   Theme: service is black and white, hospitality is color.
          Thoughtfulness beats luxury.

   Beats: arrive -> staffroom -> oqil -> mother -> lesson -> timur
          -> gift -> walk -> report -> done
   ============================================================================ */
window.G = window.G || {};
G.data = G.data || {};

(function () {
  var P = {
    SERVICE: "I-001",
    ENLIGHTENED: "I-002",
    PRESENT: "I-028",
    THOUGHTFUL: "I-043",
    SYSTEMIZE: "I-044",
    ENGINE: "F-013"
  };

  G.data.story = {
    id: "mission1",
    title: "Birinchi kun: Timur",
    subtitle: "Sulton School — 1-kun",
    opening: "opening",

    brief: [
      "Timur — 5-B. Jim, matematikada orqada.",
      "Onasi darvozada kutmoqda.",
      "Bugun nima qilsangiz — ertaga u bilan ishlaysiz."
    ],

    npcs: [
      {
        id: "abubakr", name: "Abu Bakr", role: "Direktor o'rinbosari",
        zone: "staffroom", at: 2, palette: "adult_male", facing: "down",
        entry: { default: "abq_start" }
      },
      {
        id: "oqil", name: "Oqil", role: "Matematika o'qituvchisi",
        zone: "staffroom", at: 4, palette: "teacher_male", facing: "down",
        entry: { default: "oqil_start" }
      },
      {
        id: "nodira", name: "Nodira opa", role: "Timurning onasi",
        zone: "gate", at: 0, palette: "mother", facing: "down",
        entry: { default: "mom_start", report: "report_start" }
      },
      {
        id: "timur", name: "Timur", role: "5-B o'quvchisi",
        zone: "classroom", at: 1, palette: "boy", facing: "down",
        entry: { default: "timur_start" }
      },
      {
        id: "sardor", name: "Sardor aka", role: "Do'kon egasi",
        zone: "shop", at: 1, palette: "shopkeeper", facing: "down",
        entry: { default: "gift_start" }
      }
    ],

    triggers: [
      { zone: "staffroom", beat: "arrive", scene: "staffroom_enter", once: true },
      { zone: "classroom", beat: "lesson", scene: "lesson_start", once: true },
      { zone: "yard", beat: "walk", scene: "walk_start", once: true }
    ],

    objectives: {
      arrive: "Maktabga kir, o'qituvchilar xonasini top",
      staffroom: "Abu Bakr bilan gaplash",
      oqil: "Oqil bilan gaplash — u Timurni biladi",
      mother: "Darvozadagi onasi bilan gaplash",
      lesson: "5-B sinfiga kir",
      timur: "Timur bilan gaplash",
      gift: "Do'kondan Timur uchun kichik narsa ol",
      walk: "Timurni uyiga kuzatib bor",
      report: "Nodira opaga hisobot ber",
      done: "Birinchi kun tugadi"
    },

    scenes: {

      /* ================= OPENING ================= */
      opening: {
        start: "op_1",
        nodes: {
          op_1: {
            type: "say", speaker: "",
            text: "Ertalab 8:40. Sulton School darvozasi oldida turibsiz. Qo'lingizda bugungi jadval: birinchi dars 9:00 — 5-B, matematika.",
            next: "op_2"
          },
          op_2: {
            type: "say", speaker: "",
            text: "Kecha Abu Bakr bilan shartlarni kelishdingiz. Bugun hali hech kim sizni tanimaydi. Siz ham hech kimni tanimaysiz.",
            next: "op_3"
          },
          op_3: {
            type: "say", speaker: "",
            text: "Darvozada bir ayol turibdi. Bolasining ryukzagini to'g'rilab qo'ymoqda. Sizga bir qarab qo'ydi-yu, gapirmadi.",
            next: "op_4"
          },
          op_4: {
            type: "say", speaker: "",
            text: "Ichkariga kirasiz. Bugun omadingizni haddan tashqari ko'p narsaga urinmaslik bilan sinab ko'ring: avval kuzating, keyin biror narsa qiling.",
            next: "op_end"
          },
          op_end: {
            type: "end",
            effects: [
              { beat: "arrive" },
              { journal: "Birinchi kun. Darvozada bir ayol kutib turgan edi." }
            ]
          }
        }
      },

      /* ================= ENTERING THE STAFFROOM ================= */
      staffroom_enter: {
        start: "se_1",
        nodes: {
          se_1: {
            type: "say", speaker: "",
            text: "O'qituvchilar xonasi. Choynak, stol ustida qog'ozlar, doskada haftalik jadval. Deraza oldida Abu Bakr turadi.",
            next: "se_2"
          },
          se_2: {
            type: "say", speaker: "",
            text: "Burchakda yana bir kishi o'tiribdi — oldida daftarlar uyumi. U boshini ko'tarmadi, faqat qo'li bilan salom berdi.",
            next: "se_end"
          },
          se_end: {
            type: "end",
            effects: [
              { beat: "staffroom" },
              { journal: "O'qituvchilar xonasi: jadval, choynak, va ikki charchagan odam." }
            ]
          }
        }
      },

      /* ================= ABU BAKR ================= */
      abq_start: {
        start: "abq_1",
        nodes: {
          abq_1: {
            type: "say", speaker: "Abu Bakr",
            text: "Keling, keling! Azizbek aka, to'g'ri keldingiz. Choy ichasizmi? Bugun birinchi kuningiz — jadvalni bir ko'zdan kechirdik.",
            next: "abq_2"
          },
          abq_2: {
            type: "say", speaker: "Abu Bakr",
            text: "Haftada 18 soat. Kuniga 3-4 dars, ba'zi kunlari 5. 5-B sizga biriktirildi — sinf rahbari ham siz bo'lasiz.",
            next: "abq_3"
          },
          abq_3: {
            type: "say", speaker: "",
            text: "U jadvalni stolga qo'ydi. Qog'ozda kataklar zich — tanaffus ham, bo'sh vaqt ham deyarli yo'q.",
            next: "abq_4"
          },
          abq_4: {
            type: "say", speaker: "Abu Bakr",
            text: "Ochig'i, jadval hali qotib qolmagan. Xohlasangiz biror narsani o'zgartiramiz. Nima deysiz?",
            next: "abq_q1"
          },
          abq_q1: {
            type: "choice",
            prompt: "Nima deysiz?",
            options: [
              {
                id: "ABQ_1",
                text: "«Jadval yaxshi ko'rinadi. Darslarni boshlayveraman.»",
                next: "abq_r1",
                effects: [
                  { note: { principle: P.SERVICE, verdict: "weak", text: "Jadvalni so'ramasdan qabul qildingiz: siz faqat dars o'tadigan odam bo'lib qoldingiz." } },
                  { flag: "abq_flat" }
                ]
              },
              {
                id: "ABQ_2",
                text: "«Avval bir narsani so'rasam bo'ladimi — maktab keyingi yil qayerga ketmoqchi?»",
                next: "abq_r2",
                effects: [
                  { note: { principle: P.ENLIGHTENED, verdict: "good", text: "Jadvaldan oldin maqsadni so'radingiz: o'qituvchi emas, maktabning bir qismi bo'lishga qiziqdingiz." } },
                  { trust: 1 },
                  { flag: "abq_vision" },
                  { journal: "Abu Bakr yangi filiallar haqida gapirdi. Hali rasmiy emas, lekin jiddiy." }
                ]
              },
              {
                id: "ABQ_3",
                text: "«Men 3 darsdan ko'proq o'ta olmayman. Menga loyihalar uchun vaqt kerak.»",
                next: "abq_r3",
                effects: [
                  { note: { principle: P.SYSTEMIZE, verdict: "weak", text: "Talabingiz to'g'ri, lekin birinchi kuni, hali ishonch qozonmasdan aytildi — himoyalanish bo'lib eshitildi." } },
                  { flag: "abq_push" }
                ]
              }
            ]
          },
          abq_r1: {
            type: "say", speaker: "Abu Bakr",
            text: "Yaxshi. Birinchi kunlarda odamlar ko'p gapiradi, keyin charchaydi. Siz gapirmadingiz — bu ham bir yo'l.",
            next: "abq_r1b"
          },
          abq_r1b: {
            type: "say", speaker: "",
            text: "U jadvalni yig'ishtirdi. Suhbat tugadi. Siz xonada qoldingiz — va bitta savol berilmagan holda qoldi: bu maktab qayoqqa ketyapti?",
            next: "abq_end"
          },
          abq_r2: {
            type: "say", speaker: "Abu Bakr",
            text: "Hmm. Ikkinchi kunda shu savolni beradigan odam kam. Kelasi yil ikki filial haqida o'ylayapmiz — Buxoro markazida va G'ijduvonda.",
            next: "abq_r2b"
          },
          abq_r2b: {
            type: "say", speaker: "Abu Bakr",
            text: "Lekin filial ochish oson. Muammo — bir xil sifatni saqlash. Bitta maktabda yaxshi ishlaydigan narsa ikkinchisida ishlamaydi.",
            next: "abq_r2c"
          },
          abq_r2c: {
            type: "say", speaker: "Abu Bakr",
            text: "Xo'p, jadvalga qaytamiz. 5-B da bir bola bor — Timur. Matematikada orqada. Sinf rahbari bo'lasiz, o'zingiz ko'rasiz.",
            next: "abq_end"
          },
          abq_r3: {
            type: "say", speaker: "Abu Bakr",
            text: "Hozir? Birinchi kunda?",
            next: "abq_r3b"
          },
          abq_r3b: {
            type: "say", speaker: "Abu Bakr",
            text: "Azizbek aka, men sizni matematika o'qituvchisi sifatida oldim. Avval shu yerda o'zingizni ko'rsating. Keyin gaplashamiz — vaqt bor.",
            next: "abq_r3c"
          },
          abq_r3c: {
            type: "say", speaker: "",
            text: "U jadvalni yopdi. Xona jim. Oqil burchakda boshini ko'tarmadi, lekin siz uning kulimsiraganini ko'rdingiz.",
            next: "abq_end"
          },
          abq_end: {
            type: "end",
            effects: [
              { beat: "oqil" },
              { journal: "Abu Bakr: filiallar, sifat, va «avval o'zingizni ko'rsating»." }
            ]
          }
        }
      },

      /* ================= OQIL ================= */
      oqil_start: {
        start: "oq_1",
        nodes: {
          oq_1: {
            type: "say", speaker: "",
            text: "Oqil oldida 40 ga yaqin daftar. Qo'li bilan bir varaqni ochdi-yu, yana yopdi. Ko'zlari charchagan.",
            next: "oq_2"
          },
          oq_2: {
            type: "say", speaker: "Oqil",
            text: "O'qituvchilar xonasiga xush kelibsiz. Men Oqil — matematikadan. Sizni men taklif qilgandim, eslaysizmi?",
            next: "oq_3"
          },
          oq_3: {
            type: "say", speaker: "Oqil",
            text: "Bugun 7 darsim bor. Tanaffusda 3 soat qo'shimcha dars. Kechqurun daftar tekshiraman. Kunim shu.",
            next: "oq_4"
          },
          oq_4: {
            type: "say", speaker: "",
            text: "U daftarlar uyumiga ishora qildi. Ovozida shikoyat yo'q edi — faqat charchoq.",
            next: "oq_5"
          },
          oq_5: {
            type: "say", speaker: "Oqil",
            text: "5-B haqida aytib qo'yay. Timur degan bola bor — u bilan ovora bo'lmang. Uy vazifasini qilmaydi, darsda jim. Besh yildan beri shunaqa.",
            next: "oq_q1"
          },
          oq_q1: {
            type: "choice",
            prompt: "Oqilga nima deysiz?",
            options: [
              {
                id: "OQ_1",
                text: "«Tushunarli. Uy vazifasini tekshirib boraman, bas.»",
                next: "oq_r1",
                effects: [
                  { note: { principle: P.SERVICE, verdict: "bad", text: "Oqilning hukmini qabul qildingiz: endi Timur siz uchun «muammoli bola» bo'lib qoldi, o'quvchi emas." } },
                  { note: { principle: P.ENLIGHTENED, verdict: "weak", text: "Charchagan hamkasbni tushundingiz — bu yaxshi. Lekin uning xulosasini tekshirmadingiz." } },
                  { flag: "oqil_accept" }
                ]
              },
              {
                id: "OQ_2",
                text: "«Besh yil kuzatdingiz. U aslida nima qiladi? Nima bilan band bo'ladi?»",
                next: "oq_r2",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "good", text: "«U dangasa» degan hukmni emas, kuzatuvni so'radingiz. Bu — birinchi haqiqiy ma'lumot." } },
                  { intel: "intel_oqil" },
                  { trust: 1 },
                  { flag: "oqil_intel" }
                ]
              },
              {
                id: "OQ_3",
                text: "«Bola haqida shunday gapirish to'g'ri emas. Siz o'qituvchimisiz?»",
                next: "oq_r3",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "bad", text: "Haqiqatni aytdingiz, lekin charchagan odamni birinchi kuni jamoa oldida sharmanda qildingiz. Endi u sizga yordam bermaydi." } },
                  { trust: -1 },
                  { flag: "oqil_offended" }
                ]
              }
            ]
          },
          oq_r1: {
            type: "say", speaker: "Oqil",
            text: "To'g'ri. Siz ham men kabi qilasiz. Bir haftada ko'ramiz, o'zingiz ham shu gapni aytasiz.",
            next: "oq_r1b"
          },
          oq_r1b: {
            type: "say", speaker: "",
            text: "U yana daftarlariga qaytdi. Siz xonada turibsiz, qo'lingizda jadval — va Timurning ismi jadvallar orasida faqat bitta qator.",
            next: "oq_end"
          },
          oq_r2: {
            type: "say", speaker: "Oqil",
            text: "Nima qiladi? Hm. Daftar chetiga yozadi — chizadi, raqamlar, o'yin sxemalari. Darsda jim, lekin qo'li to'xtamaydi.",
            next: "oq_r2b"
          },
          oq_r2b: {
            type: "say", speaker: "Oqil",
            text: "Bir marta koptok olib kirgan. Men oldim. Boshqa hech narsa esimda qolmagan. Yaxshi o'quvchi emas — lekin men unga besh yil vaqt bermadim.",
            next: "oq_r2c"
          },
          oq_r2c: {
            type: "say", speaker: "",
            text: "U o'z gapidan o'zi hayron bo'lgandek, daftarlarga qaradi. Keyin jimgina qo'shildi:",
            next: "oq_r2d"
          },
          oq_r2d: {
            type: "say", speaker: "Oqil",
            text: "Balki aybdor menman. Bilmayman. Bugun 7 dars — o'ylashga vaqt yo'q.",
            next: "oq_end"
          },
          oq_r3: {
            type: "say", speaker: "Oqil",
            text: "",
            next: "oq_r3b"
          },
          oq_r3b: {
            type: "say", speaker: "",
            text: "Oqil sekin daftarini yopdi. Hech narsa demadi. Xona jim qoldi — va bu jimlik sizni bir hafta ta'qib qiladi.",
            next: "oq_end"
          },
          oq_end: {
            type: "end",
            effects: [
              { beat: "mother" },
              { journal: "Oqil: 7 dars, 3 soat qo'shimcha, kechqurun daftarlar. Va bir bola, kimga 5 yil vaqt berilmagan." }
            ]
          }
        }
      },

      /* ================= MOTHER AT THE GATE ================= */
      mom_start: {
        start: "mom_1",
        nodes: {
          mom_1: {
            type: "say", speaker: "",
            text: "Darvozada o'sha ayol hali turibdi. Qo'lida telefon, ryukzak yonida. Sizni ko'rdi — yaqinlashdi.",
            next: "mom_2"
          },
          mom_2: {
            type: "say", speaker: "Nodira opa",
            text: "Kechirasiz, siz yangi o'qituvchimi? Timurning sinf rahbari? Men Nodira, onasi. Ikki daqiqa vaqtim bor — ishga kechikyapman.",
            next: "mom_3"
          },
          mom_3: {
            type: "say", speaker: "Nodira opa",
            text: "Faqat bir narsani so'rayman: uy vazifasini qilsin. Men uyda nima qilsam ham o'qimaydi. Siz aytsangiz eshitadi, deb o'ylayman.",
            next: "mom_4"
          },
          mom_4: {
            type: "say", speaker: "",
            text: "U telefonga qaradi. Vaqti haqiqatan oz. Siz ko'p savol bera olasiz — lekin hammasiga emas.",
            next: "mom_q"
          },
          mom_q: {
            type: "multi",
            prompt: "Nima so'raysiz? Ikki savolga vaqtingiz bor.",
            max: 2,
            next: "mom_wait",
            options: [
              {
                id: "MOM_Q1",
                text: "«Timur kasal bo'lib qolganmi? Ba'zi haftalar darsda ko'rinmagan.»",
                intel: "intel_sick",
                next: "mom_a1"
              },
              {
                id: "MOM_Q2",
                text: "«Uydan tashqari nima bilan shug'ullanadi? Nima uni xursand qiladi?»",
                intel: "intel_football",
                next: "mom_a2"
              },
              {
                id: "MOM_Q3",
                text: "«U qachondan beri jim bo'lib qolgan?»",
                intel: "intel_quiet",
                next: "mom_a3"
              },
              {
                id: "MOM_Q4",
                text: "«Uyda nima o'zgardi?»",
                intel: "intel_home",
                next: "mom_a4"
              }
            ]
          },
          mom_a1: {
            type: "say", speaker: "Nodira opa",
            text: "Ha. O'tgan oy ikki hafta kasal bo'ldi. Gripp. Qaytganda sinf ancha oldinga ketgan edi — u quvib yetolmasligini aytdi.",
            next: "mom_a1b"
          },
          mom_a1b: {
            type: "say", speaker: "",
            text: "Ikki hafta. Yetib olmagan. Va sizga bu haqda hech kim aytmagan — chunki hech kim so'ramagan.",
            next: "mom_q"
          },
          mom_a2: {
            type: "say", speaker: "Nodira opa",
            text: "Futbol. Koptok bilan ovora. Kechqurun uyda ham devorga tepadi — qo'shnilar shikoyat qiladi.",
            next: "mom_a2b"
          },
          mom_a2b: {
            type: "say", speaker: "Nodira opa",
            text: "Balki shuni bilasiz deb o'ylagandim. Lekin maktabga kelganda hech kim u bilan futbol haqida gaplashmaydi.",
            next: "mom_q"
          },
          mom_a3: {
            type: "say", speaker: "Nodira opa",
            text: "Jim bo'lganmi? U har doim jim edi. Lekin oldin darsdan keyin gapirardi, kechagi o'yinni aytardi.",
            next: "mom_a3b"
          },
          mom_a3b: {
            type: "say", speaker: "Nodira opa",
            text: "Endi faqat daftar bilan o'ynaydi. Daftar chetiga chizadi. Men u bilan gaplashmoqchiman — u qochadi.",
            next: "mom_q"
          },
          mom_a4: {
            type: "say", speaker: "Nodira opa",
            text: "Uyda... nima o'zgarmadi? Bu og'ir savol.",
            next: "mom_a4b"
          },
          mom_a4b: {
            type: "say", speaker: "Nodira opa",
            text: "Otasi ish bilan boshqa shaharda, oyda bir marta keladi. Men ikki ish qilaman. Bolaga vaqt qolmaydi.",
            next: "mom_q"
          },
          mom_wait: {
            type: "say", speaker: "Nodira opa",
            text: "Rahmat. Hozir ketishim kerak.",
            next: "mom_5"
          },
          mom_5: {
            type: "say", speaker: "Nodira opa",
            text: "Yana bir narsa — Timurning tug'ilgan kuni yaqin. Biror narsa olib berolgan bo'lardingiz... Lekin iltimos, qimmat bo'lmasin. Bizda ortiqcha pul yo'q.",
            next: "mom_5b"
          },
          mom_5b: {
            type: "say", speaker: "",
            text: "U shoshib ketdi. Siz qo'lingizda ryukzak bilan qolgansiz. Bu gap ham ma'lumot edi — va bir cheklov.",
            next: "mom_end"
          },
          mom_end: {
            type: "end",
            effects: [
              { intel: "intel_budget" },
              { beat: "lesson" },
              { journal: "Nodira opa: uy vazifasi, tug'ilgan kun, va «qimmat bo'lmasin»." }
            ]
          }
        }
      },

      /* ================= LESSON ================= */
      lesson_start: {
        start: "les_1",
        nodes: {
          les_1: {
            type: "say", speaker: "",
            text: "5-B sinfi. O'n to'rt bola. Ismlar jadvalda. Qator oxirida bir bola derazaga qarab o'tiribdi — ryukzagi yonida, ochilmagan.",
            next: "les_2"
          },
          les_2: {
            type: "say", speaker: "",
            text: "Hamma sizga qaraydi. Sinf rahbari ekanligingizni bilishadi. Birinchi 5 daqiqada kim ekanligingizni ham bilib olishadi.",
            next: "les_3"
          },
          les_3: {
            type: "say", speaker: "",
            text: "Qanday boshlaysiz?",
            next: "les_q"
          },
          les_q: {
            type: "choice",
            prompt: "Darsni qanday boshlaysiz?",
            options: [
              {
                id: "LES_1",
                text: "«Kitobni oching, 24-bet. O'tgan mavzuni takrorlaymiz.»",
                next: "les_r1",
                effects: [
                  { note: { principle: P.SERVICE, verdict: "weak", text: "Dars boshlandi, tartib bor. Lekin bu sinfni taniganingizni hech narsa ko'rsatmadi — birinchi daqiqadan siz «rasmiy» odam bo'ldingiz." } },
                  { flag: "les_flat" }
                ]
              },
              {
                id: "LES_2",
                text: "«Bugun sondan emas, savoldan boshlaymiz: bir haftada nechta qadam bosasiz?»",
                next: "les_r2",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "good", text: "O'z dunyosidan boshladingiz: matematika ularning hayotida ko'rindi, hali mavzu ham boshlanmagan." } },
                  { note: { principle: P.THOUGHTFUL, verdict: "good", text: "Birinchi daqiqada sinfni taniganingizni ko'rsatdingiz — hech qanday pul sarflamasdan." } },
                  { trust: 1 },
                  { flag: "les_good" }
                ]
              },
              {
                id: "LES_3",
                text: "«Timur! Sen yana ochmadingmi? O'rtaga chiq, doskaga yoz.»",
                next: "les_r3",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "bad", text: "Boshqalarni ko'rsatish uchun bir bolani tanladingiz. Sinf o'rgandi: bu o'qituvchi bilan xato qilish qimmat." } },
                  { note: { principle: P.THOUGHTFUL, verdict: "bad", text: "Birinchi daqiqada eng himoyasiz odamni markazga chiqardingiz. Bu ehtiyotkorlik emas — namoyish." } },
                  { trust: -2 },
                  { flag: "les_harsh" }
                ]
              }
            ]
          },
          les_r1: {
            type: "say", speaker: "",
            text: "Sinf kitoblarni ochdi. Shovqin. Kimdir yoqimsiz ohangda takrorladi. Orqa qatorda Timur kitobni ochdi — lekin varaqni buklab qo'ydi.",
            next: "les_r1b"
          },
          les_r1b: {
            type: "say", speaker: "",
            text: "Dars o'tdi. Yaxshi o'tdi. Hech kim savol bermadi. Siz sinfni boshqardingiz — lekin tanimadingiz.",
            next: "les_end"
          },
          les_r2: {
            type: "say", speaker: "",
            text: "Jimlik. Keyin bir qiz kuldi: «Nega qadam?» — «Chunki biz bugun tezlikni o'lchaymiz.»",
            next: "les_r2b"
          },
          les_r2b: {
            type: "say", speaker: "",
            text: "Besh daqiqada sinf uyg'ondi. Orqa qatorda Timur boshini ko'tardi. Derazadan ko'zini uzdi — birinchi marta.",
            next: "les_r2c"
          },
          les_r2c: {
            type: "say", speaker: "",
            text: "Dars tugadi. Ular chiqib ketishdi. Timur ham. Lekin ostonada to'xtab, ortiga qaradi.",
            next: "les_end"
          },
          les_r3: {
            type: "say", speaker: "",
            text: "Timur sekin o'rnidan turdi. Doskaga keldi. Bo'rni oldi-yu, hech narsa yozmadi.",
            next: "les_r3b"
          },
          les_r3b: {
            type: "say", speaker: "",
            text: "Sinf jim. Kimdir pichirladi. Timur yelkasini qisdi va joyiga qaytdi. Darsning qolgan qismida u derazaga qaradi.",
            next: "les_end"
          },
          les_end: {
            type: "end",
            effects: [
              { beat: "timur" },
              { journal: "5-B. O'n to'rt bola. Orqa qatorda derazaga qarab o'tirgan biri." }
            ]
          }
        }
      },

      /* ================= TIMUR ================= */
      timur_start: {
        start: "tm_1",
        nodes: {
          tm_1: {
            type: "say", speaker: "",
            text: "Darsdan keyin sinf bo'shadi. Timur ryukzagini yig'moqda — juda sekin, go'yo ketishni xohlamagandek. Yoki qolishni.",
            next: "tm_2"
          },
          tm_2: {
            type: "say", speaker: "Timur",
            text: "Siz yangi o'qituvchisiz.",
            next: "tm_3"
          },
          tm_3: {
            type: "say", speaker: "",
            text: "Gap emas — xabar. U ryukzagini yelkasiga oldi.",
            next: "tm_q"
          },
          tm_q: {
            type: "choice",
            prompt: "Nimani sezdingiz? Nima deysiz?",
            options: [
              {
                id: "NOT_1",
                text: "«Krossovkang futbol uchun. Sen o'ynaysanmi?»",
                next: "tm_r1",
                requires: { intel: "intel_football" },
                lockedText: "«Krossovkang futbol uchun...» — lekin buni qayerdan bilasiz?",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "good", text: "Onasi aytgan narsani ko'rdi va tanidi. Bu savol emas — «men seni ko'ryapman» degan gap." } },
                  { trust: 2 },
                  { flag: "tm_football" }
                ]
              },
              {
                id: "NOT_2",
                text: "«Ikki hafta kasal bo'lgansan. Qaytganda qiyin bo'ldimi?»",
                next: "tm_r2",
                requires: { intel: "intel_sick" },
                lockedText: "«Ikki hafta kasal bo'lgansan...» — buni bilish uchun avval so'rash kerak edi.",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "good", text: "Yetib olmagan vaqtni tan oldingiz. Bola birinchi marta «seni ko'rdim» degan gapni eshitdi." } },
                  { trust: 2 },
                  { flag: "tm_sick" }
                ]
              },
              {
                id: "NOT_3",
                text: "«Daftaringning chetiga yozasan, to'g'rimi? Nima yozasan?»",
                next: "tm_r3",
                requires: { intel: "intel_quiet" },
                lockedText: "«Daftaring chetiga yozasan...» — buni qayerdan bildingiz?",
                effects: [
                  { note: { principle: P.THOUGHTFUL, verdict: "good", text: "Uning jimligini emas, jimligining ichidagi ishni ko'rdingiz. Hech narsa sotib olmadingiz — lekin aniq narsa aytdingiz." } },
                  { trust: 2 },
                  { flag: "tm_notebook" }
                ]
              },
              {
                id: "NOT_4",
                text: "«Ertaga nazorat ishi. Tayyorlanishing kerak.»",
                next: "tm_r4",
                effects: [
                  { note: { principle: P.SERVICE, verdict: "bad", text: "Birinchi suhbatni baho bilan boshladingiz. U sizdan yana bitta talab eshitdi — va ketdi." } },
                  { trust: -1 },
                  { flag: "tm_test" }
                ]
              }
            ]
          },
          tm_r1: {
            type: "say", speaker: "Timur",
            text: "Ha.",
            next: "tm_r1b"
          },
          tm_r1b: {
            type: "say", speaker: "",
            text: "U krossovkasiga qaradi. Keyin sizga. Ryukzagini yelkasidan tushirdi.",
            next: "tm_r1c"
          },
          tm_r1c: {
            type: "say", speaker: "Timur",
            text: "Hovlida o'ynayman. Kechqurun ham. Daftarga o'yin chizaman — qaysi jamoa qanday o'ynaydi.",
            next: "tm_r1d"
          },
          tm_r1d: {
            type: "say", speaker: "",
            text: "Daftar. O'yin sxemalari. Oqil aytgan «chizmalar» — bu o'yin chizmalari edi.",
            next: "tm_end"
          },
          tm_r2: {
            type: "say", speaker: "Timur",
            text: "Qiyin.",
            next: "tm_r2b"
          },
          tm_r2b: {
            type: "say", speaker: "",
            text: "Bir so'z. Keyin qo'shdi, sekin:",
            next: "tm_r2c"
          },
          tm_r2c: {
            type: "say", speaker: "Timur",
            text: "Ular oldinga ketdi. Men quvib yetolmadim. Endi so'rasam, hamma kuladi.",
            next: "tm_r2d"
          },
          tm_r2d: {
            type: "say", speaker: "",
            text: "Sizga birinchi marta biror narsa tushuntirdi — va bu dars haqida emas edi.",
            next: "tm_end"
          },
          tm_r3: {
            type: "say", speaker: "Timur",
            text: "O'yin chizaman.",
            next: "tm_r3b"
          },
          tm_r3b: {
            type: "say", speaker: "",
            text: "U daftarini ochdi. Chetlarida maydonchalar, strelkalar, raqamlar — tartibli, aniq.",
            next: "tm_r3c"
          },
          tm_r3c: {
            type: "say", speaker: "Timur",
            text: "Bu — hujum. Bu — himoya. Men o'zim o'ylab topdim.",
            next: "tm_r3d"
          },
          tm_r3d: {
            type: "say", speaker: "",
            text: "Siz matematika o'qituvchisisiz. Va qo'lingizda geometriya bor — u buni o'zi topgan, ismsiz.",
            next: "tm_end"
          },
          tm_r4: {
            type: "say", speaker: "Timur",
            text: "Bilaman.",
            next: "tm_r4b"
          },
          tm_r4b: {
            type: "say", speaker: "",
            text: "U ryukzagini oldi va chiqib ketdi. Eshik yopildi. Sinf bo'sh.",
            next: "tm_end"
          },
          tm_end: {
            type: "end",
            effects: [
              { beat: "gift" },
              { journal: "Timur bilan gaplashdim. U jim emas — shunchaki hech kim so'ramagan." }
            ]
          }
        }
      },

      /* ================= SHOP / GIFT ================= */
      gift_start: {
        start: "g_1",
        nodes: {
          g_1: {
            type: "say", speaker: "",
            text: "Darvozadan chiqib chapga burildingiz. Sardor akaning do'koni — peshtaxtada non, orqada javonlar.",
            next: "g_2"
          },
          g_2: {
            type: "say", speaker: "Sardor aka",
            text: "Qani, yangi o'qituvchi! Nima kerak? Bolalar uchunmi? Hozir sovg'a mavzusi ko'p — tug'ilgan kunlar ketdi.",
            next: "g_3"
          },
          g_3: {
            type: "say", speaker: "",
            text: "Javonda to'rt narsa ko'zga tashlanadi. Cho'ntagingizda ozgina pul. Nodira opaning gapi ham bor: «qimmat bo'lmasin».",
            next: "g_mg"
          },
          g_mg: {
            type: "minigame",
            game: "giftShop",
            config: { budget: 60000 },
            onWin: "g_won",
            onLose: "g_lost"
          },
          g_won: {
            type: "say", speaker: "Sardor aka",
            text: "Mayli. Yaxshisini tanladingiz — qog'ozga o'ramayman, shundoq bering.",
            next: "g_won2"
          },
          g_won2: {
            type: "say", speaker: "",
            text: "Qo'lingizda sovg'a. Kichik, arzon, lekin siz nega aynan shu narsani olganingizni bilasiz. Bu farqni bola ham sezadi.",
            next: "g_end"
          },
          g_lost: {
            type: "say", speaker: "Sardor aka",
            text: "Xo'p, oling. Lekin bilib qo'ying — sovg'a sovg'a emas, agar kimga olayotganingizni bilmasangiz.",
            next: "g_lost2"
          },
          g_lost2: {
            type: "say", speaker: "",
            text: "Qo'lingizda narsa bor. Ichida ishonch yo'q. Ertaga buni ochganda buni sezadi.",
            next: "g_end"
          },
          g_end: {
            type: "end",
            effects: [
              { beat: "walk" },
              { journal: "Sardor akaning do'koni. Sovg'a — bu narx emas, tanilish." }
            ]
          }
        }
      },

      /* ================= WALK HOME ================= */
      walk_start: {
        start: "w_1",
        nodes: {
          w_1: {
            type: "say", speaker: "",
            text: "Darsdan keyin hovlida. Timur to'p bilan chiqdi — yangi sovg'angiz qo'lida emas, hali yashirib qo'ygansiz.",
            next: "w_2"
          },
          w_2: {
            type: "say", speaker: "Timur",
            text: "Uyga qaytamizmi? Siz ham shu yoqqa ketasizmi?",
            next: "w_3"
          },
          w_3: {
            type: "say", speaker: "",
            text: "Yo'l uzoq — taxminan 15 daqiqa. Bu 15 daqiqa bugungi eng muhim vaqtingiz bo'lishi mumkin. Yoki eng behuda.",
            next: "w_mg"
          },
          w_mg: {
            type: "minigame",
            game: "travelTalk",
            config: {},
            onWin: "w_after",
            onLose: "w_after"
          },
          w_after: {
            type: "say", speaker: "",
            text: "Hovli. Timur koptokni olib chiqdi: «Bir oz o'ynaymizmi?»",
            next: "w_ball"
          },
          w_ball: {
            type: "minigame",
            game: "ballPlay",
            config: {},
            onWin: "w_ball_win",
            onLose: "w_ball_lose"
          },
          w_ball_win: {
            type: "say", speaker: "Timur",
            text: "Yaxshi o'ynaysiz. Nostandart. Keling, har kuni shunday qilamiz.",
            next: "w_ball_win2"
          },
          w_ball_win2: {
            type: "say", speaker: "",
            text: "U kuldi — birinchi marta, ovoz chiqarib. Siz hali hech qanday dars o'tmagansiz, lekin bugun shu hovlida birinchi dars bo'ldi.",
            next: "w_end"
          },
          w_ball_lose: {
            type: "say", speaker: "Timur",
            text: "Hechqisi yo'q. Men ham ko'p o'tkazib yuboraman.",
            next: "w_ball_lose2"
          },
          w_ball_lose2: {
            type: "say", speaker: "",
            text: "U koptokni qo'lingizga berdi. «Ertaga yana urinib ko'ramiz», — dedi va darvozaga yugurdi.",
            next: "w_end"
          },
          w_end: {
            type: "end",
            effects: [
              { beat: "report" },
              { journal: "Uyga kuzatdim. Hovlida o'ynadik. U kuldi." }
            ]
          }
        }
      },

      /* ================= REPORT ================= */
      report_start: {
        start: "r_1",
        nodes: {
          r_1: {
            type: "say", speaker: "",
            text: "Kechqurun 6:30. Darvoza oldida Nodira opa. Bugun sizga ikki daqiqa bergan edi — endi kutmoqda.",
            next: "r_2"
          },
          r_2: {
            type: "say", speaker: "Nodira opa",
            text: "Qani, ayting. Uy vazifasi haqida nima dedingiz? Eshitdim, u bilan gaplashgansiz.",
            next: "r_q"
          },
          r_q: {
            type: "choice",
            prompt: "Nima deysiz?",
            options: [
              {
                id: "REP_1",
                text: "«U dangasa. Uy vazifasini qilmaydi, darsda jim. Boshqa hech narsa qila olmadim.»",
                next: "r_r1",
                effects: [
                  { note: { principle: P.PRESENT, verdict: "bad", text: "Bola haqida hukm aytdingiz, kuzatuv emas. Endi onasi ham o'sha hukm bilan yashaydi." } },
                  { note: { principle: P.ENLIGHTENED, verdict: "bad", text: "Sizga ma'lumot berilgan edi — kasallik, futbol, jimlik. Hech birini ishlatmadingiz." } },
                  { trust: -2 }
                ]
              },
              {
                id: "REP_2",
                text: "«Bugun bir narsani ko'rdim: u jim, lekin daftar chetiga o'yin sxemalarini chizadi. Ertaga shundan boshlaymiz. Bir haftadan keyin ayting — o'zi gapirishni boshladimi.»",
                next: "r_r2",
                effects: [
                  { note: { principle: P.THOUGHTFUL, verdict: "good", text: "Aniq bir kuzatuv va aniq bir qadam. Onasi birinchi marta bolasi haqida yangi narsa eshitdi." } },
                  { note: { principle: P.ENGINE, verdict: "good", text: "Eshitdi → bittasini tanladi → qildi → va endi hikoyani saqlayapti. Bu tamoyilning to'liq zanjiri." } },
                  { trust: 3 },
                  { flag: "rep_good" }
                ]
              },
              {
                id: "REP_3",
                text: "«Baho past. Keyingi hafta nazorat — natijaga qarab gaplashamiz.»",
                next: "r_r3",
                effects: [
                  { note: { principle: P.SERVICE, verdict: "weak", text: "Faqat raqam aytdingiz. Onasi bu raqamni o'zi ham biladi — sizdan yangilik eshitmadi." } },
                  { trust: 1 }
                ]
              },
              {
                id: "REP_4",
                text: "«Xavotir olmang, men uni yaxshi o'quvchi qilaman. Menga ishoning.»",
                next: "r_r4",
                effects: [
                  { note: { principle: P.THOUGHTFUL, verdict: "weak", text: "Va'da oson, natija qiyin. Ona bir vaqtlar bunday va'dalarni eshitgan — va ular bajarilmagan." } },
                  { trust: -1 },
                  { flag: "rep_promise" }
                ]
              }
            ]
          },
          r_r1: {
            type: "say", speaker: "Nodira opa",
            text: "",
            next: "r_r1b"
          },
          r_r1b: {
            type: "say", speaker: "",
            text: "U jimgina bosh irg'adi. «Bilaman», — dedi. Va ketdi. Siz bilasiz: u endi hech narsa so'ramaydi.",
            next: "r_end"
          },
          r_r2: {
            type: "say", speaker: "Nodira opa",
            text: "Daftar chetiga chizadi... Ha. Men uni kechqurun ko'raman, lekin nima qilayotganini so'ramaganman.",
            next: "r_r2b"
          },
          r_r2b: {
            type: "say", speaker: "Nodira opa",
            text: "Balki men ham so'rashim kerak edi. Rahmat. Bir haftadan keyin kelaman — va eshitaman.",
            next: "r_r2c"
          },
          r_r2c: {
            type: "say", speaker: "",
            text: "U ketdi, lekin bu safar shoshmadi. Darvoza oldida bir zum to'xtab, ortiga qaradi.",
            next: "r_end"
          },
          r_r3: {
            type: "say", speaker: "Nodira opa",
            text: "Bilaman. Baho past. Men shuni bilaman.",
            next: "r_r3b"
          },
          r_r3b: {
            type: "say", speaker: "",
            text: "U telefoniga qaradi. Suhbat tugadi — va sizdan hech narsa o'zgarmadi.",
            next: "r_end"
          },
          r_r4: {
            type: "say", speaker: "Nodira opa",
            text: "Ishoning, deysiz...",
            next: "r_r4b"
          },
          r_r4b: {
            type: "say", speaker: "",
            text: "U kulimsirab qo'ydi, lekin ko'zlarida ishonch yo'q edi. Bu gapni u avval ham eshitgan.",
            next: "r_end"
          },
          r_end: {
            type: "say", speaker: "",
            text: "Kun tugadi. Siz uyga qaytasiz. Bugun siz bir bola bilan bir kunda nima qila olardingiz — savol shu edi. Javob sizda.",
            next: "r_end2"
          },
          r_end2: {
            type: "end",
            effects: [
              { beat: "done" },
              { journal: "Kun tugadi. Birinchi kun." },
              { endMission: true }
            ]
          }
        }
      }

    }
  };

  // Guard: every scene must resolve its own node references. Logged, not thrown,
  // so a typo degrades to a warning instead of a blank screen.
  (function validate() {
    var scenes = G.data.story.scenes;
    for (var sk in scenes) {
      if (!scenes.hasOwnProperty(sk)) continue;
      var nodes = scenes[sk].nodes;
      if (!nodes) { console.warn("scene has no nodes: " + sk); continue; }
      for (var nk in nodes) {
        if (!nodes.hasOwnProperty(nk)) continue;
        var n = nodes[nk];
        var targets = [];
        if (n.next) targets.push(["next", n.next]);
        if (n.onWin) targets.push(["onWin", n.onWin]);
        if (n.onLose) targets.push(["onLose", n.onLose]);
        if (n.nextAfter) {
          if (n.nextAfter.true) targets.push(["nextAfter.true", n.nextAfter.true]);
          if (n.nextAfter.false) targets.push(["nextAfter.false", n.nextAfter.false]);
        }
        if (n.nextFallback) targets.push(["nextFallback", n.nextFallback]);
        if (n.options) {
          for (var i = 0; i < n.options.length; i++) {
            if (n.options[i].next) targets.push(["options[" + i + "].next", n.options[i].next]);
          }
        }
        for (var t = 0; t < targets.length; t++) {
          if (!nodes[targets[t][1]]) {
            console.warn("story: " + sk + "/" + nk + " " + targets[t][0] + " -> missing node " + targets[t][1]);
          }
        }
      }
    }
  })();

})();
