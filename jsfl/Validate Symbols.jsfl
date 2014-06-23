/**
 * Author: Thang To
 * Date: 9/6/2013
 * Check all the symbols in the library make sure they are updated and doesn't have missing info
 */

fl.outputPanel.clear();
var currentDoc = fl.getDocumentDOM();
var curLibrary = currentDoc.library;

var curDocIndex = fl.findDocumentIndex(currentDoc.name); 
var curTab= fl.documents[curDocIndex];

var docPath = currentDoc.pathURI;
var t = docPath.lastIndexOf("/");
var folderPath = docPath.substr(0, t);

var queuedDocs = [];

validateSymbols();

function validateSymbols()
{
	fl.trace("Start validating all symbols in the library: ");

	var librarySymbols = curLibrary.items;
	for (var i = 0; i < librarySymbols.length; i++)
	{
		var symbol = librarySymbols[i];
		// fl.trace("Checking symbol[" + i + " / " + librarySymbols.length + "] : " + symbol.name + " - type: " + symbol.itemType);
		if (symbol.itemType == "font")
		{
			// TODO: Need to check the font somehow?
			// Can push the font into a list and keep track if any symbols/items use other fonts>
			// Can check: fl.isFontInstalled()
			continue;
		}

		// Check imported symbols
		var bIsImported = symbol.linkageImportForRS;
		if (bIsImported)
		{
			checkImportedSymbol(symbol);
		}
	}

	closeQueuedDocuments();
	fl.trace("END VALIDING");
}

function closeQueuedDocuments()
{
	for (var i = 0; i < queuedDocs.length; i++)
	{
		fl.closeDocument(queuedDocs[i]);
	}
}

// Search for a symbol in a library, return its full name
function findSymbol(lib, sbName)
{
	var librarySymbols = lib.items;
	sbName = sbName.toLowerCase();

	for (var i = 0; i < librarySymbols.length; i++)
	{
		var symbol = librarySymbols[i];
		// fl.trace("Checking symbol: " + symbol + " name: " + symbol.name + " linkageClassName: " + symbol.linkageClassName +
		// 	" sourceFilePath = " + symbol.sourceFilePath + " sourceLibraryName = " + symbol.sourceLibraryName);

		var symbolName = String(symbol.name).toLowerCase();

		// Check if the full name end with the short name
		var t = symbolName.lastIndexOf(sbName);
		if (t != -1 && t + sbName.length == symbolName.length)
		{
			// fl.trace("Find symbol: sbName = " + sbName + " current symbol = " + symbol.name);
			return symbol.name;
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

function checkImportedSymbol(symbol)
{
	// Give warning if the symbol doesn't have a source file
	if (!symbol.sourceFilePath)
	{
		var swfURL = symbol.linkageURL;
		var flaURL = swfURL.substr(0, swfURL.length - 4) + ".fla";

		fl.trace("checkImportedSymbol - symbol: " + symbol.name + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
				" => should fix its source file to: " + flaURL);

		var fullPath = folderPath + "/" + flaURL;
		var bExisted = fl.fileExists(fullPath);
		if (!bExisted)
		{
			fl.trace("**WARNING** checkImportedSymbol - symbol: " + symbol.name  + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
					" => should fix its source file path to: " + fullPath + " - but that file is NOT EXISTED => need to manually fix it");
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

		fl.setActiveWindow(currentDoc);

		// Push the doc into the queue to close later
		queuedDocs.push(newDoc);

		fl.trace("checkImportedSymbol - symbol: " + symbol.name  + " have NO sourceFilePath. It's imported from swf path: " + swfURL +
				" => FIXED its source file path to: " + fullPath + " - fix the sourceLibraryName to: " + sourceName);
	}
}