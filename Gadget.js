var m_isGadget = false;

function debug( s )
{
	System.Debug.outputString( s ); 
}

function InitGadget()
{
	if( typeof System == "undefined" )
	{
		m_todoFiles = ["C:\\temp\\a.xml", "c:\\temp\\a2.xml"]
		//$("#nonGadgetFooter").css( "display", "inline" );
		return
	}
	
	m_isGadget = true
	var oBackground = document.getElementById("imgBackground");
	oBackground.style.msInterpolationMode = "bicubic";
	oBackground.src = "url(images/bg.png)";
	
	System.Gadget.settingsUI = "settings.html";
	//System.Gadget.Flyout.file = "details.html";
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

function ShowFlyout()
{
	if( !m_isGadget )
	{
		return;
	}
	
	if( !System.Gadget.Flyout.show )
	{
		System.Gadget.Flyout.show = true;
	}
}

function UpdateFlyout( item )
{
	if( !m_isGadget )
	{
		return;
	}

	var doc = System.Gadget.Flyout.document
	var div = doc.getElementById( "mainContent" )
	$(div).html( $( "#FlyoutTemplate" ).parseTemplate( {item:item} ) )
}

function NonGadgetSettings()
{
	//window.open( "settings.html" )
}