import type { PersonalityDimension, PersonalityVector, TestAnswer } from "@/lib/types";

export const personalityDimensions: PersonalityDimension[] = ["aggressive","aim","chaos","mindgame","information","control","support","lurk"];
export const emptyPersonalityVector = (): PersonalityVector => ({ aggressive:0, aim:0, chaos:0, mindgame:0, information:0, control:0, support:0, lurk:0 });

/** 汇总十道真实对局选择，答案不再携带或推断任何特工定位。 */
export function calculatePersonalityVector(answers: TestAnswer[]): PersonalityVector {
  const total = emptyPersonalityVector();
  answers.forEach(({ dimensions }) => personalityDimensions.forEach((dimension) => {
    total[dimension] += dimensions[dimension] ?? 0;
  }));
  return total;
}
