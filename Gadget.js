var m_isGadget = false;

function debug( s )
{
	System.Debug.outputString( s ); 
}

function InitGadget()
{
	//If running in a browser, not as a gadget
	if( typeof System == "undefined" )
	{
		System = new Object();
		System.Gadget = new Object();
		System.Debug = new Object();
		System.Debug.outputString = function(s){ window.alert(s); }
		
		System.settings = [];
		System.Gadget = new Object();
		System.Gadget.Settings = new Object();
		System.Gadget.Settings.read = function( key ){ return System.Gadget.Settings.settings[ key ]; };
		System.Gadget.Settings.write = function( key, value ){ System.Gadget.Settings.settings[ key ] = value };
		System.Gadget.Settings.settings = [];
		System.Gadget.document = document
		
		System.Gadget.Settings.settings[ "todoFiles" ] = "C:\\temp\\a.xml\r\nc:\\temp\\a2.xml";
	}
	else
	{
		m_isGadget = true
		$("#nonGadgetSettings").css( "display", "none" )
	}
}

function InitTodoGadget()
{
	InitGadget();
	
	var oBackground = document.getElementById("imgBackground");
	oBackground.style.msInterpolationMode = "bicubic";
	oBackground.src = "url(images/bg.png)";
	
	System.Gadget.settingsUI = "settings.html";
	m_todoFiles = ReadConfig()
}

function ReadConfig()
{
	var files = System.Gadget.Settings.read( "todoFiles" )
	
	var items = files.split( "\r\n" )
	todoFiles = new Array();
	
	for( var i = 0; i < items.length; ++i )
	{
		if( items[i] != "" )
		{
			todoFiles[ todoFiles.length ] = items[ i ];
		}
	}
	
	return todoFiles;
}
