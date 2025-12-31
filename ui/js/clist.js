$(document).ready(function() {
    $('.modal').modal();

    // Initialize Web3 (do this once at the beginning)
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

    // ABI for the contract
    var abi = JSON.parse('[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor"}]');
    
    // Initialize the contract with ABI and address
    const contractInstance = new web3.eth.Contract(abi, '0x96F52Dc3AE7A1905C9533b859aDE1Cf53C9b94EF');

    // Function to read cookies
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Function to disable vote buttons
    function disableVotingButtons() {
        $('#vote1').addClass("disabled");
        $('#vote2').addClass("disabled");
        $('#vote3').addClass("disabled");
        $('#vote4').addClass("disabled");
    }function disable() {
        $('#vote1').addClass("disabled");
        $('#vote2').addClass("disabled");
        $('#vote3').addClass("disabled");
        $('#vote4').addClass("disabled");
    }

    // Check if the user has already voted
    function checkIfVoted() {
        var aadhaar = readCookie('aadhaar');
        if (!aadhaar) {
            console.error("Aadhaar number not found in cookies.");
            return;
        }

        // Make an API call to check if the user has voted based on their Aadhaar number
        $.ajax({
            url: '/check-vote-status',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ aadhaar: aadhaar }),
            success: function(response) {
                console.log("Vote status:", response);  // Handle success
                
                if (response.voted) {
                    disableVotingButtons();  // Disable all voting buttons if already voted
                    $('#loc_info').text('You have already voted!');
                } else {
                    $('#loc_info').text('You have not voted yet.');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", xhr.responseText);  // Handle error
            }
        });
    }

    // Check accounts
    web3.eth.getAccounts().then(function(accounts) {
        if (accounts.length === 0) {
            console.error("No accounts found. Please make sure your Ethereum client is running.");
            return;
        }
        
        var aadhaar_list = {
            "956813257894": "Prayagraj",
            "123456781234": "Bhandara"
        };

        var aadhaar = readCookie('aadhaar');
        var address = aadhaar_list[aadhaar];
        $('#loc_info').text('Location based on Aadhaar: ' + address);

        const senderAddress = accounts[0];  // Use the first account as sender

        // Disable voting if already voted
        checkIfVoted();

        // Handle logout
        $('#logout').click(function() {
            clearAllCookies();  // Clear all cookies in the browser
            window.location.href = '/logout-both';  // Redirect to backend logout route
        });

        function clearAllCookies() {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                if (name !== 'auth') {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
                }
            }
        }

        // Voting functions
        $('#vote1').click(function() {
            const candidateName = web3.utils.padLeft(web3.utils.asciiToHex('Sanat'), 64);
            contractInstance.methods.voteForCandidate(candidateName)
                .send({ from: senderAddress })
                .then(function() {
                    alert('Vote submitted to Sanat');
                    updateVoteStatus();
                    disable();
                    $('#loc_info').text('Vote submitted successfully to Sanat');
                })
                .catch(function(error) {
                    console.error("Error submitting vote: ", error);
                    alert('An error occurred while submitting the vote');
                });
        });
        $('#vote2').click(function() {
            const candidateName = web3.utils.padLeft(web3.utils.asciiToHex('Aniket'), 64);
            contractInstance.methods.voteForCandidate(candidateName)
                .send({ from: senderAddress })
                .then(function() {
                    alert('Vote submitted to Aniket');
                    updateVoteStatus();
                    disable();
                    $('#loc_info').text('Vote submitted successfully to Aniket');
                })
                .catch(function(error) {
                    console.error("Error submitting vote: ", error);
                    alert('An error occurred while submitting the vote');
                });
        });
        $('#vote3').click(function() {
            const candidateName = web3.utils.padLeft(web3.utils.asciiToHex('Mandar'), 64);
            contractInstance.methods.voteForCandidate(candidateName)
                .send({ from: senderAddress })
                .then(function() {
                    alert('Vote submitted to Mandar');
                    updateVoteStatus();
                    disable();
                    $('#loc_info').text('Vote submitted successfully to Mandar');
                })
                .catch(function(error) {
                    console.error("Error submitting vote: ", error);
                    alert('An error occurred while submitting the vote');
                });
        });
        $('#vote4').click(function() {
            const candidateName = web3.utils.padLeft(web3.utils.asciiToHex('Akshay'), 64);
            contractInstance.methods.voteForCandidate(candidateName)
                .send({ from: senderAddress })
                .then(function() {
                    alert('Vote submitted to Akshay');
                    updateVoteStatus();
                    disable();
                    $('#loc_info').text('Vote submitted successfully to Akshay');
                })
                .catch(function(error) {
                    console.error("Error submitting vote: ", error);
                    alert('An error occurred while submitting the vote');
                });
        });

        // Similarly for other vote buttons (vote2, vote3, vote4)
        // Implement voting logic for other candidates (Aniket, Mandar, Akshay)

        // Function to update the vote status in the database
        function updateVoteStatus() {
            var aadhaar = readCookie('aadhaar');
            $.ajax({
                url: '/update-vote-status',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ aadhaar: aadhaar }),
                success: function(response) {
                    console.log(response.success);  
                },
                error: function(xhr, status, error) {
                    console.error("Error updating vote status:", xhr.responseText);
                }
            });
        }
    });
});
