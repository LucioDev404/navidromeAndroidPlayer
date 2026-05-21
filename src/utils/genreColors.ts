const PALETTE = [
  ["#7b2ff7", "#f107a3"],
  ["#ff7eb3", "#65d9ff"],
  ["#ffb36b", "#ff6b6b"],
  ["#6a11cb", "#2575fc"],
  ["#43cea2", "#185a9d"],
  ["#f7971e", "#ffd200"],
  ["#00b09b", "#96c93d"],
  ["#f953c6", "#b91d73"],
];

export function genreGradient(name: string) {
  if (!name) return PALETTE[0];
  // simple deterministic hash
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % PALETTE.length;
  return PALETTE[idx];
}

export default genreGradient;
