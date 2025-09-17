function nextTimeFromNow(headwayMin = 3) {
  if (typeof headwayMin !== "number" || headwayMin <= 0) return null;
  const now = new Date();
  const next = new Date(now.getTime() + headwayMin * 60 * 1000);
  const hh = String(next.getUTCHours()).padStart(2, "0");
  const mm = String(next.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

module.exports = { nextTimeFromNow };