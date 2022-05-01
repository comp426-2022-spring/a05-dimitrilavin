// Place your server entry point code here
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
args['port'];
args['help'];
args['debug'];
args['log'];

const help = `server.js [options]
        --port	Set the port number for the server to listen on. Must be an integer between 1 and 65535.
        --debug	If set to \`true\`, creates endpoints /app/log/access/ which returns
                    a JSON access log from the database and /app/error which throws 
                    an error with the message \"Error test successful.\" Defaults to 
                    \`false\`.
        --log		If set to false, no log files are written. Defaults to true.
                    Logs are always written to database.
        --help	Return this message and exit.`;

if(args.help||args.h){
    console.log(help);
    process.exit(0);
}

const logdb  = require("./src/services/database.js");
const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

const port = args.port ||process.env.port|| 5555;

const server = app.listen(port, () => {
    console.log(`App is running on port %PORT%`.replace(`%PORT%`,port));
     })

if(args.log==true){
const WRITESTREAM = fs.createWriteStream('./data/log/access.log', { flags: 'a' });
app.use(morgan('combined', { stream: WRITESTREAM }));
}

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    };

    const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent);
    next();
    })

if(args.debug){

    app.get("/app/log/access", (req, res) =>{
        try{
            const logs = logdb.prepare('SELECT * FROM accesslog').all();
            res.status(200).json(logs);
        } catch(e){
            console.error(e);
        }
    });

    app.get("/app/error", (req, res) => {
        throw new Error('Error Test Successful');
    });

}

 app.get("/app", (req, res) =>{
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage);
})  

app.get("/app/flips/:number", (req, res) =>{
    let flipsArr = coinFlips(req.params.number);
    res.status(200).json({ "raw" : flipsArr , "summary": countFlips(flipsArr)});
    res.type("text/plain");
})  

app.get("/app/flip/call/heads", (req, res) =>{
    let result = flipACoin("heads");
    res.status(200).json({"call" : result.call, "flip" : result.flip, "result" : result.result});
    res.type("text/plain");
})

app.get("/app/flip/call/tails", (req, res) =>{
    let result = flipACoin("tails");
    res.status(200).json({"call" : result.call, "flip" : result.flip, "result" : result.result});
    res.type("text/plain");
})

app.get("/app/flip", (req, res) =>{
    res.status(200).json({ "flip" : coinFlip() });
    res.type("text/plain");
})

 app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND');
    res.type("text/plain");
 })



 /** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

function coinFlip() {
    if(Math.random() < 0.5){
      return 'heads'
    }
    else{
      return 'tails'
    }
    }
    
    /** Multiple coin flips
     * 
     * Write a function that accepts one parameter (number of flips) and returns an array of 
     * resulting "heads" or "tails".
     * 
     * @param {number} flips 
     * @returns {string[]} results
     * 
     * example: coinFlips(10)
     * returns:
     *  [
          'heads', 'heads',
          'heads', 'tails',
          'heads', 'tails',
          'tails', 'heads',
          'tails', 'heads'
        ]
     */
    
    function coinFlips(flips) {
      const flipArr = []
      for(let i = 0; i<flips; i++){
        flipArr[i] = coinFlip()
      }
      return flipArr
    }
    
    /** Count multiple flips
     * 
     * Write a function that accepts an array consisting of "heads" or "tails" 
     * (e.g. the results of your `coinFlips()` function) and counts each, returning 
     * an object containing the number of each.
     * 
     * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
     * { tails: 5, heads: 5 }
     * 
     * @param {string[]} array 
     * @returns {{ heads: number, tails: number }}
     */
    
    function countFlips(array) {
      let heads = 0
      let tails = 0
      let countObject
      for(let i = 0; i<array.length; i++){
        if(array[i]==='heads'){
          heads++
        }
        else{
          tails++
        }
      }
      if(heads>0 && tails>0){
          countObject = {heads: heads, tails: tails}
      }
      else if(tails==0){
           countObject = {heads: heads}
      }
      else{
          countObject = {tails: tails}
      }
      return countObject
    }
    
    /** Flip a coin!
     * 
     * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
     * 
     * @param {string} call 
     * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
     * 
     * example: flipACoin('tails')
     * returns: { call: 'tails', flip: 'heads', result: 'lose' }
     */
    
    function flipACoin(call) {
    let flipObject = {call: call, flip: coinFlip(), result: ''}
    if(flipObject.call === flipObject.flip){
      flipObject.result = 'win'
    } 
    else{
      flipObject.result = 'lose'
    }
    return flipObject
    }