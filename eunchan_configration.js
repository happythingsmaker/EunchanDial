(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', event => {
    let connectButton = document.querySelector("#connect");
    let statusDisplay = document.querySelector('#status');

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
            lastClickedButton.innerText = "Click to apply "
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
        document.getElementById("LEFT_CTRL_L").checked,
        document.getElementById("LEFT_SHIFT_L").checked,
        document.getElementById("LEFT_ALT_L").checked,
        false, //gui is not supporting at this moment
        document.getElementById("RIGHT_CTRL_L").checked,
        document.getElementById("RIGHT_SHIFT_L").checked,
        document.getElementById("RIGHT_ALT_L").checked,
        false, //gui is not supporting at this moment
        document.getElementById("keys_L").value
        )

      //RIGHT 1
      setOneChannelKey(
        1,
        document.getElementById("LEFT_CTRL_R").checked,
        document.getElementById("LEFT_SHIFT_R").checked,
        document.getElementById("LEFT_ALT_R").checked,
        false, //gui is not supporting at this moment
        document.getElementById("RIGHT_CTRL_R").checked,
        document.getElementById("RIGHT_SHIFT_R").checked,
        document.getElementById("RIGHT_ALT_R").checked,
        false, //gui is not supporting at this moment
        document.getElementById("keys_R").value
        )

      //CLICK 2 
      setOneChannelKey(
        2,
        document.getElementById("LEFT_CTRL_C").checked,
        document.getElementById("LEFT_SHIFT_C").checked,
        document.getElementById("LEFT_ALT_C").checked,
        false, //gui is not supporting at this moment
        document.getElementById("RIGHT_CTRL_C").checked,
        document.getElementById("RIGHT_SHIFT_C").checked,
        document.getElementById("RIGHT_ALT_C").checked,
        false, //gui is not supporting at this moment
        document.getElementById("keys_C").value
        )
    }

    function setOneChannelKey(direction, left_ctrl, left_shift, left_alt, left_gui, right_ctrl, right_shift, right_alt, right_gui , key){
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

      // LEFT_CTRL
      if (left_ctrl){
        view[5] = 1;
      } else {
        view[5] = 0;
      }
      
      // LEFT_SHIFT
      if (left_shift){
        view[6] = 1;
      }else {
        view[6] = 0;
      }

      // LEFT_ALT
      if (left_alt){
        view[7] = 1;
      }else {
        view[7] = 0;
      }

      // LEFT_GUI
      if (left_gui){
        view[8] = 1;
      }else {
        view[8] = 0;
      }


      // RIGHT_CTRL
      if (right_ctrl){
        view[9] = 1;
      } else {
        view[9] = 0;
      }
      
      // RIGHT_SHIFT
      if (right_shift){
        view[10] = 1;
      }else {
        view[10] = 0;
      }

      // RIGHT_ALT
      if (right_alt){
        view[11] = 1;
      }else {
        view[11] = 0;
      }

      // RIGHT_GUI
      if (right_gui){
        view[12] = 1;
      }else {
        view[12] = 0;
      }
       
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
          false,
          false,
          false,
          false,
          false,
          "0xD8" //left arrow
        )
        setOneChannelKey(
          1,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0xD7" //right arrow
        )
        setOneChannelKey(
          2,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0x6b" //k
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
          false,
          false,
          false,
          false,
          false,
          "0xD8" //left arrow
        )
        setOneChannelKey(
          1,
          true, //ctrl
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0xD7" //right arrow
        )
        setOneChannelKey(
          2,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0x20" //space
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
          false,
          false,
          false,
          false,
          false,
          "0x5B" // [
        )
        setOneChannelKey(
          1,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0x5D" // ]
        )
        setOneChannelKey(
          2,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          "0x00" //nothing
        )
    });


  });
})();
