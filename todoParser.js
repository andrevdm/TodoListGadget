TodoParser = 
{
	ParseFiles : function( paths )
	{
		var files = []
			
		for( var i = 0; i < paths.length; ++i )
		{
			var info = 
			{ 
				path : paths[ i ], 
				items : new Array()
			}
			
			files[ paths[ i ] ] = info
			
			this.ParseFile( paths[i], info.items )
		}
		
		return files
	},
	
	ParseFile : function( path, items )
	{
		var xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
		xmlDoc.async="false";
		xmlDoc.load( path );

		var nodes = xmlDoc.selectNodes( "TODOLIST" );
		
		if( nodes.length > 0 )
		{
			this.FindTasks( xmlDoc, nodes[0], 0, items );
		}
		
		xmlDoc = null	
	},
	
	FindTasks : function( xmlDoc, parent, level, items )
	{
		var nodes = parent.selectNodes("TASK");

		for( var i = 0; i < nodes.length; ++i )
		{
			var n = nodes[i];
			
			if( n.getAttributeNode( "DUEDATE" ) != null )
			{
				var percent = 0
				
				if( n.getAttributeNode( "PERCENTDONE" ) != null )
				{
					percent = parseInt( n.getAttributeNode( "PERCENTDONE" ).value )
				}
	
				items[ items.length ] = 
				{
					date : this.ParseDate( n.getAttributeNode( "DUEDATESTRING" ).value ), 
					title : n.getAttributeNode( "TITLE" ).value, 
					id : n.getAttributeNode( "ID" ).value, 
					priority : parseInt(n.getAttributeNode( "PRIORITY" ).value),
					percentDone : percent,
					createDate : this.ParseDate( n.getAttributeNode( "CREATIONDATESTRING" ).value ),
					comments : n.getAttributeNode( "COMMENTS" ) != null ? n.getAttributeNode( "COMMENTS" ).value : ""
				}
			}
			
			this.FindTasks( xmlDoc, n, level + 1, items );
		}
	},
	
	ParseDate : function( dateStr )
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
}