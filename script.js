

document.querySelector('input[type="file"]').addEventListener('input', (e) => {
  if (e.target.files.length) {
    audio = new Audio(URL.createObjectURL(e.target.files[0]));
    sound = loadSound(URL.createObjectURL(e.target.files[0]));

    cnv.show()
    
    audio.play();
    setTimeout(function(){ 
      audio.pause();
      audio.currentTime = 0;
      }, 5000); 
  }
});

document.body.onkeydown = function(e){
/*AND STACK PEEK IS STOP OR EMPTY*/
  if (sound.isPlaying()){
    if(e.keyCode == 65 && (stack.length == 0 || stack[stack.length - 1].type == "STOP")){
        console.log("Num4 (start cut) was hit");
        stack.push({type:"START", timestamp: sound.currentTime(), amp:amplitude.getLevel()});
        console.log({type:"START", timestamp: sound.currentTime(), amp:amplitude.getLevel()});
        //background(color(0, 255, 0))
/*PUSH START OBJ WITH TIMESTAMP ONTO STACK*/
    }
/*AND STACK PEEK IS START*/
    if(e.keyCode == 68 && stack[stack.length - 1].type == "START"){
        console.log("Num6 (stop cut) was hit");
        /*ADD LENIENCY PROTOCOL BECAUSE THIS IS TOO DANG EXACT*/
        stack.push({type:"STOP", timestamp: sound.currentTime(), amp:amplitude.getLevel()});
        console.log({type:"STOP", timestamp: sound.currentTime(), amp:amplitude.getLevel()})
/*PUSH STOP OBJ WITH TIMESTAMP ONTO STACK*/
    }

    if(e.keyCode == 16 && stack.length > 0){
      if(stack[stack.length-1].type != "STOP"){
        stack.push({type:"STOP", timestamp: sound.currentTime(), amp:amplitude.getLevel()});
      }
      sound.stop();
      var btn = document.getElementById("createKeyButton");
      btn.hidden = "true"
      console.log("AMP HISTORY - UNFETTERED");
      console.log(ampHistory);

      //TODO: Do my stuff with the sound...

      for(let i = 0; i < stack.length; i++){
        if(stack[i].type == "START"){
          //stack.push({type:"START", timestamp: sound.currentTime(), amp:amplitude.getLevel()});
          cleanStack.push({type:"START", timestamp:roundDown(stack[i].timestamp)});
        }
        else if(stack[i].type == "STOP"){
          cleanStack.push({type:"STOP", timestamp:roundUp(stack[i].timestamp)});
        }
      }

      console.log(cleanStack);
      /*
          <textarea rows="10" cols="75" id="inputBox">
      Enter Your Input Here! Encrypted, Or Decrypted! It doesn't matter.
    </textarea>
    */
    cnv.hide();
    
    var textArea = document.createElement("TEXTAREA");
    textArea.id = "txtArea";
    textArea.rows = "10";
    textArea.cols = "75";
    

    

    var gPrompt = document.getElementById("gPrompt");
    gPrompt.textContent = "Step 2: Paste whatever text you want to be changed by the program (you'll select whether you want it \n encrypted/decrypted in the next step) \n and hit the \'Load To System\' Button."
    
    var uploadtxtbtn = document.createElement("BUTTON");
    uploadtxtbtn.id = "uploadtxtbtn";
    uploadtxtbtn.innerText = "Upload The Data";
    uploadtxtbtn.onclick = dofunc;

    var br = document.createElement("br");
    gPrompt.appendChild(br);

    gPrompt.appendChild(uploadtxtbtn);

    var br2 = document.createElement("br");

    gPrompt.appendChild(br2);

    gPrompt.appendChild(textArea);
 
    }
  }
}

function dofunc(){
  var textBox = document.getElementById("txtArea");
  console.log(textBox.value);
  console.log("AMAZING")
  data = textBox.value;
  textBox.hidden = "true";

  var uploadtxtbtn = document.getElementById("uploadtxtbtn");
  uploadtxtbtn.hidden = "true";

  var gPrompt = document.getElementById("gPrompt");
  gPrompt.textContent = "Step 3: Choose Whether You Want This Data To Be Encrypted Or Decrypted.";

  var br = document.createElement("br");
  gPrompt.appendChild(br);

  var encryptDataBtn = document.createElement("BUTTON");
  encryptDataBtn.textContent = "Encrypt!";
  encryptDataBtn.onclick = encrypt;

  var decryptDataBtn = document.createElement("BUTTON");
  decryptDataBtn.textContent = "Decrypt!";
  decryptDataBtn.onclick = decrypt;


  gPrompt.appendChild(encryptDataBtn);
  gPrompt.appendChild(decryptDataBtn);

  myloading();
}




function stepOne(){
  var gPrompt = document.getElementById("gPrompt");
  gPrompt.innerText = "Step 1: Click \'Create Key\' to play the song and select the song slices. \n \'A\' Starts a cut \n \'D\' Ends A Cut \n \'Left Shift\' generates the key.";
  var br = document.createElement("BR");
  gPrompt.appendChild(br);
  
  setTimeout(function(){
    var createKey = document.createElement("BUTTON");
    createKey.id = "createKeyButton";
    createKey.innerText = "Create Key";
    createKey.onclick = playMusic;
    gPrompt.appendChild(createKey); 
  }, 5000)
}

function setup() {
  fft = new p5.FFT();

  cnv = createCanvas(window.screen.availWidth,100);
  cnv.hide();

  amplitude = new p5.Amplitude();
}


function draw() {
  background(26,43,60);
  let dark = color(13, 81, 84);
  let medium = color(22, 162, 168);
  let light = color(31, 246, 255)
  

  if(amplitude.getLevel() != 0){
    stroke(255);
    var level = amplitude.getLevel();
    var ts = sound.currentTime();
    volHistory.push(level);
    ampHistory.push({vol:level, timestamp:ts/*.toFixed(4)*/});
    
    noFill();
    beginShape();
    stroke(255, 255, 255);
    for (let i = 0; i < volHistory.length; i++){
      var y = map(volHistory[i] * 5, 0, 2, height*(9/10), 0);
      vertex(i, y);
    }
    endShape();

    spec_amps = [];
    for(var x = 0; x < stack.length; x++){
      spec_amps.push(stack[x]["amp"]);
      //console.log(stack[x]["amp"]);
    }


    //The lines part
    for (let i = 0; i < spec_amps.length; i++){
      var spot = volHistory.indexOf(spec_amps[i])
      if(spot != -1){
        if(stack[i]["type"] == "START"){stroke(0, 255, 0)}
        if(stack[i]["type"] == "STOP"){stroke(255, 0, 0)}

        line(spot, 0, spot, cnv.height);
      }
    }

    if (volHistory.length>width){volHistory.splice(0,1);}
  }
}

function playMusic(){
  stack = [];
  volHistory = [];
  ampHistory = [];
  var btn = document.getElementById("createKeyButton");
  smooth(0);

  if (!sound.isPlaying() ){
    sound.play();
    btn.textContent = "Reset"
  } else {
    sound.stop();
    btn.textContent = "Create Key"
  }
}

function roundDown(number){
  return parseInt(number, 10);
}
function roundUp(number){
  return roundDown(number + 1);
}

function myloading(){
  for(let i = 0; i < ampHistory.length; i++){
    if(ampHistory[i].timestamp >= cleanStack[0].timestamp && ampHistory[i].timestamp <= cleanStack[1].timestamp){
      cleanHistory.push(ampHistory[i]);
    }
  }

  //console.log("\n\n\n\n ROOMBA SCKLOOMBA");
  //console.log(cleanHistory);



  for(let i = 0; i < cleanHistory.length; i++){
    if(!uniqueHistory.includes(cleanHistory[i].vol)){
      uniqueHistory.push(cleanHistory[i].vol);
    }
  }
  //console.log(uniqueHistory);

  //console.log(cleanHistory.length);
  //console.log(uniqueHistory.length);

  var acc_chars_length = validChars.length;
  counter = 0;
  counterTwo = 0;
  
  for(var i = 0; i < uniqueHistory.length; i++){
    normal_to_enc_dict[validChars[counter]] = 0;
    counter += 1;
    
    if(counter == acc_chars_length){
      counter = 0;
    }
  }

  //Creates the encryption of letter -> value
  for(var i = 0; i < uniqueHistory.length; i++){
    normal_to_enc_dict[validChars[counter]] += uniqueHistory[i];
    counter += 1;
  
    if(counter == acc_chars_length){
      counter = 0;
    }
  }
  console.log(normal_to_enc_dict);


  /* TEST CRAP
  var encrypted_string = "";
  for(const item of data){
    encrypted_string += normal_to_enc_dict[item];
    encrypted_string += "*";
  }
  console.log(encrypted_string);
  */


  //Creates Decryption of value -> character
  for(const character of validChars){
    enc_to_normal_dict[normal_to_enc_dict[character]] = character;
  }


  /*
  var testi = "";
  var encrypted_array = encrypted_string.split("*");
  encrypted_array.pop();
  for(const item of encrypted_array){
    testi += enc_to_normal_dict[item];
  }
  console.log(testi);
  */
}

function encrypt(){
  encryption_sequence = "";
  for(const character of data){
    encryption_sequence += normal_to_enc_dict[character];
    encryption_sequence += "*";
  }
  console.log(encryption_sequence);
  finish_string = encryption_sequence;

  showResults();
}

function decrypt(){
  encrypted_sequence = data;
  encrypted_array = encrypted_sequence.split("*");
  encrypted_array.pop();

  decrypted_data = "";
  for(const item of encrypted_array){
    decrypted_data += enc_to_normal_dict[item];
  }
  console.log(decrypted_data);
  finish_string = decrypted_data;

  showResults();
}

function showResults(){
  var gPrompt = document.getElementById("gPrompt");
  gPrompt.textContent = "This is the result of your key! \n\n";
  var resultBox = document.createElement("TEXTAREA");
  resultBox.id = "resultBox";
  resultBox.rows = "10";
  resultBox.cols = "75";

  resultBox.textContent = finish_string;

  var mybr = document.createElement("br");
  gPrompt.appendChild(mybr);

  gPrompt.appendChild(resultBox);
  
}

var volHistory = [];
var ampHistory = [];
var stack = [];

var cleanHistory = [];
var cleanStack = [];
var uniqueHistory = [];

let audio;
var sound, amplitude, cnv;
var data;

var normal_to_enc_dict = {};
var enc_to_normal_dict = {};

var finish_string = "";

validChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
              'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
              '0','1','2','3','4','5','6','7','8','9','.','\'', '\"', '(', ')', '_', '-', ' ', '.', '/', '\\', ':', '!', '?'];