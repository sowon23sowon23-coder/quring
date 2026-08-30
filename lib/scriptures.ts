export type QtQuestionKey = "heart_verse" | "message" | "practice" | "prayer";

export const questionOrder: QtQuestionKey[] = ["heart_verse", "message", "practice", "prayer"];

export type Verse = { no: number; text: string };

export type DailyScripture = {
  date: string; // YYYY-MM-DD
  book: string;
  reference: string;
  title: string;
  focusVerse: string;
  verses: Verse[];
  questions: Record<QtQuestionKey, string>;
};

const baseQuestions = (
  message: string,
  practice: string,
  prayer: string
): Record<QtQuestionKey, string> => ({
  heart_verse: "가장 마음에 남는 구절은 무엇이고, 왜 그런가요?",
  message,
  practice,
  prayer
});

// 로컬 기본 본문. 관리자가 Supabase daily_scriptures 에 같은 날짜를 넣으면 그 값이 우선합니다.
export const scriptures: DailyScripture[] = [
  {
    date: "2026-08-24",
    book: "시편",
    reference: "시편 1:1-3",
    title: "복 있는 사람",
    focusVerse: "오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 묵상하는도다",
    verses: [
      { no: 1, text: "복 있는 사람은 악인들의 꾀를 따르지 아니하며 죄인들의 길에 서지 아니하며 오만한 자들의 자리에 앉지 아니하고" },
      { no: 2, text: "오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 묵상하는도다" },
      { no: 3, text: "그는 시냇가에 심은 나무가 철을 따라 열매를 맺으며 그 잎사귀가 마르지 아니함 같으니 그가 하는 모든 일이 다 형통하리로다" }
    ],
    questions: baseQuestions(
      "내 삶의 방향은 지금 어떤 '자리'에 앉아 있나요?",
      "오늘 말씀을 '주야로 묵상'하기 위해 정할 한 가지 습관은?",
      "뿌리 깊은 나무처럼 살도록 도와달라고 기도해 보세요."
    )
  },
  {
    date: "2026-08-25",
    book: "시편",
    reference: "시편 23:1-4",
    title: "여호와는 나의 목자",
    focusVerse: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
    verses: [
      { no: 1, text: "여호와는 나의 목자시니 내게 부족함이 없으리로다" },
      { no: 2, text: "그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다" },
      { no: 3, text: "내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다" },
      { no: 4, text: "내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다" }
    ],
    questions: baseQuestions(
      "지금 내게 '음침한 골짜기'처럼 느껴지는 상황은 무엇인가요?",
      "그 상황에서 '주께서 함께 하심'을 신뢰하는 한 걸음은?",
      "부족함 없이 채우시는 목자 되심을 신뢰하며 기도해 보세요."
    )
  },
  {
    date: "2026-08-26",
    book: "마태복음",
    reference: "마태복음 6:31-34",
    title: "먼저 그의 나라를 구하라",
    focusVerse: "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라",
    verses: [
      { no: 31, text: "그러므로 염려하여 이르기를 무엇을 먹을까 무엇을 마실까 무엇을 입을까 하지 말라" },
      { no: 32, text: "이는 다 이방인들이 구하는 것이라 너희 하늘 아버지께서 이 모든 것이 너희에게 있어야 할 줄을 아시느니라" },
      { no: 33, text: "그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라" },
      { no: 34, text: "그러므로 내일 일을 위하여 염려하지 말라 내일 일은 내일이 염려할 것이요 한 날의 괴로움은 그 날로 족하니라" }
    ],
    questions: baseQuestions(
      "요즘 내 마음을 가장 많이 차지하는 염려는 무엇인가요?",
      "'먼저 그의 나라를 구하는' 것으로 우선순위를 바꿀 한 가지는?",
      "내일의 염려를 내려놓고 오늘을 맡기는 기도를 드려 보세요."
    )
  },
  {
    date: "2026-08-27",
    book: "요한일서",
    reference: "요한일서 4:18-19",
    title: "온전한 사랑이 두려움을 내쫓는다",
    focusVerse: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라",
    verses: [
      { no: 18, text: "사랑 안에 두려움이 없고 온전한 사랑이 두려움을 내쫓나니 두려움에는 형벌이 있음이라 두려워하는 자는 사랑 안에서 온전히 이루지 못하였느니라" },
      { no: 19, text: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라" }
    ],
    questions: baseQuestions(
      "내가 하나님 앞에서 여전히 두려워하는 부분은 무엇인가요?",
      "'그가 먼저 사랑하셨다'는 사실이 오늘 관계 하나를 어떻게 바꾸나요?",
      "먼저 사랑받은 자로서 누군가를 사랑할 힘을 구해 보세요."
    )
  },
  {
    date: "2026-08-28",
    book: "빌립보서",
    reference: "빌립보서 4:6-7",
    title: "감사로 아뢰라",
    focusVerse: "모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라",
    verses: [
      { no: 6, text: "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라" },
      { no: 7, text: "그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라" }
    ],
    questions: baseQuestions(
      "지금 하나님께 '아뢰야 할' 구체적인 일은 무엇인가요?",
      "염려를 기도로 바꾸기 위해 오늘 멈추고 기도할 시간을 정해 보세요.",
      "감사 제목 세 가지를 적고 그 감사로 기도해 보세요."
    )
  },
  {
    date: "2026-08-29",
    book: "이사야",
    reference: "이사야 41:10",
    title: "두려워하지 말라",
    focusVerse: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라",
    verses: [
      { no: 10, text: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라" }
    ],
    questions: baseQuestions(
      "이 약속 중 오늘 내게 가장 필요한 부분은 어디인가요?",
      "두려움 대신 '함께 하심'을 붙들고 내디딜 한 걸음은?",
      "나를 붙드시는 손을 신뢰한다고 고백하며 기도해 보세요."
    )
  },
  {
    date: "2026-08-30",
    book: "미가",
    reference: "미가 6:6-8",
    title: "주님께서 구하시는 것",
    focusVerse: "오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐",
    verses: [
      { no: 6, text: "내가 무엇을 가지고 여호와 앞에 나아가며 높으신 하나님께 경배할까 내가 번제물로 일 년 된 송아지를 가지고 그 앞에 나아갈까" },
      { no: 7, text: "여호와께서 천천의 숫양이나 만만의 강물 같은 기름을 기뻐하실까 내 허물을 위하여 내 맏아들을, 내 영혼의 죄로 말미암아 내 몸의 열매를 드릴까" },
      { no: 8, text: "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐" }
    ],
    questions: baseQuestions(
      "'정의·인자·겸손' 중 지금 내게 가장 부족한 것은 무엇인가요?",
      "오늘 그 한 가지를 실천할 구체적인 자리(사람·상황)는 어디인가요?",
      "겸손하게 하나님과 동행하는 하루가 되도록 기도해 보세요."
    )
  },
  {
    date: "2026-08-31",
    book: "로마서",
    reference: "로마서 12:1-2",
    title: "마음을 새롭게",
    focusVerse: "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아",
    verses: [
      { no: 1, text: "그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니 너희 몸을 하나님이 기뻐하시는 거룩한 산 제물로 드리라 이는 너희가 드릴 영적 예배니라" },
      { no: 2, text: "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라" }
    ],
    questions: baseQuestions(
      "내가 무심코 '이 세대를 본받고' 있는 생각의 습관은 무엇인가요?",
      "마음을 새롭게 하기 위해 오늘 채우거나 비울 한 가지는?",
      "내 몸과 하루를 산 제물로 드린다고 고백하며 기도해 보세요."
    )
  },
  {
    date: "2026-09-01",
    book: "야고보서",
    reference: "야고보서 1:2-4",
    title: "시험을 기쁘게 여기라",
    focusVerse: "너희 믿음의 시련이 인내를 만들어 내는 줄 너희가 앎이라",
    verses: [
      { no: 2, text: "내 형제들아 너희가 여러 가지 시험을 당하거든 온전히 기쁘게 여기라" },
      { no: 3, text: "이는 너희 믿음의 시련이 인내를 만들어 내는 줄 너희가 앎이라" },
      { no: 4, text: "인내를 온전히 이루라 이는 너희로 온전하고 구비하여 조금도 부족함이 없게 하려 함이라" }
    ],
    questions: baseQuestions(
      "지금 겪는 시련을 통해 하나님이 만들어 가시는 것은 무엇일까요?",
      "인내가 필요한 그 자리에서 오늘 포기하지 않을 한 가지는?",
      "시련 중에도 온전함을 이루시는 하나님을 신뢰하며 기도해 보세요."
    )
  },
  {
    date: "2026-09-02",
    book: "요한복음",
    reference: "요한복음 15:4-5",
    title: "내 안에 거하라",
    focusVerse: "나는 포도나무요 너희는 가지라 ... 나를 떠나서는 너희가 아무 것도 할 수 없음이라",
    verses: [
      { no: 4, text: "내 안에 거하라 나도 너희 안에 거하리라 가지가 포도나무에 붙어 있지 아니하면 스스로 열매를 맺을 수 없음 같이 너희도 내 안에 있지 아니하면 그러하리라" },
      { no: 5, text: "나는 포도나무요 너희는 가지라 그가 내 안에, 내가 그 안에 거하면 사람이 열매를 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라" }
    ],
    questions: baseQuestions(
      "요즘 나는 '스스로' 열매 맺으려 애쓰고 있지는 않나요?",
      "주님 안에 거하기 위해 오늘 지킬 조용한 시간은 언제인가요?",
      "가지로서 나무에 붙어 있게 해 달라고 기도해 보세요."
    )
  },
  {
    date: "2026-09-03",
    book: "시편",
    reference: "시편 46:1-3",
    title: "하나님은 우리의 피난처",
    focusVerse: "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라",
    verses: [
      { no: 1, text: "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라" },
      { no: 2, text: "그러므로 땅이 변하든지 산이 흔들려 바다 가운데에 빠지든지 우리는 두려워하지 아니하리로다" },
      { no: 3, text: "바닷물이 솟아나고 뛰놀든지 그것이 넘침으로 산이 흔들릴지라도 우리는 두려워하지 아니하리로다" }
    ],
    questions: baseQuestions(
      "지금 내 삶에서 '흔들리는 산'처럼 불안한 영역은 무엇인가요?",
      "불안할 때 하나님께로 '피하기' 위해 할 구체적인 행동은?",
      "요동하는 상황 속에서도 흔들리지 않는 피난처를 신뢰하며 기도해 보세요."
    )
  },
  {
    date: "2026-09-04",
    book: "잠언",
    reference: "잠언 3:5-6",
    title: "마음을 다하여 신뢰하라",
    focusVerse: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라",
    verses: [
      { no: 5, text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라" },
      { no: 6, text: "너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라" }
    ],
    questions: baseQuestions(
      "지금 내 '명철'로만 붙들고 있는 결정이나 걱정은 무엇인가요?",
      "그 일에서 하나님을 '인정하는' 첫 번째 행동은 무엇일까요?",
      "내 길을 지도하시는 하나님을 신뢰한다고 고백하며 기도해 보세요."
    )
  },
  {
    date: "2026-09-05",
    book: "마태복음",
    reference: "마태복음 11:28-30",
    title: "내게로 오라",
    focusVerse: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
    verses: [
      { no: 28, text: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라" },
      { no: 29, text: "나는 마음이 온유하고 겸손하니 나의 멍에를 메고 내게 배우라 그리하면 너희 마음이 쉼을 얻으리니" },
      { no: 30, text: "이는 내 멍에는 쉽고 내 짐은 가벼움이라" }
    ],
    questions: baseQuestions(
      "지금 내가 지고 있는 '무거운 짐'은 구체적으로 무엇인가요?",
      "그 짐을 주님께 가져가기 위해 오늘 내려놓을 한 가지는?",
      "주님의 쉬운 멍에로 바꿔 메게 해 달라고 기도해 보세요."
    )
  },
  {
    date: "2026-09-06",
    book: "고린도전서",
    reference: "고린도전서 13:4-7",
    title: "사랑은",
    focusVerse: "사랑은 오래 참고 사랑은 온유하며 ... 모든 것을 견디느니라",
    verses: [
      { no: 4, text: "사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며" },
      { no: 5, text: "무례히 행하지 아니하며 자기의 유익을 구하지 아니하며 성내지 아니하며 악한 것을 생각하지 아니하며" },
      { no: 6, text: "불의를 기뻐하지 아니하며 진리와 함께 기뻐하고" },
      { no: 7, text: "모든 것을 참으며 모든 것을 믿으며 모든 것을 바라며 모든 것을 견디느니라" }
    ],
    questions: baseQuestions(
      "이 사랑의 목록 중 특정한 관계에서 내가 가장 못 하는 부분은?",
      "오늘 그 사람에게 이 사랑을 한 문장/한 행동으로 표현한다면?",
      "내 안에서 이 사랑이 자라도록 도와달라고 기도해 보세요."
    )
  }
];

const byDate = new Map(scriptures.map((s) => [s.date, s]));

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function displayDate(dateKey: string): string {
  return dateKey.replace(/-/g, ".");
}

/** 정확히 일치하는 날짜가 없으면, 그 날짜 이하의 가장 최근 본문(없으면 첫 본문)을 돌려줍니다. */
export function getScriptureForDate(dateKey: string): DailyScripture {
  const exact = byDate.get(dateKey);
  if (exact) return exact;

  const earlierOrEqual = scriptures.filter((s) => s.date <= dateKey);
  if (earlierOrEqual.length > 0) {
    return earlierOrEqual[earlierOrEqual.length - 1];
  }
  return scriptures[0];
}

export function getTodayKey(now: Date = new Date()): string {
  return formatDateKey(now);
}

export function getScriptureByExactDate(dateKey: string): DailyScripture | undefined {
  return byDate.get(dateKey);
}
