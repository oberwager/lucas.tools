const header = document.getElementById("header");
let sticky = header.offsetTop;
let worksTimeout;
let typeTimeout;
function titleCase(s) {
  return s.replace(/\w\S*/g, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
  });
}
function formatDuration(s) {
  if (s < 60) return s + "s";
  return Math.round(s / 60) + "m " + (s % 60) + "s";
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
  const container = document.getElementById("header").parentElement;
  sticky = container.offsetTop;
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
  // Update currently reading book
  fetch("https://openlibrary.org/people/lucasobe/books/currently-reading.json")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("curBook").innerHTML = data.reading_log_entries
        .map(
          (e) =>
            `<a href="https://openlibrary.org${e.work.key}">${titleCase(e.work.title)}</a> by ${titleCase(e.work.author_names[0])}`,
        )
        .join(" and ");
    })
    .catch(console.error);

  // Page weight via Resource Timing API
  let last = 0;
  const pageSizeIv = setInterval(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    let total = nav ? nav.transferSize : 0;
    resources.forEach((r) => {
      total += r.transferSize;
    });
    const el = document.getElementById("page-size");
    if (total > 0 && el) {
      el.textContent = (total / 1024).toFixed(0) + " KB";
      if (total === last) clearInterval(pageSizeIv);
      last = total;
    }
    const avgWebPageSize = 3106816; // https://www.speedcurve.com/blog/web-performance-page-bloat/
    const ratio = Math.floor(avgWebPageSize / total);
    document.getElementById("size-ratio").textContent = ratio;
  }, 500);

  // Homelab cluster stats — single call covers uptime, last deploy, and cluster health
  fetch("https://api.lucas.tools/v1/stats")
    .then((res) => res.json())
    .then((stats) => {
      const svc = stats.services || {};
      const pipeline = stats.pipeline || {};
      const cluster = stats.cluster || {};
      const seen = stats.last_worked_on || {};

      // Uptime (replaces uptime.lucas.tools badge fetch)
      if (svc.uptime_24hour_pct != null)
        document.getElementById("uptime").textContent = svc.uptime_24hour_pct.toFixed(2);

      // Last deploy repo (replaces GitHub events fetch)
      if (seen.repo && seen.repo_url && seen.pushed_at) {
        document.getElementById("curRepo").innerHTML =
          `<a href="${seen.repo_url}">${seen.repo}</a>, ` +
          `${timeSince(new Date(seen.pushed_at)) || "just now"} ago`;
      }

      // Stats row
      if (svc.uptime_90day_pct)
        document.getElementById("hl-uptime-90").textContent = svc.uptime_90day_pct.toFixed(2) + "%";
      if (svc.uptime_24hour_pct != null)
        document.getElementById("hl-uptime-24").textContent =
          svc.uptime_24hour_pct.toFixed(2) + "%";
      if (svc.services?.length) {
        document.getElementById("hl-service-count").textContent = svc.services.length;
        const pings = svc.services.map((s) => s.avg_ping_ms).filter((p) => p != null);
        if (pings.length)
          document.getElementById("hl-avg-ping").textContent =
            Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) + "ms";
      }
      if (pipeline.avg_deploy_display)
        document.getElementById("hl-deploy-avg").textContent = pipeline.avg_deploy_display;
      if (pipeline.deploy_success_rate_pct != null)
        document.getElementById("hl-success-rate").textContent =
          pipeline.deploy_success_rate_pct.toFixed(0) + "%";

      // Resource gauges
      function setBar(barId, pctId, pct, label) {
        const fill = document.getElementById(barId);
        const lbl = document.getElementById(pctId);
        if (fill) {
          fill.style.width = Math.min(pct, 100) + "%";
          fill.className = "hl-bar-fill" + (pct > 90 ? " crit" : pct > 70 ? " warn" : "");
        }
        if (lbl) lbl.textContent = label;
      }
      if (cluster.cpu_usage_pct != null)
        setBar(
          "hl-cpu-bar",
          "hl-cpu-pct",
          cluster.cpu_usage_pct,
          cluster.cpu_usage_pct.toFixed(1) + "%",
        );
      if (cluster.mem_total_bytes) {
        const memPct = (cluster.mem_used_bytes / cluster.mem_total_bytes) * 100;
        const usedGB = (cluster.mem_used_bytes / 1073741824).toFixed(1);
        const totalGB = (cluster.mem_total_bytes / 1073741824).toFixed(1);
        setBar("hl-mem-bar", "hl-mem-pct", memPct, `${usedGB} / ${totalGB} GB`);
      }
      if (cluster.disk_used_pct != null)
        setBar(
          "hl-disk-bar",
          "hl-disk-pct",
          cluster.disk_used_pct,
          cluster.disk_used_pct.toFixed(1) + "%",
        );

      // Pipeline stat boxes
      if (pipeline.deploys_last_30_days != null)
        document.getElementById("hl-deploys-30d").textContent = pipeline.deploys_last_30_days;

      // Cluster metadata grid
      const grid = document.getElementById("hl-cluster-grid");
      [
        [
          "pods",
          cluster.pods_unhealthy > 0
            ? `${cluster.pods_running} (${cluster.pods_unhealthy}!)`
            : `${cluster.pods_running}`,
        ],
        ["load", cluster.load1 != null ? cluster.load1 : null],
        ["namespaces", cluster.namespace_count],
        ["pod restarts 24h", cluster.restart_count_24h],
        ["alerts", cluster.active_alerts?.total != null ? cluster.active_alerts.total : null],
        ["certs", cluster.certs_healthy != null ? `${cluster.certs_healthy} ok` : null],
        [
          "cert expiry",
          cluster.min_cert_expiry_days != null ? `${cluster.min_cert_expiry_days}d` : null,
        ],
        [
          "scrape targets",
          cluster.targets_up != null ? `${cluster.targets_up}↑ ${cluster.targets_down}↓` : null,
        ],
      ].forEach(([key, val]) => {
        if (val == null) return;
        const div = document.createElement("div");
        div.className = "hl-kv";
        div.innerHTML =
          `<span class="hl-kv-val">${val}</span>` + `<span class="hl-kv-key">${key}</span>`;
        grid.appendChild(div);
      });

      // Cache timestamp
      if (stats.cached_at) {
        const cachedDate = new Date(stats.cached_at);
        const ageSec = Math.floor((Date.now() - cachedDate) / 1000);
        const ageStr = ageSec < 60 ? `${ageSec}s` : `${Math.floor(ageSec / 60)}m ${ageSec % 60}s`;
        const timeStr = cachedDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        document.getElementById("hl-cache").textContent = `cached ${ageStr} ago · at ${timeStr}`;
      }

      // Service health rows
      const serviceList = document.getElementById("hl-services");
      (svc.services || []).forEach((s) => {
        const li = document.createElement("li");
        li.className = "hl-service";
        li.innerHTML =
          `<span class="hl-dot ${s.up ? "hl-dot-ok" : "hl-dot-fail"}"></span>` +
          `<span class="hl-service-name">${s.name}</span>` +
          `<span class="hl-service-pct">${(s.uptime_24h * 100).toFixed(2)}%</span>`;
        serviceList.appendChild(li);
      });

      // Deploy feed — one row per repo, sorted by most recent run
      const deployList = document.getElementById("hl-deploys");
      [...(pipeline.repos || [])]
        .sort((a, b) => new Date(b.last_run_at) - new Date(a.last_run_at))
        .forEach((r) => {
          const isOk = r.last_run_conclusion === "success";
          const isPending = !r.last_run_conclusion || r.last_run_conclusion === null;
          const li = document.createElement("li");
          li.className = "hl-deploy";
          li.innerHTML =
            `<span class="hl-dot ${isPending ? "hl-dot-pending" : isOk ? "hl-dot-ok" : "hl-dot-fail"}"></span>` +
            `<span class="hl-deploy-name">${r.name}` +
            (r.current_version ? ` ${r.current_version}` : "") +
            `</span>` +
            (r.cosign_verified
              ? `<span class="hl-shield" data-tip="cosign verified"> <svg viewBox="0 0 24 24"> <use xlink:href="#shield" /></svg></span>`
              : "") +
            `<span class="hl-deploy-meta">${timeSince(new Date(r.last_run_at)) || "just now"} ago` +
            (r.last_run_seconds ? ` · ${formatDuration(r.last_run_seconds)}` : "") +
            (r.image_size_display ? ` · ${r.image_size_display}` : "") +
            `</span>`;
          deployList.appendChild(li);
        });
    })
    .catch(console.error);
};
