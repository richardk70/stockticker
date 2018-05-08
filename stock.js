// single quote API call: https://api.iextrading.com/1.0/stock/LETTERS/quote
// multiple quote API call: https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,%20wfc&types=quote
const container = document.getElementsByClassName('container')[0];
const ticker = document.getElementById('ticker');
const checks = document.getElementById('checks');
const input = document.getElementsByTagName('INPUT')[0];
let quotesToRetrieve = ['DIA', 'SPY'];
let quotes = [];
let theData = [];
var timeout;

let j = 0;
setInterval( () => { 
    j++;
    if (j > 60){
        reset();
    }
}, 1000);

function Quote(symbol, change, name){
    this.symbol = symbol;
    this.change = change;
    this.name = name;
};

// positioning the 'cover' elements
let leftEdge = 0, rightEdge = 0;
let tickerScreenLeftEdge = ticker.offsetLeft;
let tickerScreenRightEdge = ticker.offsetLeft + ticker.offsetWidth;
const right = document.getElementById('right');
const left = document.getElementById('left');
right.style.left = 388 + 'px';
right.style.top = 168 + 'px';
left.style.top = 168 + 'px';
left.style.left = 20 + 'px';

function reset(){
    // reset the timer
    j = 0;
    // reset the quotes array
    quotes.length = [];
    // reset any quotes already going across the screen
    ticker.innerHTML = `
    <div id="border"></div>
    <div id="bg"></div>
    `;
    //quoteIndex = -1;
    clearTimeout(timeout);
    // clear the display  
    processQuotes();
}

reset();

document.addEventListener('keydown', (e) => {
    if (e.keyCode == 13){
        let upper = input.value.toUpperCase();
        if (input.value.length > 0 && input.value.length <= 4 && !quotesToRetrieve.includes(upper)){
            quotesToRetrieve.push(input.value);
            input.value = "";
            reset();
        } else
            input.value = "";
    }
});

function processQuotes(){
    // empty out previous object
    quotes = [];
    let quoteString = "";
    for (var i = 0; i < quotesToRetrieve.length; i++){
        quotesToRetrieve[i] = quotesToRetrieve[i].toUpperCase();
        if (i == 0)
            quoteString += quotesToRetrieve[i];
        else
            quoteString += ',' + quotesToRetrieve[i];
    }
    
    let url = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=' + quoteString + '&types=quote';
    getQuoteData(url);
}

function getQuoteData(url){
    fetch(url)
        .then( (res) => {
            return res.json();
        })
        .then ( (data) => {
            theData = Object.values(data);
            for (var i = 0; i < theData.length; i++){
                let rounded = (theData[i].quote.changePercent*100).toFixed(2);
                quotes.push(new Quote(theData[i].quote.symbol, rounded, theData[i].quote.companyName));
            }
            checks.innerHTML = "";
            createChecks();
            buildJoined();
        })
        .catch( (err) => {
            console.error('Error: ' + err);
        });
}

let delay = 20; // affects scroll speed, the higher the slower

// but we want to put the quotes out slowly

let quoteIndex = -1;
let joinedIndex = -1;

function buildJoined(){
    quoteIndex++;
    if (quoteIndex < quotes.length){    
        let symbol = quotes[quoteIndex].symbol.split('');
        let changeArr = quotes[quoteIndex].change.split('');

        if (eval(quotes[quoteIndex].change) > 0){
            // insert + sign before the array
            changeArr.splice(0, 0, '+');
        }

        let joined = symbol.concat(' ').concat(changeArr);
        initShift(joined);
    }
    if (quoteIndex == quotes.length){
        quoteIndex = -1;
        buildJoined();
    }
}

function initShift(joined){
    joinedIndex++;
    // send the char
    shiftLeft(joined[joinedIndex]);

    if (joinedIndex < joined.length - 1){
        // send the next char after a delay
        timeout = setTimeout( () => { 
            initShift(joined)
        }, delay * 15);
    }
    // check if reached end of 'joined' array
    if (joinedIndex == joined.length - 1){
        joinedIndex = -1;
        // have to build the next 'joined' array
        timeout = setTimeout( buildJoined, delay * 150);
    }
}

function shiftLeft(el){
    let quoteSpan = document.createElement('SPAN');
    let quoteTxt = document.createTextNode(el);
    quoteSpan.className = 'quote';

    if (el == '+')
        quoteSpan.classList.add('up');
    else if (el == '-')
        quoteSpan.classList.add('down');
    else
        quoteSpan.classList.add('yellow');

    quoteSpan.appendChild(quoteTxt);
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
        checkSpan.className = 'row spacing';
        let div1 = document.createElement('DIV');
        div1.className = 'scale2';
        let checkBox = document.createElement('INPUT');
        checkBox.type = 'checkbox';
        checkBox.id = quotes[i].symbol;
        checkBox.checked = false;
        div1.appendChild(checkBox);

        let div2txt = document.createTextNode(quotes[i].symbol);
        let div2 = document.createElement('SPAN');
        div2.className = 'inline';
        div2.appendChild(div2txt);
        div1.appendChild(div2);

        let div3txt = document.createTextNode(quotes[i].name);
        let div3 = document.createElement('DIV');
        div3.className = 'co-name';
        div3.appendChild(div3txt);

        checkSpan.appendChild(div1);
        checkSpan.appendChild(div3);
        checks.appendChild(checkSpan);
    }
    // deal with the height of the container
    let checkSpans = document.getElementsByClassName('spacing');
    let height = container.offsetHeight;
    if (checkSpans.length > 3 && checkSpans.length%3 == 1 ){
        console.log('before: ' + height);
        height += 70;
        console.log('after: ' + height);
        container.style.height = height + 'px';
    }

    // add the delete button
    let btn = document.createElement('BUTTON');
    btn.textContent = 'Delete';
    btn.id = 'delBtn';
    checks.appendChild(btn);

    let delBtn = document.getElementById('delBtn');
    delBtn.addEventListener('click', deleteSymbols );
}

function deleteSymbols(){
    //console.log('before: ' + quotesToRetrieve);
    quotesToRetrieve = [];
    quotes = [];
    // check the checkboxes
    const checkBoxes = checks.querySelectorAll('INPUT');
    checkBoxes.forEach(checkBox => {
        if (!checkBox.checked){
            quotesToRetrieve.push(checkBox.id);
            
        }
    });
    reset();

}
