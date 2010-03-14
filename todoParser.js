TodoParser = 
{
	ParseFiles : function( paths )
	{
		var files = []
			
		for( var i = 0; i < paths.length; ++i )
		{
			var info = new TodoFile( paths[ i ] )
			
			files[ files.length ] = info
			
			this.ParseFile( paths[i], info.items, info )
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

function TodoFile( path )
{
	this.type = "TodoFile"
	this.path = path
	this.items = []	
	
	this.SelectItems = function( filter )
	{
		var filtered = [];
		
		for( var i = 0; i < this.items.length; ++i )
		{
			var item = this.items[ i ];
			
			if( filter( item ) )
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
	
	this.SelectItems = function( filter )
	{
		var filtered = [];
		
		for( var f = 0; f < this.items.length; ++f )
		{
			var file = this.items[f];
			
			var filteredForFile = file.SelectItems( filter )
			for( var i = 0; i < filteredForFile.length; ++i )
			{
				var item = filteredForFile[ i ];
				
				if( filter( item ) )
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