import React from "react";
import "./GoalReminder.css";

const GoalReminder = ({
  calorieGoal,
  caloriesConsumed,
  proteinGoal,
  proteinConsumed,
  loading,
}) => {
  if (loading || !calorieGoal || calorieGoal === 0) {
    return null;
  }

  const caloriePercentage = (caloriesConsumed / calorieGoal) * 100;
  const proteinPercentage = proteinGoal > 0 ? (proteinConsumed / proteinGoal) * 100 : 0;
  const caloriesLeft = calorieGoal - caloriesConsumed;
  const proteinLeft = proteinGoal - proteinConsumed;

  // Get current time to determine if it's late in the day
  const now = new Date();
  const currentHour = now.getHours();
  const isLateDay = currentHour >= 18; // After 6 PM
  const isMidDay = currentHour >= 14; // After 2 PM

  const reminders = [];

  // Calorie reminders
  if (caloriePercentage >= 90 && caloriesLeft > 0) {
    reminders.push({
      type: "success",
      icon: "🎯",
      message: `Almost there! Only ${Math.round(caloriesLeft)} calories left to reach your goal!`,
    });
  } else if (caloriePercentage >= 100) {
    reminders.push({
      type: "achieved",
      icon: "🎉",
      message: `Congratulations! You've reached your calorie goal!`,
    });
  } else if (caloriePercentage < 50 && isLateDay) {
    reminders.push({
      type: "warning",
      icon: "⏰",
      message: `You're at ${Math.round(caloriePercentage)}% of your calorie goal. Time to fuel up!`,
    });
  } else if (caloriePercentage >= 75 && caloriePercentage < 90) {
    reminders.push({
      type: "info",
      icon: "💪",
      message: `Great progress! ${Math.round(caloriesLeft)} calories remaining.`,
    });
  }

  // Protein reminders
  if (proteinGoal > 0) {
    if (proteinPercentage >= 90 && proteinLeft > 0) {
      reminders.push({
        type: "success",
        icon: "🥩",
        message: `Almost at your protein goal! Just ${Math.round(proteinLeft)}g more needed.`,
      });
    } else if (proteinPercentage >= 100) {
      reminders.push({
        type: "achieved",
        icon: "💪",
        message: `Protein goal achieved! Keep it up!`,
      });
    } else if (proteinPercentage < 50 && isMidDay) {
      reminders.push({
        type: "warning",
        icon: "⚠️",
        message: `You're at ${Math.round(proteinPercentage)}% of your protein goal. Consider adding protein-rich foods!`,
      });
    }
  }

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="goal-reminders">
      {reminders.map((reminder, index) => (
        <div key={index} className={`goal-reminder goal-reminder--${reminder.type}`}>
          <span className="reminder-icon">{reminder.icon}</span>
          <span className="reminder-message">{reminder.message}</span>
        </div>
      ))}
    </div>
  );
};

export default GoalReminder;

