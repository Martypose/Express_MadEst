// ---- medidas desde la cenital (siempre mm reales) ----
socket.on('medidas', async (dataArray, cb) => {
  try {
    const arr = Array.isArray(dataArray) ? dataArray : [dataArray];
    let count = 0;

    for (const data of arr) {
      if (!data.ancho_mm || !(data.grosor_lateral_mm ?? data.grosor_mm)) {
        console.warn(`Medida inválida: falta mm (tabla_id=${data?.tabla_id})`);
        continue;
      }
      if (isV2(data)) {
        await upsertMedidaCenitalV2(data);
      } else {
        // Fallback legacy → mapear mínimos
        await upsertMedidaCenitalV2({
          ...data,
          schema: 'legacy',
          ancho_px_mean: data.ancho_pixel_real,
          xl_px: data.xl_px,
          xr_px: data.xr_px,
          rows_valid: data.rows,
          grosor_lateral_mm: data.grosor_mm,
        });
      }
      count++;
    }

    console.info(`Medida(s) insertada(s): ${count}`);
    if (cb) cb({ ok: true, count });
  } catch (e) {
    console.error('Error procesando medidas:', e);
    if (cb) cb({ ok: false, error: String(e?.message || e) });
  }
});
