@echo off
setlocal

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%SCRIPT_DIR%start_one_click.py" %*
) else (
  python "%SCRIPT_DIR%start_one_click.py" %*
)

endlocal
