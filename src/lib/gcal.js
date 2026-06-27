// Builds an "Add to Google Calendar" template URL (no API/OAuth needed).
// The user taps it and Google Calendar opens pre-filled; they can add Meet
// with one click on Google's side.

const BLOCK_START = { Morning: 9, Midday: 13, Afternoon: 15, Evening: 18 };

function fmt(d) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `T${p(d.getHours())}${p(d.getMinutes())}00`
  );
}

export function buildCalendarUrl({ slot, duration, callType, note, otherName }) {
  if (!slot) return null;
  const start = new Date(slot.dayKey); // e.g. "Mon Jun 30 2025"
  if (isNaN(start)) return null;
  start.setHours(BLOCK_START[slot.block] ?? 12, 0, 0, 0);

  const mins = parseInt(String(duration), 10) || 30;
  const end = new Date(start.getTime() + mins * 60000);

  const text = `Call with ${otherName || 'a connection'}`;
  const details =
    `${callType || 'Video'} call set up via Klyk.` +
    (note ? `\n\nNote: ${note}` : '') +
    `\n\nTip: add Google Meet to this event in one click.`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
