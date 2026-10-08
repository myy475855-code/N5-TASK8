const $ = (id) => document.getElementById(id);
let state = { page: 1, limit: 12, search: "", location: "", category: "", sort: "newest" };
let timer;

function debounce(fn, delay = 350) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function skeletons() {
  $("grid").innerHTML = Array.from({length: 6}, () => '<div class="skeleton"></div>').join("");
  $("empty").classList.add("hidden");
}

async function load() {
  skeletons();
  $("status").textContent = "Loading…";
  const params = new URLSearchParams({
    search: state.search, location: state.location, category: state.category,
    sort: state.sort, page: state.page, limit: state.limit
  });
  try {
    const res = await fetch("/internships?" + params);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Request failed");

    $("status").textContent = `${body.total} internship${body.total === 1 ? "" : "s"} found`;
    if (!body.data.length) {
      $("grid").innerHTML = "";
      $("empty").classList.remove("hidden");
    } else {
      $("empty").classList.add("hidden");
      $("grid").innerHTML = body.data.map(x => `
        <article class="card">
          <h3>${escapeHtml(x.title)}</h3>
          <div class="company">${escapeHtml(x.company.name)}</div>
          <div class="meta">
            <span class="chip">${escapeHtml(x.category)}</span>
            <span class="chip">${escapeHtml(x.location)}</span>
            <span class="chip">${escapeHtml(x.workMode)}</span>
          </div>
          <p class="desc">${escapeHtml(x.description)}</p>
          <small>${x.stipend ? "PKR " + x.stipend.toLocaleString() + "/month" : "Stipend not specified"} · ${x.duration} weeks</small>
        </article>`).join("");
    }
    renderPagination(body.page, body.totalPages);
  } catch (e) {
    $("grid").innerHTML = "";
    $("status").innerHTML = `<span class="error">${escapeHtml(e.message)}</span>`;
    $("pagination").innerHTML = "";
  }
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) return $("pagination").innerHTML = "";
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    if (i <= 3 || i > totalPages - 3 || Math.abs(i - page) <= 1)
      html += `<button class="${i === page ? "active" : ""}" onclick="go(${i})">${i}</button>`;
    else if (!html.endsWith("…")) html += "…";
  }
  $("pagination").innerHTML = html;
}
window.go = (page) => { state.page = page; load(); window.scrollTo({top:0, behavior:"smooth"}); };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

$("search").addEventListener("input", debounce(e => {
  state.search = e.target.value.trim(); state.page = 1; load();
}, 350));

["location","category","sort"].forEach(id => {
  $(id).addEventListener("change", e => { state[id] = e.target.value; state.page = 1; load(); });
});

async function populateFilters() {
  const response = await fetch("/internships?limit=50&page=1");
  const json = await response.json();
  const locations = [...new Set(json.data.map(x => x.location))].sort();
  const categories = [...new Set(json.data.map(x => x.category))].sort();
  $("location").innerHTML += locations.map(x => `<option>${escapeHtml(x)}</option>`).join("");
  $("category").innerHTML += categories.map(x => `<option>${escapeHtml(x)}</option>`).join("");
}
populateFilters().then(load);
