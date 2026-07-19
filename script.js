const digitElement = document.getElementById("digit");

let counts = {
  0:0,1:0,2:0,3:0,4:0,
  5:0,6:0,7:0,8:0,9:0
};

function analyzeDigit(digit){

    digitElement.textContent = digit;

    counts[digit]++;

    for(let i=0;i<=9;i++){
        document.getElementById("d"+i).textContent = counts[i];
    }

}
