"use strict";

// jQuery shortcut for ready function
// $ === jQuery
$(function(){
  // player object for each player/computer
  function Player(node){
    // JQUERY NODE
    this.node = $(node);
    // name of player
    this.name = this.node.attr("data-user");
    // use left property for this items position
    this.position = parseInt(this.node.css("left"), 10);

    // subtracted img width from main width of screen
    // this is to take into count that finish line is (width of screen - width of player)
    // uncomment to have this object keep track of width
    // this.width = this.node.width();
  }

  Player.prototype.setPosition = function(speed){
    // move element <speed> far
    this.position += speed;

    // dont let position be greater than screen
    if(this.position > env.widthOfScreen){ this.position = env.widthOfScreen; }

    // using left position to move piece
    this.node.css("left", this.position );
  }

  Player.prototype.run = function(event){
    /*
     * MOVE PIECE
    */
    if(event.key !== env.runKey || env.isGameOver){
      // STOP FUNCTION IF GAME IS OVER
      // OR IF WRONG KEY WAS PRESSED
      return;
    }

    // move element
    this.setPosition(env.carSpeed);

    if(this.isFinished()){
      // end game
      env.gameOver();
      // let user know who won
      alert(this.name + " has won the game");
    }

  };

  Player.prototype.isFinished = function(){
    // HAS THE PLAYER REACHED THE FINISH LINE
    return env.widthOfScreen === this.position;
  };

  // local variables
  var startButton = document.getElementById("start");
  var $intro = $("#intro");
  var $gameBoard = $("#game");
  var $backstretch = $(".backstretch-img");
  var $countDown = $('#countDown');
  var $instructions = $('#instructions');

  // players
  var player = new Player(".car[data-user='player']");
  var computer = new Player(".car[data-user='computer']");

  // game rules and information
  var env = {
    ready: false,
    isGameOver: false,
    runKey:"ArrowRight",
    widthOfScreen: 0,
    carSpeed: 0,
    computerSpeed: 150, // 150 milliseconds
    computerId:false,
    startGame: function(event){
      if(this.ready){ return; }

      this.ready = true;

      // game has started so remove listener for start button
      startButton.removeEventListener("click", env.startGame);

      $intro.removeClass("fade-in").addClass("fade-out");
      $intro.on("animationend", useAnimationOnce(env,this.loadGame));
    },
    loadGame:function(event){

      env.setGameWidth(document.body.offsetWidth);

      $intro.removeClass("fade-out").addClass("hide");
      $gameBoard.add($instructions).removeClass("hide").addClass("fade-in");

      $gameBoard.on('animationend', useAnimationOnce($gameBoard, this.countDown));

    },
    countDown: function(event){
      /**
       * setInterval(<function>,<milliseconds>)
       * 1000 === one second
      */

      // $instructions.removeClass("hide").addClass("fade-in");
      let countDown = 3;
      let oneSecond = 1000;
      // colors for which number should display as
      let colorArray = ["green","yellow","red","red"];

      let countDownId = setInterval(function(){
        // display countDown to screen
        // if countDown is 0 it will display "GOOO!!!"
        countDownLog(countDown || "GOOOO!!!!", colorArray[countDown]);

        if(countDown === 0){

          $countDown.addClass("fade-out").on("animationend", useAnimationOnce($countDown,function(event){
            // clear text when last pop-up number is done
            this.text("");
          }));

          //event when correct key press
          document.body.addEventListener("keyup", player.run.bind(player));

          // start computer
          env.computerId = setInterval(function(){
            // Player.prototype.run takes a Event obj with what key was pressed
            // use regular object so run function wont break
            computer.run({key: env.runKey });
          }, env.computerSpeed );

          // remove countdown
          return clearInterval(countDownId);
        }

        countDown--; // make countDown count down
      }, oneSecond);
    },
    gameOver: function(){
      // set game to true
      this.isGameOver = true;
      // clear computers Interval to stop it from moving
      clearInterval(this.computerId);
      // clear the id
      this.computerId = false;
    },
    setGameWidth: function(width){
      // THE WIDTH OF SCREEN WILL BE THE ACUAL WIDTH MINUS
      // THE SIZE OF THE IMAGE WE ARE USING FOR OUR RACER
      this.widthOfScreen = width - $(".car").width();
      // get speed of car depending on width of screen
      // quadratic equation
      this.carSpeed = Math.ceil(-1 + Math.sqrt( 1 - 4 * -(2 * this.widthOfScreen) )/2);
    }
  }

  function useAnimationOnce(that,func){
    /**
     * THIS FUNCTION WILL REMOVE THE ANIMATIONEND EVENT ONCE THE CALL BACK IS CALLED
     * USED TO KEEP EVENT LISTENERS SHORT AND MAINTAINED
    */
    return function(event){
      // this === what element finished animation
      var $this = $(this);
      // remove this animation event
      $this.off("animationend");
      // call callback function with specified this value
      func.call(that,event);
    }
  }

  function countDownLog(number,color){
    /*
     * LOG NUMBER TO SCREEN AND FADE IT IN
    */
    $countDown.text(number).css('color',color).addClass("fade-in");
  }


  /**
   * Event Listeners
  */
  startButton.addEventListener('click', env.startGame.bind(env));

});
