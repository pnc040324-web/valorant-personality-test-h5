import { agents } from "@/data/agentRegistry";
import { personalityDimensions } from "@/lib/scoring";
import type { MatchResult, PersonalityVector } from "@/lib/types";

const dot = (left: PersonalityVector, right: PersonalityVector) => personalityDimensions.reduce((sum, key) => sum + left[key] * right[key], 0);
const magnitude = (vector: PersonalityVector) => Math.sqrt(personalityDimensions.reduce((sum, key) => sum + vector[key] ** 2, 0));
const MATCH_TEMPERATURE = 8;

const rarityExposure = (agentId: string) => agentId === "omen" ? 0.45 : 1;

function pickWeighted<T extends { exposure:number }>(candidates: T[], random: number) {
  const total = candidates.reduce((sum, candidate) => sum + candidate.exposure, 0);
  let cursor = Math.min(Math.max(random, 0), 0.999999) * total;
  for (const candidate of candidates) {
    cursor -= candidate.exposure;
    if (cursor <= 0) return candidate;
  }
  return candidates[candidates.length - 1];
}

/**
 * 人格相似度决定候选强度，基础 weight 调整长期曝光；随后在全量相关候选池中加权抽取。
 * 这避免了单一高维画像长期垄断，同时不回退到“定位 → 特工”的固定映射。
 */
export function matchAgent(personalityVector: PersonalityVector, random = Math.random()): MatchResult {
  const playerMagnitude = Math.max(magnitude(personalityVector), 1);
  const ranked = agents.map((agent) => {
    let similarity = dot(personalityVector, agent.personalityWeights) / (playerMagnitude * Math.max(magnitude(agent.personalityWeights), 1));
    // 幽影 SSR 隐藏人格：只在完整暗影画像中得到小幅加成，常规回答不再默认命中。
    if (agent.id === "omen" && personalityVector.mindgame >= 10 && personalityVector.control >= 8 && personalityVector.aim >= 5) similarity += 0.035;
    const exposure = Math.exp(similarity * MATCH_TEMPERATURE) * agent.weight * rarityExposure(agent.id);
    return { agent, similarity, exposure };
  }).sort((left, right) => right.similarity - left.similarity || left.agent.id.localeCompare(right.agent.id));
  const primary = pickWeighted(ranked, random);
  return {
    primary: primary.agent,
    backups: ranked.filter(({ agent }) => agent.id !== primary.agent.id).slice(0, 3).map(({ agent }) => agent),
    similarity: Number(primary.similarity.toFixed(4)),
    probability: Math.max(68, Math.min(98, Math.round(55 + primary.similarity * 45))),
    personalityVector,
  };
}
