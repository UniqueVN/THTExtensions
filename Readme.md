
THT Extensions
======
THT Extensions is a collections of command and tools that help UI developer save time when working with Flash/Scaleform on project with multiple files

## Install
* Run "THT Extensions.zxp" (double click).
* Close the THTExtPanel if you have it opening in Flash then reopen it: Window > Other Panels > THTExtPanel.

## Profiles
The profile list show the list of current profiles:
* "+" button: add new profile
* "-" button: remove current profile
* "Edit" button: change the current profile

## Settings
Following are different settings that user can change for each profile:
* Game's Flash folder: the root folder that contain all the .fla files of the project you are working on
* Importer's Execute file: the path to the .exe file of the importer that will be used to import the .swf to the game. If your game use UnrealEngine then this is the game's .exe file
* Perforce workspace: name of the workspace in Perforce you want to check out the .fla to
* Perforace User: user's name for the perforce check out
* Profile name: an unique name to save the profile with

## Features:
* Update Symbols: the tool will check the current selected symbol in the Library. If it's imported and have "Source File" different from "URL" then its URL will be fixed to match with the "Source File". This problem normally happened when a symbol imported through multiple .fla files in different folder
* Edit Original Clip: use this command after selecting an imported symbol in the Library will make Flash open the original .fla that the symbol are imported from and allow user to edit it. Useful for symbol that imported through multiple files
* Validate: TODO
* File: If select "This" then other action "Perforce Checkout", "Public" and "Import to Package" will only apply to the current opening .fla. If select "All" it will apply to all the .fla files that opening in the Flash.
* Exclude file: Scan the fla files and create the "_exclude.xml" file which contains all the ActionScript classes that the .fla don't needed. Use "_exclude.xml" will reduce the size of the .swf file a lot (more than 10 times in a project with a lot of classes). NOTES: the tool only scan for the direct classes of the symbols using in .fla so sometime it may excluded the needed classes. In that case, open the "_exclude.xml" file in a text editor, add a section "<!-- MANUAL IMPORTED CLASSES ... Insert_Needed_Classes_Here ... -->" on top of the file and run the Create command again.
* Perforce Checkout: add both .fla and its .swf files to the default changelist in Perforce. NOTES: there is no warning if the username or client's workspace are wrong so user need to check the profile settings if this tool seem to not working. Also user must login to the Perforce workspace with the right password first otherwise the command will fail.
* Publish: clear the old publish caches and publish the .fla to .swf. If All is selected all the files will be published, if any file have error while publishing the process will automatically stop.
* Import to Package: import the .swf files to the game package so it can be used in game. Currently this command only integrated with the UnrealEngine 3 commandlet GFxImport to import .swf files to the .upk package

## License
This library is available to anybody free of charge, under the terms of MIT License:

Copyright (c) 20013-2014 Thang Hong To (UniqueVN@gmail.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.