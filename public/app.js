
$.getJSON('/songs', function(data) {
  for (var i = 0; i<data.length; i++){
    $('#songs').append('<p data-id="' + data[i]._id + '">'+ '#' + data[i].position + '<br />' + data[i].title + '<br />' + data[i].artist + '<br />' + '<a href="' + data[i].link + '" target= _blank>' + data[i].link + '</a></p>');
  }
});

$(document).on('click', 'p', function(){
  $('#notes').empty();
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: "GET",
    url: "/songs/" + thisId,
  })
    .done(function( data ) {
      console.log(data);
      $('#notes').append('<h2>' + data.title + '</h2>'); 
      $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
      $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

      if(data.note){
        $('#bodyinput').val(data.note.body);
      }
    });
});

$(document).on('click', '#savenote', function(){
  var thisId = $(this).attr('data-id');
  $.ajax({
    method: "POST",
    url: "/songs/" + thisId,
    data: {
      body: $('#bodyinput').val()
    }
  })

    .done(function( data ) {
      console.log(data);
      $('#notes').empty();
    });

  $('#bodyinput').val("");
});
