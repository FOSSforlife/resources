function decodeHtml(html) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Old Wikipedia API: https://en.wikipedia.org/w/api.php?action=parse&page=Pet_door&prop=text&formatversion=2&format=json
async function fetchWikiEmbed(elementId, embedData) {
  const { entryName } = embedData;
  const pageName = entryName
    .split(' ')
    .map((s) => s.toLowerCase())
    .join('_');
  const text = await (
    await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${pageName}`)
  ).text();

  const start = text.indexOf('<body');
  const end = text.indexOf('</body>');
  const body = text.substring(start, end);
  // const body = text.substring(1133, 206896);
  const el = document.getElementById(elementId);
  el.classList.add('wikipedia');
  el.innerHTML = body;

  const links = document.querySelectorAll(`#${elementId} a`);
  for (const anchorTag of Array.from(links)) {
    anchorTag.setAttribute(
      'href',
      'https://en.wikipedia.org/wiki' + anchorTag.getAttribute('href').substr(1)
    );
  }
}

async function fetchRedditEmbed(elementId, embedData) {
  const { url } = embedData;
  const response = await (await fetch(url + '.json')).json();
  const html = response.data.content_html;
  const el = document.getElementById(elementId);
  el.classList.add('reddit');
  el.innerHTML = decodeHtml(html);

  const links = document.querySelectorAll(`#${elementId} a`);
  for (const anchorTag of Array.from(links)) {
    if (
      anchorTag.getAttribute('href').startsWith('/r/') ||
      anchorTag.getAttribute('href').startsWith('/u/')
    ) {
      anchorTag.setAttribute(
        'href',
        'https://reddit.com' + anchorTag.getAttribute('href')
      );
    }
  }
}
