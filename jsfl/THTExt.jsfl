/**
 * Author: Thang To
 * Date: 9/10/2013
 * Check all the symbols in the library make sure they are updated and doesn't have missing info
 */

// Constant
var PROFILE_KEY = "Profile";
var PANEL_NAME = "THTExtPanel";
var PUBLISH_SUCCESS = "0 Error(s), 0 Warning(s)";

var curDoc, curLibrary, curDocIndex, curTab, curSwfPanel;

var asVer, pkgPaths;

var extPath = fl.configURI + "THTExt/";
var settingFile = extPath + "settings.txt";
var profileDir = extPath + "/profiles/";
var configExt = ".conf";
var excludeExt = "_exclude.xml";

fl.outputPanel.clear();

// ============================= Initializing  =============================
function initDoc()
{
    fl.outputPanel.clear();

    initSwfPanel(PANEL_NAME);

    curDoc = fl.getDocumentDOM();
    if (curDoc)
    {
        curLibrary = curDoc.library;
        curDocIndex = fl.findDocumentIndex(curDoc.name); 
        curTab = fl.documents[curDocIndex];

        asVer = curDoc.asVersion;

        // Get the string inside the tag for package paths in the current document's publish setting
        var tag = asVer == 2 ? "PackagePaths" : "AS3PackagePaths";
        var publishSettingsStr = curDoc.exportPublishProfileString();
        var tagBeginIndex = publishSettingsStr.indexOf("<" + tag + ">") + tag.length + 2;
        var tagEndIndex = publishSettingsStr.indexOf("</" + tag + ">");
        pkgPaths = publishSettingsStr.substring(tagBeginIndex, tagEndIndex).split(";");

        // fl.trace("Current document: " + curDoc.name + " path = " + curDoc.path + " pathURI = " + curDoc.pathURI +  " sourcePath = " + curDoc.sourcePath
        //     + " currentPublishProfile = " + curDoc.currentPublishProfile + " asVersion = " + asVer + " PackagePaths = " + pkgPaths
        //     + " fl.packagePaths = " + fl.packagePaths + " fl.as3PackagePaths = " + fl.as3PackagePaths);
    }
    else
    {
        fl.trace("There're no document opened. Please open a .fla file to use the command with!");
        curLibrary = null;
        curDocIndex = -1;
        curTab = null;

        curSwfPanel.call("cancelCommand");
    }
}

function initSwfPanel(panelName)
{
    // If we already have the right panel then don't need to search
    if (curSwfPanel && curSwfPanel.name == panelName)
    {
        return;
    }

    curSwfPanel = fl.getSwfPanel(panelName);
    // fl.trace("Found the current swfPanel: name = " + curSwfPanel.name + " path = " + curSwfPanel.path);
}

// ============================= Helper  =============================

function callPanelFunction(panelName, funcName, arg)
{
    initSwfPanel(panelName);

    if (curSwfPanel)
    {
        if (arg)
        {
            curSwfPanel.call(funcName, arg);
        }
        else
        {
            curSwfPanel.call(funcName);
        }
    }
}

function getFolderPath(filePath)
{
    return filePath.substr(0, filePath.lastIndexOf("/"));
}

function getDocumentFolder(document)
{
    return getFolderPath(document.pathURI);
}

// Search for a symbol in a library with specified name (can just be a short name, don't need to have full folder path)
function findSymbol(lib, sbName)
{
    var librarySymbols = lib.items;
    sbName = sbName.toLowerCase();

    for (var i = 0; i < librarySymbols.length; i++)
    {
        var symbol = librarySymbols[i];
        // Check the symbol's short name
        var symbolName = getSymbolShortName(symbol).toLowerCase();

        if (symbolName == sbName)
        {
            // fl.trace("Find symbol: sbName = " + sbName + " current symbol = " + symbol.name);
            return symbol;
        }
    }
}

function getSymbolShortName(symbol)
{
    var sbName = symbol.name;
    var index = sbName.lastIndexOf("/");
    var shortName = (index == -1) ? sbName : sbName.substr(index, sbName.length - index);

    return shortName;
}

function getFileName(filePath)
{
    var t = filePath.lastIndexOf("/");
    return filePath.substr(t + 1, filePath.length - t - 1);
}

// Get the relative path of the destion path compare to the source path.
// Both input path must be full URI
function getRelativePath(srcPath, destPath)
{
    // fl.trace("getRelativePath: srcPath = " + srcPath + " destPath = " + destPath);
    // TODO: Need to really find the relative path. For now, we only handle case when destPath is inside srcPath
    if (destPath.lastIndexOf(srcPath) == 0)
    {
        var relPath = destPath.substr(srcPath.length + 1, destPath.length - srcPath.length - 1);
        return relPath;
    }
}

function isInFolder(srcPath, checkPath)
{
    // fl.trace("Check isInFolder: srcPath = " + srcPath + " checkPath  = " + checkPath + " checkPath.lastIndexOf(srcPath) = " + checkPath.lastIndexOf(srcPath)
    //         + " (checkPath.substr(srcPath.length) == srcPath) = " + (checkPath.substr(0, srcPath.length - 1) == srcPath) + " checkPath.substr(0, srcPath.length - 1) = " 
    //         + checkPath.substr(0, srcPath.length - 1));
    return (checkPath.substr(0, srcPath.length - 1) == srcPath);
    // return (checkPath.lastIndexOf(srcPath) == 0);
}

// Get all the file with extension pattern in a specific folder
function getAllFiles(folderPath, fileExtension, bIncludeSubFolder, prevPath)
{
    var fullPath = (prevPath == undefined) ? folderPath : (prevPath + "/" + folderPath);
    var fileList = FLfile.listFolder(fullPath + "/" + fileExtension, "files");
    // fl.trace("getAllFiles: folderPath = " + folderPath + " fileExtension = " + fileExtension + " prevPath = " + prevPath + " fullPath = " + fullPath);

    // By default we want to search all sub-folder too
    if (bIncludeSubFolder == undefined)
        bIncludeSubFolder = true;

    // Search all the folder if the flag is specified
    if (bIncludeSubFolder)
    {
        var folderList = FLfile.listFolder(fullPath, "directories");
        if (!folderList || folderList.length == 0)
        {
            return fileList;
        }

        for (var i = 0; i < folderList.length; i++)
        {
            var searchFolder = folderList[i];
            var subList = getAllFiles(searchFolder, fileExtension, bIncludeSubFolder, fullPath);

            for (var j = 0; j < subList.length; j++)
            {
                var filePath = searchFolder + "/"+ subList[j];
                fileList.push(filePath);
            }
        }
    }

    return fileList;
}

// ============================ INITIALIZE ============================
function configureTool()
{
    initDoc();
}
// ============================= SETTINGS =============================
function getProfileList()
{
    // If there's no profile folder then create a new one
    if (!fl.fileExists(profileDir))
    {
        FLfile.createFolder(profileDir);
        return [];
    }

    // Find all the profiles
    var profileConfigs = getAllFiles(profileDir, "*" + configExt, false);
    var profileCount = profileConfigs.length;

    // We only need the name, not whole file path or extension
    var list = [];
    for (var i = 0; i < profileCount; i++)
    {
        var profileName = profileConfigs[i].split(".")[0];
        list.push(profileName);
    }

    return list;
}

// Get the profile list for the ActionScript
function getProfileListForAS()
{
    var list = getProfileList();

    if (!list)
        return "";

    // fl.trace("getProfileListForAS: " + list.join("\n"));

    return list.join("\n");
}

// Get the path of a profile config file when known its name
function getProfileConfigFilePath(profileName)
{
    return (profileDir + "/" + profileName + configExt);
}

function selectProfile(profileName)
{
    fl.trace("SELECT NEW PROFILE: profileName = " + profileName);
    // TODO: Need a general function to add/change a specific preference in the settings file
    // Right now we only have 1 line for profile, so just overwrite the setting file
    FLfile.write(settingFile, PROFILE_KEY + ":" + profileName);
}

function selectDefaultProfile()
{
    var profileList = getProfileList();
    if (profileList && profileList.length > 0)
    {
        var chooseProfile = profileList[0];
        selectProfile(chooseProfile);
        return chooseProfile;
    }

    return null;
}

function getCurrentProfileName()
{
    var allSettings = FLfile.read(settingFile).split("\n");
    var settingCount = allSettings.length;
    for (var i = 0; i < settingCount; i++)
    {
        var settings = allSettings[i].split(":");
        if (settings[0] == PROFILE_KEY)
        {
            return settings[1];
        }
    };

    // If this is old system or we don't write the settings file yet then just select a default one
    return selectDefaultProfile();
}

function getProfileConfig(profileName)
{
    var profileFilePath = getProfileConfigFilePath(profileName);
    if (!profileName || profileName == "")
        profileFilePath = settingFile;
    // fl.trace("getProfileConfig: " + profileFilePath + " profileName = " + profileName + "\n");

    // Read the data from the setting file
    var settingValues = FLfile.read(profileFilePath).split("\n");
    var l = settingValues.length;
    // Fill in empty string if the config file doesn't have the data
    for (var i = l;  i < 4; i++)
    {
        settingValues.push("");
    }
    // fl.trace("Get config: settings = " + paths.join("\n"));
    var config = {
      flashPath: settingValues[0],
      gamePath: settingValues[1],
      p4Client: settingValues[2],
      p4User: settingValues[3]
    };

    return config;
}

function getCurrentProfileConfig()
{
    var curProfileName = getCurrentProfileName();
    fl.trace("Current profile using: " + curProfileName);
    return getProfileConfig(curProfileName);
}

function addNewProfile()
{
    initDoc();

    var curProfileName = getCurrentProfileName();
    var curProfileSetting = getCurrentProfileConfig();

    // Set data for the setting dialog
    var settingXml = extPath + "xmlPanel/settings.xml";
    var tmpXMP = settingXml + ".tmp";
    var dlgStr = FLfile.read(settingXml);
    // fl.trace("Read dlgStr: " + dlgStr);
    dlgStr = dlgStr.replace("%FlashPath%", curProfileSetting.flashPath);
    dlgStr = dlgStr.replace("%GamePath%", curProfileSetting.gamePath);
    dlgStr = dlgStr.replace("%P4Client%", curProfileSetting.p4Client);
    dlgStr = dlgStr.replace("%P4User%", curProfileSetting.p4User);
    dlgStr = dlgStr.replace("%ProfileName%", curProfileName ? (curProfileName + "_NEW") : "NEW");
    // fl.trace("Prepare the setting panel: " + dlgStr);
    FLfile.write(tmpXMP, dlgStr);

    fl.trace("Show the setting panel: " + tmpXMP);

    // Don't need to do anything if player didn't confirm the settings
    var settingPanel = curDoc.xmlPanel(tmpXMP);
    if (settingPanel.dismiss != "accept")
    {
        return;
    }

    var flashPath = settingPanel.txtFlashPath;
    var gamePath = settingPanel.txtGamePath;
    var p4Client = settingPanel.txtP4Client;
    var p4User = settingPanel.txtP4User;
    var profileName = settingPanel.txtProfileName;
    var newProfilePath = getProfileConfigFilePath(profileName);

    // Check if the path is valid
    var error = "";
    if (!fl.fileExists(FLfile.platformPathToURI(flashPath)))
        error += "Flash path NOT found: " + flashPath + "\n";
    if (!fl.fileExists(FLfile.platformPathToURI(gamePath)))
        error += "Game path NOT found: " + gamePath + "\n";
    if (fl.fileExists(newProfilePath))
        error += "Profile name existed: " + profileName + ". Need non-conflict name!\n";;
    if (profileName == "")
        error += "Profile name can not be EMPTY!\n";;
    if (error != "")
    {
        alert(error);
        return;
    }

    // fl.trace("Add a new Profile:");
    // fl.trace("Flash Path: " + flashPath);
    // fl.trace("Game Path: " + gamePath);
    // fl.trace("Profile name: " + profileName);

    // Create new profile preference file:
    FLfile.write(newProfilePath, 
        flashPath + "\n" + 
        gamePath + "\n" +
        p4Client + "\n" +
        p4User);

    // Select the new profile to use
    selectProfile(profileName);

    curSwfPanel.call("refreshProfiles");
}

function removeCurrentProfile()
{
    initDoc();

    var currentProfile = getCurrentProfileName();
    if (currentProfile == "" || !currentProfile)
    {
        alert("ERROR: Must select a valid profile before deleting");
        return;
    }

    // Remove the config file of the current profile
    FLfile.remove(getProfileConfigFilePath(currentProfile));

    selectDefaultProfile();
    curSwfPanel.call("refreshProfiles");
}

function editCurrentProfile()
{
    initDoc();

    var curProfileName = getCurrentProfileName();
    var curProfileSetting = getCurrentProfileConfig();

    // TODO: Make this part into a function to share when we want to add new or edit profiles
    // Set data for the setting dialog
    var settingXml = extPath + "xmlPanel/settings.xml";
    var tmpXMP = settingXml + ".tmp";
    var dlgStr = FLfile.read(settingXml);
    dlgStr = dlgStr.replace("%FlashPath%", curProfileSetting.flashPath);
    dlgStr = dlgStr.replace("%GamePath%", curProfileSetting.gamePath);
    dlgStr = dlgStr.replace("%P4Client%", curProfileSetting.p4Client);
    dlgStr = dlgStr.replace("%P4User%", curProfileSetting.p4User);
    dlgStr = dlgStr.replace("%ProfileName%", curProfileName);
    FLfile.write(tmpXMP, dlgStr);

    var settingPanel = curDoc.xmlPanel(tmpXMP);
    if (settingPanel.dismiss != "accept")
    {
        return;
    }

    var flashPath = settingPanel.txtFlashPath;
    var gamePath = settingPanel.txtGamePath;
    var p4Client = settingPanel.txtP4Client;
    var p4User = settingPanel.txtP4User;
    var profileName = settingPanel.txtProfileName;
    var newProfilePath = getProfileConfigFilePath(profileName);

    // Check if the path is valid
    var error = "";
    if (!fl.fileExists(FLfile.platformPathToURI(flashPath)))
        error += "Flash path NOT found: " + flashPath + "\n";
    if (!fl.fileExists(FLfile.platformPathToURI(gamePath)))
        error += "Game path NOT found: " + gamePath + "\n";
    if (profileName != curProfileName && fl.fileExists(newProfilePath))
        error += "Profile name changed to an exising profile: " + profileName + " old profile name: " + curProfileName + ". Need non-conflict name!\n";
    if (error != "")
    {
        alert(error);
        return;
    }

    // fl.trace("Edit Profile:");
    // fl.trace("Flash Path: " + flashPath);
    // fl.trace("Game Path: " + gamePath);
    // fl.trace("Profile name: " + profileName);

    // If the profile name change then remove the old profile config file first
    if (profileName != curProfileName)
    {
        FLfile.remove(getProfileConfigFilePath(curProfileName));
        // Select the new profile to use
        selectProfile(profileName);
    }

    // Create new profile preference file:
    FLfile.write(newProfilePath, 
        flashPath + "\n" + 
        gamePath + "\n" +
        p4Client + "\n" +
        p4User);

    curSwfPanel.call("refreshProfiles");
}

function getImportSwfPath(flashPath, docPath)
{
    // fl.trace("getImportSwfPath: flashPath = " + flashPath + " docPath = " + docPath + " getRelativePath(flashPath, docPath) = " + getRelativePath(flashPath, docPath));
    var relativePath = getRelativePath(flashPath, docPath);
    var swfPath = relativePath != undefined ? relativePath.replace(".fla", ".swf") : undefined;
    return swfPath;
}

// ============================= SYMBOLS =============================
function isValidFilePath(filePath)
{
    if (!filePath || !fl.fileExists(filePath))
        return false;

    return true;
}

// Try to guess a valid source path for imported symbol from its linkage swf
function suggestValidSourcePath(symbol)
{
    var swfURL = symbol.linkageURL;
    var flaURL = swfURL.substr(0, swfURL.length - 4) + ".fla";

    // TODO: Check if flaURL is exist, if it is, try to search for the symbols name in its library
    // If flaURL not exist, try to find a valid swfURL first
}

function hasValidSourcePath(symbol)
{
    // Non imported symbol always have valid source path
    if (!symbol.linkageImportForRS)
        return true;

    // Check if the source file existed or not
    // var folderPath = getDocumentFolder(curDoc);
    // var flaPath = folderPath + "/" + curFlaPath.split("\\").join("/");
    // // If there's no source file or the specified source file not exist then it mean symbol have invalided source file
    // if (!curFlaPath || !fl.fileExists(flaPath))
    //     return false;

    // // Check whether the swf path is same as fla path
    // var swfURL = symbol.linkageURL;
    // var matchFlaURL = swfURL.substr(0, swfURL.length - 4) + ".fla";
    // if (matchFlaURL != curFlaPath)
    //     return false;

    // // TODO: Check if the swf file is in same folder or not?
    // return true;
}

function hasValidSwfPath(symbol)
{
    // Non imported symbol always have valid linked swf path
    if (!symbol.linkageImportForRS)
        return true;

    var swfURL = symbol.linkageURL;
    var folderPath = getDocumentFolder(curDoc);
    var swfPath = folderPath + "/" + swfURL.split("\\").join("/");
    if (!swfURL || fl.fileExists(swfPath))
        return false;

    return true;
}

// Select the origional symbol where this symbol get imported from
function findSourceOfSymbol(symbol)
{
    // Don't care about non-imported symbol
    if (!symbol.linkageImportForRS)
    {
        fl.trace("Symbol: " + symbol.name + " not imported => itself is its source");
        return null;
    }

    var folderPath = getDocumentFolder(curDoc);

    var flaPath = symbol.sourceFilePath;
    // Give warning if the symbol doesn't have a source file
    if (!hasValidSourcePath(symbol))
    {
        var swfURL = symbol.linkageURL;
        flaPath = swfURL.substr(0, swfURL.length - 4) + ".fla";
        flaPath = swfURL.replace(".swf", ".fla");

        // fl.trace("checkImportedSymbol - symbol: " + symbol.name + " have INVALIDATED sourceFilePath. It's imported from swf path: " + swfURL +
        //         " => should fix its source file to: " + flaPath);
        // return;
    }
    flaPath = folderPath + "/" + flaPath.split("\\").join("/");

    if (!fl.fileExists(flaPath))
    {
        fl.trace("Error: can't find the source file path: " + flaPath + " of the imported symbol: " + symbol.name);
        return null;
    }

    // Search the item in the fla file
    fl.openDocument(flaPath);
    var sourceDoc = fl.getDocumentDOM();
    var sourceLib = sourceDoc.library;
    var sourceSymbol = findSymbol(sourceLib, getSymbolShortName(symbol));

    // fl.trace("findSourceOfSymbol - symbol: " + symbol.name + " sourceSymbol = " + sourceSymbol);

    // If this symbol also imported from other file, not originally create here then try to find its origin
    if (sourceSymbol != null && sourceSymbol != undefined && sourceSymbol.linkageImportForRS)
    {
        return findSourceOfSymbol(sourceSymbol);
    }

    // fl.setActiveWindow(curDoc);

    return { srcDocument: sourceDoc, srcSymbol: sourceSymbol};
}

function findSourceOfSelectedSymbol()
{
    initDoc();

    fl.outputPanel.clear();
    if (!curLibrary)
    {
        fl.trace("Open a document first.");
        return;
    }

    var selectedSymbols = curLibrary.getSelectedItems();
    if (selectedSymbols.length == 0)
    {
        fl.trace("Select the symbol you want to find source");
        return;
    }

    var source = findSourceOfSymbol(selectedSymbols[0]);
    if (!source)
        return;

    // Select the original symbol in its library and go to its edit mode
    var sourceLib = source.srcDocument.library;
    sourceLib.selectItem(source.srcSymbol.name);
    sourceLib.editItem();
    // fl.trace("Select and edit item: sourceName = " + sourceName.name);
}

// ============================= INCLUDE/EXCLUDE CLASSES =============================

/*
"_exclude.xml" file format:
    _ List of classes that developer want to be included. In case the classes not detected by the tool, manually include it here
    _ List of classes that symbols in the Flash file used. This list is auto-detected by the tool
    _ 'excludeAssets' section with 'asset' tags for classes that would be excluded from the file - they will get compile out
*/

var MANUAL_IMPORTED_CLASSES_TAG = "MANUAL IMPORTED CLASSES";
var AUTO_IMPORTED_CLASSES_TAG = "AUTO IMPORTED CLASSES";

// Import the list of manually included classes from an _exclude.xml file
function importExcludeFile(filePath)
{
    var excludeContent = FLfile.read(filePath);

    //<!-- MANUAL IMPORTED CLASSES(.*\n)+(?=-->)
    // FIXME: this regular expression capture longer string then we needed
    var manualImportSearch = new RegExp("<!-- " + MANUAL_IMPORTED_CLASSES_TAG + "(.*\n)+(?=-->)", "gm");
    var manualImportStr = manualImportSearch.exec(excludeContent);
    // fl.trace("importExcludeFile: excludeContent = " + excludeContent);

    fl.trace("importExcludeFile: filePath = " + filePath + " manualImportStr = " + manualImportStr + "\nmanualImportSearch = " + manualImportSearch);
    // alert("importExcludeFile: filePath = " + filePath + " manualImportStr = " + manualImportStr + " manualImportSearch = " + manualImportSearch);

    var manualImportedClasses = [];
    if (manualImportStr && manualImportStr[0])
    {
        manualImportedClasses = manualImportStr[0].split("\n");
    }

    // Remove the opening tag: <!-- MANUAL IMPORTED CLASSES
    manualImportedClasses.splice(0, 1);

    for (var i = 0; i < manualImportedClasses.length; i++)
    {
        if (manualImportedClasses[i] == "-->")
        {
            manualImportedClasses.splice(i, manualImportedClasses.length - i);
            break;
        }
    }

    return { manualImportedClasses: manualImportedClasses };
}

function exportExcludeFile(filePath, classesData)
{
    fl.trace("exportExcludeFile: " + filePath);
    // Write the classes list to the file
    var content = "";

    // Export the list of auto detected classes that need to be included
    content += "<!-- " + MANUAL_IMPORTED_CLASSES_TAG + "\n";
    var manualImportedClasses = classesData.manualImportedClasses;
    for (var i = 0; i < manualImportedClasses.length; i++)
    {
        content += manualImportedClasses[i] + "\n";
    }
    content += "-->\n";

    // Export the list of auto detected classes that need to be included
    content += "<!-- " + AUTO_IMPORTED_CLASSES_TAG + "\n";
    var autoDetectedClasses = classesData.autoDetectedClasses;
    for (var i = 0; i < autoDetectedClasses.length; i++)
    {
        content += autoDetectedClasses[i] + "\n";
    }
    content += "-->\n";

    // Export the list of classes that shouldn't be compiled to .swf
    var excludedClasses = classesData.excludedClasses;
    var assetTag = "asset";
    content += "<excludeAssets>\n";
    for (var i = 0; i < excludedClasses.length; i++)
    {
        content += '\t<asset name="' + excludedClasses[i] + '"><asset>\n';
    }

    content += "</excludeAssets>";
    FLfile.write(filePath, content);
}

function updateExcludeClassesFromIncludeList(excludeClasses, includeClasses)
{
    for (var i = 0; i < includeClasses.length; i++)
    {
        var symbolClass = includeClasses[i];
        // Remove it from the excludedClasses list
        var index = excludeClasses.indexOf(symbolClass);
        if (index >= 0)
        {
            excludeClasses.splice(index, 1);
            // fl.trace("We want to include class: " + symbolClass + " so remove it from the excluded classes list at " + index + ". \n");
        }
    }

    return excludeClasses;
}

function createClassesList(classes, folderPath)
{
    fl.trace("createClassesList for folderPath = " + folderPath);
    var scriptFiles = getAllFiles(folderPath, "*.as", true);
    // Remove the extension ".as" so we can get the class path
    for (var i = 0; i < scriptFiles.length; i++)
    {
        var className = scriptFiles[i].substr(0, scriptFiles[i].length - 3).split("/").join(".");
        classes.push(className);
    }

    return classes;
}

function createExcludeClassesFile(flaDoc, bForPublish)
{
    var excludeFileName = flaDoc.name + excludeExt;
    var flaFolderPath = getDocumentFolder(flaDoc);
    var excludeFileURI = flaFolderPath + "/" + excludeFileName;
    //  Check whether the exclude file is existed or not and ask user whether they want to overwrite it or not
    var bExisted = fl.fileExists(excludeFileURI);
    fl.trace("Create exclude file: excludeFileName = " + excludeFileName + " excludeFileURI = " + excludeFileURI + " bExisted = " + bExisted + "\n");

    var autoDetectedClasses = [];
    var manualImportedClasses = [];
    // Don't need to ask if we want to create the exclude file for the publish process
    if (bExisted)
    {
        if ( !bForPublish)
        {
            var result = confirm("The exclude file for current Flash file: " + flaDoc.name + " already existed at: " + FLfile.uriToPlatformPath(excludeFileURI) + 
                    "! Do you want to update it?");
            if (!result)
            {
                fl.trace("Don't update existing exclude file => stop command.");
                return;
            }
        }

        var exludeData = importExcludeFile(excludeFileURI);
        if (exludeData)
        {
            manualImportedClasses = exludeData.manualImportedClasses;
        }
    }

    var excludedClasses = [];

    // Create the classes list from all the source paths
    fl.trace("Source path: " + pkgPaths.join("\n"));
    var scriptFolderPath, srcPath;
    for (var i = pkgPaths.length - 1; i >= 0; i--)
    {
        srcPath = pkgPaths[i];

        if (srcPath == "" || srcPath == undefined)
            continue;

        scriptFolderPath = FLfile.uriToPlatformPath(flaFolderPath) + "\\" + srcPath;
        fl.trace("Generate classess list for source path: "+ srcPath + " final path: " + scriptFolderPath);
        createClassesList(excludedClasses, FLfile.platformPathToURI(scriptFolderPath));
    }

    autoDetectedClasses = [];
    // Search the library to find the AS classes that created in the file
    var librarySymbols = flaDoc.library.items;
    for (var i = 0; i < librarySymbols.length; i++)
    {
        var symbol = librarySymbols[i];
        var symbolType = symbol.itemType.toLowerCase();
        if (symbolType != "movie clip" && symbolType != "component" && symbolType != "compiled clip")
        {
            continue;
        }

        var symbolClass = getSymbolClass(symbol);
        // fl.trace("Checking symbol: " + symbol.name + " symbolClass = " + symbolClass + " symbol.itemType = " + symbol.itemType);
        if (!symbolClass)
        {
            continue;
        }

        var index = autoDetectedClasses.indexOf(symbolClass);
        if (index < 0)
        {
            autoDetectedClasses.push(symbolClass);
        }
    }

    fl.setActiveWindow(curDoc);

    // Remove the classes we do want imported from the excluded classes list
    updateExcludeClassesFromIncludeList(excludedClasses, autoDetectedClasses);
    updateExcludeClassesFromIncludeList(excludedClasses, manualImportedClasses);

    fl.trace("Done processing the classes list => generate the xml file from the list now");

    exportExcludeFile(excludeFileURI, {
        manualImportedClasses: manualImportedClasses,
        autoDetectedClasses: autoDetectedClasses,
        excludedClasses: excludedClasses
    });
}

// Create/Update the exclude.xml file for the current fla
function createExcludeFileForCurrentDocument()
{
    fl.outputPanel.clear();
    initDoc();

    createExcludeClassesFile(curDoc);
}


// Remove the exclude.xml file for the current fla
function removeExcludeFileForCurrentDocument()
{
    fl.outputPanel.clear();
    initDoc();

    removeExcludeClassesFile(curDoc);
}

function removeExcludeClassesFile(flaDoc)
{
    var excludeFileName = flaDoc.name + excludeExt;
    var flaFolderPath = getDocumentFolder(flaDoc);
    var excludeFileURI = flaFolderPath + "/" + excludeFileName;
    //  Check whether the exclude file is existed or not and ask user whether they want to overwrite it or not
    var bExisted = fl.fileExists(excludeFileURI);
    fl.trace("removeExcludeClassesFile: excludeFileURI = " + excludeFileURI + " bExisted = " + bExisted);
    // Remove the exclude file if it already existed
    if (bExisted)
    {
        var bRemoved = FLfile.remove(excludeFileURI);
        fl.trace("removeExcludeClassesFile: bRemoved = " + bRemoved);
    }
}

// ============================= PUBLISH =============================

function getSymbolClass(symbol)
{
    if (symbol.linkageImportForRS)
    {
        var source = findSourceOfSymbol(symbol);
        if (source && source.srcSymbol)
        {
            return source.srcSymbol.linkageClassName;
        }
        else
        {
            fl.trace("Can't find the original symbol of: " + symbol.name + " => Can't get its class");
            return "";
        }
    }
    
    return symbol.linkageClassName;
}

function publishFile(flaDoc)
{
    // fl.outputPanel.clear();

    // Clear the cache before republishing
    fl.clearPublishCache();

    fl.trace("PublishFile: " + flaDoc.name);

    var compileLogFile = extPath + "compile.log";

    var pathURI = flaDoc.pathURI;
    var publishLog = "\n";
    publishLog += "Publish: " + pathURI;
    fl.publishDocument(pathURI);
    // removeExcludeClassesFile(flaDoc);

    fl.trace("Publish done\n");
    
    var bSuccess = true;
    // Read the compiler errors, if there's errors then print it out
    fl.compilerErrors.save(compileLogFile);
    var compileLog = FLfile.read(compileLogFile);
    if (compileLog && compileLog != PUBLISH_SUCCESS)
    {
        publishLog += "\n ERROR:";
        publishLog += "\n" + compileLog;

        // It's not successfully publishing if there's log in compile errors
        bSuccess = false;
    }
    else
    {
        publishLog += "\nPublishing Successed!!!";
    }

    publishLog += "\n========================================\n";

    return { bPublished:bSuccess, log: publishLog };
}

// Publish Flash files that are opening
function publishFiles(bAll, bForImport)
{
    initDoc();

    fl.trace("Publish Files: bAll = " + bAll + " bForImport = " + bForImport);

    var settings = getCurrentProfileConfig();
    var flashPath = FLfile.platformPathToURI(settings.flashPath);

    var publishLog = "";

    var params = [];
    var paramStr;
    var bPublished = true;
    // Build the params from all the opening documents
    if (bAll == "true" || bAll == true)
    {
        var documents = fl.documents;
        for (var i = 0; i < documents.length; i++)
        {
            var doc = documents[i];
            // If this is for importing then we don't need to publish files that not in the game flash folder
            // if (!bForImport || isInFolder(flashPath, doc.pathURI))
            if (true)
            {
                if (bForImport)
                {
                    var relPath = getImportSwfPath(flashPath, doc.pathURI);
                    params.push(relPath);
                }

                // Publish this file before importing it
                var publishResult = publishFile(doc);
                publishLog += publishResult.log;

                fl.trace("Publish Files: bAll = " + bAll + " bForImport = " + bForImport);
                // Stop publishing if there're errors
                if (!publishResult.bPublished)
                {
                    fl.trace(publishLog);
                    fl.trace("ERROR: Fail to publish file: " + doc.pathURI + "\n");
                    fl.trace("STOP PUBLISHING!!!");

                    bPublished = false;
                    break;
                }
            }
            else
            {
                fl.trace("Document: " + doc.pathURI + " is not in the Game's Flash folder - " + flashPath + " => NO NEED TO IMPORT IT");
            }
        }
        paramStr = params.join(" ");
    }
    else
    {
        if (!curDoc)
        {
            alert("No file opened. You must open the file you want to import first!!!");
            return;
        }

        // Publish this file before importing it
        var publishResult = publishFile(curDoc);
        publishLog += publishResult.log;
        bPublished = publishResult.bPublished;
        if (bForImport)
        {
            paramStr = getImportSwfPath(flashPath, curDoc.pathURI);
        }

        fl.trace(publishLog);
    }
    // fl.trace(publishLog);

    return { paramStr: paramStr, bPublished: bPublished};
}

// ============================= IMPORT =============================
function gfxImport(bAll)
{
    fl.outputPanel.clear();
    initDoc();

    var settings = getCurrentProfileConfig();

    var flashPath = FLfile.platformPathToURI(settings.flashPath);
    var gamePath = settings.gamePath;

    // Clear the cache before republishing
    fl.clearPublishCache();

    var publishResult = publishFiles(bAll, true);
    if (!publishResult.bPublished)
    {
        fl.trace("Publishing failed! Please fix the errors before trying to import files again!");
        return;
    }

    var paramStr = publishResult.paramStr;

    // Get the game path from the gfx player?
    var command = "GFxImport";

    fl.trace("gfxImport: bAll:\t" + bAll + "\nflashPath:\t" + flashPath + "\ngamePath:\t" + gamePath);

    var commandStr = "start /HIGH /B cmd /c \"" + gamePath + " " + command + " " + paramStr + " && pause\"";
    fl.trace("Import with command: " + commandStr);

    FLfile.runCommandLine(commandStr);

    // TODO: Show the import log in the output panel
    // var log = FLfile.read( "file:///C|/GfxImport.log"); 
    // fl.trace(log);

    fl.trace("Importing ...");
}

// ============================= VALIDATION =============================
function validateFontSymbol(fontSymbol)
{
    // TODO: Need to check the font somehow?
    // Can push the font into a list and keep track if any symbols/items use other fonts>
    // Can check: fl.isFontInstalled()
}

function validateMovieClipSymbol(symbol)
{
    // Don't care about not imported movie clip
    var bIsImported = symbol.linkageImportForRS;
    if (!bIsImported)
    {
        return;
    }

    var path = symbol.linkageURL;
    var uriPath = FLfile.platformPathToURI(path);
    fl.trace("symbol.linkageURL = " + path + " URI: " + uriPath + " existed: " + fl.fileExists(uriPath) + " filePath: " + curDoc.pathURI);

    // Give warning if the symbol doesn't have a source file
    if (!symbol.sourceFilePath)
    {
        var swfURL = symbol.linkageURL;
        var flaURL = swfURL.substr(0, swfURL.length - 4) + ".fla";

        // fl.trace("checkImportedSymbol - symbol: " + symbol.name + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
        //         " => should fix its source file to: " + flaURL);

        var fullPath = folderPath + "/" + flaURL;
        var bExisted = fl.fileExists(fullPath);
        if (!bExisted)
        {
            // fl.trace("**WARNING** checkImportedSymbol - symbol: " + symbol.name  + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
            //         " => should fix its source file path to: " + fullPath + " - but that file is NOT EXISTED => need to manually fix it");
            // fl.trace("Full path: " + fullPath + " folderPath = " + folderPath);
            return;
        }
        return;

        // Search the item in the fla file
        fl.openDocument(fullPath);
        var newDoc = fl.getDocumentDOM();
        var checkLib = newDoc.library;
        var sourceName = findSymbol(checkLib, getSymbolShortName(symbol));

        symbol.sourceFilePath = fullPath;
        // Only get the short name of the symbol
        symbol.sourceLibraryName = sourceName;

        fl.setActiveWindow(curDoc);

        // Push the doc into the queue to close later
        queuedDocs.push(newDoc);

        // fl.trace("checkImportedSymbol - symbol: " + symbol.name  + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
        //         " => FIXED its source file path to: " + fullPath + " - fix the sourceLibraryName to: " + sourceName);
    }
}

function validateSymbol(symbol)
{
    if (symbol.itemType == "font")
    {
        validateFontSymbol(symbol);
    }
    else if (symbol.itemType == "bitmap")
    {
        // TODO
    }
    else if (symbol.itemType == "graphic")
    {
        // TODO
    }
    else if (symbol.itemType == "sound")
    {
        // TODO
    }
    else
    {
        validateMovieClipSymbol(symbol);
    }
}

function validateSelectedSymbol()
{
    initDoc();
    var symbol = curLibrary.getSelectedItems()[0];
    if (symbol)
    {
        fl.trace("============= Start validating symbol: " + symbol.name);
        validateSymbol(symbol);
        fl.trace("============= End validating");
    }
    else
    {
        fl.trace("Select the symbol you want to validate first");
    }
}

function validateSymbols()
{
    initDoc();
    fl.trace("============= Start validating all symbols in the library =============");

    var librarySymbols = curLibrary.items;
    for (var i = 0; i < librarySymbols.length; i++)
    {
        var symbol = librarySymbols[i];
        // fl.trace("Checking symbol[" + i + " / " + librarySymbols.length + "] : " + symbol.name + " - type: " + symbol.itemType);
        validateSymbol(symbol);
    }

    closeQueuedDocuments();
    fl.trace("============= END VALIDING =============");
}

// ============================= PERFORCE =============================

function checkOut(filePath)
{
    if (!filePath || filePath == "")
        return;

    var settings = getCurrentProfileConfig();

    var userName = settings.p4User;
    var client = settings.p4Client;

    var p4command = "p4 ";
    p4command += "-u " + userName + " ";
    // p4command += "-P " + password + " ";
    p4command += "-c " + client + " ";
    // p4command += " edit " + files.join(" ");
    p4command += " edit " + filePath;
    // p4command += " > tmp.log";

    fl.trace("Perforce checkout's command: " + p4command);
    FLfile.runCommandLine(p4command);
}

function checkOutFiles(bAll)
{
    initDoc();

    fl.trace("Check out files: bAll = " + bAll);

    // Build the params from all the opening documents
    if (bAll == "true" || bAll == true)
    {
        var documents = fl.documents;
        for (var i = 0; i < documents.length; i++)
        {
            checkOut(documents[i].path.replace(".fla", ".*"));
        }
    }
    else
    {
        if (!curDoc)
        {
            alert("No file opened. You must open the file you want to checkout first!!!");
            return;
        }

        // Check out both the .fla and the .swf files
        checkOut(curDoc.path.replace(".fla", ".*"));
    }
}