const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
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
  textBox.setAttribute("height", REM*parseFloat(maskPath.getAttribute("stroke-width"))+2);
  textBox.setAttribute("x", width / 2 - textBox.getBBox().width / 2);
  textBox.setAttribute("y", startY - textBox.getBBox().height / 2);
}

/**
 * Adjusts the SVG transition paths to fit the screen.
 */
function adjustLandingTransitionPath() {
  const landingSvg = document.getElementById("landing-svg");
  const svg = document.getElementById("transition-svg");
  const path = document.getElementById("transition-red-path");
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  const aboutSection = document.querySelector(".about");

  const landingSvgHeight = landingSvg.clientHeight;

  // Calculate the path start and end points based on the SVG dimensions
  const startX = width * 0.86;
  const startY = -height * 0.1;
  const bendX = width * 0.75;
  const bendY = height * 0.75;
  const endX = width * 0.5;
  const endY = height * 0.15;

  const pathData = `M${startX},${startY} L${bendX},${bendY} L${endX},${endY} L${endX},${height}`;

  const strokeAngle = Math.abs(Math.atan2(landingSvgHeight * 0.7, bendX));
  const stroke2Angle = Math.abs(Math.atan2(startY - bendY, startX - bendX));

  const strokeWidth = 3 / Math.sin(strokeAngle);
  const strokeWidth2 = strokeWidth * Math.sin(stroke2Angle);

  path.setAttribute("stroke-width", strokeWidth2 + "rem");
  path.setAttribute("d", pathData);
  svg.style.setProperty("--path-length", path.getTotalLength());

  // Make the about section the same width as the path
  aboutSection.style.setProperty("--width", `${strokeWidth2}rem`);
}

// Listen for page load and resize events
const fontObserver = new FontFaceObserver("EgyptianEF");

fontObserver
  .load()
  .then(function () {
    adjustPath();
  })
  .catch(function (e) {
    console.error("EgyptianEF font failed to load", e);
  });
window.addEventListener("resize", adjustPath);

  const links = document.querySelectorAll("a");

  links.forEach(link => {
    // Randomize the size of the background
    const scale = 1 + Math.random() * 0.5;
    link.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;

    // Randomize the position of the background
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    link.style.backgroundPosition = `${posX}% ${posY}%`;
  });

  const video = document.getElementById("transition-video");

  const videoObserver = new IntersectionObserver(
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
  videoObserver.observe(video);

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
  return s.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

/**
 * Fetches data from a specified URL using the Fetch API.
 * @param {string} url - The URL to fetch data from.
 * @return {Promise<Object>} - A promise that resolves to the JSON response.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Loads the currently reading books from Open Library and displays them. 
 */
async function loadCurrentlyReading() {
  try {
    const data = await fetchData("https://openlibrary.org/people/lucasobe/books/currently-reading.json");
    document.getElementById("cur-book").innerHTML = data.reading_log_entries
      .map(e => `<a href="https://openlibrary.org${e.work.key}">${titleCase(e.work.title)}</a> by ${titleCase(e.work.author_names[0])}`)
      .join(" and ");
  } catch (error) {
    console.error("Failed to load currently reading books:", error);
  }
}


/**
 * Loads the last updated repo from GitHub and displays it.
 */
async function loadLastUpdatedRepo() {
  try {
    const events = await fetchData("https://api.github.com/users/Watt3r/events?per_page=1");
    const repoName = events[0].repo.name;
    const repoDetails = await fetchData(`https://api.github.com/repos/${repoName}`);
    const homepage = repoDetails.homepage ? repoDetails.homepage : `https://github.com/${repoName}`;
    document.getElementById("cur-repo").innerHTML = `<a href="${homepage}">${repoName}</a>, ${timeSince(new Date(events[0].created_at))} ago`;
  } catch (error) {
    console.error("Failed to load last updated repo:", error);
  }
}

/**
 * Loads the most recent track from Last.fm and displays it.
 */
async function loadRecentTrack() {
  try {
    const data = await fetchData("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=lucasobe&api_key=1de06f62b7d8a0300bec8ed5b05598e8&format=json&limit=1");
    const track = data.recenttracks.track[0];
    document.getElementById("cur-song").innerHTML = `<a href="${track.url}">${track.name}</a> by ${track.artist["#text"]}`;
  } catch (error) {
    console.error("Failed to load recent track:", error);
  }
}

// Call each function independently
window.onload = async () => {
  loadCurrentlyReading();
  loadLastUpdatedRepo();
  loadRecentTrack();
};

