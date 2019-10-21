let soundsList = document.querySelectorAll(".sounds");
window.addEventListener('keypress',playKeyboard);
//Array of all Rec elements
let trackList = [];

//Object contaning all sounds in Sounds.list named by key char number reffered to it
let Sounds = {
    list: {},
    loadSounds: function()
    {
        this.list = {};
        for (let i = 0; i < soundsList.length; i++) {
            Sounds.list[soundsList[i].dataset.code] = soundsList[i];
        }
    }      
};
Sounds.loadSounds();

//Constructor of object Rec which function is to record, edit, and play nice beatbox
function Rec(trackBox)
{
    //Total duration of recorded track in miliseconds
    this.duration = 0;
    //Array of objects that contains recorded sounds info.
    // It contains:
    //soundLog.time (time in miliseconds from last recorded sound)
    //soundLog.sound (refference to played sound (not key))
    //soundLog.soundPiece (refference to div displayed on track visualization)
    this.soundLog = [];
    
    //refference to div
    this.trackBox = trackBox;
    //Reference to pointer on track
    this.pointer = this.trackBox.querySelector(".track").querySelector(".pointer");
    this.trackScale = 10; 

    //Current played sound recorded on soundLog array
    this.i = 0;
    //Current timeout refference or info about not playing
    this.crntTimeout = "not Playing";
    //Method that tell about exacly what it name says
    this.isRecording = () => {return this.trackBox.querySelector(".trackRecord").classList.contains("active")};
}

//Method for playing recorded track
Rec.prototype.play = function ()
{
    //Can play if this track is not recording
    if(!this.isRecording())
    {
        //and if anything is recorded
        if(this.soundLog.length > 0)
        {            
            //this is for checking if this is going to play first sound
            if(this.crntTimeout == "not Playing")
            {
                //First stage is to play track from a point where pointer is set
                let pointerTime = parseFloat(this.pointer.style.left) * this.trackScale;
                let sPSumTime = this.soundLog[this.i].time;
                let startingTime = 0;
                //Loop that set for us this.i value to ignore all recorded sounds thar are before pointer
                //and get for us time delay before playing first after pointer
                    while(pointerTime > sPSumTime)
                    {
                        this.i++;
                        if(this.i < this.soundLog.length)
                            sPSumTime += this.soundLog[this.i].time;
                        else
                        {
                            this.i = 0;
                            this.pointer.style.left = "0px";
                            pointerTime = 0;
                            sPSumTime = this.soundLog[this.i].time;
                        }                     
                    }
                startingTime = sPSumTime - pointerTime;
                    
                //Seting first timeout
                this.crntTimeout = 
                setTimeout(() => {this.play()}, startingTime);

                //Setting play button as active
                this.trackBox.querySelector(".trackPlay").classList.add("active");
                //Getting into move track pointer
                this.movePointer(Date.now() - pointerTime);                
            }
            //For every other sound that must be played
            else
            {   
                //Adding and setting timeout for class "playing" for div to glow when playing
                let playingSoundpiece = this.soundLog[this.i].soundPiece;
                playingSoundpiece.classList.add("playing");
                setTimeout(() => {
                    playingSoundpiece.classList.remove("playing");
                },400);
                
                //Actually playing ;)
                this.soundLog[this.i].sound.currentTime = 0;
                this.soundLog[this.i].sound.play();

                //Running function appendWave 
                appendWave(this.soundLog[this.i].sound.parentElement);

                //Setting timeout for playing next sound if there is any or setting all variables for status of not playing
                this.i++;
                if(this.soundLog[this.i])
                this.crntTimeout = setTimeout(() => {this.play()}, this.soundLog[this.i].time);
                else
                {                    
                    this.i = 0;
                    this.crntTimeout = "not Playing";
                    this.trackBox.querySelector(".trackPlay").classList.remove("active");                    
                    this.pointer.style.left = "0px";
                    if(this.trackBox.querySelector(".trackRepeat").classList.contains("active"))
                    this.play();
                }
                
            }
            
        }
    }
}

//Function for suddenly stopping of playing recorded track
Rec.prototype.pause = function()
{
    clearTimeout(this.crntTimeout);
    this.crntTimeout = "not Playing";
    this.i = 0;
    this.trackBox.querySelector(".trackPlay").classList.remove("active");        
}

//Function creates new soundlog objects and linked to it div elements on track
Rec.prototype.logNewKey = function(charCode)
{
    //creating empty div, and adding classes to it
    let tmp = document.createElement("div");
    tmp.classList.add("" + this.soundLog.length);
    tmp.classList.add("soundPiece");

    let timeNow = Date.now();

    //adding new object to soundLog array
    this.soundLog.push(
        {
            time: 0,
            sound: Sounds.list[charCode],
            //adding created div to track and assigning it's refference to soundLog object
            soundPiece: this.trackBox.querySelector(".track").appendChild(tmp)
        });            

    //temporary variable
    let sLL = this.soundLog.length - 1;
    let crntSoundpiece = this.soundLog[sLL].soundPiece;

    //setting sound div's position and width
    crntSoundpiece.style.left = parseFloat(this.pointer.style.left) + "px";
    crntSoundpiece.style.width = "0px";
    //for incredible css animation
    if(this.soundLog[sLL].sound) 
    setTimeout(() => {
        crntSoundpiece.style.width = (this.soundLog[sLL].sound.duration * this.trackScale + 10) + "px";
    },100);

    //adding reference of soundLog object to sound div
    crntSoundpiece.logElem = this.soundLog[sLL];
    
    //Adding event listeners to sound div
    crntSoundpiece.addEventListener("mousedown",() => {
        document.addEventListener("mousemove",msMv);        
        document.addEventListener("mouseup",msLv);
        
        let spEl = this.soundLog[sLL].soundPiece;

        function msMv(e)
        {            
            let tmp = parseFloat(spEl.style.left);
            spEl.style.left = (tmp + e.movementX) + "px";
        }

        function msLv(e) {

            let trackElem = spEl.parentElement.recElement
            
            document.removeEventListener("mousemove",msMv);            
            document.removeEventListener("mouseup",msLv);

            trackElem.reTiming();
        }

    });    
    this.reTiming();
}

//Function moving div elements on visual track
Rec.prototype.sPMove = function(e)
{
    let tmp = parseFloat(e.target.style.left);
    e.target.style.left = (tmp + e.movementX) + "px";
}

//Function that set and change Rec.soundlog.time depending on sound div's position on visual track 
Rec.prototype.reTiming = function()
{
    //Sorting in case if user change sound order on track
    this.soundLog.sort((a,b) => {
        return parseFloat(a.soundPiece.style.left) - parseFloat(b.soundPiece.style.left);
    });

    //Setting time to play for each sound
    let duration = parseFloat(this.soundLog[0].soundPiece.style.left) * this.trackScale;
    this.soundLog[0].time = duration;
    for (let i = 1; i < this.soundLog.length; i++)  
    {
        this.soundLog[i].time = (parseFloat(this.soundLog[i].soundPiece.style.left) * this.trackScale) - duration;
        duration += this.soundLog[i].time;
    }

    //Setting total duration of recoring
    tmp = 0;
    this.soundLog.forEach((item) => {
        tmp += item.time;
    });
    this.duration = tmp;

}

//Function that make pointer move
Rec.prototype.movePointer = function(tStart)
{
    let dt = Date.now();
    let tmp = parseFloat(this.pointer.style.left);

    //Moving pointer
    this.pointer.style.left = ((dt - tStart) / this.trackScale) + "px";

    this.scrollByPointer();

    let isPlaying = this.trackBox.querySelector(".trackPlay").classList.contains("active");
    //Will run next pointer move if time for end of track has not come, and if it still playing
    if(dt < this.duration + tStart && isPlaying)
    {
        requestAnimationFrame(() => {this.movePointer(tStart)});
    } else
    {
        this.pointer.style.left = "0px";
    }
}

//The same function as for playing but this is for recording
Rec.prototype.recordingPointer = function(tPrev)
{
    let dt = Date.now();
    let tmp = parseFloat(this.pointer.style.left);

    this.pointer.style.left = (tmp + ((dt - tPrev) / this.trackScale)) + "px";
    
    this.scrollByPointer();

    let isRecording = this.trackBox.querySelector(".trackRecord").classList.contains("active");
    if(isRecording)
    {
        requestAnimationFrame(() => {this.recordingPointer(dt)});
    } else
    {
        this.pointer.style.left = "0px";
    }
}

//Function that resets track
Rec.prototype.reset = function()
{
    this.duration = 0;
    
    this.soundLog.forEach(function(element){
        element.soundPiece.remove();
    });
    
    this.soundLog = [];
    
    this.trackScale = 10; 

    this.i = 0;
    clearTimeout(this.crntTimeout);
    this.crntTimeout = "not Playing";
    this.trackBox.querySelector(".trackPlay").classList.remove("active");  
}

Rec.prototype.recordTrack = function()
{    
    this.recordingPointer(Date.now());
}

//Function for scrolling track for pointer to be visible
Rec.prototype.scrollByPointer = function()
{
    let pPos = parseFloat(this.pointer.style.left);
    let tWidth = parseFloat(this.trackBox.offsetWidth) - 200;
    if(pPos > tWidth)     
        this.trackBox.querySelector(".track").scrollLeft = pPos - tWidth;
    else 
        this.trackBox.querySelector(".track").scrollLeft = 0;
}

//Function that play sound by pressing buttons on keyboard, and record them on tracks
function playKeyboard(e)
{
    //if key has a sound assigned to it
    if(Sounds.list.hasOwnProperty(e.charCode))
    {
        //log sound on every track that is recording
        trackList.forEach((track) => {
            if(track.isRecording()) track.logNewKey(e.charCode);
        });

        //playing sound
        Sounds.list[e.charCode].currentTime = 0;
        Sounds.list[e.charCode].play();
        
        //making cool wave
        appendWave(Sounds.list[e.charCode].parentElement);
    }
}

//Function that play sound by clicking on button, and record them on tracks
function playButton(e)
{
    //log sound on every track that is recording
    trackList.forEach((track) => {
        if(track.isRecording()) track.logNewKey(e.charCode);
    });
    
    //playing sound
    Sounds.list[e.dataset.code].currentTime = 0;
    Sounds.list[e.dataset.code].play();
}

//Function that set cool wave to button that play sound
function appendWave(el)
{
    let tmp = document.createElement("div");
    tmp.classList.add("wave");

    let tmp2 = el.appendChild(tmp);
    setTimeout(() => {
        tmp2.remove();
    },1000);
}
