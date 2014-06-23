package src.tools {
	
	import adobe.utils.MMEndCommand;
	import adobe.utils.MMExecute;
	import fl.accessibility.ButtonAccImpl;
	import fl.accessibility.RadioButtonAccImpl;
	import fl.controls.CheckBox;
	import fl.controls.ComboBox;
	import fl.controls.RadioButton;
	import fl.controls.RadioButtonGroup;
	import fl.core.UIComponent;
	import fl.controls.Button;
	import fl.data.DataProvider;
	import flash.external.ExternalInterface;
	import flash.net.FileReference;
	
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.StatusEvent;
	import flash.net.SharedObject;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.system.Capabilities;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	public class THTTools extends Sprite {
		// Static properties:
		public static var SCRIPT_PATH:String = "THTExt/jsfl/";
		//public static var SCRIPT_PATH:String = "Commands/";
		public static var JSFL_EXT:String = ".jsfl";
		public static const BUTTON_PADDING:Number = 8;
		public static const STANDARD_WIDTH:Number = 256;
		
		// UI Elements:
		public var btnValidation:Button;
		public var btnUpdate:Button;
		public var btnSource:Button;
		public var bg:MovieClip;
		public var btnImport:Button;
		public var btnPublish:Button;		
		
		// Profiles
		public var listProfiles:ComboBox;
		public var btnAddProfile:Button;
		public var btnRemoveProfile:Button;
		public var btnEditProfile:Button;
		
		// Import/Publish options:
		public var rbImportThis:RadioButton;
		public var rbImportAll:RadioButton;
		public var rbImportCustom:RadioButton;
		public var importOptionGroup:RadioButtonGroup;
		
		// Exclude classes options:
		public var btnCreateExcludeFile:Button;
		public var btnRemoveExcludeFile:Button;
		
		// Perforce
		public var btnCheckout:Button;
		
		// Protected properties:
		
		// Initialization:
		
		public function THTTools()
		{
			configUI();
		}
		
		protected function configUI():void
		{
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			stage.addEventListener(Event.RESIZE, handleStageResize, false, 0, true);
			
			btnPublish.addEventListener(MouseEvent.CLICK, handlePublishClick, false, 0, true);
			//btnManageExcludedClasses.addEventListener(MouseEvent.CLICK, handleExcludedClassesClick, false, 0, true);
			btnImport.addEventListener(MouseEvent.CLICK, handleImportClick, false, 0, true);
			btnValidation.addEventListener(MouseEvent.CLICK, handleValidationClick, false, 0, true);
			btnUpdate.addEventListener(MouseEvent.CLICK, handleUpdateClick, false, 0, true);
			btnSource.addEventListener(MouseEvent.CLICK, handleSourceClick, false, 0, true);
			
			btnAddProfile.addEventListener(MouseEvent.CLICK, handleAddProfileClick, false, 0, true);
			btnRemoveProfile.addEventListener(MouseEvent.CLICK, handleRemoveProfileClick, false, 0, true);
			btnEditProfile.addEventListener(MouseEvent.CLICK, handleEditProfileClick, false, 0, true);
			listProfiles.addEventListener(Event.CHANGE, handleProfileChanged);
			
			// Set up import options
			importOptionGroup = new RadioButtonGroup("ImportOptionGroup");
			importOptionGroup.addEventListener(Event.CHANGE, handleImportOptionChanged);
			
			// Set up Exclude file buttons
			btnCreateExcludeFile.addEventListener(MouseEvent.CLICK, handleCreateExcludeFileClick);
			btnRemoveExcludeFile.addEventListener(MouseEvent.CLICK, handleRemoveExcludeFileClick);

			// Set up Perforce buttons
			btnCheckout.addEventListener(MouseEvent.CLICK, handleCheckoutClick);
			
			setupButton(btnPublish);
			//setupButton(btnManageExcludedClasses);
			setupButton(btnImport);
			setupButton(btnValidation);
			setupButton(btnUpdate);
			setupButton(btnSource);
			
			trace(this + " set up callback: ExternalInterface.available = " + ExternalInterface.available);
			ExternalInterface.addCallback("cancelCommand", cancelCommand);
			
			ExternalInterface.addCallback("refreshProfiles", refreshProfiles);
			refreshProfiles();
		}
		
		protected function handleStageResize(event:Event):void {
			// TODO: Use constrain?
			updateComponent(btnPublish);
			//updateComponent(btnManageExcludedClasses);
			updateComponent(btnImport);
			updateComponent(btnValidation);
			
			var panelWidth = stage.stageWidth;
			
			btnUpdate.setSize(panelWidth / 2 - BUTTON_PADDING, btnUpdate.height);
			btnSource.x = panelWidth / 2;
			btnSource.setSize(panelWidth / 2 - BUTTON_PADDING, btnSource.height);
			
			var offsetX = stage.stageWidth - STANDARD_WIDTH;
			
			btnEditProfile.x = panelWidth - BUTTON_PADDING - btnEditProfile.width;
			btnRemoveProfile.x = btnEditProfile.x - btnRemoveProfile.width - 2;
			btnAddProfile.x = btnRemoveProfile.x - btnAddProfile.width - 2;
			var listProfileWidth = btnAddProfile.x - 2 - listProfiles.x;
			listProfiles.setSize(listProfileWidth, listProfiles.height);
			
			btnCheckout.width = panelWidth - BUTTON_PADDING * 2;
			
			bg.width = stage.stageWidth;
		}
		
		protected function updateComponent(comp:UIComponent)
		{
			comp.setSize(stage.stageWidth - BUTTON_PADDING * 2, comp.height);
		}
		
		protected function setupButton(checkButton:Button)
		{
			//checkButton.setSize(width, btnImport.height);
			checkButton.setStyle("textFormat", new TextFormat("_sans", 12, 0x000000, true));
			checkButton.drawNow();
		}
		
		protected function handlePublishClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "publishFiles", rbImportAll.selected, false);
		}
		
		protected function handleExcludedClassesClick(event:MouseEvent):void
		{
			//runJSFL("THTExt", "createExcludeClassesForCurrentDocument");
		}
		
		protected function handleImportClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "gfxImport", rbImportAll.selected);
		}
		
		protected function handleValidationClick(event:MouseEvent):void
		{
			//MMExecute("fl.runScript(fl.configURI + 'Commands/Validate Symbols.jsfl')");
			//runJSFL("Validate Symbols");
			//runJSFL("THTExt", "validateSelectedSymbol");
		}
		
		protected function handleUpdateClick(event:MouseEvent):void
		{
			runJSFL("Update Symbols", "updateSelectedSymbols");
		}

		protected function handleSourceClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "findSourceOfSelectedSymbol");
		}
		
		// Profile Settings
		protected function handleAddProfileClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "addNewProfile");
			//refreshProfiles();
		}
		
		protected function handleRemoveProfileClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "removeCurrentProfile");
		}
		
		protected function handleEditProfileClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "editCurrentProfile");
		}

		protected function handleProfileChanged(event:Event):void
		{
			var curProfileName:String = runJSFL("THTExt", "getCurrentProfileName");
			var selectedProfile:String = listProfiles.selectedLabel;
			// If we change the current profile then notify it
			if (selectedProfile != curProfileName)
			{
				runJSFL("THTExt", "selectProfile", selectedProfile);
			}
		}
		
		// Refresh the profile list
		protected function refreshProfiles():void
		{
			//var profileList:String = runJSFL("THTExt", "getProfileList");
			var profileListStr:String = runJSFL("THTExt", "getProfileListForAS");
			var profileList:Array = profileListStr.split("\n");
			listProfiles.dataProvider = new DataProvider(profileList);
			
			var curProfileName:String = runJSFL("THTExt", "getCurrentProfileName");
			var profileIndex = profileList.indexOf(curProfileName);
			listProfiles.selectedIndex = (profileIndex > 0) ? profileIndex : 0;
		}
		
		protected function handleImportOptionChanged(event:Event):void
		{
			var importOption:String = String(importOptionGroup.selection.value);
		}
		
		protected function handleEditPublishListClick(event:MouseEvent):void
		{
			//runJSFL("THTExt", "editCurrentProfile");
		}
		
		protected function handleCreateExcludeFileClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "createExcludeFileForCurrentDocument");
		}
		
		protected function handleRemoveExcludeFileClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "removeExcludeFileForCurrentDocument");
		}
		
		protected function handleCheckoutClick(event:MouseEvent):void
		{
			runJSFL("THTExt", "checkOutFiles", rbImportAll.selected);
		}
		
		protected function cancelCommand():void
		{
			MMEndCommand(false, "Cancel command");
			//MMEndCommand(true, "Cancel command");
		}
		
		// Utility functions
		
		// Script file name
		// Function name
		// Arguments
		protected function runJSFL(... params):String
		{
			var scriptFileName:String = params.shift().toString();
			var functionName:String = params.length == 0 ? " " : params.shift().toString();
			trace(this + "runJSFL: scriptFileName = " + scriptFileName + " functionName = " + functionName);
			
			var args:Array = [];
			var paramNum:Number = params.length;
			// Clean up the paramaters:
			// - Remove invalid params
			// - Replace ' by \' in string params
			for (var i:int = 0; i < paramNum; i++)
			{
				var checkParam:String = (params[i] == undefined) ? "" : params[i].toString();
				args.push("'" + checkParam.split("'").join("\'") + "'");
			}
			
			var scriptFilePath:String = SCRIPT_PATH + scriptFileName + JSFL_EXT;
			var scriptPath:String = "fl.runScript(fl.configURI + '" + scriptFilePath + "', '" + functionName + "'";
			if (paramNum != 0)
			{
				scriptPath += ", " + args.join(",");
			}
			scriptPath += ");";
			
			//trace("scriptPath: " + scriptPath);
			return MMExecute(scriptPath);
		}
	}
}