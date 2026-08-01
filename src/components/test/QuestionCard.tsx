"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Question, QuestionOption } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  onChoose: (option: QuestionOption) => void;
}

/** 单题卡片只负责展示与交互，评分和跳转由页面流程统一处理。 */
export function QuestionCard({ question, onChoose }: QuestionCardProps) {
  const [selecting, setSelecting] = useState(false);
  const choose = (option: QuestionOption) => { if (selecting) return; setSelecting(true); onChoose(option); };
  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="flex min-h-[calc(100svh-175px)] flex-1 flex-col justify-center py-7"
    >
      <p className="text-xs tracking-[.2em] text-riot">
        Q.{String(question.id).padStart(2, "0")} / {question.sideText}
      </p>
      <h1 className="mt-4 text-3xl font-bold leading-tight">{question.question}</h1>
      <div className="mt-9 space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            onClick={() => choose(option)} disabled={selecting}
            className="clip-reverse esport-card group min-h-14 w-full border border-white/15 bg-white/[.04] p-4 text-left transition duration-200 hover:border-riot hover:bg-riot/10 active:scale-[.975] active:border-riot active:bg-riot/20 disabled:opacity-70"
          >
            <span className="mr-3 inline-flex h-6 w-6 items-center justify-center bg-white/10 text-xs text-riot">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm font-medium">{option.text}</span>
            <span className="mt-2 block text-xs text-white/45 opacity-0 transition group-hover:opacity-100">
              {option.comment}
            </span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
