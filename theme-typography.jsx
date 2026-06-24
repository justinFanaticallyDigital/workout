// theme-typography.jsx
// Shared typography helpers + tilt guard for FitTrack screens.
//
// Promoted out of gameplan-active.jsx so every screen library
// (checkin / picker / planning / logger) can use the same
// type wrappers and the same `stripTilt` rule (graffiti-only tilt).
//
// USAGE — each library binds the helpers to its own theme getter:
//
//   const { Marker, Reenie, Archivo, stripTilt, isGraffiti } =
//     window.makeFitTrackTypography(() => MY_THEME_VAR);
//
// The getter is called on every render, so when the host swaps themes
// (and re-mounts the screen) the helpers see the fresh tokens.
//
// Contract (each helper renders a <span> with the right font family):
//   Marker   — display font (graffiti spray, blueprint stencil, etc.)
//   Reenie   — number font, falls back to body. For big numerals so
//              themes can override digit family without affecting layout.
//   Archivo  — data font (mono / spec readouts).
//   stripTilt(style) — drops `transform` + `transformOrigin` from the
//              style on non-graffiti themes. Graffiti is the only theme
//              where slanted hand-drawn type reads correctly; every
//              other theme wants level baselines.
//   isGraffiti() — true when active theme's chrome === 'graffiti'.
//
// Loose ornament JSX (rotated stamps in picker / planning) should also
// run their style through stripTilt to flatten on non-graffiti themes.

(function () {
  function makeFitTrackTypography(getTheme) {
    const isGraffiti = () => {
      const t = getTheme();
      return !!t && t.chrome === 'graffiti';
    };

    function stripTilt(style) {
      if (isGraffiti() || !style) return style;
      const { transform, transformOrigin, ...rest } = style;
      return rest;
    }

    const Marker = (props) => {
      const t = getTheme();
      return (
        <span style={{ fontFamily: t.fontDisplay, ...stripTilt(props.style) }}>
          {props.children}
        </span>
      );
    };

    const Reenie = (props) => {
      const t = getTheme();
      return (
        <span style={{ fontFamily: t.fontNumber || t.fontBody, lineHeight: 1, ...stripTilt(props.style) }}>
          {props.children}
        </span>
      );
    };

    const Archivo = (props) => {
      const t = getTheme();
      return (
        <span style={{ fontFamily: t.fontData, ...stripTilt(props.style) }}>
          {props.children}
        </span>
      );
    };

    return { Marker, Reenie, Archivo, stripTilt, isGraffiti };
  }

  window.makeFitTrackTypography = makeFitTrackTypography;
})();
