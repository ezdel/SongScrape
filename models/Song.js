
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

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
  note: {
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }
});

var Song = mongoose.model('Song', SongSchema);

module.exports = Song;