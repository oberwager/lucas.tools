const header = document.getElementById("header");
let sticky = header.offsetTop;
let worksTimeout;
let typeTimeout;
function titleCase(s) {
  return s.replace(/\w\S*/g, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
  });
}
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const timeUnits = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];

  for (const unit of timeUnits) {
    const interval = Math.floor(seconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval > 1 ? "s" : ""}`;
    }
  }
}
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
    const container = document.getElementById("header").parentElement;
    sticky = container.offsetTop;
    scrollEvent();
  });
  typeTimeout = setTimeout(function () {
    document.getElementsByClassName("type")[0].classList.remove("type");
  }, 9300);
  // Update currently reading book
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://openlibrary.org/people/lucasobe/books/currently-reading.json", true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
      const data = JSON.parse(xhr.responseText);
      document.getElementById("curBook").innerHTML = data.reading_log_entries
        .map(function (e) {
          return `<a href="https://openlibrary.org${e.work.key}">${titleCase(
            e.work.title,
          )}</a> by ${titleCase(e.work.author_names[0])}`;
        })
        .join(" and ");
    }
  };
  xhr.send();
  // Update last updated repo
  const xhr2 = new XMLHttpRequest();
  xhr2.open("GET", "https://api.github.com/users/oberwager/events?per_page=1", true);
  xhr2.onload = function () {
    if (xhr2.status >= 200 && xhr2.status < 400) {
      const data = JSON.parse(xhr2.responseText);
      if (data.length === 0) {
        return;
      }
      document.getElementById("curRepo").innerHTML = `<a href="https://github.com/${
        data[0].repo.name
      }">${data[0].repo.name}</a>, ${timeSince(new Date(data[0].created_at))} ago`;
      const xhr3 = new XMLHttpRequest();
      xhr3.open("GET", `https://api.github.com/repos/${data[0].repo.name}`, true);
      xhr3.onload = function () {
        const data2 = JSON.parse(xhr3.responseText);
        if (data2.homepage) {
          document.getElementById("curRepo").firstChild.setAttribute("href", data2.homepage);
        }
      };
      xhr3.send();
    }
  };
  xhr2.send();
  // Update uptime
  fetch("https://uptime.lucas.tools/api/badge/1/uptime/120")
    .then(res => res.text())
    .then(svg => {
      const match = svg.match(/>(\d+\.\d+)%</);
      if (!match) return;
      const uptime = match[1];
      document.getElementById("uptime").innerHTML = uptime;
    })
    .catch(console.error);
};
