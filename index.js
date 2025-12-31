
const express = require('express');
const app = express();
const mysql = require('mysql');

const Contract = require('web3-eth-contract');
var morgan = require('morgan');
var path = require('path');
var passwordHash = require('password-hash');
var cookieParser = require('cookie-parser');
var request = require('request');
var fs = require('fs');
Web3 = require('web3').default;
solc = require('solc')
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json());  // Parses incoming JSON request bodies


app.use("/", express.static("ui"));


var username;
var password;

app.post('/login', function(req, res) {
    
	console.log(req.body);
    username = req.body.username;
    password = req.body.password;
    var hashedPassword = passwordHash.generate(password);
    
    if (username == "admin" && password == "123") {

    	res.status(200).send({ message: hashedPassword});

    } else {
    	res.status(500).send({ message: 'error' });
    }
});

app.post('/auth', function(req, res) {
	var cookie_pass = req.cookies['auth'];
	if (passwordHash.verify('123', cookie_pass)) {
		res.status(200).send({ message: hashedPassword});
	} else {
		res.status(500).send({ message: 'error' });
	}
});

app.get('/',function(req,res){
	var cookie_pass = req.cookies['auth'];
	if (passwordHash.verify('123', cookie_pass)) {
		res.sendFile(path.join(__dirname, 'ui', 'app.html'));
	} else {
		console.log('ok');
	}
});

app.get('/app', function(req, res){
	var cookie_pass = req.cookies['auth'];
	var cookie_otp = req.cookies['show'];

	if (passwordHash.verify('123', cookie_pass) && cookie_otp != null) {
		//res.sendFile(path.join(__dirname, 'ui', 'clist.html'));
		res.redirect('/info');

	} else if (cookie_otp == null && passwordHash.verify('123', cookie_pass)) {
		res.sendFile(path.join(__dirname, 'ui', 'app.html'));
	}
	else {
		res.redirect('/');
	}
	
});

// app.post('/getaddress',function(req,res){

// });const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); // Point to your Ethereum provider
// const fs = require('fs');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/result', async function(req, res) {
    const web3 = new Web3("http://localhost:7545");

    try {
        const transactionData = [];
        const voteCounts = {
            "Sanat": 0,
            "Mandar": 0,
            "Aniket": 0,
            "Akshay": 0
        };
        
        const latestBlockNumber = await web3.eth.getBlockNumber();
        console.log('Latest Block Number:', latestBlockNumber.toString());

        // Loop through all blocks from block 0 to the latest block
        for (let i = 0; i <= latestBlockNumber; i++) {
            const block = await web3.eth.getBlock(i, true); // Pass `true` to fetch full transaction objects
            if (block.transactions.length > 0) {
                block.transactions.forEach(tx => {
                    if (tx.gas == 90000) {
                        const party = web3.utils.hexToUtf8(tx.input.slice(10).replace(/^0+/, ''));
                        transactionData.push({
                            value: party,
                        });

                        // Increment vote count for the respective party
                        if (voteCounts.hasOwnProperty(party)) {
                            voteCounts[party]++;
                        }
                    }
                });
            }
        }

        // Calculate percentages for each party
        const totalVotes = transactionData.length;
        const partyPercentages = Object.keys(voteCounts).map(party => {
			const votes = voteCounts[party];
			const percentage = ((votes / totalVotes) * 100).toFixed(2);
			
			// Map each party to a political party affiliation
			let politicalParty;
			switch (party) {
				case 'Sanat':
					politicalParty = 'Bharatiya Janata Party';  // For Sanat, assign BJP
					break;
				case 'Aniket':
					politicalParty = 'Congress';  // For Aniket, assign Congress
					break;
				case 'Mandar':
					politicalParty = 'Nationalist Congress Party';  // Example, can be customized
					break;
				case 'Akshay':
					politicalParty = 'Shiv Sena';  // Example, can be customized
					break;
				default:
					politicalParty = 'Independent';  // Default affiliation if no match is found
					break;
			}
		
			return {
				party,
				votes,
				percentage,
				politicalParty  // Add the political party affiliation
			};
		});
		

        // Prepare the response object
        const response = {
            // transactionData,
            // voteCounts,
            partyPercentages
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching block data:', error);
        res.status(500).json({ error: 'Failed to fetch block data' });
    }
});










app.get('/info', function(req, res){
	var cookie_pass = req.cookies['auth'];
	var cookie_otp = req.cookies['show'];
	if (cookie_pass == null || cookie_pass == '' || cookie_otp == null || cookie_otp == '') {
		res.redirect('/app');
	} else {
		
		res.sendFile(path.join(__dirname, 'ui', 'clist.html'));
	}
	
});

// Setup body-parser to parse JSON request bodies
// app.use(bodyParser.json());
// This will automatically parse JSON requests.

// Setup database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'voting'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});


// Endpoint to check if the user has already voted
// app.post('/check-vote-status', (req, res) => {
// 	console.log(req.body);
// 	console.log(req.body.aadhaar);
//     const aadhaar = req.body.aadhaar;
//     if (!aadhaar) {
//         return res.status(400).send({ error: 'Aadhaar number is required' });
//     }

//     // Query the database to check if the user has voted
//     const query = 'SELECT voted FROM users WHERE aadhaar = ?';
//     db.query(query, [aadhaar], (err, result) => {
//         if (err) {
//             return res.status(500).send({ error: 'Database error' });
//         }

//         if (result.length === 0) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         // Send response with vote status
//         const voted = result[0].voted;
//         res.send({ voted: voted });
//     });
// });

app.post('/check-vote-status', (req, res) => {
    console.log(req.body);  // Log the incoming request body
    const aadhaar = req.body.aadhaar;
    if (!aadhaar) {
        return res.status(400).send({ error: 'Aadhaar number is required' });
    }

    const query = 'SELECT voted FROM voting WHERE aadhaar = ?';
    db.query(query, [aadhaar], (err, result) => {
        if (err) {
            return res.status(500).send({ error: err});
        }

        if (result.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        const voted = result[0].voted;
        res.send({ voted: voted });
    });
});

// Endpoint to update vote status in the database
app.post('/update-vote-status', (req, res) => {
    const aadhaar = req.body.aadhaar;  // Get Aadhaar number from the request
    if (!aadhaar) {
        return res.status(400).send({ error: 'Aadhaar number is required' });
    }

    const query = 'UPDATE voting SET voted = 1 WHERE aadhaar = ?';
    db.query(query, [aadhaar], (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send({ success: 'Vote status updated successfully' });
    });
});


// Endpoint to fetch the phone number based on Aadhaar
app.post('/get-phone-number', (req, res) => {
    const aadhaar = req.body.aadhaar;  // Get Aadhaar number from the request
    if (!aadhaar) {
        return res.status(400).send({ error: 'Aadhaar number is required' });
    }

    // Query to fetch phone number based on Aadhaar
    const query = 'SELECT phone_no FROM voting WHERE aadhaar = ?';
    db.query(query, [aadhaar], (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // If user not found
        if (result.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Return the phone number
        res.send({ phone_no: result[0].phone_no });
    });
});

app.get('/logout', function(req, res) {
    // Clear only the 'show' cookie
    res.clearCookie('show');
    res.clearCookie('auth');

    // Redirect to the desired page (e.g., login or home)
    res.redirect('/app');
});



app.get('/logout-both', function(req, res) {
    // Clear both 'auth' and 'show' cookies
    res.clearCookie('show');
    res.clearCookie('aadhaar');
    res.clearCookie('voter');

    // Redirect to the home page
    res.redirect('/');
});

var port = 2910;
app.listen(2910, function () {
  console.log(`app listening on port ${port}!`);
});