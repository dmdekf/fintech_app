var request = require('request');
const express = require('express')
const app = express();
var mysql      = require('mysql');
var jwt = require('jsonwebtoken');
var auth = require('./lib/auth.js');
var cors = require('cors');


var tokenKey = 'f!i@n#t$e%c^h&t*o(k)))e@@nKey'
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port : 3307,
  user     : 'root',
  password : '0akeorkfl!',
  database : 'fintech'
});

connection.connect();
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.get('/', function (req, res) {
  res.render('index')
})

app.get('/join', function (req, res) {
  res.render('join')
})

app.get('/login', function (req, res) {
  res.render('login');
})

app.post('/join', function(req, res){
  console.log(req);
  var name = req.body.name;
  var birthday = new Date();
  var email = req.body.email;
  var password = req.body.password;
  var phone = "010999999999";
  var accessToken = req.body.accessToken;
  var refreshToken = req.body.refreshToken;
  var useseqnum = req.body.useseqnum;
  console.log(name, email, password);
  var sql = 'INSERT INTO `fintech`.`user` (`name`, `birthday`, `user_id`, `user_password`, `phone`, `accesstoken`, `refreshtoken`, `useseqnum`) VALUES (?,?,?,?,?,?,?,?);'
  connection.query(sql,[name, birthday, email, password, phone,accessToken,refreshToken,useseqnum], function (error, results) {
    if (error) throw error;  
    else {
        console.log(this.sql);
        res.json(1);
    }
  });
})

app.get('/ajaxTest',function(req, res){
  console.log('ajax call');
  var result = "hello";
  res.json(result);
})

app.get('/authResult',function(req, res){
  var auth_code = req.query.code
  var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token";
  var option = {
      method : "POST",
      url :getTokenUrl,
      headers : {
        
      },
      form : {
          code : auth_code,
          client_id : "l7xx6fc7801e1d23465f827b966915b4d293",
          client_secret : "383a28572a454f2e81585487de76913e",
          redirect_uri : "http://localhost:3000/authResult",
          grant_type : "authorization_code"
      }
  };
  request(option, function(err, response, body){
    if(err) throw err;
    else {
        console.log(body);
        var accessRequestResult = JSON.parse(body);
        console.log(accessRequestResult);
        res.render('resultChild', {data : accessRequestResult})
    }
})
  })

  app.post('/login', function(req, res){
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail, userPassword);

    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function (error, results) {
      if (error) throw error;
      else {
        console.log(results);
        if (userPassword == results[0].user_password){
          jwt.sign(
            {userName : results[0].name,
             userId : results[0].user_id
            },
            tokenKey,
            {
              expiresIn : '1d',
              issuer : 'fintech.admin',
              subject : 'user.login.info'
            },
            function(err, token){
              console.log("LOGIN 성공", new Date(), token)
              res.json(token)
            }
          )
        }
        else {
          res.json("등록정보가 없습니다");
        }
      }
    });

  })
  app.get('/ajaxTest',function(req, res){
    console.log('ajax call');
    var result = "hello";
    res.json(result);
})
  app.get('/tokenTest', auth, function(req, res) {
    console.log(req.decoded.userName);
  })
app.listen(3000)