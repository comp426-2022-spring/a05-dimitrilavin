// Focus div based on nav button click
const home = document.getElementById("homenav");
home.addEventListener("click", clickHome);
function clickHome(){
    document.getElementById("home").className = "active";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}
const single = document.getElementById("singlenav");
single.addEventListener("click", clickSingle);
function clickSingle(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "active";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

const multi = document.getElementById("multinav");
multi.addEventListener("click", clickMulti);
function clickMulti(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "active";
    document.getElementById("guess").className = "hidden";
}

const guess = document.getElementById("guessnav");
guess.addEventListener("click", clickGuess);
function clickGuess(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "active";
}

// Flip one coin and show coin image to match result when button clicked
const coin = document.getElementById("coin");
coin.addEventListener("click", flipCoin);
function flipCoin(){
    const endpoint = "app/flip/";
    const url = document.baseURI+endpoint;
    fetch(url).then(response=>{
            return response.json();
        }).then(function(result){
            console.log(result);
            document.getElementById("result").innerHTML = result.flip;
            document.getElementById("singleFlip").setAttribute("src","assets/img/"+result.flip+".png");  
        });
}
// Flip multiple coins and show coin images in table as well as summary results
const coins = document.getElementById("coins")
coins.addEventListener("submit", flipCoins)
async function flipCoins(event) {
    event.preventDefault();
    
    const endpoint = "app/flip/coins/";
    const url = document.baseURI+endpoint;
    const formEvent = event.currentTarget;

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });
        const heads = flips.summary.heads||0;
        const tails = flips.summary.tails||0;
        console.log(flips);
        document.getElementById("heads").innerHTML = "Heads: "+heads;
        document.getElementById("tails").innerHTML = "Tails: "+tails;
        document.getElementById("coinlist").innerHTML = coinArray(flips.raw);
    } catch (error) {
        console.log(error);
    }
}

async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}

// Enter number and press button to activate coin flip series



// Guess a flip by clicking either heads or tails button
const tailsCall = document.getElementById("tailsCall")
tailsCall.addEventListener("click", callTails)
async function callTails() {
    const endpoint = "app/flip/call/"
    const url = document.baseURI+endpoint
    const call = "tails"
    try{
        const result = await sendCall({url, call})
        console.log(result)
        updateResults(result)
    }catch(error){
        console.log(error)
    }
}

const headsCall = document.getElementById("headsCall")
headsCall.addEventListener("click", callHeads)
async function callHeads() {
    const endpoint = "app/flip/call/"
    const url = document.baseURI+endpoint
    const call = "heads"
    try{
        const result = await sendCall({url, call})
        console.log(result)
        updateResults(result)
    }catch(error){
        console.log(error)
    }

}

async function sendCall({url, call}) {
    const callJson = {"guess": call}
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callJson),
      }
    const response = await fetch(url, options);
    return response.json()
}

function updateResults(result) {
    const callResult = document.getElementById("callResult")
    callResult.src = "./assets/img/" + result.call + ".png"

    const flipResult = document.getElementById("flipResult")
    flipResult.src = "./assets/img/" + result.flip + ".png"

    const resultText = document.getElementById("resultText")
    resultText.innerText = result.result

}

function coinArray(array){
    let text = "";
    for(let i = 0; i<array.length; i++){
        text = text + '<li><img src="assets/img/'+array[i]+'.png" class="smallcoin"></li>';
    }
    return text;
}