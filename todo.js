//-----------------
//Config
//-----------------
//TODO should be on the config screen
var m_refreshMinutes = 5
var m_defaultTimeHour = 8
var m_defaultTimeMinute = 0
var m_priorityColours = ["#1EE100", "#00E43F", "#00E7A0", "#00D1EA", "#0071ED", "#000FF0", "#5400F3", "#BA00F6", "#F900CD", "#FC0068", "#FF0000"]
//-----------------		

var m_day=1000*60*60*24
var m_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var m_todoFiles = []
var m_files = []
var m_log = []
var m_verNumber = "0.2.6"
var m_verReleaseDate = "2010/03/16"
var m_manifest = {
	"Release" : 
	{
		"VersionNumber" : "0.2.7",
		"ReleaseDate" : "2010/03/16",
		"LatestManifestUrl" : "http://github.com/andrevdm/TodoListGadget/raw/master/TodoGadgetManifest.js",
		"_LatestManifestUrl" : "http://localhost/Gadgets/TestTodoGadgetManifest.js"
	}
}


var m_sections = 
[
	{
		title : "Overdue",
		filters : [HasDueDate, IsIncomplete, IsOld],
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsTwoColumn",
		formatLeftCol : function( item ){ return dateDiff( item.dueDate ) },
		colLeftWidth : 13
	},
	{
		title : "Today",
		filters : [HasDueDate, IsIncomplete, IsToday],
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsList"
	},
	{
		title : "Tomorrow",
		filters : [HasDueDate, IsIncomplete, IsTomorrow],
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsList"
	},
	{
		title : "Next 7 Days",
		filters : [HasDueDate, IsIncomplete, IsAfterTomorrowButInNext7Days],
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsTwoColumn",
		formatLeftCol : function( item ){ return m_days[ item.dueDate.getDay() ] },
		colLeftWidth : 23
	}
]	

//TODO not working
$(window).error(function() 
{
	Log( "error", "exception" )
	return true;
});

$(document).ready(function() {
    $('#tabs').tabs();

    if (m_refreshMinutes > 0) {
        setTimeout(LoadPage, 1000 * 60 * m_refreshMinutes);
    }

    Log("info", "Loaded: " + (new Date()))

    /*$.get('TodoGadgetManifest.js', "", function(data) 
    {
        m_manifest = $.parseJSON(data);
        m_verNumber = m_manifest.Release.VersionNumber;
        m_verReleaseDate = m_manifest.Release.ReleaseDate;
    });*/
});


function InitPage()
{
	InitTodoGadget();
	LoadPage()
}

function LoadProjectAccordion()
{
	var menu = document.getElementById( "accMenu" );
	
	$('.acc-menu-ctc').hide();
	$('.acc-menu-ctc:first').show();
	$('.acc-menu-img:first' ).attr( "src", "images/open.png" )
	$('.acc-menu-hdr').click(
		function() 
		{
			var checkElement = $(this).next();
			
			if( checkElement.is('div') )
			{
				$('.acc-menu-img').attr( "src", "images/closed.png" );
				
				if( checkElement.is(':visible') )
				{
					$('.acc-menu-ctc:visible').slideUp('normal');
					return false;
				}
				else
				{
					$('.acc-menu-ctc:visible').slideUp('normal');
					$(this).children( ".acc-menu-img" ).attr( "src", "images/open.png" )
					checkElement.slideDown('normal');
					return false;
				}
			}
		} 
	);
}

function ReLoadPage()
{
	//LoadPage()
	window.location = window.location
}

function SetStatus( msg )
{
	$("#statusBar").html( msg );
}

function LoadPage()
{
	var files = TodoParser.ParseFiles( m_todoFiles )
	m_files = files
	
	var output = FormatAllSections( m_sections, files )
	$('#allTabContent').html(output);
	
	output = FormatSectionsByProject( m_sections, files )
	$('#accMenu').html(output);
	
	LoadProjectAccordion();	
	SetStatus( "loaded" );
	
	$("#versionNumber").html(m_verNumber);
	$("#versionReleaseDate").html(m_verReleaseDate);
}

function ReadConfig()
{
	try
	{
		var files = System.Gadget.Settings.read( "todoFiles" )
		var parsed = JSON.parse( files );
		return parsed;
	}
	catch( ex )
	{
		Log( "error", "exception parsing JSON\r\nException: " + ex.message + "\r\nJSON: " + files )
		return new Array();
	}
}

function UpdateFilesFromSettingsPage( itemsFromSettings )
{
	var items = []
	for( var i in itemsFromSettings )
	{
		var s = itemsFromSettings[ i ]
		items[ items.length ] = { path : s.path, textColour : s.textColour }
	}
	
	var filesString = JSON.stringify( items );
	System.Gadget.Settings.write( "todoFiles", filesString )
	m_todoFiles = items
	
	LoadPage()
}

function FormatSectionsByProject( sections, files )
{
	var html = $( "#ItemsByProject" ).parseTemplate( {sections : sections, files : files} );
	return html
}

function FormatSectionForFile( sections, file )
{
	var files = []
	files[ 0 ] = file
	return FormatAllSections( sections, new TodoFileCollection( files ) );
}

function FormatAllSections( sections, files )
{
	var html = ""

	for( var s in sections )
	{
		var section = sections[s];
		var items = files.SelectItems( section.filters );
		items.sort( SortByDueDate );
		
		if( items.length == 0 )
		{
			continue;
		}
		
		html += FormatHeader( section );
		html += $( section.itemTemplate ).parseTemplate( {section:section, items : items, colLeftWidth : section.colLeftWidth} );
	}
	
	return html;
}

function FormatHeader( section )
{
	var html = $( section.headerTemplate ).parseTemplate( {section:section} );
	return html
}
	
function IsOld( item )
{
	return (item.dueDate < new Date()) || (dateDiff(item.dueDate) < 0);
}

function IsToday( item )
{
	if( item.dueDate < new Date() )
	{
		return false;
	}
	
	var diff = dateDiff(item.dueDate)
	return (diff>= 0) && (diff < 1)
}

function IsTomorrow( item )
{
	var diff = dateDiff(item.dueDate)
	return (diff>= 1) && (diff < 2)
}

function IsAfterTomorrowButInNext7Days( item )
{
	var diff = dateDiff(item.dueDate);
	return (diff >= 2) && (diff < 7)
}

function IsIncomplete( item )
{
	return (item.percent < 100);
}

function HasDueDate( item )
{
	return (item.dueDate != null);
}

function SelectAll( item )
{
	return true;
}

function dateDiff( x )
{
	a = new Date( x )
	a.setHours( 8 )
	a.setMinutes( 0 )
	a.setSeconds( 0 )
	a.setMilliseconds( 0 )
	
	b = new Date()
	b.setHours( 8 )
	b.setMinutes( 0 )
	b.setSeconds( 0 )
	b.setMilliseconds( 0 )
	
	return (a.getTime() - b.getTime()) / m_day
}	

function SortByDueDate( x, y )
{
	var compare = compareTo( x.dueDate.getTime(), y.dueDate.getTime() )
	
	return compare != 0 ? compare : -compareTo( x.priority, y.priority );
}

function compareTo( x, y )
{
	return (x < y) ? -1 : ((x > y) ? 1  : 0);
}

function FormatDate( d )
{
	return d.getYear() + "-" + (d.getMonth() < 9 ? "0" : "") +  (d.getMonth()  + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") +  d.getMinutes()
}

function formatDateAsDayName( d )
{
	var days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
	return days[ d.getDay() ]
}

function formatDateAsNumberOfDays( d )
{
	var days = dateDiff( d )
	return Math.round( days )
}

function UpdateRowCacheAndGetInfo( row )
{
	//Cache files by ID
	if( m_files.itemsById == null )
	{
		m_files.itemsById = []
		for( var f in m_files.items )
		{
			m_files.itemsById[ m_files.items[ f ].path ] = m_files.items[ f ]
		}
	}
	
	var file = m_files.itemsById[ row.filePath ]
	
	//Cache items by ID
	if( file.itemsById == null )
	{
		file.itemsById = []
		for( var i in file.items )
		{
			file.itemsById[ file.items[i].id ] = file.items[i]
		}
	}
	
	var item = file.itemsById[row.itemId]
	return { item : item, file : file }
}

function OnMouseClickItem( row )
{
	try
	{
		var info = UpdateRowCacheAndGetInfo( row )
		var file = info.file
		var item = info.item
		
		var infoDialog = $('<div></div>')
			.html( $( "#DetailsDialogTemplate" ).parseTemplate( {item:item} ) )
			.dialog(
			{
				autoOpen: false,
				title: FormatDate( item.dueDate ),
				modal: true,
				width: 210,
				height: 350,
				draggable: false
			});
		
		infoDialog.dialog('open')
	}
	catch( ex )
	{
		SetStatus( "Exception: " + ex.message )
	}
}

function OnMouseOverItem( row )
{
	try
	{
		$(row).addClass( "selectedItem" )
		
		var info = UpdateRowCacheAndGetInfo( row )
		var file = info.file
		var item = info.item
		
		SetStatus( row.itemId + ", f=" + file.path + ", i=" + item.id );
		
		//Cache row title
		if( row.title == "" )
		{
			row.title = $( "#TooltipTextTemplate" ).parseTemplate( {item:item} )
		}
	}
	catch( ex )
	{
		SetStatus( "Exception: " + ex.message );
	}
}

function OnMouseOutItem( row )
{
	$(row).removeClass( "selectedItem" )
}

function MakeHtmlHierarchyTree( item )
{
	var node = item.node
	
	var items = []
	GetHierarchy( node, items )
	
	s = ""
	for( var i = items.length - 1; i >= 0; --i )
	{
		s += "<span style='white-space: nowrap;'>"
		for( var x = 1; x < items.length - i; ++x )
		{
			s += "-"
		}
		s += items[ i ] + "</span></br>"
	}
	
	return s
}

function GetHierarchy( node, items )
{
	if( (node.parentNode != null) && (node.nodeName != "TODOLIST") )
	{
		items[ items.length ] = node.getAttributeNode( "TITLE" ).value 
		GetHierarchy( node.parentNode, items )
	}
	else
	{
		if( node.nodeName != "TODOLIST" )
		{
			items[ items.length ] = node.getAttributeNode( "TITLE" ).value 
		}
	}
}

function Log( level, message )
{
	var log = { level:level, message:message, at:new Date() }
	m_log[ m_log.length ] = log
	$("#logContent > tbody:first").prepend( $("#LogItemTemplate").parseTemplate( log ) );
}

function NonGadgetSettings()
{
	var settings = window.open( "settings.html", "todo_gadget_settings", "status=1, toolbar=0, location=1, menubar=1, width=400, height=300" )
	settings.focus();
}

function CheckForNewVersion()
{
	$("#checkForNewVersion").css( "display", "none" );
	$("#versionCheckStatus").html( "checking..." );
	SetStatus( "downloading " + m_manifest.Release.LatestManifestUrl );
	
	$.get( m_manifest.Release.LatestManifestUrl + "?rand=" + Math.random(), function(data, sts) 
	{
			try
			{
				manifest = $.parseJSON( data );
				$("#versionCheckStatus").html( "Latest version is " + manifest.Release.VersionNumber );
				
				if( IsNewerVersion( m_manifest.Release.VersionNumber, manifest.Release.VersionNumber ) )
				{
					$("#versionCheckStatus").append( "<br/> a newer version exists" );
				}
				else
				{
					$("#versionCheckStatus").append( "<br/> you have the latest version" );
				}
			}
			catch( ex )
			{
				$("#versionCheckStatus").html( ex.message != null ? ex.message : ex );
			}
	});
}

function IsNewerVersion( oldVersion, newVersion )
{
	var verRe = /^(\d+)\.(\d+)\.(\d+)$/i;
	var oldMatch = oldVersion.match( verRe );
	var newMatch = newVersion.match( verRe );
	
	var oldA = oldMatch[1];
	var oldB = oldMatch[2];
	var oldC = oldMatch[3];
	
	var newA = newMatch[1];
	var newB = newMatch[2];
	var newC = newMatch[3];
	
	if( newA > oldA )
		return true;
	
	if( newA < oldA )
		return false;

	if( newB > oldB )
		return true;
	
	if( newB < oldB )
		return false;

	if( newC > oldC )
		return true;
		
	return false;
}