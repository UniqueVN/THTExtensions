/**
 * Author: Thang To
 * Date: 11/27/2013
 * Analyze symbols in the flash file: where is the symbols imported from, how many times does it used
 */

fl.outputPanel.clear();

var curDoc, library, selectedSymbols;

findInstanceOfSymbol();

function init()
{
    curDoc = fl.getDocumentDOM();

    if (curDoc)
    {
    	library = curDoc.library;
    	selectedSymbols = library.getSelectedItems();
    }
    else
    {
        fl.trace("There're no document opened!");
        library = null;
    }
}

function findInstanceOfSymbol()
{
	fl.outputPanel.clear();
	init();
    if (selectedSymbols.length == 0)
    {
        fl.trace("Select the symbol you want to find instance of");
        return;
    }

	if (!library)
		return;

	var checkSymbol = selectedSymbols[0];

	fl.trace("Searching for instances of symbol: " + checkSymbol.name + "\n");

	found = false;

	// Scan the main timeline first
	scanTimeline(curDoc.getTimeline(), checkSymbol, true);

	// Scan the library
	scanLibrary(checkSymbol);
}

function scanTimeline(_timeline, _checkSymbol, _mainTimeline)
{
	var timeline = _timeline;
	var layerCount = timeline.layerCount;

	while (layerCount--)
	{
		var checkLayer = timeline.layers[layerCount];
		var frameCount = checkLayer.frameCount;
		var frameIndex = 0;

		while (frameIndex < frameCount)
		{
			found = false;
			var checkFrame = checkLayer.frames[frameIndex];
			if (checkFrame == undefined)
			{
				continue;
			}

			var elems = checkFrame.elements;
			var p = elems.length;

			while (p--)
			{
				var checkComponent = elems[p];
				// Check if it's an instance in the library
				if (checkComponent.elementType == 'instance')
				{
					// Check if it's the same clip as our active check
					if (checkComponent.libraryItem.name == _checkSymbol.name)
					{
						found = true;
						var location;

						if(_mainTimeline == true)
						{
							location = 'the main timeline';
						}
						else
						{
							location = 'the library item: ' + item.name;
						}
						location += " - layer: " + checkLayer.name + " - frame: " + frameIndex;

						fl.trace("Found an instance of symbol: " + _checkSymbol.name + " name: " + checkComponent.name + " in " + location + " \n");
						break;
					}
				}
			}

			frameIndex++;
			if (found)
				break;
		}
	}
}

function scanLibrary(_checkSymbol)
{
	var items = library.items;

	for (var i = 0; i < items.length; i++)
	{
		item = items[i];

		// if (item.itemType == 'movie clip' && item != _checkSymbol)
		// Only check non-imported symbols
		if (item.itemType == 'movie clip' && item != _checkSymbol && !item.linkageImportForRS)
		{
			scanTimeline(item.timeline, _checkSymbol, false);
		}
	}
}