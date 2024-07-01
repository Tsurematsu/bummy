#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const {execSync} = require('child_process');
async function main() {
  const rutaRelativa = process.cwd();
  const nombreCarpeta = path.basename(rutaRelativa);
  const rutaPlantilla = path.join(__dirname, 'template');
  const [,, nombreProyecto, puerto] = process.argv;
  if (!nombreProyecto) {console.log('No se ha especificado un nombre de proyecto');process.exit(1);}
  try {
    await fs.rm(path.join(rutaPlantilla, 'src'), { recursive: true, force: true });
    await fs.mkdir(path.join(rutaPlantilla, 'src'));
    await fs.symlink(rutaRelativa, path.join(rutaPlantilla, 'src', nombreCarpeta), 'junction');
    // Crear main.jsx
    const cleanName = nombreProyecto.replaceAll("./", "").replaceAll(".jsx", "").replaceAll(".\\", "");
    const cleanCarpet = nombreCarpeta.replaceAll("./", "").replaceAll(".jsx", "").replaceAll(".\\", "");
    const mainJsxContent = `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import ${cleanName} from './${cleanCarpet}/${cleanName}.jsx';
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <${cleanName}/>
        </React.StrictMode>
      )`;
    await fs.writeFile(path.join(rutaPlantilla, 'src', 'main.jsx'), mainJsxContent);
    // Cambiar al directorio de la plantilla
    process.chdir(rutaPlantilla);
    // Abrir navegador
    const startCommand = process.platform === 'win32' ? 'start' : 'open';
    execSync(`${startCommand} http://localhost:${puerto??5173}/`);
    // Instalar dependencias y ejecutar
    execSync('npm install', { stdio: 'inherit' });
    if (!puerto) {
      execSync('npm run dev', { stdio: 'inherit' });
    }else{
      execSync(` npx vite --port ${puerto}`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);