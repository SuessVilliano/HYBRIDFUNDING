export type BattleFormat = "spotlight" | "sprint" | "target" | "prop" | "league";

export type BattleRuleConfig = {
  format: BattleFormat;
  label: string;
  durationSeconds?: number;
  targetReturnPct?: number;
  profitTargetPct?: number;
  maxDrawdownPct?: number;
  accountSize?: number;
  endsAt?: string | null;
};

export const BATTLE_PRESETS: Record<BattleFormat, BattleRuleConfig> = {
  spotlight: {
    format: "spotlight",
    label: "Spotlight Session",
  },
  sprint: {
    format: "sprint",
    label: "Sprint",
    durationSeconds: 60 * 60,
  },
  target: {
    format: "target",
    label: "Target Race",
    targetReturnPct: 5,
  },
  prop: {
    format: "prop",
    label: "Prop Challenge",
    profitTargetPct: 8,
    maxDrawdownPct: 5,
  },
  league: {
    format: "league",
    label: "Monthly League",
  },
};

export function parseBattleRules(params: URLSearchParams): BattleRuleConfig {
  const format = (params.get("format") || "spotlight") as BattleFormat;
  const preset = BATTLE_PRESETS[format] || BATTLE_PRESETS.spotlight;

  const numberParam = (key: string, fallback?: number) => {
    const raw = params.get(key);
    if (raw == null || raw === "") return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    ...preset,
    label: params.get("ruleLabel") || preset.label,
    durationSeconds: numberParam("duration", preset.durationSeconds),
    targetReturnPct: numberParam("target", preset.targetReturnPct),
    profitTargetPct: numberParam("profitTarget", preset.profitTargetPct),
    maxDrawdownPct: numberParam("maxDD", preset.maxDrawdownPct),
    accountSize: numberParam("accountSize", preset.accountSize),
    endsAt: params.get("endsAt") || preset.endsAt || null,
  };
}

export function battleClock(rule: BattleRuleConfig, elapsed: number, now = Date.now()) {
  if (rule.format === "sprint" && rule.durationSeconds) {
    return {
      seconds: Math.max(0, rule.durationSeconds - elapsed),
      direction: "down" as const,
      label: "TIME LEFT",
      expired: elapsed >= rule.durationSeconds,
    };
  }

  if (rule.format === "league" && rule.endsAt) {
    const seconds = Math.max(0, Math.floor((Date.parse(rule.endsAt) - now) / 1000));
    return {
      seconds,
      direction: "down" as const,
      label: "SEASON LEFT",
      expired: seconds <= 0,
    };
  }

  return {
    seconds: elapsed,
    direction: "up" as const,
    label: rule.format === "spotlight" ? "SESSION TIME" : "RACE TIME",
    expired: false,
  };
}

export function battleObjective(rule: BattleRuleConfig) {
  switch (rule.format) {
    case "sprint":
      return "Highest return when the clock expires";
    case "target":
      return `First verified account to +${rule.targetReturnPct ?? 5}%`;
    case "prop":
      return `Pass the Hybrid challenge · target ${rule.profitTargetPct ?? 8}% · max DD ${rule.maxDrawdownPct ?? 5}%`;
    case "league":
      return "Monthly verified leaderboard · no forced daily trade";
    case "spotlight":
    default:
      return "Live spotlight · producer ends the session";
  }
}
