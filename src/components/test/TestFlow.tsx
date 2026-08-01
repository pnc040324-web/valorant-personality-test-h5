"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import questionsJson from "@/data/questions.json";
import { calculatePersonalityVector } from "@/lib/scoring";
import { matchAgent } from "@/lib/matcher";
import type { Question, QuestionOption } from "@/lib/types";
import { useTestStore } from "@/store/testStore";
import { ProgressBar } from "@/components/common/ProgressBar";
import { track } from "@/lib/analytics";
import { QuestionCard } from "@/components/test/QuestionCard";

const questions = questionsJson as Question[];

function createOptionOrders() {
  return questions.map((question) => {
    const order = question.options.map((_, optionIndex) => optionIndex);
    for (let cursor = order.length - 1; cursor > 0; cursor -= 1) {
      const target = Math.floor(Math.random() * (cursor + 1));
      [order[cursor], order[target]] = [order[target], order[cursor]];
    }
    return order;
  });
}

export function TestFlow() {
  const router = useRouter();
  const { answers, result, setAnswer, setResult, reset, restoreProgress } = useTestStore();
  const [ready, setReady] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(questions);
  const index = Math.min(answers.length, questions.length - 1);

  useEffect(() => {
    restoreProgress();
    let orders = createOptionOrders();
    try {
      const saved = JSON.parse(sessionStorage.getItem("valorant_question_orders_v1") ?? "null");
      if (Array.isArray(saved) && saved.length === questions.length && saved.every((order) => Array.isArray(order) && order.length === 4)) orders = saved;
      else sessionStorage.setItem("valorant_question_orders_v1", JSON.stringify(orders));
    } catch { sessionStorage.setItem("valorant_question_orders_v1", JSON.stringify(orders)); }
    setShuffledQuestions(questions.map((question, questionIndex) => ({ ...question, options:orders[questionIndex].map((optionIndex) => question.options[optionIndex]) })));
    setReady(true);
  }, [restoreProgress]);

  useEffect(() => { if (ready) { track("page_view", { page:"test" }); track("question_start"); } }, [ready]);
  useEffect(() => { if (ready) track("question_view", { question:index + 1 }); }, [index, ready]);
  useEffect(() => { const onHidden=()=>{ if(document.visibilityState === "hidden" && answers.length < questions.length) track("question_drop", { question:answers.length + 1 }); }; document.addEventListener("visibilitychange",onHidden); return ()=>document.removeEventListener("visibilitychange",onHidden); }, [answers.length]);
  useEffect(() => { if (!ready || answers.length < questions.length) return; if (result) router.replace("/scan"); else reset(); }, [answers.length, ready, reset, result, router]);

  if (!ready) return <main className="app-shell grid place-items-center"><p className="text-sm tracking-widest text-white/50">正在恢复答题进度…</p></main>;

  const choose = (option: QuestionOption) => {
    track("question_answer", { question:index + 1 });
    setAnswer(index, option);
    if (index === questions.length - 1) {
      const finalAnswers = [...answers, option];
      const finalResult = matchAgent(calculatePersonalityVector(finalAnswers));
      setResult(finalResult);
      track("test_complete", { agent:finalResult.primary.id });
      track("finish_test", { agent:finalResult.primary.id });
      track("agent_result", { agent:finalResult.primary.id, probability:finalResult.probability });
      router.push("/scan");
    }
  };

  return <main className="app-shell grid-bg flex min-h-svh flex-col px-5 py-7"><header><div className="mb-7 flex items-center justify-between"><button onClick={() => router.push("/")} className="text-xs text-white/50">← 退出测试</button><span className="font-display text-xs tracking-widest text-riot">AGENT MATCH</span></div><ProgressBar current={index + 1} total={questions.length}/></header><AnimatePresence mode="wait"><QuestionCard key={shuffledQuestions[index].id} question={shuffledQuestions[index]} onChoose={choose}/></AnimatePresence><p className="text-center text-xs text-white/35">凭第一直觉选，别开科研局</p></main>;
}
