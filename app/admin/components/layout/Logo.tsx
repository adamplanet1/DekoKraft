"use client";

import { publicPath } from "../../../lib/publicPath";

export default function Logo() {
  return (
    <div className="dkLogoCard">
      <img
        src={publicPath("/logo-dekokraft-1200.webp")}
        alt="DekoKraft"
        className="dkLogoImage"
      />

      <h2>DekoKraft</h2>
      <p>Adamplanet | كوكب آدم</p>
    </div>
  );
}
