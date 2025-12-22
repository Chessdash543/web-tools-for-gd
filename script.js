const PRESETS = {
  h_m: { factor: 0.5, src: "-uhd", dst: "-hd" },
  m_h: { factor: 2.0, src: "-hd", dst: "-uhd" },
  h_l: { factor: 0.25, src: "-uhd", dst: "" },
  l_h: { factor: 4.0, src: "", dst: "-uhd" }
};

document.getElementById("run").onclick = async () => {
  const files = document.getElementById("files").files;
  if (!files.length) return;

  const preset = PRESETS[document.getElementById("preset").value];
  const rename = document.getElementById("rename").checked;

  const zip = new JSZip();
  const status = document.getElementById("status");

  for (const file of files) {
    const bitmap = await createImageBitmap(file);

    const w = Math.round(bitmap.width * preset.factor);
    const h = Math.round(bitmap.height * preset.factor);
    if (w < 1 || h < 1) continue;

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await canvas.convertToBlob({ type: "image/png" });

    let name = file.name.replace(".png", "");
    if (rename && preset.src && name.endsWith(preset.src)) {
      name = name.slice(0, -preset.src.length);
    }
    if (rename && preset.dst) name += preset.dst;

    zip.file(name + ".png", blob);
    status.textContent = `Processing ${file.name}`;
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(zipBlob);
  a.download = "images.zip";
  a.click();

  status.textContent = "Finished!";
};
