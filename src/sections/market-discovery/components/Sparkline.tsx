interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function Sparkline(props: SparklineProps) {
  const { data, positive, width = 48, height = 16 } = props;

  if (!data || data.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.001;
  const pad = 1;

  const pts = data.map((v, i) => {
    const x = pad + ((i / (data.length - 1)) * (width - pad * 2));
    const y = pad + ((1 - (v - min) / range) * (height - pad * 2));
    return [x, y] as [number, number];
  });

  const linePath = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const stroke = positive ? "#10b981" : "#ef4444";

  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

