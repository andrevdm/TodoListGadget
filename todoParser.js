TodoParser = 
{
	ParseFiles : function( items )
	{
		var files = []
			
		for( var i = 0; i < items.length; ++i )
		{
			try
			{
				var path = items[ i ].path
				var info = new TodoFile( items[ i ] )
				
				files[ files.length ] = info
				
				this.ParseFile( path, info.items, info )
				
				//~ Log( "info", "Parsed " + path )
				//TODO enable logging when the log window only keeps the top n items
			}
			catch( ex )
			{
				Log( "error", "Exception parsing file. " + paths[i] + " - " + ex.message )
			}
		}
		
		return new TodoFileCollection( files )
	},
	
	ParseFile : function( path, items, ownerFile )
	{
		var xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
		xmlDoc.async="false";
		xmlDoc.load( path );

		var nodes = xmlDoc.selectNodes( "TODOLIST" );
		
		if( nodes.length > 0 )
		{
			this.FindTasks( xmlDoc, nodes[0], 0, items, ownerFile );
		}
		
		xmlDoc = null	
	},
	
	FindTasks : function( xmlDoc, parent, level, items, ownerFile )
	{
		var nodes = parent.selectNodes("TASK");

		for( var i = 0; i < nodes.length; ++i )
		{
			items[ items.length ] = new TodoItem( nodes[i], ownerFile ) 
			
			this.FindTasks( xmlDoc, nodes[i], level + 1, items, ownerFile );
		}
	}
}

function TodoItem( node, file )
{
	this.type = "TodoItem"
	this.node = node
	this.file = file
	
	this.percent = 0
	if( node.getAttributeNode( "PERCENTDONE" ) != null )
	{
		this.percent = parseInt( node.getAttributeNode( "PERCENTDONE" ).value )
	}

	this.dueDate = null
	if( node.getAttributeNode( "DUEDATE" ) != null )
	{
		this.dueDate = ParseDate( node.getAttributeNode( "DUEDATESTRING" ).value )
	}
	
	this.title = node.getAttributeNode( "TITLE" ).value
	this.id = node.getAttributeNode( "ID" ).value
	this.priority = parseInt(node.getAttributeNode( "PRIORITY" ).value)
	this.createDate = ParseDate( node.getAttributeNode( "CREATIONDATESTRING" ).value )
	this.comments = node.getAttributeNode( "COMMENTS" ) != null ? node.getAttributeNode( "COMMENTS" ).value : ""
}

function TodoFile( info )
{
	this.type = "TodoFile"
	this.path = info.path
	this.info = info
	this.items = []	
	
	this.SelectItems = function( filters )
	{
		var filtered = [];
		
		for( var i = 0; i < this.items.length; ++i )
		{
			var item = this.items[ i ];
			
			if( AllFilters( filters, item ) )
			{
				filtered[ filtered.length ] = item;
			}
		}
		
		return filtered;
	}	
}

function TodoFileCollection( files )
{
	this.type = "TodoFileCollection"
	this.items = files
	
	this.SelectItems = function( filters )
	{
		var filtered = [];
		
		for( var f = 0; f < this.items.length; ++f )
		{
			var file = this.items[f];
			
			var filteredForFile = file.SelectItems( filters )
			for( var i = 0; i < filteredForFile.length; ++i )
			{
				var item = filteredForFile[ i ];
				
				if( AllFilters( filters, item ) )
				{
					filtered[ filtered.length ] = item;
				}
			}
		}
		
		return filtered;
	}
}


function ParseDate( dateStr )
{
	//2010-03-11 15:00
	var dre = dateStr.match( /^(\d\d\d\d)(-|\/)(\d\d)(-|\/)(\d\d)( (\d\d):(\d\d))?/i )
	
	var date = new Date();
	date.setFullYear( dre[1] );
	date.setMonth( dre[3] - 1 );
	date.setDate( dre[5] );
	
	if( dre[6] != "" )
	{
		date.setHours( dre[7] );
		date.setMinutes( dre[8] );
	}
	else
	{
		date.setHours( m_defaultTimeHour );
		date.setMinutes( m_defaultTimeMinute );
	}
	
	date.setSeconds( 0 )

	return date
}

function AllFilters( filters, item )
{
	for( var f = 0; f < filters.length; ++f )
	{
		var match = filters[f]( item );
		if( !match )
		{
			return false;
		}
	}
	
	return true;
}