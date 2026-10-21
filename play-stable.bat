@echo off
REM ---------------------------------------------------------------------------
REM  Play the last verified version, even while this folder is being changed.
REM
REM  Creates a separate git worktree (a second, independent checkout) of the tag
REM  "stable-ch1" in the _stable-play folder, then opens the game from there.
REM  That copy is untouched by edits, experiments, or breakage in the folder you
REM  are developing in, so you can always go back and play.
REM
REM  First run creates the folder. Later runs just open it. To pick up a newer
REM  stable tag later, delete _stable-play and run this again.
REM
REM  Note: this avoids "if (...)" blocks on purpose. The project path contains
REM  parentheses, and cmd mangles them inside parenthesised blocks.
REM ---------------------------------------------------------------------------
setlocal enabledelayedexpansion
set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"
set "STABLE=%REPO%\_stable-play"

if exist "%STABLE%\index.html" goto :open

echo Creating stable play copy at:
echo   %STABLE%
git -C "%REPO%" worktree add --detach "%STABLE%" stable-ch1
if errorlevel 1 goto :failed

:open
echo.
echo Opening the stable version ^(stable-ch1^) from:
echo   %STABLE%
echo.
start "" "%STABLE%\index.html"
exit /b 0

:failed
echo.
echo Could not create the stable play copy.
echo Run "git tag" and check that stable-ch1 is listed, then try again.
echo.
pause
exit /b 1
