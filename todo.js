//-----------------
//Config
//-----------------
var m_todoFiles = new Array();
var m_refreshMinutes = 5
var m_defaultTimeHour = 8
var m_defaultTimeMinute = 0
var m_priorityColours = ["#1EE100", "#00E43F", "#00E7A0", "#00D1EA", "#0071ED", "#000FF0", "#5400F3", "#BA00F6", "#F900CD", "#FC0068", "#FF0000"]
//-----------------		

var m_day=1000*60*60*24
var m_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

var m_sections = 
[
	{
		title : "Overdue",
		filter : IsOld,
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsTwoColumn",
		formatLeftCol : function( item ){ return dateDiff( item.dueDate ) }
	},
	{
		title : "Today",
		filter : IsToday,
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsList"
	},
	{
		title : "Tomorrow",
		filter : IsTomorrow,
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsList"
	},
	{
		title : "Week",
		filter : IsAfterTomorrowButInNext7Days,
		headerTemplate : "#HeaderTemplate",
		itemTemplate : "#ItemsTwoColumn",
		formatLeftCol : function( item ){ return m_days[ item.dueDate.getDay() ] }
	}
]	

$(document).ready(function()
{
	$('#tabs').tabs();
	
	//Browser hacks to emulate gadgets
	//~ System = new Object();
	//~ System.Debug = new Object();
	//~ System.Debug.outputString = alert
	//
	LoadPage();
});

function LoadProjectAccordion()
{
	var menu = document.getElementById( "accMenu" );
	
	/*for( var i = 0; i < 5; ++i )
	{
		var item = document.createElement( "div" );
		item.className = "acc-menu-item"
		
		var hdr = document.createElement( "div" );
		hdr.className = "acc-menu-hdr";
		item.appendChild( hdr );
		hdr.innerText = "hdr" + i;
		
		var ctc = document.createElement( "div" );
		ctc.className = "acc-menu-ctc";
		item.appendChild( ctc );
		ctc.innerText = "ctc" + i;
		
		menu.appendChild( item );
	}*/
	
	//~ menu.innerHTML += "<div class='acc-menu-item'><div class='acc-menu-hdr'>menu1</div><div class='acc-menu-ctc'>content1</div></div>"
	//~ menu.innerHTML += "<div class='acc-menu-item'><div class='acc-menu-hdr'>menu1</div><div class='acc-menu-ctc'>content1</div></div>"
	
	$('.acc-menu-ctc').hide();
	$('.acc-menu-ctc:first').show();
	$('.acc-menu-hdr').click(
		function() 
		{
			var checkElement = $(this).next();
			
			if( checkElement.is('div') )
			{
				if( checkElement.is(':visible') )
				{
					return false;
				}
				else
				{
				  $('#.acc-menu-ctc:visible').slideUp('normal');
				  checkElement.slideDown('normal');
				  return false;
				}
			}
		} 
	);
}

function LoadPage()
{
	var files = TodoParser.ParseFiles( ["C:\\temp\\a.xml", "c:\\temp\\a2.xml"] )
	
	var projectAll = document.getElementById( "tabs-all" )
	var projectTab = document.getElementById( "tabs-project" )
	
	var output = FormatAllSections( m_sections, files )
	$('#tabs-all').html(output);
	
	output = FormatSectionsByProject( m_sections, files )
	$('#accMenu').html(output);
	
	LoadProjectAccordion();	
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
		var filter = function( item ){ return SelectItemsWithDueDate( item ) && section.filter( item ) };
		var items = files.SelectItems( filter );
		items.sort( SortByDueDate );
		
		if( items.length == 0 )
		{
			continue;
		}
		
		html += FormatHeader( section );
		html += $( section.itemTemplate ).parseTemplate( {section:section, items : items} );
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

	
function SelectItemsWithDueDate( item )
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

