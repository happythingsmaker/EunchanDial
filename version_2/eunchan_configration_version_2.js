(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', event => {
    let connectButton = document.querySelector("#connect");
    let statusDisplay = document.querySelector('#status');

    let setPresetVolume = document.querySelector('#preset_volume');
    let setPresetPre = document.querySelector('#preset_premiere');
    let setPresetAE = document.querySelector('#preset_AE');
    let setPresetIlu = document.querySelector('#preset_illustrator');

    let setCustomizeButton = document.querySelector("#set_customize");

    let resultSpan = document.querySelector("#set_result");
    
    
    let port;

    let lastClickedButton;

    function connect() {
      port.connect().then(() => {
        statusDisplay.textContent = 'Connected!';
        connectButton.textContent = 'Disconnect';

        // Serial callback from USB
        port.onReceive = data => {
          let textDecoder = new TextDecoder();
          
          if(textDecoder.decode(data).indexOf("Save Done!") != -1) {
          // resultSpan.textContent = "Successfully Saved!"
          lastClickedButton.className = "btn btn-success"
          lastClickedButton.innerText = "SUCCESS!"

          setTimeout(function(){
            // resultSpan.textContent = ""
            lastClickedButton.className = "btn btn-warning"
            lastClickedButton.innerText = "apply "
          },3000)
          }
          console.log(textDecoder.decode(data))
        }

        port.onReceiveError = error => {
          console.log(error);
          
        };
      }, error => {
        statusDisplay.textContent = error;
        connectButton.className = "btn btn-danger"
        connectButton.innerText = "ERROR"
      });
    }

    function onUpdate() {
      if (!port) {
        return;
      }

      let view = new Uint8Array(15);
      view[0] = 0xff;
      view[1] = 0xff;
      view[2] = 0x10;
      view[3] = 0x10;

      view[4] = 0x01;
      
      view[5] = 0x00;
      view[6] = 0x00;
      view[7] = 0x00;
      view[8] = 0x00;
      view[9] = 0x00;
      view[10] = 0x00;
      view[11] = 0x00;
      view[12] = 0x00;
      
      view[13] = 0x00;
      
      view[14] = 0xff;
      port.send(view);

    };


    connectButton.addEventListener('click', function() {
      if (port) {
        port.disconnect();
        connectButton.textContent = 'Connect';
        statusDisplay.textContent = '';
        port = null;
      } else {
        serial.requestPort().then(selectedPort => {
          port = selectedPort;
          connect();
        }).catch(error => {
          statusDisplay.textContent = error;
        });
      }
    });



    serial.getPorts().then(ports => {
      if (ports.length == 0) {
        statusDisplay.textContent = 'No device found.';
      } else {
        statusDisplay.textContent = 'Connecting...';
        port = ports[0];
        connect();
      }
    });

    function sendKeyboardSetting() {
      if (!port) {
        return;
      }

      let view = new Uint8Array(10);
      //header2
      view[0] = 0xff;
      view[1] = 0xff;
      view[2] = 0x10;
      view[3] = 0x10;
      
      // L 0, R 1, Click 2
      // if (document.getElementById("iunput_type").value >=0 && document.getElementById("iunput_type").value < 3) {
      //   view[4] = document.getElementById("iunput_type").value;
      // }

      if (document.getElementsByName("type_radio")[0].checked == true){
        view[4] = 0;
      } else if (document.getElementsByName("type_radio")[1].checked == true){
        view[4] = 1;
      } else if (document.getElementsByName("type_radio")[2].checked == true){
        view[4] = 2;
      } else {
        alert("error");
      }
      
      // CTRL
      if(document.getElementById("CTRL").checked){
        view[5] = 1;
      } else {
        view[5] = 0;
      }
      
      // ALT
      if(document.getElementById("ALT").checked){
        view[6] = 1;
      } else {
        view[6] = 0;
      }

      // SHIFT
      if(document.getElementById("SHIFT").checked){
        view[7] = 1;
      } else {
        view[7] = 0;
      }

      // KEY
      view[8] = document.getElementById("keys").value;

      //FINISHING
      view[9] = 0xff;
      // console.log(view)
      port.send(view);

    };


    setCustomizeButton.addEventListener('click', function(event){
      event.preventDefault(); 
      sendAllKeyboardSetting();
      lastClickedButton = setCustomizeButton;
    });

    function sendAllKeyboardSetting(){
      if (!port) {
        return;
      }

      //LEFT 0 
      //CTRL, ALT, ShIFT
      setOneChannelKey(
        0,
        document.getElementById("CTRL_L").checked,
        document.getElementById("SHIFT_L").checked,
        document.getElementById("ALT_L").checked,
        document.getElementById("keys_L").value
        )

      //RIGHT 1
      setOneChannelKey(
        1,
        document.getElementById("CTRL_R").checked,
        document.getElementById("SHIFT_R").checked,
        document.getElementById("ALT_R").checked,
        document.getElementById("keys_R").value
        )

      //CLICK 2 
      setOneChannelKey(
        2,
        document.getElementById("CTRL_C").checked,
        document.getElementById("SHIFT_C").checked,
        document.getElementById("ALT_C").checked,
        document.getElementById("keys_C").value
        )
    }

    function setOneChannelKey(direction, ctrl, shift, alt, key){
      if (!port) {
        return;
      }
      let view = new Uint8Array(15);
      //header2
      view[0] = 0xff;
      view[1] = 0xff;
      view[2] = 0x10;
      view[3] = 0x10;
      
      // left right or click (this time, left)
      if (direction > 2 || direction < 0){
        alert("direction index error:");
        return;
      } else {
        view[4] = direction;
      }

      // CTRL
      if (ctrl){
        view[5] = 1;
      } else {
        view[5] = 0;
      }
      
      // SHIFT
      if (shift){
        view[6] = 1;
      }else {
        view[6] = 0;
      }

      // ALT
      if (alt){
        view[7] = 1;
      }else {
        view[7] = 0;
      }

      view[8] = 0;
      view[9] = 0;
      view[10] = 0;
      view[11] = 0;
      
      if (key < 0xf000){
        view[12] = 0; //normal key
      } else {
        view[12] = 1; //consumer key
        key = key - 0xf000
      }
      console.log(key);
      
      // KEY
      view[13] = key;
      
      //FINISHING
      view[14] = 0xff;
      port.send(view);
      // console.log(view);
    }

    
    setPresetPre.addEventListener('click', function(event){
      event.preventDefault(); 
        if (!port) {
          return;
        }
        lastClickedButton = setPresetPre;
  
        //LEFT 0 
        //CTRL, ALT, ShIFT
        setOneChannelKey(
          0,
          false,
          false,
          false,
          "0x50" //left arrow
        )
        setOneChannelKey(
          1,
          false,
          false,
          false,
          "0x4F" //right arrow
        )
        setOneChannelKey(
          2,
          true,
          false,
          false,
          "14" //k
        )
    });

    setPresetAE.addEventListener('click', function(event){
      event.preventDefault(); 
        if (!port) {
          return;
        }
        lastClickedButton = setPresetAE;
  
        //LEFT 0 
        //CTRL, ALT, ShIFT
        setOneChannelKey(
          0,
          true, //ctrl
          false,
          false,
          "0x50" //left arrow
        )
        setOneChannelKey(
          1,
          true, //ctrl
          false,
          false,
          "0x4F" //right arrow
        )
        setOneChannelKey(
          2,
          false,
          false,
          false,
          "44" //space
        )
    });

    setPresetIlu.addEventListener('click', function(event){
      event.preventDefault(); 
        if (!port) {
          return;
        }
        lastClickedButton = setPresetIlu;
  
        //LEFT 0 
        //CTRL, ALT, ShIFT
        setOneChannelKey(
          0,
          false,
          false,
          false,
          "47" // [
        )
        setOneChannelKey(
          1,
          false,
          false,
          false,
          "48" // ]
        )
        setOneChannelKey(
          2,
          false,
          false,
          false,
          "0x00" //nothing
        )
    });

    setPresetVolume.addEventListener('click', function(event){
      event.preventDefault(); 
        if (!port) {
          return;
        }
        lastClickedButton = setPresetVolume;
  
        //LEFT 0 
        //CTRL, ALT, ShIFT
        setOneChannelKey(
          0,
          false,
          false,
          false,
          "0xF0EA" // down
        )
        setOneChannelKey(
          1,
          false,
          false,
          false,
          "0xF0E9" // up
        )
        setOneChannelKey(
          2,
          false,
          false,
          false,
          "0xF0E2" //mute
        )
    });


  });
})();
