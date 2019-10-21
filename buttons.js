//Getting blank Trackbox for later copying
let blankTrackbox = document.querySelectorAll(".trackBox")[0].cloneNode(true);
window.addEventListener('keypress',assignButton);

//Making sound buttons play
let playButtons = document.querySelectorAll(".soundBox");
playButtons.forEach((item) => 
{
    item.addEventListener("click",btnPlay);
});

//Making buttons for reassigning buttons reassign functionality
let assignButtons = document.querySelectorAll(".btnRe");
assignButtons.forEach((item) => 
{
    item.addEventListener("click",btnReassign);
});

//Setting event listeners for all buttons of trackBoxes
let trackBoxes = document.querySelectorAll(".trackBox");
trackBoxes.forEach((item) => 
{
    //creating new Rec object, and putting it into array
    trackList.push(new Rec(item));
    item.querySelector(".track").recElement = trackList[trackList.length - 1];

    item.querySelector(".track").addEventListener("mousedown",rewind);    
    item.querySelector(".trackPlay").addEventListener("click",playTrack);
    item.querySelector(".trackRecord").addEventListener("click",recordTrack);
    item.querySelector(".trackRepeat").addEventListener("click",switchStatus);
    item.querySelector(".trackSelect").addEventListener("click",switchStatus);
    
    item.querySelector(".trackReset").addEventListener("click",() => {
        item.querySelector(".track").recElement.reset();
    });    
});

//Event listeners for global function buttons
document.querySelector("#playSel").addEventListener("click",playSelected);
document.querySelector("#stopSel").addEventListener("click",stopSelected);
document.querySelector("#showReBtns").addEventListener("click",showReBtns);
document.querySelector("#addNewTrack").addEventListener("click",addNewTrack);

let assignWindow = document.querySelector("#dimness");

function btnPlay(e)
{
    let audioElem = e.target.querySelector(".sounds") || e.target.parentElement.querySelector(".sounds");
    playButton(audioElem);
    e.target.classList.contains("soundBox") ? appendWave(e.target) : appendWave(e.target.parentElement);
}


//function for changing sound buttons assigned keyboard keys
let lookForBtn = false;
let audioToAssign;
function assignButton(e)
{
    if(lookForBtn)
    {
        audioToAssign.dataset.code = e.charCode;
        lookForBtn = false;    
        assignWindow.classList.remove("active");
        audioToAssign.parentElement.querySelector(".assignedButton").innerHTML = e.key;
        Sounds.loadSounds();
    }
}

//Function that are setting ability to reassign keys bindings
function btnReassign(e)
{
    audioToAssign = e.target.parentElement.querySelector(".sounds");
    lookForBtn = true;
    assignWindow.classList.add("active");
}

//Playing track
function playTrack(e)
{
    let CrntTrack = trackList[e.target.parentElement.dataset.trackid];

    if(e.target.classList.contains("active"))
    {
        CrntTrack.pause();
    }
    else if(!e.target.parentElement.querySelector(".trackRecord").classList.contains("active"))
    {
        CrntTrack.play();
    }
}

//Recording track
function recordTrack(e)
{
    if(e.target.classList.contains("active"))
    {        
        e.target.classList.remove("active")
    }else if(!e.target.parentElement.querySelector(".trackPlay").classList.contains("active"))
    {
        e.target.classList.add("active");
        let CrntTrack = trackList[e.target.parentElement.dataset.trackid];
        CrntTrack.recordTrack();
    }
}

function switchStatus(e)
{
    if(e.target.classList.contains("active"))    
        e.target.classList.remove("active");
    else    
        e.target.classList.add("active");    
}


function playSelected(e)
{
    trackList.forEach(function(element) {
        if(element.trackBox.querySelector(".trackSelect").classList.contains("active") &&
        !element.trackBox.querySelector(".trackPlay").classList.contains("active"))
            element.trackBox.querySelector(".track").recElement.play();
    }, this);
}

function stopSelected(e)
{
    trackList.forEach(function(element) {
        if(element.trackBox.querySelector(".trackSelect").classList.contains("active") &&
        element.trackBox.querySelector(".trackPlay").classList.contains("active"))
            element.trackBox.querySelector(".track").recElement.pause();
    }, this);
}

//Showing or hidding buttons for reassigning key bindings of sound buttons
function showReBtns(e)
{
    if(e.target.classList.contains("active"))
    {
        e.target.classList.remove("active");
        document.querySelectorAll(".btnRe").forEach((item) => {
            item.style.display = "none";
        });
    }
    else
    {
        e.target.classList.add("active");
        document.querySelectorAll(".btnRe").forEach((item) => {
            item.style.display = "block";
        });
    }    
}

function addNewTrack(e)
{
    let trackBoxesContainer = document.querySelector("#trackBoxesContainer");

    blankTrackbox.dataset.trackId = trackList.length
    let item = blankTrackbox.cloneNode(true);
    item.dataset.trackid = trackList.length;
    
    trackBoxesContainer.appendChild(item);
    
    trackList.push(new Rec(item));
    item.querySelector(".track").recElement = trackList[trackList.length - 1];
    
    item.querySelector(".track").addEventListener("mousedown",rewind);    
    item.querySelector(".trackPlay").addEventListener("click",playTrack);
    item.querySelector(".trackRecord").addEventListener("click",recordTrack);
    item.querySelector(".trackRepeat").addEventListener("click",switchStatus);
    item.querySelector(".trackSelect").addEventListener("click",switchStatus);
    
    item.querySelector(".trackReset").addEventListener("click",() => {
        item.querySelector(".track").recElement.reset();
    });     
}

function rewind(e)
{
    if(e.target.classList.contains("track") && e.target.recElement.crntTimeout == "not Playing")
    {
        let trackEl = e.target;
        trackEl.recElement.pointer.style.left = (e.offsetX + e.target.scrollLeft) + "px";
        trackEl.recElement.scrollByPointer();
        trackEl.addEventListener("mousemove",trackMouseMove);        
        document.addEventListener("mouseup",() => {
            trackEl.removeEventListener("mousemove",trackMouseMove);
        });

        function trackMouseMove(e)
        {    
            trackEl.recElement.pointer.style.left = (e.offsetX + e.target.scrollLeft) + "px";
            trackEl.recElement.scrollByPointer();
        }
    }
}

function scrollByBorder(e)
{
    if(e.offsetX < 100 && e.target.scrollLeft > 0)
        e.target.scrollLeft--;

    if(e.offsetX < e.target.offsetWidth - 100)
        e.target.scrollLeft++;
}