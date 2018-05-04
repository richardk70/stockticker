// the API call: https://api.iextrading.com/1.0/tops/?symbols=ANET

const ticker = document.getElementById('ticker');
const checks = document.getElementById('checks');

const quotes = [
    {
        symbol: 'AAPL',
        change: '+.025' },
    {
        symbol: 'FB',
        change: '-.01' },
    {
        symbol: 'IBM',
        change: '-.013' },
    {
        symbol: 'OKTA',
        change: '+.012' },
    {
        symbol: 'SDS',
        change: '-.02' }
    ];

let delay = 10; // affects scroll speed AND spacing between quote and change

// outputs 10 ten times :( after the delay
/*
for (var i = 0; i < 10; i++){
    setTimeout(() => {
        console.log(i);
    }, 500);
}
*/

// using a closure, outputs 0 - 9 with no delay after the initial one
/*
for (var i = 0; i < 10; i++){
    ( ()=>{
    const inner_i = i;
    setTimeout( () => {
        console.log(inner_i);
    }, 500);
})();
}
*/

// but we want to put the quotes out slowly
var i = -1;
const len = quotes.length;

function initShift(){
    i += 1;
    shiftLeft(quotes[i]);
    if (i < len-1)
        setTimeout(initShift, delay * (40 * len)); // recursion after a delay
    // repeat the series
    if (i == len-1){
        i = -1;
        setTimeout(initShift, delay * (50 * len));
    }
}

initShift();

let leftEdge = 0, rightEdge = 0;
let tickerScreenLeftEdge = ticker.offsetLeft;
let tickerScreenRightEdge = ticker.offsetLeft + ticker.offsetWidth;

function shiftLeft(el){
    let quoteSpan = document.createElement('SPAN');
    let changeSpan = document.createElement('SPAN');
    let quoteTxt = document.createTextNode(el.symbol);
    let changeTxt = document.createTextNode(' ' + el.change);
    quoteSpan.appendChild(quoteTxt);
    changeSpan.appendChild(changeTxt);
    quoteSpan.className = 'quote';
    if (eval(el.change) > 0)
        changeSpan.className = 'up';
    else
        changeSpan.className = 'down';
    quoteSpan.appendChild(changeSpan);
    ticker.appendChild(quoteSpan);

    setInterval( () => {
        leftEdge = quoteSpan.offsetLeft;
        rightEdge = quoteSpan.offsetLeft + quoteSpan.offsetWidth;
        quoteSpan.style.left = leftEdge - 1 + 'px';
        // remove the SPAN element
        if (rightEdge < 0){
            ticker.removeChild(quoteSpan);
        }
    }, delay);
}

function createChecks(){
    for (var i = 0; i < quotes.length; i++){
        let checkSpan = document.createElement('SPAN');
        checkSpan.className = 'scale2 row';
        let checkBox = document.createElement('INPUT');
        checkBox.type = 'checkbox';
        checkBox.name = 'name';
        checkBox.checked = true;
        let label = document.createElement('label');
        label.className = 'scale1 bumpUp';
        label.appendChild(document.createTextNode(quotes[i].symbol));
        checkSpan.appendChild(checkBox);
        checkSpan.appendChild(label);
        checks.appendChild(checkSpan);        
    }
}

const up = '\uf062';
const down = '\uf063';

createChecks();
