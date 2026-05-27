import { formatCurrency } from '@/lib/utils';

interface Point {
  label: string;
  value: number;
}

interface Props {
  points: Point[];
}

export function SpendingChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-secondary">
        Sem dados pra exibir.
      </p>
    );
  }

  const W = 600;
  const H = 200;
  const PADDING_X = 40;
  const PADDING_Y = 20;

  const values = points.map((p) => p.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const xStep =
    points.length > 1 ? (W - 2 * PADDING_X) / (points.length - 1) : 0;
  const yScale = (v: number) => {
    const range = maxVal - minVal || 1;
    return H - PADDING_Y - ((v - minVal) / range) * (H - 2 * PADDING_Y);
  };

  const coords = points.map((p, i) => ({
    x: PADDING_X + i * xStep,
    y: yScale(p.value),
    ...p,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x},${H - PADDING_Y} L ${coords[0].x},${H - PADDING_Y} Z`
      : '';

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320 }}
        role="img"
        aria-label="Gráfico de gasto mensal"
      >
        <defs>
          <linearGradient id="spending-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={PADDING_X}
            x2={W - PADDING_X}
            y1={PADDING_Y + p * (H - 2 * PADDING_Y)}
            y2={PADDING_Y + p * (H - 2 * PADDING_Y)}
            stroke="#2a2a3a"
            strokeDasharray="2 4"
          />
        ))}

        <path d={areaPath} fill="url(#spending-grad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#6C5CE7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="#6C5CE7" />
            <text
              x={c.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#8888a0"
            >
              {c.label}
            </text>
          </g>
        ))}

        <text x={4} y={PADDING_Y + 4} fontSize="10" fill="#8888a0">
          {formatCurrency(maxVal)}
        </text>
        <text x={4} y={H - PADDING_Y} fontSize="10" fill="#8888a0">
          R$ 0
        </text>
      </svg>
    </div>
  );
}
