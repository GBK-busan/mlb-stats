import "./DatePicker.css";

export default function DatePicker({ date, onChangeDate }) {
  const handleChange = (e) => {
    onChangeDate(e.target.value);
  };

  // 🔹 날짜를 days 만큼 이동 (예: -1이면 어제, +1이면 내일)
  const shiftDate = (days) => {
    if (!date) return;
    const current = new Date(date + "T00:00:00");
    current.setDate(current.getDate() + days);

    const offset = current.getTimezoneOffset();
    const local = new Date(current.getTime() - offset * 60 * 1000);
    const newDateStr = local.toISOString().slice(0, 10);

    onChangeDate(newDateStr);
  };

  // 🔹 오늘로 이동
  const goToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1000);
    const todayStr = local.toISOString().slice(0, 10);
    onChangeDate(todayStr);
  };

  return (
    <div className="date-picker">
      <label htmlFor="game-date">날짜 선택: </label>
      <input id="game-date" type="date" value={date} onChange={handleChange} />

      <div className="date-buttons">
        <button type="button" onClick={() => shiftDate(-1)}>
          ◀ 이전
        </button>
        <button type="button" onClick={goToday}>
          오늘
        </button>
        <button type="button" onClick={() => shiftDate(1)}>
          다음 ▶
        </button>
      </div>
    </div>
  );
}
