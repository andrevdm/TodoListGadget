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

