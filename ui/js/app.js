function isNumberKey(evt){
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
  return true;
}

$('#verify_otp_model').hide();
$('#errorbox').hide();
var otp ='';
var phone_no ='';
// phone auth
function getPhoneNumber(aadhaar, callback) {
  $.ajax({
      url: '/get-phone-number',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ aadhaar: aadhaar }),
      success: function(response) {
          console.log("Phone number:", response.phone_no);
          callback(response.phone_no); // Pass the phone number to the callback
      },
      error: function(xhr, status, error) {
          console.error("Error fetching phone number:", xhr.responseText);
      }
  });
}

function usePhoneNumber(phone_no) {
  console.log("Using phone number:", phone_no);
  // Add logic to use the phone number here
}

// Example usage
getPhoneNumber('123456789012', function(phone_no) {
  usePhoneNumber(phone_no);
});


// Function to send OTP via Telegram bot
function sendTelegramOtp(phoneNumber, otp) {
  var botToken = '7394133284:AAHReU4_c5pv-ScTY_qvGWRSsXHv5uVbsNs'; // Replace with your bot token
  var chatId = getChatIdByPhoneNumber(phoneNumber); // Function to retrieve chatId from your database or mapping
  
  if (chatId) {
      var message = `Your OTP for authentication is: ||${otp}||`;
      $.ajax({
          url: `https://api.telegram.org/bot${botToken}/sendMessage`,
          method: "POST",
          data: {
              chat_id: chatId,
              text: message,
              parse_mode: 'MarkdownV2'
          },
          success: function(response) {
              console.log('OTP sent successfully via Telegram: ', response);
          },
          error: function(error) {
              console.error('Error sending OTP via Telegram: ', error);
          }
      });
  } else {
      console.log('Phone number not found in the database for Telegram chat ID mapping.');
  }
}

// Dummy function to map phone number to Telegram chat ID
function getChatIdByPhoneNumber(phoneNumber) {
  var chatIds = {
      "9664865082": "5870091292",  // Replace with actual phone number and corresponding Telegram chat ID
      "7903226437": "5092468370",  // Replace with actual phone number and corresponding Telegram chat ID
      "9517028139": "1396243725",
      "9415267141": "",
      
      // Add more mappings here
  };
  return chatIds[phoneNumber];
}

// OTP generation function (random 6-digit OTP)
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
}

// Function to handle sign-in submit
function onSignInSubmit() {
  // console.log('aaaaaa');
  window.signingIn = true;
  $('#errorbox').hide();
  var aadhaarNo = $('#aadhaar_no').val();
  
  // Call getPhoneNumber with a callback
  getPhoneNumber(aadhaarNo, function(phoneNumber) {
    if (!phoneNumber) {
      $('#errorbox').show();
      $('#error').text('Aadhaar number is not valid or registered');
      return;
    }
    
    otp = generateOtp(); // Generate OTP

    // Set cookie for Aadhaar number
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = 'aadhaar' + "=" + aadhaarNo + ";" + expires + ";path=/";

    $('#verifyc').text('Enter verification code sent to ' + phoneNumber);

    // Send OTP via Telegram
    sendTelegramOtp(phoneNumber, otp);

    $('#enter_aadhaarno').hide();
    $('#verify_otp_model').show();
  });
}

$(verifyotp).click(function() {
  var code = String($('#verify_otp').val());
  otp = String(otp)
  if (code === otp) {
      // User signed in successfully.
      var user = { uid: 'dummy-user-uid' }; // Simulate user object
      // console.log(user.uid);
      var d = new Date();
      d.setTime(d.getTime() + (1*24*60*60*1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = 'show' + "=" + user.uid + ";" + expires + ";path=/";
      window.location = '/info';
  } else {
      // User couldn't sign in (bad verification code)
      $('#errorbox').show();
      $('#error').text('Enter valid OTP');
  }
});
$(getotp).click(function() {
  
  if ($('#aadhaar_no').val() == "") {
    $('#errorbox').show();
    $('#error').text('Please Enter Aadhaar No');
  } else {
    var enteredAadhaar = $('#aadhaar_no').val();
    
    // Call getPhoneNumber with a callback function
    getPhoneNumber(enteredAadhaar, function(phone_no) {
      if (!phone_no) {
        $('#errorbox').show();
        $('#error').text('Aadhaar number is not valid or registered');
      } else {
        onSignInSubmit();
        $('#errorbox').hide();
      }
    });
  }
});
