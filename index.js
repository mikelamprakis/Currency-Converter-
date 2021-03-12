
//------------GETTING THE DATA OF THE MOST RECENT DATE FOR THE CONVERTER-------------//
let path = "./eurofxref.csv";

function loadCSV(path) { 
  let result = null;
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      result = this.responseText;
    }
  };
  xhttp.open("GET", path, false);
  xhttp.send();
  return result;
}

var csv = loadCSV(path);
console.log(csv);

//-----------------CREATING JSON OBJECT WITH CURRENCIES / RATES -----------------//
var result = [];
var historyDate = [];
//var csv is the CSV file with headers
function csvJSON(csv){
    var lines=csv.split("\n");
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    
    return JSON.stringify(result); //JSON
  }

//-------------------------CREATING DROP-DOWN MENU FOR THE CONVERTER -----------//
csvJSON(csv)
console.log(result[0]);
var dataObject = result[0];
var _selectTo = document.getElementById("optionsConversionTo");
var _selectFrom = document.getElementById("optionsConversionFrom");
_selectTo.options[0] = new Option("EUR", 1);
_selectFrom.options[0] = new Option("EUR", 1);
for (var key in dataObject) {
        if (key == "Date"){
            // console.log("Date was found");
        } else {
            var item = dataObject[key];
        // console.log(item);
        _selectTo.options[_selectTo.options.length] = new Option(key, item);
        _selectFrom.options[_selectFrom.options.length] = new Option(key, item);
        }
}




//--------------------GETTING THE AVERAGES OF LAST 90 DAYS -----------------//
var value;  
var x;
let historicalPath = "./eurofxref-hist.csv";
var historicalCsv = loadCSV(historicalPath);
//Get the 90 day average for each currency
function getAverageFromHistoricalData(csvData, currencyNameFrom, currencyNameTo){
    var cNameFrom = currencyNameFrom.replace(/\s+/g, '');
    var cNameTo = currencyNameTo.replace(/\s+/g, '');
    
    
    //---create allData 2D Array list of dayLists--//
    var lines=csvData.split("\n");
    var currencies = lines[0].split(",");
    var alldata=[];
    for (var i=0; i<lines.length; i++){
        var arrayLine = lines[i].split(",");
        alldata.push(arrayLine);
    }
    //console.log(alldata);    
    //---create arr 2D Array list of CurrencyLists--//
    var arr = Array.from(Array(currencies.length), () => new Array(lines.length));
    for (var i=0; i<lines.length; i++){
        for (var z=0; z<currencies.length; z++){
            arr[z][i] = parseFloat(alldata[i][z]);
        }    
    }
    //---GETTING THE AVERAGES---//
    var avg = {};
    for (var z=0; z<currencies.length; z++){
        var sum = 0;
        for (var i=1; i<91; i++){
            sum += arr[z][i];
        }
        avg[currencies[z]] = (sum/90).toFixed(4);
    }
    avg["EUR"] = 1;

    console.log(cNameFrom);
    console.log(avg[cNameFrom]);
    console.log(cNameTo);
    console.log(avg[cNameTo]);
    document.getElementById("averageValueIdFrom").innerHTML =  cNameFrom + " " + avg[cNameFrom] ;
    document.getElementById("averageValueIdTo").innerHTML =  cNameTo + " " + avg[cNameTo] ;

  //return avg[cName];
}


//---------------------- GET LIST OF CURRENCIES SORTED ACCORDING TO STRENGTH--------------------//

//Create an object with Curency/Rates of the most recent date
//obj is an dictionary oblect with key/values as properties
function getCurrentRates(csv){
    var lines=csv.split("\n");
    var headers=lines[0].split(",");
    for(var i=1;i<2;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = parseFloat(currentline[j]);  
        }
    }
    for (var key in obj){
        if (Number.isNaN(obj[key])|| key =='Date'){
           delete obj[key];
        }
    }
    //console.log( obj);
    return obj;
}
//getCurrentRates(csvData);


// Create items array
//items is an array object with subarrays as properties that include key/values
function getItemsArrayObject(csv){
    var items = Object.keys(getCurrentRates(csv)).map(function(key) {
    return [key, getCurrentRates(csv)[key]];
    });
    //console.log(items);
    return items;
}
// Sort the array based on the second element from the strongest to the weekest
function getSortedRates(csv){
    var sortedRates = getItemsArrayObject(csv).sort(function(first, second) {
    return  first[1] - second[1];
    });
   console.log("sorted rates: ", sortedRates);
    return sortedRates;
}


// ---- INTERGRATING THE LIST WITH HTML ---------//
var sorted = getSortedRates( historicalCsv);

function createList(data, list, index){
    for (var i=0; i<data.length; i++){
        var listElement = document.createElement('li');
        listElement.appendChild(document.createTextNode(data[i][index]));
        list.appendChild(listElement);
    }
}
let sortedList = document.getElementById('sortedList');
createList(sorted, sortedList,0);
let sortedList2 = document.getElementById('sortedList2');
createList(sorted, sortedList2, 1);

//-------------------------------------GET THE CURRENCIES STRINGER THAN EURO-------------------------//

// Get the currencies stronger than Euro
function getStringerThanEuro(csv){
    var strongerThanEuro = []; 
    var list = getSortedRates(csv)
    for (var currency in list){ 
        //console.log(list[currency][1]);
        if (list[currency][1]<1){
            // THIS WAS NOT FIT FOR PURPOSE, arrays cannot have key / value pair only objects 
            // strongerThanEuro[list[currency][1]] = list[currency][0];
            // changed to push value into array, so we can map over them or render as below 
            strongerThanEuro.push(list[currency][0]);
        }
    }
    console.log(strongerThanEuro);
    document.getElementById("currencyStrongerThanEuro").innerHTML = strongerThanEuro

    return strongerThanEuro;
}
getStringerThanEuro(historicalCsv); 


//---------------------- CREATING THE CONVERT BUTTON -----------------------//

function handleClick() {
    
    value = document.getElementById("value").value;
    var valAsNum = parseFloat(value)
    console.log(valAsNum);

    to = document.getElementById("optionsConversionTo").selectedIndex;
    from = document.getElementById("optionsConversionFrom").selectedIndex;

    let fromName = document.getElementsByTagName("option")[from].text;
    let toName = document.getElementsByTagName("option")[to].text;

    var optionValTo = parseFloat(document.getElementsByTagName("option")[to].value)
    var optionValFrom = parseFloat(document.getElementsByTagName("option")[from].value)
    console.log(document.getElementsByTagName("option")[from].text);
    console.log(document.getElementsByTagName("option")[to].text);
    console.log(typeof optionValTo);

    var valueInBaseCurrency = (valAsNum / optionValFrom * optionValTo).toFixed(2)
    
    console.log("value is: "+ (valAsNum / optionValFrom * optionValTo));

    document.getElementById("calcValue").innerHTML = valueInBaseCurrency;
    
    document.getElementById("labelCurFrom").style.display = 'inline';
    document.getElementById("curRateFrom").innerHTML = fromName + " " + optionValFrom;

    document.getElementById("labelCurTo").style.display = 'inline';
    document.getElementById("curRateTo").innerHTML = toName + " " + optionValTo;
    
    getAverageFromHistoricalData(historicalCsv, fromName ,toName);
    
    getSortedRates(historicalCsv);

}


//--------------------------------- CREATING CHARTS ------------------------------------ //

// delete the date property and value
delete dataObject.Date
//sort data strongest to weakest
var dataLabels1 = Object.entries(dataObject).sort((a,b) => a[1]-b[1]);
//creates array of currency names 
var arrayOfLabels = Object.entries(dataObject).sort((a,b) => a[1]-b[1]).map(el=>el[0])
arrayOfLabels.shift();
//gets top 10 as already sorted
var arrayOf10labels = arrayOfLabels.slice(0, 10)

var arrayOfDataLabels = Object.entries(dataObject).sort((a,b) => a[1]-b[1]).map(el=>el[1])
arrayOfDataLabels.shift()
var arrayOf10DataLabels = arrayOfDataLabels.slice(0,10)

console.log(arrayOf10DataLabels);

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: arrayOf10labels,
        datasets: [{
            label: 'Top 10 Strongest Currencies vs Euro',
            data: arrayOf10DataLabels,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

delete dataObject.Date
//sort data strongest to weakest
var dataLabelsDesc = Object.entries(dataObject).sort((a,b) => a[1]-b[1]);
//creates array of currency names 
var arrayOfLabelsDesc = Object.entries(dataObject).sort((a,b) => b[1]-a[1]).map(el=>el[0])
//gets bottom 10 as already sorted
arrayOfLabelsDesc.shift()
arrayOfLabelsDesc.shift()

var arrayOf10labelsDesc = arrayOfLabelsDesc.slice(0, 10)

var arrayOfDataLabelsDesc = Object.entries(dataObject).sort((a,b) => b[1]-a[1]).map(el=>el[1])
//gets bottom 10 values as already sorted
arrayOfDataLabelsDesc.shift();
arrayOfDataLabelsDesc.shift();

console.log(arrayOfDataLabelsDesc);

var arrayOf10DataLabelsDesc = arrayOfDataLabelsDesc.slice(0,10)

var ctx1 = document.getElementById('WeakChart').getContext('2d');
var myChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: arrayOf10labelsDesc,
        datasets: [{
            label: 'Top 10 Weakest Currencies vs Euro                       * top 2 weakest removed and displayed above',
            data: arrayOf10DataLabelsDesc,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

delete dataObject.Date
//sort data strongest to weakest
var dataLabelsDesc = Object.entries(dataObject).sort((a,b) => a[1]-b[1]);

//creates array of currency names 
var arrayOf2LabelsDesc = Object.entries(dataObject).sort((a,b) => b[1]-a[1]).map(el=>el[0])
//gets bottom 10 as already sorted
var arrayOf2labelsDesc = arrayOf2LabelsDesc.slice(0, 2)

var arrayOf2DataLabelsDesc = Object.entries(dataObject).sort((a,b) => b[1]-a[1]).map(el=>el[1])
//gets bottom 10 values as already sorted
var arrayOf2DataLabelsDesc = arrayOf2DataLabelsDesc.slice(0,2)

var ctx2 = document.getElementById('WeakestChart').getContext('2d');
var myChart = new Chart(ctx2, {
    type: 'horizontalBar',
    data: {
        labels: arrayOf2labelsDesc,
        datasets: [{
            label: 'Top 2 Weakest Currencies vs Euro',
            data: arrayOf2DataLabelsDesc,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

