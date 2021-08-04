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
  const body =
    `View on Wikipedia: <a href="https://en.wikipedia.org/wiki/${pageName}">${entryName}</a><br><br>` +
    text.substring(start, end);
  const el = document.getElementById(elementId);
  el.classList.add('wikipedia');
  el.innerHTML = body;

  const links = document.querySelectorAll(`[rel="mw:WikiLink"]`);
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
  const urlPartial = url.split('/').slice(3).join('/');

  const el = document.getElementById(elementId);
  el.classList.add('reddit');
  el.innerHTML = `View on Reddit: <a href="${url}">/${urlPartial}</a><br>` + decodeHtml(html);

  const links = document.querySelectorAll(`#${elementId} a`);
  for (const anchorTag of Array.from(links)) {
    if (
      anchorTag.getAttribute('href').startsWith('/r/') ||
      anchorTag.getAttribute('href').startsWith('/u/')
    ) {
      anchorTag.setAttribute('href', 'https://reddit.com' + anchorTag.getAttribute('href'));
    }
  }
}

async function fetchGithubEmbed(elementId, embedData, md) {
  const convertToRawGithubUrl = (url) => {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('blob/', '');
  };

  const { url } = embedData;
  let mdContent = '';
  let response;
  if (url.indexOf('blob') === -1) {
    // repo url
    response = await fetch(convertToRawGithubUrl(url + '/blob/main/README.md'));
    if (response.status === 404) {
      response = await fetch(convertToRawGithubUrl(url + '/blob/master/README.md'));
    }
  } else {
    // specific file
    response = await fetch(convertToRawGithubUrl(url));
  }
  mdContent = await response.text();
  const html = md.render(mdContent);

  const el = document.getElementById(elementId);
  el.innerHTML = `<a href="${url}">View on GitHub</a><br>` + decodeHtml(html);
}

async function fetchWikiProxyEmbed(elementId, embedData, siteName) {
  const { url } = embedData;
  const html = await (await fetch(url)).text();
  const el = document.getElementById(elementId);
  el.innerHTML = `<a href="${url}">View on ${siteName}</a><br>` + decodeHtml(html);
}

async function fetchSepEmbed(elementId, embedData) {
  embedData.url = embedData.url.replace(
    'https://plato.stanford.edu',
    'https://wiki-proxy.s3.us-west-2.amazonaws.com/sep'
  );
  return fetchWikiProxyEmbed(elementId, embedData, 'SEP');
}
