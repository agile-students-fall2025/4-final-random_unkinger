import React from "react";

function buildCalorieMessage(calorieGoal, caloriesConsumed) {
  if (!calorieGoal) {
    return {
      variant: "info",
      title: "Set a daily calorie goal",
      body: "Add a calorie target in your profile to get more tailored reminders.",
    };
  }

  const remaining = Math.max(0, calorieGoal - caloriesConsumed);
  const pct = calorieGoal > 0 ? caloriesConsumed / calorieGoal : 0;

  if (pct >= 1.05) {
    return {
      variant: "warning",
      title: "You’ve gone over your calorie goal",
      body: `You’re above today’s goal. Consider a lighter meal or more movement.`,
    };
  }

  if (pct >= 0.95 && pct <= 1.05) {
    return {
      variant: "achieved",
      title: "Calorie goal reached 🎉",
      body: `You’re right around your target for today. Nicely balanced!`,
    };
  }

  if (pct >= 0.7) {
    return {
      variant: "success",
      title: "You’re close to your calorie goal",
      body: `${remaining} kcal left for today. You’re nearly there—plan your next meal mindfully.`,
    };
  }

  return {
    variant: "info",
    title: "You’re off to a good start",
    body: `${remaining} kcal remaining. Keep logging meals to stay on track.`,
  };
}

function buildProteinMessage(proteinGoal, proteinConsumed) {
  if (!proteinGoal) {
    return {
      variant: "info",
      title: "Set a protein goal",
      body: "Add a daily protein target to help support your energy and recovery.",
    };
  }

  const remaining = Math.max(0, proteinGoal - proteinConsumed);
  const pct = proteinGoal > 0 ? proteinConsumed / proteinGoal : 0;

  if (pct >= 1.05) {
    return {
      variant: "warning",
      title: "Protein goal exceeded",
      body: `You’re above your protein target. It’s okay, just balance it across the week.`,
    };
  }

  if (pct >= 0.95 && pct <= 1.05) {
    return {
      variant: "achieved",
      title: "Protein goal reached 💪",
      body: `You’ve hit today’s protein target. Great for recovery and satiety.`,
    };
  }

  if (pct >= 0.7) {
    return {
      variant: "success",
      title: "You’re close to your protein goal",
      body: `${remaining.toFixed(0)} g left to hit your daily target.`,
    };
  }

  return {
    variant: "info",
    title: "Room to add more protein",
      body: `${remaining.toFixed(0)} g remaining. Consider adding a protein-rich snack or side.`,
  };
}

function cardClasses(variant) {
  const base =
    "flex items-start gap-3 rounded-2xl px-3.5 py-3 shadow-sm border-l-4 transition-transform bg-white/85 backdrop-blur-sm";

  switch (variant) {
    case "success":
      return (
        base +
        " border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800"
      );
    case "achieved":
      return (
        base +
        " border-amber-400 bg-gradient-to-r from-amber-50 to-orange-100 text-amber-900"
      );
    case "warning":
      return (
        base +
        " border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900"
      );
    case "info":
    default:
      return (
        base +
        " border-sky-400 bg-gradient-to-r from-sky-50 to-sky-100 text-sky-900"
      );
  }
}

function iconByVariant(variant) {
  switch (variant) {
    case "success":
      return "ri-checkbox-circle-line";
    case "achieved":
      return "ri-star-smile-line";
    case "warning":
      return "ri-error-warning-line";
    case "info":
    default:
      return "ri-information-line";
  }
}

export default function GoalReminder({
  calorieGoal,
  caloriesConsumed,
  proteinGoal,
  proteinConsumed,
  loading,
}) {
  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto mt-3">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 px-3.5 py-3 text-xs text-slate-500 shadow-sm">
          Loading today’s progress…
        </div>
      </div>
    );
  }

  const calorieMsg = buildCalorieMessage(calorieGoal, caloriesConsumed);
  const proteinMsg = buildProteinMessage(proteinGoal, proteinConsumed);

  return (
    <div className="w-full max-w-xl mx-auto mt-4 space-y-2.5">
      {/* Calorie reminder */}
      <div className={cardClasses(calorieMsg.variant)}>
        <span className="mt-0.5 flex-shrink-0 text-lg">
          <i className={`${iconByVariant(calorieMsg.variant)} align-middle`} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold leading-tight">
            {calorieMsg.title}
          </p>
          <p className="mt-1 text-[11px] leading-snug">
            {calorieMsg.body}
          </p>
        </div>
      </div>

      {/* Protein reminder */}
      <div className={cardClasses(proteinMsg.variant)}>
        <span className="mt-0.5 flex-shrink-0 text-lg">
          <i className={`${iconByVariant(proteinMsg.variant)} align-middle`} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold leading-tight">
            {proteinMsg.title}
          </p>
          <p className="mt-1 text-[11px] leading-snug">
            {proteinMsg.body}
          </p>
        </div>
      </div>
    </div>
  );
}
