@echo off
set dest=%USERPROFILE%\AppData\Local\Microsoft\Windows Sidebar\Gadgets\TodoList.gadget\

if not exist %dest% md %dest%
xcopy /r /y /s * "%dest%"