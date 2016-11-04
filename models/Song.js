// require mongoose
var mongoose = require('mongoose');
// create Schema class
var Schema = mongoose.Schema;

// Create article schema
var SongSchema = new Schema({
  position: {
    type:String,
    required:true
  },
  title: {
    type:String,
    required:true
  },
  artist: {
    type:String,
    required:true
  },
  link: {
    type:String,
    required:true
  },
  // this only saves one note's ObjectId. ref refers to the Note model.
  note: {
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }
});

// Create the Song model with the SongSchema
var Song = mongoose.model('Song', SongSchema);

// export the model
module.exports = Song;