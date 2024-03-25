var questions = [
    { question: "域名/软件名" },
    { question: "密码" , type: "password"}, // lyily
    { question: "密码长度（8-16间的整数，默认是8）", pattern: /^(8|9|1[0-6])$/}
  ];

const characterDictionary = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',',
    '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']',
    '^', '_', '{', '|', '}', '~'
  ];
  
  (function () {
    var tTime = 100; // transition transform time from #register in ms
    var wTime = 200; // transition width time from #register in ms
    var eTime = 1000; // transition width time from inputLabel in ms
  
    // init
    // --------------
    var position = 0;
  
    putQuestion();
  
    progressButton.addEventListener("click", validate);
    inputField.addEventListener("keyup", function (e) {
      transform(0, 0); // ie hack to redraw
      if (e.keyCode == 13) validate();
    });
  
    // functions
    // --------------
  
    // load the next question
    function putQuestion() {
      inputLabel.innerHTML = questions[position].question;
      inputField.value = "";
      if (position == 2) inputField.value = "8";
      inputField.type = questions[position].type || "text";
      inputField.focus();
      showCurrent();
    }
  
    async function calculateSHA256(str) {
        // 将字符串转换为UTF-8编码的Uint8Array
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        
        // 使用Web Crypto API计算SHA-256哈希
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // 将哈希值转换为十六进制字符串表示
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      }
    
    function sha256HexToDecimalArray(hexString) {
        if (hexString.length !== 64) {
          throw new Error('Invalid SHA-256 hash length.');
        }

        // 将十六进制哈希值字符串分割成16个4位的十六进制数
        const hexParts = hexString.match(/.{1,4}/g);
        
        // 将每个十六进制数转换为十进制数
        const decimalArray = hexParts.map(hex => parseInt(hex, 16));
        
        return decimalArray;
      }

    function isValidPassword(password) {
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialCharacter = /[!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_{|}~]/.test(password);
        
        return hasLowerCase && hasUpperCase && hasNumber && hasSpecialCharacter;
      }
      
    // when all the questions have been answered
    async function done() {
      const lengthOfPassword = parseInt(questions[2].value, 10);
      var str = questions[0].value + questions[1].value;

      var password = "";
      do {
        console.log(str);
        const hashHex = await calculateSHA256(str);
        const decimalArray = sha256HexToDecimalArray(hashHex);
        password = 
          decimalArray.slice(0, lengthOfPassword)
              .map(num => characterDictionary[num % characterDictionary.length])
                  .join('');
        str = hashHex;
      } while(!isValidPassword(password));


      // remove the box if there is no next question
      register.className = "close";
  
      // add the h1 at the end with the welcome text
      var h1 = document.createElement("h1");
      h1.appendChild(
        document.createTextNode(password)
      );
      setTimeout(function () {
        register.parentElement.appendChild(h1);
        setTimeout(function () {
          h1.style.opacity = 1;
        }, 50);
      }, eTime);
    }
  
    // when submitting the current question
    function validate() {
      // set the value of the field into the array
      questions[position].value = inputField.value;
  
      // check if the pattern matches
      if (!inputField.value.match(questions[position].pattern || /.+/)) wrong();
      else
        ok(function () {
          // set the progress of the background
          progress.style.width = (++position * 100) / questions.length + "vw";
  
          // if there is a new question, hide current and load next
          if (questions[position]) hideCurrent(putQuestion);
          else hideCurrent(done);
        });
    }
  
    // helper
    // --------------
  
    function hideCurrent(callback) {
      inputContainer.style.opacity = 0;
      inputProgress.style.transition = "none";
      inputProgress.style.width = 0;
      setTimeout(callback, wTime);
    }
  
    function showCurrent(callback) {
      inputContainer.style.opacity = 1;
      inputProgress.style.transition = "";
      inputProgress.style.width = "100%";
      setTimeout(callback, wTime);
    }
  
    function transform(x, y) {
      register.style.transform = "translate(" + x + "px ,  " + y + "px)";
    }
  
    function ok(callback) {
      register.className = "";
      setTimeout(transform, tTime * 0, 0, 10);
      setTimeout(transform, tTime * 1, 0, 0);
      setTimeout(callback, tTime * 2);
    }
  
    function wrong(callback) {
      register.className = "wrong";
      for (
        var i = 0;
        i < 6;
        i++ // shaking motion
      )
        setTimeout(transform, tTime * i, ((i % 2) * 2 - 1) * 20, 0);
      setTimeout(transform, tTime * 6, 0, 0);
      setTimeout(callback, tTime * 7);
    }
  })();
  