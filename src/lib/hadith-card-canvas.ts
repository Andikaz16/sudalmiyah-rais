/**
 * Canvas utility to generate high-resolution (1080x1080) Islamic Hadith Poster Cards
 * with official UMS & Masjid Hj. Sudalmiyah Rais branding for WhatsApp & social media sharing.
 */

import { InfaqHadith } from "@/components/MutiaraHaditsSection";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "center"
): number {
  ctx.textAlign = align;
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

export async function generateHadithPosterBlob(
  hadith: InfaqHadith,
  hijriDate: string,
  masehiDate: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }

  // 1. Background Gradient (Deep Navy Blue into Royal Islamic Navy)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#001D3D");
  bgGrad.addColorStop(0.5, "#002855");
  bgGrad.addColorStop(1, "#003B73");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative Outer Border (Gold)
  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // 3. Official Logo UMS / Masjid
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = "/images/logo/logo-masjid.png";

  await new Promise<void>((resolve) => {
    logo.onload = () => resolve();
    logo.onerror = () => resolve(); // Proceed even if logo fails to load
  });

  const logoSize = 100;
  const logoX = (width - logoSize) / 2;
  const logoY = 65;

  if (logo.complete && logo.naturalWidth > 0) {
    ctx.save();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  }

  // 4. Header Titles
  ctx.fillStyle = "#F59E0B"; // Amber Gold
  ctx.font = "bold 26px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText("MASJID HJ. SUDALMIYAH RAIS", width / 2, 195);

  ctx.fillStyle = "#E2E8F0"; // Slate 200
  ctx.font = "600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("UNIVERSITAS MUHAMMADIYAH SURAKARTA", width / 2, 225);

  // Divider Line
  ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 245);
  ctx.lineTo(width - 180, 245);
  ctx.stroke();

  // 5. Date Pill Badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  const badgeY = 265;
  const badgeH = 34;
  const badgeW = 600;
  const badgeX = (width - badgeW) / 2;
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
  ctx.fill();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#FDE68A"; // Light Amber
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`${hijriDate} (KHGT) / ${masehiDate}`, width / 2, badgeY + 22);

  // 6. Hadith Theme / Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 30px 'Times New Roman', serif";
  ctx.fillText(`MUTIARA HADITS: ${hadith.theme.toUpperCase()}`, width / 2, 345);

  // 7. Arabic Text (Centered, Gold Highlight)
  ctx.fillStyle = "#FEF08A"; // Soft Gold Arabic
  ctx.font = "bold 33px 'Amiri', 'Traditional Arabic', 'Scheherazade', serif";
  const arabicEndY = wrapText(ctx, hadith.arabic, width / 2, 405, 920, 50, "center");

  // 8. Translation (Quoted, White/Stone)
  ctx.fillStyle = "#F1F5F9";
  ctx.font = "italic 21px 'Times New Roman', Georgia, serif";
  const translationText = `"${hadith.translation}"`;
  const transStartY = Math.max(arabicEndY + 20, 560);
  const transEndY = wrapText(ctx, translationText, width / 2, transStartY, 900, 32, "center");

  // 9. Source & Fadhilah
  const fadhilahStartY = Math.min(transEndY + 18, 920);
  ctx.fillStyle = "#FBBF24"; // Amber 400
  ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`(${hadith.source} — ${hadith.fadhilah})`, width / 2, fadhilahStartY);

  // 10. Footer Section (Donation & Identity)
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(46, height - 105, width - 92, 58);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(46, height - 105, width - 92, 58);

  ctx.fillStyle = "#FDE68A"; // Amber 200
  ctx.font = "bold 14.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(
    "Donasi Kegiatan Masjid Percontohan AUM: Bank Jateng Syariah (BJS) 6012275865 a.n. MASJID UMS",
    width / 2,
    height - 76
  );

  ctx.fillStyle = "#94A3B8"; // Slate 400
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(
    "Disiarkan oleh Masjid Hj. Sudalmiyah Rais Kampus 2 UMS | Portal: masjid.ums.ac.id",
    width / 2,
    height - 54
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to export canvas to blob"));
        }
      },
      "image/jpeg",
      0.92
    );
  });
}
