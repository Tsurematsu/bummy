@echo off
:main
cls
set rutaRelativa=%cd%
for %%I in ("%CD%") do set "nombreCarpeta=%%~nxI"
set rutaPlantilla=%~dp0/template
if "%1"=="" goto noName
goto next1
:noName
echo No se ha especificado un nombre de proyecto & pause & exit
:next1
set "input=%1"
set "step1=%input:./=%"
set "step1=%input:.\=%"
set "nombreProyecto=%step1:.jsx=%"
set "personalPakage=%rutaRelativa%/package.json"
del /f /q "%rutaPlantilla%\src\*.jsx" 2>nul
for /d %%D in ("%rutaPlantilla%\src\*") do rmdir "%%D" 2>nul
mklink /j "%rutaPlantilla%\src\%nombreCarpeta%" "%rutaRelativa%"
echo import React from 'react'; import ReactDOM from 'react-dom/client'; import %nombreProyecto% from './%nombreCarpeta%/%nombreProyecto%.jsx'; ReactDOM.createRoot(document.getElementById('root')).render^( ^<React.StrictMode^>^ ^<%nombreProyecto%/^>^ ^</React.StrictMode^>^) >"%rutaPlantilla%/src/main.jsx"
cd %rutaPlantilla%
cls
if "%2"=="" goto defaulPort
start http://localhost:%2/
npm install && ping localhost -n 2 >nul & npx vite --port %2
:defaulPort
start http://localhost:5173/
npm install & ping localhost -n 2 >nul & npm run dev
exit