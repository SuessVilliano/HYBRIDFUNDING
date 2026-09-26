export function buildOBSCollection(
  base: string,
  demo: boolean,
  left: string,
  right: string,
  quick = "",
  season = "Quick Battle",
  extras: Record<string, string> = {},
) {
  const modes = [["01 · Head to head", "duel"], ["02 · Eight traders", "grid"], ["03 · Intermission", "break"]] as const;
  const sources: object[] = [];
  for (const [name, layout] of modes) {
    const url = new URL("/tradehouse/stage", base);
    url.search = new URLSearchParams({
      layout,
      overlay: "1",
      ...(demo ? { demo: "1" } : {}),
      ...(quick ? { quick, season } : {}),
      left,
      right,
      ...extras,
    }).toString();
    const sourceName = `${name} · Graphics`;
    sources.push({
      name: sourceName,
      id: "browser_source",
      versioned_id: "browser_source",
      settings: {
        url: url.toString(),
        width: 1920,
        height: 1080,
        fps: 30,
        fps_custom: true,
        shutdown: false,
        restart_when_active: false,
        css: "body { margin: 0; background: transparent; overflow: hidden; }",
      },
      mixers: 0,
      enabled: true,
    });
    sources.push({
      name,
      id: "scene",
      versioned_id: "scene",
      settings: {
        items: [{
          name: sourceName,
          id: 1,
          visible: true,
          locked: true,
          rot: 0,
          pos: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          align: 5,
          bounds_type: 0,
          bounds_align: 0,
          bounds: { x: 0, y: 0 },
          crop_left: 0,
          crop_top: 0,
          crop_right: 0,
          crop_bottom: 0,
        }],
        id_counter: 1,
      },
      mixers: 0,
    });
  }
  return {
    name: `Trade House ${demo ? "Rehearsal" : quick ? season : "Broadcast"}`,
    current_scene: modes[0][0],
    current_program_scene: modes[0][0],
    scene_order: modes.map(([name]) => ({ name })),
    sources,
    groups: [],
    quick_transitions: [],
    transitions: [],
    current_transition: "Fade",
    transition_duration: 300,
  };
}

export function downloadOBSCollection(
  base: string,
  demo: boolean,
  left: string,
  right: string,
  quick = "",
  season = "Quick Battle",
  extras: Record<string, string> = {},
) {
  const blob = new Blob(
    [JSON.stringify(buildOBSCollection(base, demo, left, right, quick, season, extras), null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Trade-House-${demo ? "Rehearsal" : quick ? "Quick-Battle" : "Broadcast"}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
