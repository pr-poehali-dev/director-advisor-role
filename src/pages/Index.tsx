import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const SLIDES = [
  { id: 0, type: "cover" },
  { id: 1, type: "role" },
  { id: 2, type: "tasks" },
  { id: 3, type: "climate" },
  { id: 4, type: "interaction" },
  { id: 5, type: "cases" },
  { id: 6, type: "results" },
];

const slideColors: Record<string, string> = {
  cover: "from-[#1A56DB] to-[#0D1B3E]",
  role: "from-[#FF6B35] to-[#FF4D8D]",
  tasks: "from-[#2ECC71] to-[#1A56DB]",
  climate: "from-[#FFD23F] to-[#FF6B35]",
  interaction: "from-[#7B2FBE] to-[#1A56DB]",
  cases: "from-[#FF4D8D] to-[#7B2FBE]",
  results: "from-[#1A56DB] to-[#2ECC71]",
};

const QUIZ_QUESTIONS = [
  {
    q: "Что делает советник директора, если двое ребят поссорились?",
    options: ["😠 Ругает обоих", "🤝 Помогает помириться", "🚶 Уходит", "📝 Пишет записку"],
    correct: 1,
  },
  {
    q: "Как советник помогает сделать класс дружнее?",
    options: ["🎮 Организует игры", "📚 Задаёт уроки", "🛌 Все отдыхают", "🍕 Заказывает пиццу"],
    correct: 0,
  },
  {
    q: "Кому советник директора рассказывает об успехах детей?",
    options: ["🧸 Игрушкам", "👨‍👩‍👧 Родителям и учителям", "🐶 Собакам", "🌙 Луне"],
    correct: 1,
  },
];

const makeMemoryCards = () =>
  ["🌟", "🎯", "🏆", "💡", "🤝", "📚", "🌈", "❤️"]
    .flatMap((e) => [e, e])
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));

function SlideTitle({ icon, title, light = true }: { icon: string; title: string; light?: boolean }) {
  return (
    <div className="text-center mb-2 animate-slide-up opacity-0 delay-100">
      <span className="text-5xl animate-wiggle inline-block">{icon}</span>
      <h2 className={`font-black text-2xl md:text-3xl mt-2 ${light ? "text-white" : "text-[#0D1B3E]"}`}>{title}</h2>
    </div>
  );
}

function ConfettiEffect() {
  const colors = ["#FFD23F", "#FF6B35", "#2ECC71", "#FF4D8D", "#1A56DB"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.8 + Math.random() * 0.7}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [memCards, setMemCards] = useState(makeMemoryCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memMatched, setMemMatched] = useState(0);
  const [memLock, setMemLock] = useState(false);
  const [activeTask, setActiveTask] = useState<number | null>(null);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  };

  const next = () => { if (current < SLIDES.length - 1) goTo(current + 1); };
  const prev = () => { if (current > 0) goTo(current - 1); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const correct = QUIZ_QUESTIONS[quizIdx].correct === idx;
    if (correct) {
      setQuizScore((s) => s + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1500);
    }
    setTimeout(() => {
      if (quizIdx < QUIZ_QUESTIONS.length - 1) {
        setQuizIdx((q) => q + 1);
        setSelectedAnswer(null);
      } else {
        setQuizDone(true);
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
  };

  const handleMemCard = (id: number) => {
    if (memLock || memCards[id].flipped || memCards[id].matched) return;
    const newCards = memCards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    const newFlipped = [...flippedIds, id];
    setMemCards(newCards);
    setFlippedIds(newFlipped);
    if (newFlipped.length === 2) {
      setMemLock(true);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setMemCards((c) => c.map((card) => card.id === a || card.id === b ? { ...card, matched: true } : card));
          setMemMatched((m) => m + 1);
          setFlippedIds([]);
          setMemLock(false);
        }, 500);
      } else {
        setTimeout(() => {
          setMemCards((c) => c.map((card) => card.id === a || card.id === b ? { ...card, flipped: false } : card));
          setFlippedIds([]);
          setMemLock(false);
        }, 900);
      }
    }
  };

  const resetMemory = () => {
    setMemCards(makeMemoryCards());
    setFlippedIds([]);
    setMemMatched(0);
    setMemLock(false);
  };

  const slide = SLIDES[current];
  const bg = slideColors[slide.type];

  return (
    <div className="min-h-screen font-golos select-none overflow-hidden">
      <div className={`min-h-screen bg-gradient-to-br ${bg} relative flex flex-col transition-all duration-500`}>
        <div className="absolute inset-0 dots-bg opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-1" key={animKey}>

          {/* COVER */}
          {slide.type === "cover" && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
              <div className="animate-float mb-6">
                <span className="text-8xl">🌟</span>
              </div>
              <h1 className="text-white font-golos font-black text-4xl md:text-6xl leading-tight mb-4 animate-slide-up opacity-0 delay-100">
                Советник директора школы
              </h1>
              <h2 className="font-caveat text-[#FFD23F] text-3xl md:text-4xl mb-6 animate-slide-up opacity-0 delay-200">
                и его роль в формировании школьного климата
              </h2>
              <div className="animate-slide-up opacity-0 delay-300 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 mb-8">
                <p className="text-white text-xl font-semibold">1 – 4 классы 🏫</p>
              </div>
              <img
                src="https://cdn.poehali.dev/projects/8bc93477-4772-47b6-9acb-a26be6d3a1fa/files/a4ac3fdc-b422-4278-890b-098c2d31beb2.jpg"
                alt="Советник директора"
                className="w-72 md:w-96 rounded-3xl shadow-2xl object-cover animate-slide-up opacity-0 delay-400 border-4 border-white/30"
              />
            </div>
          )}

          {/* ROLE */}
          {slide.type === "role" && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
              <SlideTitle icon="👤" title="Роль советника директора в школе" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mt-6">
                {[
                  { icon: "🤝", title: "Посредник", desc: "Связывает детей, учителей и родителей в единую команду" },
                  { icon: "🛡️", title: "Защитник", desc: "Помогает каждому ребёнку чувствовать себя в безопасности" },
                  { icon: "🌱", title: "Наставник", desc: "Помогает детям расти, развиваться и верить в себя" },
                  { icon: "🎯", title: "Организатор", desc: "Создаёт активности и события, которые объединяют класс" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`animate-slide-up opacity-0 delay-${(i + 1) * 100} bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 flex gap-4 items-start`}
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h3 className="text-white font-black text-xl">{item.title}</h3>
                      <p className="text-white/80 text-base mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {slide.type === "tasks" && (
            <div className="flex flex-col items-center flex-1 px-6 py-10">
              <SlideTitle icon="📋" title="Основные задачи советника" />
              <p className="text-white/70 mb-4 text-sm animate-slide-up opacity-0 delay-100">Нажми на карточку, чтобы узнать подробнее!</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {[
                  { icon: "🔍", title: "Наблюдение", desc: "Слежу за настроением и отношениями в классе каждый день" },
                  { icon: "🗣️", title: "Беседы", desc: "Провожу беседы с детьми, слушаю их истории и проблемы" },
                  { icon: "🎮", title: "Игры", desc: "Организую командные игры для сплочения класса" },
                  { icon: "📊", title: "Анализ", desc: "Изучаю ситуацию и нахожу решения для улучшения климата" },
                  { icon: "👨‍👩‍👧", title: "Работа с семьёй", desc: "Поддерживаю связь с родителями и делюсь успехами детей" },
                  { icon: "📅", title: "Планирование", desc: "Разрабатываю программы по воспитанию дружного коллектива" },
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveTask(activeTask === i ? null : i)}
                    className={`game-card animate-pop opacity-0 delay-${(i + 1) * 100} bg-white rounded-2xl p-4 cursor-pointer transition-all duration-300 ${activeTask === i ? "ring-4 ring-[#FFD23F]" : ""}`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="text-[#0D1B3E] font-black text-base mt-2">{item.title}</h3>
                    {activeTask === i && (
                      <p className="text-[#1A56DB] text-sm mt-2">{item.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIMATE */}
          {slide.type === "climate" && (
            <div className="flex flex-col items-center flex-1 px-6 py-10">
              <SlideTitle icon="🌈" title="Формирование школьного климата" light={false} />
              <div className="w-full max-w-3xl mt-4 space-y-4">
                {[
                  { label: "Доверие и безопасность", value: 92, color: "#1A56DB", icon: "🛡️" },
                  { label: "Дружба и уважение", value: 88, color: "#FF4D8D", icon: "❤️" },
                  { label: "Участие в жизни класса", value: 78, color: "#2ECC71", icon: "🌱" },
                  { label: "Радость от учёбы", value: 85, color: "#7B2FBE", icon: "😊" },
                ].map((item, i) => (
                  <div key={i} className={`animate-slide-left opacity-0 delay-${(i + 1) * 100}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-black text-[#0D1B3E] flex gap-2 items-center text-base">
                        {item.icon} {item.label}
                      </span>
                      <span className="font-black text-[#0D1B3E] text-lg">{item.value}%</span>
                    </div>
                    <div className="h-5 bg-white/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{ "--target-width": `${item.value}%`, backgroundColor: item.color } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-3xl">
                {["🎭 Классные часы", "🎨 Творческие мастерские", "🏃 Спортивные активности"].map((item, i) => (
                  <div key={i} className={`animate-pop opacity-0 delay-${(i + 3) * 100} bg-[#0D1B3E] rounded-2xl p-3 text-center`}>
                    <p className="text-white font-semibold text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTION */}
          {slide.type === "interaction" && (
            <div className="flex flex-col items-center flex-1 px-6 py-10">
              <SlideTitle icon="🤝" title="Взаимодействие с учителями и родителями" />
              <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl mt-6">
                <div className="flex-1 animate-slide-left opacity-0 delay-200">
                  <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 h-full">
                    <div className="text-5xl mb-4 text-center">👩‍🏫</div>
                    <h3 className="text-white font-black text-xl text-center mb-4">С учителями</h3>
                    <ul className="space-y-3">
                      {[
                        "Регулярные встречи для обмена наблюдениями",
                        "Совместная разработка воспитательных программ",
                        "Помощь в разрешении конфликтов в классе",
                        "Поддержка в работе с «трудными» детьми",
                      ].map((item, i) => (
                        <li key={i} className="flex gap-2 items-start text-white/90 text-sm">
                          <span className="text-[#FFD23F] mt-0.5">✦</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex-1 animate-slide-right opacity-0 delay-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 h-full">
                    <div className="text-5xl mb-4 text-center">👨‍👩‍👧</div>
                    <h3 className="text-white font-black text-xl text-center mb-4">С родителями</h3>
                    <ul className="space-y-3">
                      {[
                        "Консультации по поведению и развитию ребёнка",
                        "Информирование об успехах и достижениях",
                        "Участие родителей в школьных мероприятиях",
                        "Поддержка в трудных жизненных ситуациях",
                      ].map((item, i) => (
                        <li key={i} className="flex gap-2 items-start text-white/90 text-sm">
                          <span className="text-[#FFD23F] mt-0.5">✦</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="animate-pop opacity-0 delay-500 mt-6 bg-white/10 rounded-2xl px-8 py-4 text-center">
                <p className="font-caveat text-[#FFD23F] text-2xl">«Единая команда — счастливые дети!» ✨</p>
              </div>
            </div>
          )}

          {/* CASES / QUIZ */}
          {slide.type === "cases" && (
            <div className="flex flex-col items-center flex-1 px-6 py-8">
              <SlideTitle icon="🎮" title="Интерактивная викторина!" />
              <p className="text-white/70 text-sm mb-4 animate-slide-up opacity-0 delay-100">Проверьте свои знания о работе советника!</p>

              {confetti && <ConfettiEffect />}

              {!quizDone ? (
                <div className="w-full max-w-2xl animate-slide-up opacity-0 delay-200">
                  <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/70 text-sm">Вопрос {quizIdx + 1} из {QUIZ_QUESTIONS.length}</span>
                      <span className="bg-[#FFD23F] text-[#0D1B3E] font-black px-4 py-1 rounded-full text-sm">{quizScore} ⭐</span>
                    </div>
                    <h3 className="text-white font-black text-xl mb-6">{QUIZ_QUESTIONS[quizIdx].q}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {QUIZ_QUESTIONS[quizIdx].options.map((opt, i) => {
                        const isSelected = selectedAnswer === i;
                        const isCorrect = QUIZ_QUESTIONS[quizIdx].correct === i;
                        let btnClass = "bg-white/20 text-white border border-white/30";
                        if (selectedAnswer !== null) {
                          if (isCorrect) btnClass = "bg-[#2ECC71] text-white border-transparent scale-105";
                          else if (isSelected) btnClass = "bg-red-400 text-white border-transparent";
                          else btnClass = "bg-white/10 text-white/50 border-transparent";
                        }
                        return (
                          <button key={i} onClick={() => handleAnswer(i)}
                            className={`game-card p-4 rounded-2xl font-semibold text-left transition-all duration-300 ${btnClass}`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl text-center animate-pop opacity-0">
                  <div className="bg-white rounded-3xl p-8">
                    <div className="text-6xl mb-4">{quizScore === 3 ? "🏆" : quizScore >= 2 ? "🌟" : "💪"}</div>
                    <h3 className="text-[#0D1B3E] font-black text-3xl mb-2">
                      {quizScore === 3 ? "Отлично!" : quizScore >= 2 ? "Молодец!" : "Хорошая попытка!"}
                    </h3>
                    <p className="text-[#1A56DB] text-xl mb-6">Правильных ответов: {quizScore} из 3</p>
                    <button onClick={resetQuiz}
                      className="bg-[#FF6B35] text-white font-black px-8 py-3 rounded-2xl text-lg hover:scale-105 transition-transform">
                      Сыграть ещё раз! 🎯
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 w-full max-w-2xl animate-slide-up opacity-0 delay-400">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <h4 className="text-white font-black text-center mb-3">🎴 Игра на память: найди пары!</h4>
                  <div className="grid grid-cols-8 gap-1.5">
                    {memCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleMemCard(card.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all duration-300 font-bold
                          ${card.flipped || card.matched ? "bg-white scale-100" : "bg-white/30 hover:bg-white/50"}
                          ${card.matched ? "opacity-50 cursor-default" : ""}
                        `}
                      >
                        {card.flipped || card.matched ? card.emoji : "❓"}
                      </div>
                    ))}
                  </div>
                  {memMatched === 8 && (
                    <div className="text-center mt-3">
                      <p className="text-[#FFD23F] font-black text-xl">🎉 Все пары найдены!</p>
                      <button onClick={resetMemory} className="mt-2 bg-white text-[#7B2FBE] font-black px-4 py-1 rounded-xl text-sm">
                        Играть снова
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {slide.type === "results" && (
            <div className="flex flex-col items-center flex-1 px-6 py-10">
              <SlideTitle icon="🏆" title="Результаты и показатели успеха" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-6">
                {[
                  { num: "94%", label: "детей чувствуют себя комфортно", icon: "😊", color: "#FFD23F" },
                  { num: "3×", label: "меньше конфликтов в классе", icon: "🕊️", color: "#2ECC71" },
                  { num: "87%", label: "родителей довольны атмосферой", icon: "👨‍👩‍👧", color: "#FF6B35" },
                  { num: "+40%", label: "вовлечённость в школьную жизнь", icon: "⚡", color: "#FF4D8D" },
                ].map((item, i) => (
                  <div key={i} className={`animate-pop opacity-0 delay-${(i + 1) * 100} bg-white rounded-3xl p-5 text-center shadow-lg`}>
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="font-black text-3xl md:text-4xl" style={{ color: item.color }}>{item.num}</div>
                    <p className="text-[#0D1B3E]/70 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <img
                src="https://cdn.poehali.dev/projects/8bc93477-4772-47b6-9acb-a26be6d3a1fa/files/64856659-b32a-430e-bfcc-1583ee519178.jpg"
                alt="Дети вместе"
                className="w-full max-w-3xl rounded-3xl mt-6 object-cover h-48 border-4 border-white/30 animate-slide-up opacity-0 delay-500 shadow-xl"
              />
              <div className="animate-pop opacity-0 delay-600 mt-6 text-center">
                <p className="font-caveat text-[#FFD23F] text-3xl drop-shadow">
                  «Счастливый ребёнок — успешный ребёнок!» 🌟
                </p>
                <p className="text-white/60 text-sm mt-2">Советник директора — сердце школьного сообщества ❤️</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-sm">
          <button
            onClick={prev}
            disabled={current === 0}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Icon name="ChevronLeft" size={20} /> Назад
          </button>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <div key={i} onClick={() => goTo(i)} className={`nav-dot ${i === current ? "active" : ""}`} />
              ))}
            </div>
            <span className="text-white/60 text-sm font-semibold">{current + 1}/{SLIDES.length}</span>
          </div>

          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            Вперёд <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
