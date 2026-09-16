@echo off
cd /d "%~dp0"
for /r %%i in (*.xlsx *.xls) do (
    if not "%%~dpX"=="%~dp0" copy "%%i" "%~dp0"
)
echo Done!
timeout /t 3