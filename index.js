var request = require('request');
const express = require('express')
const app = express();
var mysql      = require('mysql');
var jwt = require('jsonwebtoken');
var auth = require('./lib/auth');
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
  var userseqnum = req.body.userseqnum;
  console.log(name, email, password);
  var sql = 'INSERT INTO `fintech`.`user` (`name`, `birthday`, `user_id`, `user_password`, `phone`, `accesstoken`, `refreshtoken`, `userseqnum`) VALUES (?,?,?,?,?,?,?,?);'
  connection.query(sql,[name, birthday, email, password, phone,accessToken,refreshToken,userseqnum], function (error, results) {
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

  app.post('/login', function (req, res) {
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail, userPassword);

    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function (error, results) {
      if (error) throw error;  
      else {

        console.log(userPassword, results[0].user_password);
        if(userPassword == results[0].user_password){
            jwt.sign(
                {
                    userName : results[0].name,
                    userId : results[0].user_id
                },
                tokenKey,
                {
                    expiresIn : '1d',
                    issuer : 'fintech.admin',
                    subject : 'user.login.info'
                },
                function(err, token){
                    console.log('로그인 성공', token)
                    res.json(token)
                }
            )            
        }
        else {
            res.json('등록정보가 없습니다');
        }
      }
    });
})

app.get('/ajaxTest',function(req, res){
  console.log('ajax call');
  var result = "hello";
  res.json(result);
})

app.get('/main', function(req, res){
  res.render('main')
})

app.post('/getUser', auth, function(req, res){
  var userId = req.decoded.userId;
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          var option = {
              method : "GET",
              url :'https://testapi.open-platform.or.kr/user/me?user_seq_no='+ result[0].userseqnum,
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken
              }
          };
          request(option, function(err, response, body){
              if(err) throw err;
              else {
                  console.log(body);
                  res.json(JSON.parse(body));
              }
          })
      }
  })
})

app.get('/tokenTest', auth, function(req, res) {
  console.log(req.decoded);
  var auth_fintechnum = req.query.fintech_num
})


app.post('/transaction_list', auth, function(req,res){
  var userId = req.decoded.userId;
  var finNum = req.body.finNum;
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "GET",
              url :'https://testapi.open-platform.or.kr/v1.0/account/transaction_list?'+
              'fintech_use_num='+finNum+'&'+
              'inquiry_type=A&'+
              'from_date=20160101&'+
              'to_date=20160101&'+
              'sort_order=D&'+
              'page_index=1&'+
              'tran_dtime=20160101121212&',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken
              }
          };
          request(option, function(err, response, body){
              if(err) throw err;
              else {
                  console.log(body);
                  res.json(JSON.parse(body));
              }
          })
      }
  })
})

app.get('/balance', function(req, res){
  res.render('balance');
})

app.get('/qr', function(req, res){
  res.render('qr');
})

app.get('/withdraw', function(req, res){
  res.render('withdraw');
})

app.post('/withdrawqr', auth, function(req,res){
  var userId = req.decoded.userId;
  var qrfin = req.body.qrFin;
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "POST",
              url :'https://testapi.open-platform.or.kr/transfer/withdraw',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken,
                  'Content-Type' : 'application/json; charset=UTF-8'
              },
              json : {
                dps_print_content : '나윤지',
                fintech_use_num : qrfin,
                tran_amt : 1000,
                print_content : '나윤지',
                tran_dtime : '20190523101921'
            }
          };
          request(option, function(err, response, body){
            if(err) throw err;
            else {
                if(body.rsp_code == "A0000"){
                    res.json(1);
                }
                else {
                    res.json(2);
                }
            }
        })
    }
})
})

app.post('/withdraw', auth, function(req,res){
  var userId = req.decoded.userId;
  var finNum = '199004740057725675133435';
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "POST",
              url :'https://testapi.open-platform.or.kr/transfer/withdraw',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken,
                  'Content-Type' : 'application/json; charset=UTF-8'
              },
              json : {
                dps_print_content : '나윤지',
                fintech_use_num : finNum,
                tran_amt : 1000,
                print_content : '나윤지',
                tran_dtime : '20190523101921'
            }
          };
          request(option, function(err, response, body){
            if(err) throw err;
            else {
                console.log(body);
                console.log(userId);
                var requestResult = body
                console.log(requestResult.tran_amt);
                if(requestResult.rsp_code == "A0000"){
                    var sql = "UPDATE user set point = point + ? WHERE user_id = ?"
                    connection.query(sql, [Number(requestResult.tran_amt), userId], function(err, result){
                        if(err){
                            console.error(err);
                            throw err;
                            
                        }
                        else {
                            res.json(1);
                        }
                    })
                }
            }
        })
    }
})
})

app.post('/balance', auth, function(req,res){
  var userId = req.decoded.userId;
  var finNum = req.body.finNum;
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "GET",
              url :'https://testapi.open-platform.or.kr/v1.0/account/balance?fintech_use_num='+finNum+'&tran_dtime=20190523101921',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken
              }
          };
          request(option, function(err, response, body){
              if(err) throw err;
              else {
                  console.log(body);
                  res.json(JSON.parse(body));
              }
          })
      }
  })
})

app.get('/authResult2',function(req, res){
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
          scope: "oob",
          grant_type : " client_credentials"
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
  
app.post('/deposit', auth, function(req,res){
  var userId = req.decoded.userId;
  var finNum = '199004740057725675133435';
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "POST",
              url :' https://testapi.open-platform.or.kr/v1.0/transfer/deposit',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken,
                  'Content-Type' : 'application/json; charset=UTF-8',
                  //  scope : 'oob'
              },
              json : {
                wd_pass_phrase : 'NONE',
                wd_print_content: '나윤지',
                name_check_option : 'on',
                req_cnt : '25',
                req_list : [{
                  tran_no : '1',
                  fintech_use_num : finNum,
                  print_content : '나윤지',
                  tran_amt : 1000
                }]
                ,
                tran_dtime : '20190523101921'
            }
          };
          request(option, function(err, response, body){
            if(err) throw err;
            else {
                console.log(body);
                console.log(userId);
                var requestResult = body
                console.log(requestResult.tran_amt);
                if(requestResult.rsp_code == "A0000"){
                    var sql = "UPDATE user set point = point - ? WHERE user_id = ?"
                    connection.query(sql, [Number(requestResult.tran_amt), userId], function(err, result){
                        if(err){
                            console.error(err);
                            throw err;
                            
                        }
                        else {
                            res.json(1);
                        }
                    })
                }
            }
        })
    }
})
})

app.post('/real_name', auth, function(req,res){
  var userId = req.decoded.userId;
  var finNum = '199004740057725675133435';
  var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
  connection.query(sql,[userId], function(err, result){
      if(err){
          console.error(err);
          throw err;
      }
      else {
          console.log(result[0].accessToken);
          var option = {
              method : "POST",
              url :' https://testapi.open-platform.or.kr/v1.0/inquiry/real_name',
              headers : {
                  'Authorization' : 'Bearer ' + result[0].accessToken,
                  'Content-Type' : 'application/json; charset=UTF-8',
                  'scope' : 'oob'
              },
              json : {
                bank_code_std : '090',
                account_num : '123456123456',
                account_holder_info_type : ' ',
                account_holder_info : '900929',
                tran_dtime : '20190523101921'
            }
          };
          request(option, function(err, response, body){
            if(err) throw err;
            else {
                console.log(body);
                // console.log(userId);
                // var requestResult = body
                // console.log(requestResult.tran_amt);
                // if(requestResult.rsp_code == "A0000"){
                //     var sql = "UPDATE user set point = point + ? WHERE user_id = ?"
                //     connection.query(sql, [Number(requestResult.tran_amt), userId], function(err, result){
                //         if(err){
                //             console.error(err);
                //             throw err;
                            
                //         }
                //         else {
                //             res.json(1);
                //         }
                //     })
                // }
            }
        })
    }
})
})

app.listen(3000)