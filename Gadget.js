function debug( s )
{
	System.Debug.outputString( s ); 
}

function InitGadget()
{
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