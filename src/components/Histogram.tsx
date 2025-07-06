import React, { useEffect, useRef } from "react";
import { calculateHistogram, type HistogramData } from "../utils/histogramCalculator";
import { useGlobalStore } from "../store/globalStore";

const drawHistogram = (canvas: HTMLCanvasElement, data: HistogramData) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const x = (width / 4) * i;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  const maxRed = Math.max(...data.red);
  const maxGreen = Math.max(...data.green);
  const maxBlue = Math.max(...data.blue);
  const maxLuminance = Math.max(...data.luminance);
  const maxValue = Math.max(maxRed, maxGreen, maxBlue, maxLuminance);
  const barWidth = width / 256;
  ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
  for (let i = 0; i < 256; i++) {
    const barHeight = (data.red[i] / maxValue) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
  ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
  for (let i = 0; i < 256; i++) {
    const barHeight = (data.green[i] / maxValue) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
  ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
  for (let i = 0; i < 256; i++) {
    const barHeight = (data.blue[i] / maxValue) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 256; i++) {
    const barHeight = (data.luminance[i] / maxValue) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
  ctx.fillStyle = '#cccccc';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('0', 10, height - 5);
  ctx.fillText('128', width / 2, height - 5);
  ctx.fillText('255', width - 10, height - 5);
};

const Histogram: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const image = useGlobalStore(state => state.image);
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    calculateHistogram(image).then((data) => {
      if (data) drawHistogram(canvasRef.current!, data);
    });
  }, [image]);
  return <canvas ref={canvasRef} width={320} height={100} style={{ width: "100%", height: "100%" }} />;
};
export default Histogram; 