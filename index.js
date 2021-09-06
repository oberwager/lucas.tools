const header = document.getElementById("header");
let sticky = header.offsetTop;
let worksTimeout;
let typeTimeout;
let playAnimations = false;
scrollEvent = () => {
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

  // Check if work link is in view
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const positionFromTop = elements[i].getBoundingClientRect().top;

    if (positionFromTop - windowHeight <= 0) {
      element.classList.add("worksInView");
      element.classList.remove("hidden");
    }
    if (positionFromTop - windowHeight > windowHeight / 6) {
      element.classList.remove("worksInView");
      element.classList.add("hidden");
    }
  }
};

window.onload = function () {
  // Animate works links in
  elements = document.querySelectorAll(".hidden");
  windowHeight = window.innerHeight;
  scrollEvent();
  window.addEventListener("scroll", scrollEvent);
  window.addEventListener("resize", function () {
    windowHeight = window.innerHeight;
    const container =  document.getElementById("header").parentElement;
    sticky = container.offsetTop;
    scrollEvent();
  });
  if (document.hasFocus()) {
    playAnimations = true
    typeTimeout = setTimeout(function () {
      document.getElementsByClassName("type")[0].classList.remove("type");
    }, 9300);
  } else {
    clearTimeout(worksTimeout);
    document.getAnimations().forEach(
      function (animation) {
        animation.pause();
      }
    );
  }
  window.addEventListener('focus', function () {
    if (document.hasFocus() && !playAnimations) {
      console.log("play animation")
      playAnimations = true
      document.getAnimations().forEach(
        function (animation) {
          animation.play();
        }
      );
      typeTimeout = setTimeout(function () {
        document.getElementsByClassName("type")[0].classList.remove("type");
      }, 9300);
    }
  })
};
