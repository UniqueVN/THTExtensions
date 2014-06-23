/**
 * Author: Thang To
 * Date: 11/27/2013
 * Analyze symbols in the flash file: where is the symbols imported from, how many times does it used
 */

fl.outputPanel.clear();

var curDoc, library;

analyzeSymbols();

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

function analyzeSymbols()
{
	init();
	fl.outputPanel.clear();

	if (!library)
		return;

    fl.trace("Analize symbols in the library of: " + curDoc.name);

	var importMap = {};

	var librarySymbols = library.items;
	for (var i = 0; i < librarySymbols.length; i++)
	{
		var symbol = librarySymbols[i];
        var symbolType = symbol.itemType.toLowerCase();
		// Only check imported movieclip symbols
		// if (symbolType != "movie clip" || !symbol.linkageImportForRS)
		if (!symbol.linkageImportForRS || symbolType == "font")
        // if ((symbolType != "movie clip" && symbolType != "component") || !symbol.linkageImportForRS)
		{
			continue;
		}

		// fl.trace("Checking symbol: " + symbol + " name: " + symbol.name + " linkageClassName: " + symbol.linkageClassName +
		// 	" sourceFilePath = " + symbol.sourceFilePath + " sourceLibraryName = " + symbol.sourceLibraryName);
    	var importPath = symbol.linkageURL;
    	// Create new array for to contain all the symbols imported from same path
    	if (!importMap[importPath])
    	{
    		importMap[importPath] = [];
    		fl.trace("Create new import list for path: " + importPath);
    	}
    	importMap[importPath].push(symbol);
	}

	fl.trace("IMPORT MAP:\n");
	for (var path in importMap)
	{
		fl.trace("Symbols imported from  " + path + ":\n");
		var list = importMap[path];
		for (var i = 0; i < list.length; i++)
		{
			var symbol = list[i];
			fl.trace("\t" + symbol.name + " - sourceFilePath: " + symbol.sourceFilePath + "\n");
		}
	}
}