/**
 * Author: Thang To
 * Date: 8/26/2013
 * Find symbols in the library with specific info
 */

fl.outputPanel.clear();

var curDoc, library;
// updateSelectedSymbols();
// var symbolName = prompt("Enter the symbol name  that you want to update (leave it empty to update all symbols):", "");
// if (symbolName != null)
// {
// 	fl.trace("Search symbolName: " + symbolName);
// 	symbolName = symbolName.toLowerCase();
	
// 	updateSymbol(symbolName);
// }

function init()
{
    curDoc = fl.getDocumentDOM();

    if (curDoc)
    {
    	library = curDoc.library;
    }
    else
    {
        fl.trace("There're no document opened");
        library = null;
    }
}

function updateSymbol(symbolName)
{
	var librarySymbols = library.items;
	for (var i = 0; i < librarySymbols.length; i++)
	{
		var symbol = librarySymbols[i];
		if (symbol.itemType != "movie clip")
		{
			continue;
		}

		// fl.trace("Checking symbol: " + symbol + " name: " + symbol.name + " linkageClassName: " + symbol.linkageClassName +
		// 	" sourceFilePath = " + symbol.sourceFilePath + " sourceLibraryName = " + symbol.sourceLibraryName);

		var sbName = String(symbol.name).toLowerCase();

		if (symbolName == "" || sbName.search(symbolName) != -1)
		{
			updateSymbolItem(symbol);
		}
	}
	fl.trace("END Search");
}

function updateSymbolItem(symbol)
{
	if (!symbol.linkageImportForRS)
	{
		fl.trace("Symbol: " + symbol.name + " not imported => no need to update it");
		return;
	}

	fl.trace("Update symbol: " + symbol.name + "\tlinkageURL = " + symbol.linkageURL + "\tlinkageIdentifier = " + symbol.linkageIdentifier);

	var oldURL = symbol.linkageURL;
	// TODO: try to fix the symbol's sourceFilePath base on the linkageURL
	library.updateItem(symbol.name);
	// Maintain the same import url
	symbol.linkageURL = oldURL;
}

function updateSelectedSymbols()
{
	init();

	if (!library)
		return;

	var selectedSymbols = library.getSelectedItems();
	if (selectedSymbols.length == 0)
	{
		fl.trace("Select the imported symbols in the library that you want to update.");
		return;
	}

	for (var i = 0; i < selectedSymbols.length; i++)
	{
		// Only update the imported symbols
		updateSymbolItem(selectedSymbols[i]);
	}
}