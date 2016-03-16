/*
 * Script which forces update from HXL proxy server
 * and outputs the result of the data pull to the html page
 */

//

var url_1, url_2, url_3;

// URL for news data
url_1 = "https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1sMsoSq5Xi5tn3quhs7yUFLnPOpWGsrsPADFOzWHr0wk/pub%3Fgid%3D1722427520%26single%3Dtrue%26output%3Dcsv&force=1";
// URL for arrivals data
url_2 = "https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&force=1";
// URL for borders data
url_3 = "https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1aICxVKQCA1gzpBVZm1ExgzcSAjhnhAM-z4MhAtm1Oio/pub%3Fgid%3D621776132%26single%3Dtrue%26output%3Dcsv&force=1";


// JQuery function which pulls data from given urls
$.ajax(url_1, {
    success: function(data) {
    	// When data is accessed from first url...
      	$.ajax(url_2, {
      		// And from the second, change update status
		    success: function(data) {
		        $("#status").text("Updated");
		    },
		    // And if error occurs with data access, say so
		    error: function(e,err) {
		        $("#status").text("Error");
		        console.log(e);
		        console.log(err);
		    }
		});
    },
    // And if error occurs with data access, say so
    error: function(e,err) {
        $("#status").text("Error");
        console.log(e);
        console.log(err);
    }
});