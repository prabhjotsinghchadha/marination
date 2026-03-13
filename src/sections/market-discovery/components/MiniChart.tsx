import { useId } from "react";

interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function MiniChart(props: MiniChartProps) {
  const { data, color = "#60a5fa", width = 100, height = 28 } = props;
  const uid = useId();
  const gradId = `mc${uid.replace(/:/g, "")}`;

  if (!data || data.length < 2) return <svg width={width} height={height} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.01;

  const pts = data.map(
    (v, i): [number, number] => [
      (i / (data.length - 1)) * width,
      2 + ((1 - (v - min) / range) * (height - 4)),
    ],
  );

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fill = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

