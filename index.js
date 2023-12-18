/**
 * Adjusts the SVG paths to fit the screen.
 */
function adjustPath() {
  adjustLandingPath();
  adjustLandingTransitionPath();
}

/**
 * Adjusts the SVG landing paths to fit the screen.
 */
function adjustLandingPath() {
  const svg = document.getElementById("landing-svg");
  const path = document.getElementById("landing-red-path");
  const maskPath = document.getElementById("landing-mask-path");
  const text = document.getElementById("landing-text");
  const textBox = document.getElementById("landing-text-box");
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  // Calculate the path start and end points based on the SVG dimensions
  const startX = width;
  const startY = height * 0.35;
  const bendX = width * 0.15;
  const endX = width * 0.9;
  const endY = height * 1.05;

  const pathData = `M${startX},${startY} L${bendX},${startY} L${endX},${endY}`;

  // Update the path and mask-path 'd' attribute
  path.setAttribute("d", pathData);
  maskPath.setAttribute("d", pathData);

  svg.style.setProperty("--path-length", path.getTotalLength());

  // Center the text vertically and place it at 50% of the width
  text.setAttribute("x", width / 2);
  text.setAttribute("y", startY);

  textBox.setAttribute("width", text.getBBox().width * 1.15);
  textBox.setAttribute("height", text.getBBox().height * 1.75);
  textBox.setAttribute("x", width / 2 - textBox.getBBox().width / 2);
  textBox.setAttribute("y", startY - textBox.getBBox().height / 2);
}

/**
 * Adjusts the SVG transition paths to fit the screen.
 */
function adjustLandingTransitionPath() {
  const svg = document.getElementById("transition-svg");
  const path = document.getElementById("transition-red-path");
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  // Calculate the path start and end points based on the SVG dimensions
  const startX = width * 0.86;
  const startY = -height * 0.1;
  const bendX = width * 0.75;
  const bendY = height * 0.75;
  const endX = width * 0.5;
  const endY = height * 0.15;

  // M 852 49 L 805 183 L 624 49 L 629 676
  const pathData = `M${startX},${startY} L${bendX},${bendY} L${endX},${endY} L${endX},${height}`;

  // Update the path and mask-path 'd' attribute
  path.setAttribute("d", pathData);

  svg.style.setProperty("--path-length", path.getTotalLength());
}

// Listen for page load and resize events
if ("fonts" in document) {
  document.fonts.load("1em EgyptianEF").then(function () {
    adjustPath();
  });
}
window.addEventListener("resize", adjustPath);

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a.redacted-link");

  links.forEach((link) => {
    // Randomize the size of the background
    const scale = 1 + Math.random() * 0.5;
    link.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;

    // Randomize the position of the background
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    link.style.backgroundPosition = `${posX}% ${posY}%`;
  });

  const video = document.getElementById("transition-video");

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    },
    {
      threshold: 0.5, // Adjust this value based on how much of the video must be visible to trigger
    },
  );

  // Start observing the video element
  observer.observe(video);

  adjustPath();
});

// Listen for scroll events
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const aboutSection = document.querySelector(".about");

      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        if (entry.target.classList.contains("projects")) {
          aboutSection.classList.add("projects-in-view");
        }
      } else {
        if (entry.target.classList.contains("projects")) {
          aboutSection.classList.remove("projects-in-view");
        }
      }
    });
  },
  { threshold: [0.1] },
);

observer.observe(document.querySelector(".landing"));
observer.observe(document.querySelector(".transition"));
observer.observe(document.querySelector(".about"));
observer.observe(document.querySelector(".projects"));

/**
 * Converts a string to title case, where the first character of each word is uppercase and the rest are lowercase.
 *
 * @param {string} s - The string to convert to title case.
 * @return {string} - The string transformed to title case.
 */
function titleCase(s) {
  return s.replace(/\w\S*/g, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
  });
}
/**
 * Calculates the time elapsed since a given date and returns it in words.
 * It returns the largest time unit (years, months, days, hours, minutes, seconds) that has a nonzero interval.
 *
 * @param {Date} date - The past date from which to calculate the time since.
 * @return {string} - A human-readable string representing the time interval since the given date.
 *                     For example, "5 years", "3 months", "2 days", "1 hour", "30 minutes", or "15 seconds".
 */
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

window.onload = function () {
  // Update currently reading book
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://openlibrary.org/people/lucasobe/books/currently-reading.json", true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
      const data = JSON.parse(xhr.responseText);
      document.getElementById("cur-book").innerHTML = data.reading_log_entries
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
  xhr2.open("GET", "https://api.github.com/users/Watt3r/events?per_page=1", true);
  xhr2.onload = function () {
    if (xhr2.status >= 200 && xhr2.status < 400) {
      const data = JSON.parse(xhr2.responseText);
      document.getElementById("cur-repo").innerHTML = `<a href="https://github.com/${
        data[0].repo.name
      }">${data[0].repo.name}</a>, ${timeSince(new Date(data[0].created_at))} ago`;
      const xhr3 = new XMLHttpRequest();
      xhr3.open("GET", `https://api.github.com/repos/${data[0].repo.name}`, true);
      xhr3.onload = function () {
        const data2 = JSON.parse(xhr3.responseText);
        if (data2.homepage) {
          document.getElementById("cur-repo").firstChild.setAttribute("href", data2.homepage);
        }
      };
      xhr3.send();
    }
  };
  xhr2.send();
  const xhr4 = new XMLHttpRequest();
  xhr4.open(
    "GET",
    "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=lucasobe&api_key=1de06f62b7d8a0300bec8ed5b05598e8&format=json&limit=1",
    true,
  );
  xhr4.onload = function () {
    if (xhr4.status < 200 || xhr4.status > 400) {
      return;
    }
    const data = JSON.parse(xhr4.responseText);
    const firstTrack = data.recenttracks.track[0]; // Access the first track
    const artistName = firstTrack.artist["#text"]; // Extract artist name
    const songTitle = firstTrack.name; // Extract song title
    // Not sure how to use this yet
    // No "time since" for now
    // const currentlyPlaying = firstTrack["@attr"] && firstTrack["@attr"].nowplaying;
    const songUrl = firstTrack.url; // Extract song URL

    document.getElementById("cur-song").innerHTML =
      `<a href="${songUrl}">${songTitle}</a> by ${artistName}`;
  };
  xhr4.send();
};
