const math = {
  lerp: (t,e,n)=>(1 - n) * t + n * e,
  absmin: (a,b)=>a > b ? b : a < -b ? -b : a
}
var last = 0;
var current = 0;
var timer = undefined;
var header = document.getElementById("header");
var sticky = header.offsetTop;
var worksTimeout;
var typeTimeout;
smoothTilt = (lastTilt) => setTimeout(function() {
  clearTimeout(timer)
  if (Math.abs(lastTilt) >= 0.10) {
    document.getElementsByClassName("content")[0].style = "transform: skewY(" + math.lerp(lastTilt, lastTilt/2, 0.3) + "deg);"
    timer = smoothTilt(math.lerp(lastTilt, lastTilt/2, 0.3))
  } else {
    curTilt = 0;
    last = current;
    document.getElementsByClassName("content")[0].style = "transform: skewY(0deg);"
  }
}, 50);
scrollEvent = () => {
  /*
  clearTimeout(timer)
  current = window.scrollY;
  curTilt = math.absmin((current-last)/document.body.clientWidth*10, 10);
  document.getElementsByClassName("content")[0].style = "transform: skewY(" + curTilt + "deg);"
  last = math.lerp(last, current, 0.1);
  timer = smoothTilt(curTilt)
  */

  // Check if Lucas Oberwager should be stuck to top
  if (window.pageYOffset >= sticky) {
    header.classList.add("sticky");
    header.children[0].classList.remove("type");
    document.getElementsByClassName("works")[0].classList.remove("hideWorks");
    clearTimeout(worksTimeout);
    clearTimeout(typeTimeout);
  } else {
    header.classList.remove("sticky");
  }

  // Check if book is in view
  let curBook =document.getElementById("curBook");
  if (curBook.getBoundingClientRect().top - windowHeight <= 0) {
   curBook.classList.add("bookType") 
  }

  // Check if work link is in view
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var positionFromTop = elements[i].getBoundingClientRect().top;

    if (positionFromTop - windowHeight <= 0) {
      element.classList.add('worksInView');
      element.classList.remove('hidden');
    }
    if (positionFromTop - windowHeight > windowHeight/6) {
      element.classList.remove('worksInView');
      element.classList.add('hidden');
    }
  }
}

window.onload = function() {
  typeTimeout = setTimeout(function() { document.getElementsByClassName("type")[0].classList.remove("type"); }, 9300);
  worksTimeout = setTimeout(function() { document.getElementById("workAnchor").scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 17700);
  var timesRun = 0;
  var age = document.getElementById("age");
  age.innerHTML = ((new Date() - new Date(2003, 10, 9)) / (1000 * 60 * 60 * 24 * 365.25)).toString().substring(0, 5);

  // Animate works links in
  elements = document.querySelectorAll('.hidden');
  windowHeight = window.innerHeight;
  scrollEvent();
window.addEventListener('scroll', scrollEvent)
window.addEventListener('resize', function(){
  windowHeight = window.innerHeight;
  sticky = header.offsetTop;
});
}
