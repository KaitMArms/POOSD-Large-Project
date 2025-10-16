//API End Points EDIT FOR OUR WEBSITE THIS IS THE BASE EX
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) =>
{
    app.get("/api/ping", (req, res, next) => {
        res.status(200).json({ message: "Hello World" });
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(42069); // start Node + Express server on port 5000
require('express');
require('mongodb');

exports.setApp = function ( app, client )
{

	app.post('/api/addcard', async (req, res, next) =>
	{
	  // incoming: userId, color
	  // outgoing: error
		
	  const { userId, card } = req.body;

	  const newCard = {Card:card,UserId:userId};
	  var error = '';

	  try
	  {
		const db = client.db('COP4331Cards');
		const result = db.collection('Cards').insertOne(newCard);
	  }
	  catch(e)
	  {
		error = e.toString();
	  }

	  cardList.push( card );

	  var ret = { error: error };
	  res.status(200).json(ret);
	});

	app.post('/api/login', async (req, res, next) => 
	{
	  // incoming: login, password
	  // outgoing: id, firstName, lastName, error
		
	 var error = '';

	  const { login, password } = req.body;

	  const db = client.db('COP4331Cards');
	  const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

	  var id = -1;
	  var fn = '';
	  var ln = '';

	  if( results.length > 0 )
	  {
		id = results[0].UserID;
		fn = results[0].FirstName;
		ln = results[0].LastName;
	  }

	  var ret = { id:id, firstName:fn, lastName:ln, error:''};
	  res.status(200).json(ret);
	});

	app.post('/api/searchcards', async (req, res, next) => 
	{
	  // incoming: userId, search
	  // outgoing: results[], error

	  var error = '';

	  const { userId, search } = req.body;

	  var _search = search.trim();
	  
	  const db = client.db('COP4331Cards');
	  const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();
	  
	  var _ret = [];
	  for( var i=0; i<results.length; i++ )
	  {
		_ret.push( results[i].Card );
	  }
	  
	  var ret = {results:_ret, error:error};
	  res.status(200).json(ret);
	});
    
}
