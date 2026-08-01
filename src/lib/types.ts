export type RoleKey = "duelist" | "initiator" | "controller" | "sentinel";
export type RoleName = "决斗" | "先锋" | "控场" | "哨卫";
export type PersonalityDimension = "aggressive" | "aim" | "chaos" | "mindgame" | "information" | "control" | "support" | "lurk";
export type PersonalityVector = Record<PersonalityDimension, number>;
export type PersonalityTag = "aggressive"|"intel"|"control"|"mindgame"|"guardian"|"anchor"|"chaos"|"leader"|"clutch"|"solo"|"teamplay";
export interface Agent { id:string; name:string; displayName:string; englishName:string; nickname:string; englishId:string; role:RoleName; popularity:number; weight:number; avatar:string; qAvatar:string; rarity:"R"|"SR"|"SSR"; title:string; shareTitle:string; teamComment:string; themeStyle:"riot-core"|"shadow-rare"|"cute-healer"; tags:PersonalityTag[]; personalityWeights:PersonalityVector; hotWords:string[]; keywords:string[]; strength:string; weakness:string; proJoke:string; rankJoke:string; shareText:string; }
export interface TestAnswer { dimensions: Partial<PersonalityVector>; }
export interface QuestionOption extends TestAnswer { text:string; comment:string; }
export interface Question { id:number; question:string; sideText:string; options:QuestionOption[]; }
export interface MatchResult { primary:Agent; backups:Agent[]; probability:number; personalityVector:PersonalityVector; similarity:number; }
