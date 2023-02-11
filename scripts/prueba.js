const { spawn } = require("child_process");
const fs = require("fs");

app.post("/procesar-imagen", upload.single("imagen"), function(req, res) {
  const scriptPath = "ruta/a/tu/script.py";
  const imagenPath = "ruta/a/tu/imagen.jpg";
  fs.writeFileSync(imagenPath, req.file.buffer);

  const process = spawn("python", [scriptPath, imagenPath]);
  let resultados = "";
  process.stdout.on("data", function(data) {
    resultados += data.toString();
  });

  process.on("close", function() {
    resultados = JSON.parse(resultados);
    res.json(resultados);
  });
});