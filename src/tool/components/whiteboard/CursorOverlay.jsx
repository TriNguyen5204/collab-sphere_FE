import { useState } from "react";

export function CursorOverlay({ cursors }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(cursors).map(([uid, pos]) => (
        <div
          key={uid}
          className="absolute text-xs bg-white px-1 py-0.5 rounded shadow"
          style={{
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          🖱️ {uid}
        </div>
      ))}
    </div>
  );
}
