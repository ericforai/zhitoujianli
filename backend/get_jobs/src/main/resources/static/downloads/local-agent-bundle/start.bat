@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 start_one_click.py %*
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python start_one_click.py %*
  goto :eof
)

echo Python not found. Please install Python 3.8+ first.
exit /b 1
