export const categoryChartColors = [
  "rgba(59, 130, 246, 0.8)",
  "rgba(34, 197, 94, 0.8)",
  "rgba(168, 85, 247, 0.8)",
  "rgba(234, 179, 8, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(107, 114, 128, 0.8)",
];

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number | null } }) => {
          const value = context.parsed.y ?? 0;
          return `達成率: ${value.toFixed(1)}%`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
};

export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    tooltip: {
      callbacks: {
        label: (context: { label: string; parsed: number }) =>
          `${context.label}: ${context.parsed.toFixed(1)}%`,
      },
    },
  },
};
