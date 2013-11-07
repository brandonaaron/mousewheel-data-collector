var express = require('express');
var app = express();
var stylus = require('stylus');
var nib = require('nib');
var useragent = require('useragent');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/mousewheeldatacollector');

var Schema = mongoose.Schema;

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.compress());
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
app.use(express.static(__dirname + '/public'));

app.configure('development', function() {
  app.use(express.logger('dev'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
}

var CollectorSchema = new Schema({
  useragent: {
    family: String,
    major: String,
    minor: String,
    patch: String,
    device: {
      family: String
    },
    os: {
      family: String,
      major: String,
      minor: String,
      patch: String
    }
  },
  delta: {
    resolution: Number,
    normalized: {
      min: Number,
      max: Number
    },
    raw: {
      min: Number,
      max: Number
    }
  }
});
var Collector = mongoose.model('Collector', CollectorSchema);

app.get('/', function(req, res) {
  var agent = useragent.parse(req.headers['user-agent']);
  Collector.find().sort('-_id').limit(15).exec(function(err, docs) {
    if (err) res.send(500);
    else res.render('home', { agent: agent, records: docs });
  });
});

app.post('/', function(req, res) {
  var collector = new Collector(req.body);
  collector.save(function(err) {
    if (err) res.send(431)
    else res.send(204)
  });
});

app.listen(process.env.PORT || 8080);
