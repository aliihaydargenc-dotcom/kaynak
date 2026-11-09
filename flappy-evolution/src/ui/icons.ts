const paths: Record<string, string> = {
  wing: "M3 17C3 7 14 3 21 4c-2 9-8 16-15 15M6 19l10-9",
  map: "M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5zm6-2v16m6-14v16",
  infinity: "M12 12c-3-6-9-6-9 0s6 6 9 0 9-6 9 0-6 6-9 0",
  hanger: "M10 6a2 2 0 114 0c0 2-2 2-2 4l9 6v3H3v-3l9-6",
  settings:
    "M12 8a4 4 0 100 8 4 4 0 000-8zm0-6v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10l2 2M5 19l2-2M17 7l2-2",
  arrow: "M4 12h16m-6-6l6 6-6 6",
  coin: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 5v8m-3-4h6",
};
export function icon(name: string): string {
  return `<svg aria-hidden="true" class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] ?? paths.wing}"/></svg>`;
}
