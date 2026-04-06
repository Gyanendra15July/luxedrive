@echo off
setlocal
cd /d "%~dp0"

rem Use npm.cmd to avoid PowerShell ExecutionPolicy issues with npm.ps1
call npm.cmd run init-db
