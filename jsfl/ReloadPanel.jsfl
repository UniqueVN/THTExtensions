/**
 * Author: Thang To
 * Date: 9/6/2013
 * Reload the extension's swfPanel that we're working on
 */

fl.outputPanel.clear();

var dom = fl.getDocumentDOM();
var panelName = dom.name.split(".fla")[0];
var fileName = panelName + ".swf";

fl.clearPublishCache();

dom.publish();

// Publish directly to the WindowSWF folder
var swfFile = fl.configURI + "WindowSWF/" + fileName;
dom.exportSWF(swfFile, true);
fl.trace("Export the swf to: " + swfFile);

// Reload the swf panel
if(fl.swfPanels.length > 0)
{ 
	for(i = 0; i < fl.swfPanels.length; i++)
	{
		var checkPanel = fl.swfPanels[i];
		// fl.trace("Panel: " + checkPanel.name + " -- Path: " + checkPanel.path + " panelName = " + panelName);
		// Found the panel => close it so we can reopen it later
		if (checkPanel.name == panelName)
		{
			fl.trace("Reload panel");
			// TODO: Only work for Flash CC and later
            // checkPanel.reload();
		}
	}
}