import * as React from "react";

interface Props {
  highlightedSpikes: number[],
  onClick(spikeNum: number): void
}

const HighlightedSpikes:React.FunctionComponent<Props> = ({
  highlightedSpikes,
  onClick
}:Props) => (
  <g>
    {highlightedSpikes
      .filter(s => s >= 0 && s < 24)
      .map(spikeNum => {
        let baseY:number, tipY:number, shadowTipY:number, spikeX:number;
        if (spikeNum < 12) {
          baseY = 30;
          tipY = 190;
          shadowTipY = 210;
          spikeX = 38 - 50 * (spikeNum - 11);
          if (spikeNum < 6) spikeX += 35;
        } else {
          baseY = 470;
          tipY = 310;
          shadowTipY = 290;
          spikeX = 38 + 50 * (spikeNum - 12);
          if (spikeNum > 17) spikeX += 35;
        }

        return (
          <g
            key={spikeNum}
            className="points"
            transform={`translate(${spikeX}, 0)`}
            onClick={() => onClick(spikeNum)}
          >
            <polygon
              style={{ fill: "#f6ff4d" }}
              points={`0,${baseY} 40,${baseY} 20,${tipY}`}
            />
            <polygon
              style={{ fill: "#f6ff4d33" }}
              points={`-5,${baseY} 45,${baseY} 20,${shadowTipY}`}
            />
          </g>
        );
      })}
  </g>
);

export default HighlightedSpikes;
