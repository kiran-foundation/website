@echo off
setlocal enabledelayedexpansion

:: Set prefix and extension
set prefix=photo
set ext=jpeg

:: Initialize counter
set num=1

:: Loop through all .jpg files in the folder
for %%f in (*.%ext%) do (
    ren "%%f" "!prefix!!num!.%ext%"
    set /a num=!num!+1
)

endlocal
