async function fetchWikiEmbed(elementId, embedData) {
  console.log(embedData);
  const { entryName } = embedData;
  const text = await (
    await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${entryName}`)
  ).text();
  const start = text.indexOf('<body');
  const end = text.indexOf('</body>');
  const body = text.substring(start, end);
  // const body = text.substring(1133, 206896);
  const el = document.getElementById(elementId);
  el.classList.add('wikipedia');
  document.getElementById(elementId).innerHTML = body;

  const links = document.querySelectorAll(`#${elementId} a`);
  for (const anchorTag of Array.from(links)) {
    anchorTag.setAttribute(
      'href',
      'https://en.wikipedia.org/wiki' + anchorTag.getAttribute('href').substr(1)
    );
  }
}

// Old Wikipedia API: https://en.wikipedia.org/w/api.php?action=parse&page=Pet_door&prop=text&formatversion=2&format=json
