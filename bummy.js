#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const {execSync} = require('child_process');
const AdmZip = require('adm-zip');
// Obtiene la ruta base del perfil de usuario
const userProfile = process.env.USERPROFILE;
let documentosPath = null;
if (userProfile) {
  // Directorio relativo de Documentos
  documentosPath = path.join(userProfile, 'Documents');
} else {
  const homeDir = os.homedir();
  const documentsDir = path.join(homeDir, 'Documents');
  fs.mkdir(nuevaCarpeta, { recursive: true }, (err) => {
      if (err) {
        console.error('Error al crear la carpeta:', err);
      } else {
        console.log(`Carpeta '${nombreCarpeta}' creada correctamente en '${documentsDir}'`);
      }
    });
    documentosPath = documentsDir;
  }
  
let rutaPlantilla = path.join(__dirname, 'template');
const verifyFolder = async () => {
  let existFile = false;
  const folderPath = path.join(documentosPath, 'bummy');
  try {await fs.access(folderPath, fs.constants.F_OK); existFile = true;} catch (err) {existFile = false;}
  if (!existFile) {await fs.mkdir(path.join(documentosPath, 'bummy'), { recursive: true });}
  
  let ExistTemplate = false;
  const folderTemplate = path.join(documentosPath, 'bummy', 'template');
  try {await fs.access(folderTemplate, fs.constants.F_OK); ExistTemplate = true;} catch (err) {ExistTemplate = false;}
  const rutaPlantillaZip = path.join(__dirname, 'template.zip');
  const archiveZip = new AdmZip(rutaPlantillaZip);
  const rutaTemplate = path.join(documentosPath, 'bummy')
  if (!ExistTemplate) {try {await archiveZip.extractAllTo(rutaTemplate, true);} catch (error) {console.log("Error al extraer");}}
  rutaPlantilla = path.join(documentosPath, 'bummy', 'template');
  main().catch(console.error);
};

async function processJson(){
  if (await existeArchivo(path.join(process.cwd(), 'package.json'))){
    const packageLocal = await leerArchivoJSON(path.join(__dirname, 'package.json'));
    const packageRelativo = await leerArchivoJSON(path.join(process.cwd(), 'package.json'));
    packageLocal.dependencies = {...packageLocal.dependencies, ...packageRelativo.dependencies};
    packageLocal.devDependencies = {...packageLocal.devDependencies, ...packageRelativo.devDependencies};
    await guardarArchivoJSON(path.join(__dirname, 'package.json'), packageLocal);
  }
}

verifyFolder();


async function main() {
  const rutaRelativa = process.cwd();
  const nombreCarpeta = path.basename(rutaRelativa);
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
    await processJson();
    process.chdir(rutaPlantilla);
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


async function leerArchivoJSON(nombreArchivo) {
  try {
    const datos = await fs.readFile(nombreArchivo, 'utf8');
    return JSON.parse(datos);
  } catch (error) {
    console.error(`Error al leer el archivo ${nombreArchivo}:`, error);
    throw error;
  }
}

async function guardarArchivoJSON(nombreArchivo, objeto) {
  try {
    const datosAGuardar = JSON.stringify(objeto, null, 2);
    await fs.writeFile(nombreArchivo, datosAGuardar, 'utf8');
    console.log(`Archivo guardado exitosamente en ${nombreArchivo}`);
  } catch (error) {
    console.error(`Error al guardar el archivo ${nombreArchivo}:`, error);
    throw error;
  }
}

async function existeArchivo(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch (error) {
    return false;
  }
}