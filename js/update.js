
var url = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1HnLZh1hUuR6JKw0xwVtC4_a4o0ixREQf9EqN1LSy2D8/pub%3Fgid%3D137269997%26single%3Dtrue%26output%3Dcsv&force=1';

$.ajax(url, {
      success: function(data) {
         $('#status').text('Updated');
      },
      error: function(e,err) {
         $('#status').text('Error');
         console.log(e);
         console.log(err);
      }
   });